/**
 * [INPUT]: 依赖 ../../../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/perler-bead-travel-editorial
 * [OUTPUT]: 拼豆旅行编辑海报条目的专属测试：原文哈希一致、默认值逐字复现作者原文、地点选项一次替换全部 5 处、50/50 与 2×3 版式在所有组合中保留
 * [POS]: tests/unit/prompts/posters/illustrated 的条目套件；通用的全组合渲染由 content.test.ts 负责
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultSelections } from "@/lib/prompt/template";
import { combinations, composer, promptEntry } from "../../../helpers";

const SLUG = "perler-bead-travel-editorial";
// SHA-256 of the prompt text as posted on X (captured 2026-09-27, not edited), without the final newline.
const POSTED_SHA256 = "27d55db565301ef0a91050df221b82a66081dd71b62ca9ed9b83935c6637b400";

const entry = promptEntry(SLUG);
const compose = composer(entry);
const original = readFileSync(path.join("content", "prompts", SLUG, "original.en.txt"), "utf8");

describe(SLUG, () => {
  it("keeps the posted text unchanged and defaults to the author's fill-in field", () => {
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(POSTED_SHA256);
    expect(compose(defaultSelections(entry.parameters), "en")).toBe(original);
  });

  it("a chosen place replaces every occurrence of the field", () => {
    const en = compose({ place: "seoul" }, "en");
    expect(en).not.toContain("[COUNTRY / LOCATION / SUBJECT]");
    expect(en.match(/Seoul/g)).toHaveLength(5);
  });

  it("keeps the 50/50 split and the 2×3 patch grid in every combination", () => {
    for (const combo of combinations(entry.parameters)) {
      expect(compose(combo, "en")).toContain("Create an exact 50/50 vertical split.");
      expect(compose(combo, "en")).toContain("in a clean 2×3 grid");
      expect(compose(combo, "zh-CN")).toContain("严格上下 50/50 分割");
    }
  });
});
