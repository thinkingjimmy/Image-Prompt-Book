/**
 * [INPUT]: 依赖 @/lib/content/load 的 loadContentLibrary，依赖 ./helpers 的 library/combinations/composer，依赖 content/ 与生成的 fixture 目录
 * [OUTPUT]: 内容闸门测试：①每个条目、每个版本的全部选项组合 × 输出语言都完整渲染且互不相同；②校验拒绝未声明 token、坏默认值、非 HTTPS 来源、尺寸不符、无审核发布、fixture 混入生产（AC-09/AC-20/AC-21/AC-23）
 * [POS]: tests/unit 的内容级通用套件；新增条目自动被覆盖，条目专属的语义回归放在 prompts/<slug>.test.ts
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadContentLibrary } from "@/lib/content/load";
import { combinations, composer, library } from "./helpers";

describe("every entry renders every combination", () => {
  it("loads the committed content without issues", () => {
    expect(library.issues).toEqual([]);
    expect(library.entries.length).toBeGreaterThan(0);
  });

  for (const entry of library.entries) {
    for (const variant of entry.variants) {
      it(`${entry.meta.slug} (${variant.id}): complete, single-language and distinct in every output locale`, () => {
        const compose = composer(variant);
        const combos = combinations(variant.parameters);
        const outputs = new Set<string>();
        for (const combo of combos) {
          for (const locale of entry.meta.outputLocales) {
            const text = compose(combo, locale);
            // No unresolved tokens, missing replacements or leftover Markdown from the source.
            expect(text).not.toMatch(/\{\{|\}\}|undefined|```|\*\*|^#/m);
            expect(text.endsWith("\n") && !text.endsWith("\n\n")).toBe(true);
            if (locale === "en") expect(text).not.toMatch(/[\u4e00-\u9fff]/);
            outputs.add(`${locale}\n${text}`);
          }
        }
        // Every option changes the prompt; otherwise it is a dead control.
        expect(outputs.size).toBe(combos.length * entry.meta.outputLocales.length);
      });
    }
  }
});

const SLUG = "grokbot-capsule-icon";
let root = "";

function setup(mutate: (dir: string) => void, allowFixtures = false) {
  root = mkdtempSync(path.join(tmpdir(), "ipb-content-"));
  cpSync("content", root, { recursive: true });
  mutate(path.join(root, "prompts", SLUG));
  return loadContentLibrary({ root, allowFixtures });
}
const editJson = (file: string, edit: (value: Record<string, unknown>) => unknown) => writeFileSync(file, JSON.stringify(edit(JSON.parse(readFileSync(file, "utf8")))));

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
});

describe("content validation", () => {
  it("accepts an untouched copy", () => {
    expect(setup(() => {}).issues).toEqual([]);
  });

  it("rejects an undeclared template token", () => {
    const { issues } = setup((dir) => writeFileSync(path.join(dir, "template.en.txt"), `${readFileSync(path.join(dir, "template.en.txt"), "utf8").trimEnd()} {{skinColor}}\n`));
    expect(issues.join("\n")).toContain("undeclared token {{skinColor}}");
  });

  it("rejects an unused parameter and a missing default", () => {
    const { issues } = setup((dir) =>
      editJson(path.join(dir, "parameters.json"), (value) => {
        const parameters = value.parameters as { id: string; default: string }[];
        parameters[1]!.default = "neon";
        parameters.push({ ...parameters[1]!, id: "extra" });
        return value;
      }),
    );
    expect(issues.join("\n")).toMatch(/default "neon" is not an option/);
    expect(issues.join("\n")).toMatch(/never uses parameter extra/);
  });

  it("rejects replacements that contain tokens", () => {
    const { issues } = setup((dir) =>
      editJson(path.join(dir, "parameters.json"), (value) => {
        const option = (value.parameters as { options: { replacements: Record<string, string> }[] }[])[1]!.options[0]!;
        option.replacements.en = "{{composition}}";
        return value;
      }),
    );
    expect(issues.join("\n")).toContain("replacement contains a token");
  });

  it("rejects non-HTTPS and script URLs", () => {
    const { issues } = setup((dir) =>
      editJson(path.join(dir, "meta.json"), (value) => {
        const [source] = value.sources as { url: string }[];
        source!.url = "javascript:alert(1)";
        (value.rights as { licenseUrl: string }).licenseUrl = "http://example.com";
        return value;
      }),
    );
    expect(issues.filter((issue) => issue.includes("HTTPS"))).toHaveLength(2);
  });

  it("refuses to publish without review and real examples", () => {
    const { issues, entries } = setup((dir) => editJson(path.join(dir, "meta.json"), (value) => ({ ...value, status: "published", publishedAt: "2026-09-23" })));
    expect(entries.find((entry) => entry.meta.slug === SLUG)).toBeUndefined();
    expect(issues.join("\n")).toContain("prompt usage review is not approved");
    expect(issues.join("\n")).toContain("example pink display rights are pending");
  });

  it("rejects missing translations and CRLF originals", () => {
    const { issues } = setup((dir) => {
      rmSync(path.join(dir, "zh-CN.json"));
      writeFileSync(path.join(dir, "original.ko.txt"), "a\r\nb\n");
    });
    expect(issues.join("\n")).toContain("zh-CN.json: file not found");
    expect(issues.join("\n")).toContain("must use LF line endings");
  });

  it("rejects example images whose declared size is wrong or missing", () => {
    const fixtures = path.resolve("tests/fixtures/.generated/content");
    const { issues } = setup((dir) => {
      cpSync(path.join(fixtures, "prompts", SLUG, "images"), path.join(dir, "images"), { recursive: true });
      const examples = JSON.parse(readFileSync(path.join(fixtures, "prompts", SLUG, "examples.json"), "utf8"));
      examples[0].width = 999;
      examples[1].src = "images/missing.png";
      writeFileSync(path.join(dir, "examples.json"), JSON.stringify(examples));
    });
    expect(issues.join("\n")).toContain("declares 999x1000 but the file is 1000x1000");
    expect(issues.join("\n")).toContain("image file not found");
  });

  it("rejects image rights marked approved without a reviewer", () => {
    const { issues } = setup((dir) =>
      editJson(path.join(dir, "examples.json"), (value) => {
        const [first] = value as unknown as { rights: Record<string, unknown> }[];
        first!.rights = { ...first!.rights, status: "approved" };
        return value;
      }),
    );
    expect(issues.join("\n")).toContain("approved image rights need reviewedBy and reviewedAt");
  });

  it("rejects fixture records outside fixture roots", () => {
    const { issues } = setup((dir) => editJson(path.join(dir, "meta.json"), (value) => ({ ...value, fixture: true })));
    expect(issues.join("\n")).toContain("fixture records are not allowed");
  });
});
