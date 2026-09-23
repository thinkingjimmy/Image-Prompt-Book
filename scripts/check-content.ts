/**
 * [INPUT]: 依赖 @/lib/content/load 的 loadContentLibrary/publicationBlockers，依赖 @/lib/site 的 contentConfig
 * [OUTPUT]: CLI：校验内容目录，打印每个条目的发布状态；有问题时以非零码退出
 * [POS]: scripts 的构建前内容闸门，被 `pnpm build` 与 CI 调用；与运行时 catalog 使用同一加载器
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { loadContentLibrary, publicationBlockers } from "@/lib/content/load";
import { contentConfig } from "@/lib/site";

const config = contentConfig();
const library = loadContentLibrary({ root: config.root, mediaRoot: config.mediaRoot, allowFixtures: config.isFixture });

console.log(`Content root: ${config.root}${config.isFixture ? " (fixture)" : ""}`);
for (const entry of library.entries) {
  const blockers = publicationBlockers(entry);
  const state = blockers.length === 0 ? "public" : `not public (${blockers.join("; ")})`;
  console.log(`- ${entry.meta.slug} [${entry.meta.status}] ${state}`);
}

if (library.issues.length > 0) {
  console.error(`\n${library.issues.length} content issue(s):`);
  for (const issue of library.issues) console.error(`  ✗ ${issue}`);
  process.exit(1);
}
console.log(`\n✓ ${library.entries.length} entr${library.entries.length === 1 ? "y" : "ies"} valid`);
