/**
 * [INPUT]: Explicit workflow markers, child-command outcomes, and this task's local usage log.
 * [OUTPUT]: Local-only phase/command reports with deduplicated actual model token counts.
 * [POS]: scripts/prompts reusable profiler; one incremental reader finalizes after turn completion.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, readSync, readdirSync, statSync, writeFileSync, renameSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

type Event = { timestamp: string; type: string; payload: Record<string, unknown> };
type Usage = { input_tokens: number; cached_input_tokens: number; output_tokens: number; reasoning_output_tokens: number; total_tokens: number };
type State = { sessionFile: string; turnId: string; startedAt: string; source: string; phases: { name: string; scope: string; startedAt: string }[] };
const fields = ["input_tokens", "cached_input_tokens", "output_tokens", "reasoning_output_tokens", "total_tokens"] as const;
const protocol = "[PROTOCOL]: Update this header when making changes, then check README.md.";
const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
const instant = (value: string) => { const time = Date.parse(value); assert(Number.isFinite(time), `Invalid timestamp: ${value}`); return time; };
const zero = (): Usage => ({ input_tokens: 0, cached_input_tokens: 0, output_tokens: 0, reasoning_output_tokens: 0, total_tokens: 0 });
const total = (rows: { usage: Usage }[]) => rows.reduce((sum, row) => { for (const field of fields) sum[field] += row.usage[field]; return sum; }, zero());
const save = (file: string, value: unknown) => { const temp = `${file}.${process.pid}.tmp`; writeFileSync(temp, json(value)); renameSync(temp, file); };

function findSession(thread: string): string {
  assert(thread, "Use --session or run inside a Codex task with CODEX_THREAD_ID");
  const root = path.join(process.env.CODEX_HOME ?? path.join(os.homedir(), ".codex"), "sessions");
  const matches = readdirSync(root, { recursive: true }).filter((file): file is string => typeof file === "string" && file.endsWith(`${thread}.jsonl`));
  assert.equal(matches.length, 1, "Could not identify exactly one session log");
  return path.join(root, matches[0]!);
}

function reader(file: string, consume: (event: Event) => void) {
  const fd = openSync(file, "r");
  let offset = 0;
  let partial = "";
  // Streaming decoding preserves UTF-8 characters split across appended byte chunks.
  const decoder = new TextDecoder();
  return {
    poll() {
      const size = statSync(file).size;
      assert(size >= offset, "Session log was truncated");
      while (offset < size) {
        const bytes = Buffer.alloc(Math.min(65536, size - offset));
        const count = readSync(fd, bytes, 0, bytes.length, offset);
        if (!count) break;
        offset += count;
        partial += decoder.decode(bytes.subarray(0, count), { stream: true });
        const lines = partial.split("\n");
        partial = lines.pop()!;
        for (const line of lines) { let event: Event; try { event = JSON.parse(line) as Event; } catch { continue; } consume(event); }
      }
    },
    close() { closeSync(fd); },
  };
}

async function main() {
  const separator = process.argv.indexOf("--");
  const command = separator < 0 ? [] : process.argv.slice(separator + 1);
  const args = process.argv.slice(2, separator < 0 ? undefined : separator);
  const { positionals, values } = parseArgs({ args, allowPositionals: true, options: {
    out: { type: "string" }, session: { type: "string" }, source: { type: "string" }, phase: { type: "string" }, scope: { type: "string" },
    step: { type: "string" }, "follow-terminal": { type: "boolean" }, timeout: { type: "string" }, baseline: { type: "string" },
  } });
  const action = positionals[0];
  assert(values.out, "Use --out tests/test-results/import-profile/<run>");
  const root = path.resolve(values.out);
  assert(root.startsWith(`${path.resolve("tests/test-results/import-profile")}${path.sep}`), "Reports must remain inside ignored import-profile artifacts");
  const stateFile = path.join(root, "profile.json");
  if (action === "start") {
    assert(!existsSync(stateFile), "Profile already exists; use mark or report");
    const sessionFile = values.session ? path.resolve(values.session) : findSession(process.env.CODEX_THREAD_ID ?? "");
    let latest: Event | undefined;
    const scan = reader(sessionFile, (event) => { if (event.type === "event_msg" && event.payload.type === "task_started") latest = event; });
    try { scan.poll(); } finally { scan.close(); }
    assert(latest && typeof latest.payload.turn_id === "string", "Current turn identity is unavailable");
    mkdirSync(root, { recursive: true });
    save(stateFile, { sessionFile, turnId: latest.payload.turn_id, startedAt: latest.timestamp, source: values.source ?? "", phases: [{ name: values.phase ?? "Workflow development", scope: values.scope ?? "development", startedAt: latest.timestamp }] } satisfies State);
    console.log(json({ startedAt: latest.timestamp, out: root }).trim());
    return;
  }
  const state = JSON.parse(readFileSync(stateFile, "utf8")) as State;
  if (action === "mark") {
    assert(values.phase, "Use --phase and optionally --scope development|import");
    state.phases.push({ name: values.phase, scope: values.scope ?? state.phases.at(-1)!.scope, startedAt: new Date().toISOString() });
    save(stateFile, state);
    console.log(json(state.phases.at(-1)).trim());
    return;
  }
  if (action === "run") {
    assert(values.step && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.step) && command.length, "Use --step <name> -- <command>");
    const metric = path.join(root, "commands", values.step, "outcome.json");
    assert(!existsSync(metric), "Step already recorded; give retries a distinct name");
    mkdirSync(path.dirname(metric), { recursive: true });
    const log = path.join(path.dirname(metric), "stdout.log");
    const fd = openSync(log, "wx");
    const startedAt = new Date().toISOString();
    const tick = performance.now();
    const outcome: { exitCode: number | null; signal: NodeJS.Signals | null; error?: string } = await new Promise((resolve) => {
      const child = spawn(command[0]!, command.slice(1), { stdio: ["ignore", fd, fd] });
      const stop = (signal: NodeJS.Signals) => { child.kill(signal); };
      const interrupt = () => stop("SIGINT");
      const terminate = () => stop("SIGTERM");
      process.once("SIGINT", interrupt); process.once("SIGTERM", terminate);
      const cleanup = () => { process.removeListener("SIGINT", interrupt); process.removeListener("SIGTERM", terminate); };
      child.once("error", (error) => { cleanup(); resolve({ exitCode: 127, signal: null, error: error.message }); });
      child.once("exit", (exitCode, signal) => { cleanup(); resolve({ exitCode, signal }); });
    });
    closeSync(fd);
    const result = { step: values.step, command: command[0], startedAt, endedAt: new Date().toISOString(), seconds: Math.round(performance.now() - tick) / 1000, ...outcome, log };
    save(metric, result);
    console.log(json(result).trim());
    process.exitCode = outcome.exitCode ?? 130;
    return;
  }
  assert(action === "report", "Usage: pnpm prompt:profile start|mark|run|report --out <artifact>");
  const usage = new Map<string, { timestamp: string; recordedAt: string; usage: Usage }>();
  let responseAt = state.startedAt;
  let terminalAt: string | undefined;
  const scan = reader(state.sessionFile, (event) => {
    if (instant(event.timestamp) < instant(state.startedAt)) return;
    const payload = event.payload;
    if ((!terminalAt || instant(event.timestamp) <= instant(terminalAt)) && event.type === "response_item" && (["function_call", "custom_tool_call"].includes(String(payload.type)) || payload.type === "message" && payload.role === "assistant")) responseAt = event.timestamp;
    if (event.type === "event_msg" && payload.turn_id === state.turnId && ["task_complete", "turn_completed", "turn_complete", "turn_aborted", "task_failed"].includes(String(payload.type))) terminalAt = event.timestamp;
    if (event.type !== "token_usage_record" || payload.turn_id !== state.turnId || typeof payload.response_id !== "string") return;
    const row = payload.usage as Usage | undefined;
    if (!row || !fields.every((field) => Number.isInteger(row[field]) && row[field] >= 0)) return;
    assert(row.cached_input_tokens <= row.input_tokens && row.reasoning_output_tokens <= row.output_tokens && row.total_tokens === row.input_tokens + row.output_tokens, "Malformed actual usage accounting");
    usage.set(payload.response_id, { timestamp: responseAt, recordedAt: event.timestamp, usage: Object.fromEntries(fields.map((field) => [field, row[field]])) as Usage });
  });
  const timeout = Number(values.timeout ?? "600");
  assert(Number.isFinite(timeout) && timeout > 0 && timeout <= 7200, "Use a timeout between 1 and 7200 seconds");
  const deadline = Date.now() + timeout * 1000;
  let terminalSeen: number | undefined;
  const snapshot = () => {
    const endedAt = terminalAt ?? new Date().toISOString();
    const rows = [...usage.values()];
    const phases = state.phases.map((phase, index) => {
      const end = state.phases[index + 1]?.startedAt ?? endedAt;
      assert(instant(end) >= instant(phase.startedAt), "Phase timestamps are not ordered");
      const selected = rows.filter((row) => instant(row.timestamp) >= instant(phase.startedAt) && instant(row.timestamp) < instant(end));
      return { ...phase, endedAt: end, seconds: (instant(end) - instant(phase.startedAt)) / 1000, responses: selected.length, tokens: rows.length ? total(selected) : null };
    });
    assert.equal(phases.reduce((sum, phase) => sum + phase.responses, 0), rows.length, "Unassigned model response");
    const scopes = [...new Set(phases.map((phase) => phase.scope))].map((scope) => {
      const selected = phases.filter((phase) => phase.scope === scope);
      return { scope, seconds: selected.reduce((sum, phase) => sum + phase.seconds, 0), responses: selected.reduce((sum, phase) => sum + phase.responses, 0), tokens: rows.length ? total(selected.map((phase) => ({ usage: phase.tokens! }))) : null };
    });
    const dir = path.join(root, "commands");
    const commandDirs = existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).filter((item) => item.isDirectory() && existsSync(path.join(dir, item.name, "outcome.json"))).map((item) => item.name) : [];
    const commands = commandDirs.map((name) => JSON.parse(readFileSync(path.join(dir, name, "outcome.json"), "utf8")) as { step: string; seconds: number; exitCode: number | null }).sort((a, b) => a.step.localeCompare(b.step));
    const tokens = rows.length ? total(rows) : null;
    const baseline = values.baseline ? JSON.parse(readFileSync(values.baseline, "utf8")) as { activeSeconds: number; tokens: Usage } : null;
    const report = { coverage: terminalAt ? "Final accounting observed" : "Live snapshot; final response accounting is pending", startedAt: state.startedAt, endedAt, elapsedSeconds: (instant(endedAt) - instant(state.startedAt)) / 1000, tokens, uncachedInputTokens: tokens ? tokens.input_tokens - tokens.cached_input_tokens : null, responses: rows.length, scopes, phases, commands, baseline };
    save(path.join(root, "report.json"), report);
    save(path.join(root, "usage.json"), rows);
    const lines = ["# Prompt workflow profile", "", `Source: ${state.source}. ${report.coverage}.`, "", "| Scope / phase | Seconds | Responses | Input | Cached input | Output | Reasoning output | Total |", "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |"];
    for (const phase of [...scopes.map((scope) => ({ ...scope, name: `Scope: ${scope.scope}` })), ...phases]) lines.push(`| ${phase.name} | ${phase.seconds.toFixed(3)} | ${phase.responses} | ${fields.map((field) => phase.tokens?.[field] ?? "unavailable").join(" | ")} |`);
    lines.push("", "Scope totals and their phases overlap; do not add them. Cached input is part of input, reasoning output is part of output, and total = input + output. Phase tokens are attributed to model-response boundaries; concurrent commands do not receive invented token splits.", "", "| Command | Seconds | Exit |", "| --- | ---: | ---: |");
    for (const command of commands) lines.push(`| ${command.step} | ${command.seconds.toFixed(3)} | ${command.exitCode ?? "signal"} |`);
    if (baseline) lines.push("", `Baseline: ${(baseline.activeSeconds / 60).toFixed(2)} minutes; ${baseline.tokens.total_tokens} total tokens. Development and entry-import scopes are shown separately; source complexity and context differ, so this is an observational comparison.`);
    lines.push("", "Actual usage comes from this task's local token_usage_record usage objects, deduplicated by response ID. Missing accounting is unavailable. The reader scans once, then consumes appended bytes until terminal accounting or timeout; no raw messages, command arguments, or browser inventory are exported.", "", protocol);
    writeFileSync(path.join(root, "report.md"), `${lines.join("\n")}\n`);
    writeFileSync(path.join(root, "README.md"), `# Import profile\n\nprofile.json: Local session identity and explicit phase markers.\nreport.json: Actual timing/token totals and command outcomes.\nreport.md: Readable scope and phase report.\nusage.json: Sanitized per-response accounting.\ncommands/: One folder per command, with timing and retained output.\n\n${protocol}\n`);
    if (existsSync(dir)) writeFileSync(path.join(dir, "README.md"), `# commands\n\n> L2 | Parent: ../README.md\n\n${commandDirs.map((name) => `${name}/: Measured command outcome and captured output.`).join("\n")}\n\n${protocol}\n`);
    for (const name of commandDirs) writeFileSync(path.join(dir, name, "README.md"), `# ${name}\n\n> L2 | Parent: ../README.md\n\noutcome.json: Command start/end, monotonic duration, and exit status.\nstdout.log: Retained output for diagnosis and replay.\n\n${protocol}\n`);
  };
  try {
    do {
      scan.poll(); snapshot();
      if (terminalAt) terminalSeen ??= Date.now();
      if (!values["follow-terminal"] || terminalSeen && Date.now() - terminalSeen >= 3000 || Date.now() >= deadline) break;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } while (true);
  } finally { scan.close(); }
  console.log(json({ report: path.join(root, "report.md"), responses: usage.size, final: Boolean(terminalAt) }).trim());
}

void main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
