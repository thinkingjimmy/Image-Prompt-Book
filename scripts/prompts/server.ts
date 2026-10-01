/**
 * [INPUT]: A completed Next.js build, repository input files, and Node process/network APIs.
 * [OUTPUT]: startPreviewServer() with a loopback URL and cleanup for its own child process.
 * [POS]: scripts/prompts server lifecycle; check.ts reuses a verified build without rebuilding.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { spawn } from "node:child_process";
import { appendFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { createServer } from "node:net";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

function newestInput(file: string): number {
  if (!existsSync(file)) return 0;
  const stat = statSync(file);
  if (stat.isFile()) return path.basename(file) === "README.md" ? 0 : stat.mtimeMs;
  return Math.max(0, ...readdirSync(file).map((name) => newestInput(path.join(file, name))));
}

async function freePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Cannot allocate a preview port");
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return address.port;
}

export async function startPreviewServer(logPath: string) {
  if (process.env.IPB_CONTENT_DIR) throw new Error("Prompt imports must use real content, not fixtures");
  const buildId = path.join(process.env.IPB_DIST_DIR ?? ".next", "BUILD_ID");
  if (!existsSync(buildId)) throw new Error("No production build found. Run pnpm verify first.");
  const latest = Math.max(...["src", "content", "next.config.ts", "package.json"].map(newestInput));
  if (latest > statSync(buildId).mtimeMs) throw new Error("The production build is stale. Run pnpm verify after the final edits.");

  const port = await freePort();
  const url = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    env: { ...process.env, IPB_E2E: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let spawnError: Error | undefined;
  child.once("error", (error) => { spawnError = error; });
  child.stdout.on("data", (chunk: Buffer) => appendFileSync(logPath, chunk));
  child.stderr.on("data", (chunk: Buffer) => appendFileSync(logPath, chunk));
  const kill = () => { child.kill("SIGTERM"); };
  process.once("exit", kill);

  async function stop() {
    process.removeListener("exit", kill);
    if (!child.pid || child.exitCode !== null || child.signalCode !== null) return;
    const exited = new Promise<void>((resolve) => child.once("exit", () => resolve()));
    kill();
    await Promise.race([exited, delay(3000, undefined, { ref: false })]);
    if (child.exitCode === null && child.signalCode === null) {
      child.kill("SIGKILL");
      await exited;
    }
  }

  try {
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      if (spawnError) throw spawnError;
      if (child.exitCode !== null || child.signalCode !== null) throw new Error(`Preview server exited. See ${logPath}`);
      try {
        const response = await fetch(`${url}/en`, { signal: AbortSignal.timeout(1000) });
        await response.body?.cancel();
        if (response.ok) return { url, stop };
      } catch { /* The server is still starting. */ }
      await delay(100);
    }
    throw new Error(`Preview server did not become ready. See ${logPath}`);
  } catch (error) {
    await stop();
    throw error;
  }
}
