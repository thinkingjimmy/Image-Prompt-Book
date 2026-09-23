/**
 * [INPUT]: 依赖 @/lib/content/load 读取所有条目的来源、作者、许可与案例来源链接，依赖全局 fetch
 * [OUTPUT]: CLI：逐个请求外链并打印状态报告；`--strict` 时有失效链接则非零退出
 * [POS]: scripts 的独立外链巡检，由维护者手动或定时运行；不参与构建、不修改或删除任何来源记录
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { loadContentLibrary } from "@/lib/content/load";
import { contentConfig } from "@/lib/site";

const TIMEOUT_MS = 10_000;
const strict = process.argv.includes("--strict");

type Link = { slug: string; label: string; url: string };

function collectLinks(): Link[] {
  const config = contentConfig();
  const { entries } = loadContentLibrary({ root: config.root, mediaRoot: config.mediaRoot, allowFixtures: config.isFixture });
  const links: Link[] = [];
  for (const entry of entries) {
    const slug = entry.meta.slug;
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
  console.log(`\n${links.length} links, ${broken} not reachable. Nothing was changed; review failures by hand.`);
  if (strict && broken > 0) process.exit(1);
}

void main();
