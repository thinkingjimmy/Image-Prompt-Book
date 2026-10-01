/**
 * [INPUT]: Content loader, optional --slug filters, Node argument parsing, and fetch.
 * [OUTPUT]: CLI link report; --strict fails on unreachable links and --slug scopes imports.
 * [POS]: scripts external-link checker; keeps full-library audits separate from entry imports.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { loadContentLibrary } from "@/lib/content/load";
import { contentConfig } from "@/lib/site";
import { parseArgs } from "node:util";

const TIMEOUT_MS = 10_000;
const { values } = parseArgs({ options: { strict: { type: "boolean" }, slug: { type: "string", multiple: true } } });
const strict = values.strict;

type Link = { slug: string; label: string; url: string };

function collectLinks(): Link[] {
  const config = contentConfig();
  const { entries, issues } = loadContentLibrary({ root: config.root, allowFixtures: config.isFixture });
  if (issues.length > 0) throw new Error(issues.join("\n"));
  for (const slug of values.slug ?? []) {
    if (!entries.some((entry) => entry.meta.slug === slug)) throw new Error(`Unknown prompt: ${slug}`);
  }
  const links: Link[] = [];
  for (const entry of entries) {
    const slug = entry.meta.slug;
    if (values.slug && !values.slug.includes(slug)) continue;
    for (const source of entry.meta.sources) {
      links.push({ slug, label: `source:${source.id}`, url: source.url });
      if (source.author?.url) links.push({ slug, label: `author:${source.id}`, url: source.author.url });
    }
    links.push({ slug, label: "license", url: entry.meta.rights.licenseUrl });
    if (entry.meta.rights.sourceLicenseUrl) links.push({ slug, label: "source-license", url: entry.meta.rights.sourceLicenseUrl });
    for (const example of entry.examples) links.push({ slug, label: `example:${example.id}`, url: example.sourceUrl });
  }
  return links;
}

async function probe(url: string): Promise<string> {
  const attempt = async (method: "HEAD" | "GET") => {
    const response = await fetch(url, { method, redirect: "follow", signal: AbortSignal.timeout(TIMEOUT_MS), headers: { "User-Agent": "ImagePromptBook-LinkCheck/1.0" } });
    return response.status;
  };
  try {
    let status = await attempt("HEAD");
    // Many sites reject HEAD; confirm with GET before reporting a failure.
    if (status >= 400) status = await attempt("GET");
    return String(status);
  } catch (error) {
    return `error (${(error as Error).name})`;
  }
}

async function main() {
  const links = collectLinks();
  const unique = [...new Set(links.map((link) => link.url))];
  const results = new Map(await Promise.all(unique.map(async (url) => [url, await probe(url)] as const)));

  let broken = 0;
  for (const link of links) {
    const status = results.get(link.url)!;
    const ok = /^[23]\d\d$/.test(status);
    if (!ok) broken++;
    console.log(`${ok ? "✓" : "✗"} ${status.padEnd(12)} ${link.slug} ${link.label} ${link.url}`);
  }
  console.log(`\n${links.length} references (${unique.length} unique URLs), ${broken} not reachable. Nothing was changed; review failures by hand.`);
  if (strict && broken > 0) process.exit(1);
}

void main().catch((error) => { console.error(error); process.exitCode = 1; });
