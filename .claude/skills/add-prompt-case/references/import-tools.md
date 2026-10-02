# Import tools

Use reviewed source data. These tools neither fetch browser content nor decide licensing, authorship, image transformations, or translation fidelity.

## Manifest

Put the manifest and captured files in one scratch folder. All input paths are relative to that folder; traversal and symlinks outside it fail. Prepare final local image files first and view their previews once. `prepare` measures actual dimensions and copies bytes without recompression or cropping.

```json
{
  "meta": {
    "slug": "entry-slug",
    "category": "photo-art",
    "tags": ["image-to-image"],
    "originalLocale": "zh-CN",
    "requiresReferenceImage": true,
    "sourceRecommendedTools": [],
    "sources": [{"id":"source","type":"x","role":"original","title":"Author on X (date)","url":"https://x.com/author/status/123","author":{"name":"Author","handle":"@author","url":"https://x.com/author"},"checkedAt":"2026-10-02"}],
    "rights": {"promptLicense":"LicenseRef-Unspecified","licenseUrl":"https://x.com/author/status/123","sourceLicenseUrl":null,"commercialUse":"unknown"}
  },
  "original": {"file":"original.zh-CN.txt","sha256":"independently captured 64-character SHA-256"},
  "content": {"en":"complete localeContentSchema object","zh-CN":"complete localeContentSchema object"},
  "variants": [{
    "id":"default",
    "defaults":{"en":"default.en.txt","zh-CN":"default.zh-CN.txt"},
    "parameters":[],
    "requiredText":{"en":["essential immutable clause"],"zh-CN":["必要固定约束"]}
  }],
  "examples":[{
    "id":"cover",
    "image":{"file":"example.jpg","name":"cover.jpg","alt":{"en":"Accurate image description","zh-CN":"准确图像描述"}},
    "sourceUrl":"https://x.com/author/status/123",
    "rights":{"basis":"Actual source, terms, and material changes","evidence":"https://x.com/author/status/123"}
  }],
  "attribution":{"en":"Complete plain-text credit and changes","zh-CN":"完整纯文本署名与改编说明"},
  "audit":"Optional source/crop details."
}
```

The example illustrates keys, not valid content. `content` contains every field in `content/README.md`. Each parameter follows the existing parameters schema, with 2–6 bilingual choices. Its default replacement is the exact phrase replaced in each independent default; the phrase must occur once. For intentional repeats, set `occurrences: {"parameterId":{"en":2,"zh-CN":2}}` on that variant. Multiple variants need bilingual `labels`; the first uses templates/, others their variant ID folders. A single variant uses ID `default`.

Optional example `input` has the same shape as `image` and activates the existing comparison viewer. Defaults must have one LF final newline; original capture may omit it. The source SHA-256 excludes that final newline. Output is draft, never automatically published or model-verified.

```bash
pnpm prompt:prepare /tmp/<task>/manifest.json --dry-run
pnpm prompt:prepare /tmp/<task>/manifest.json
```

The result prints its independent checks path. Review decisions, set local published metadata, then run scoped links and one verify concurrently; run `test:prompt --checks <printed path>`, inspect saved screenshots, and ship. Existing-entry or expectation output fails rather than overwriting files.

## Profiling

```bash
pnpm prompt:profile start --out tests/test-results/import-profile/<run> --source <URL>
pnpm prompt:profile mark --out tests/test-results/import-profile/<run> --phase "Source capture" --scope import
pnpm prompt:profile run --out tests/test-results/import-profile/<run> --step verify -- pnpm verify
pnpm prompt:profile run --out tests/test-results/import-profile/<run> --step links -- pnpm links:check --slug <slug>
pnpm prompt:profile mark --out tests/test-results/import-profile/<run> --phase "Entry E2E"
pnpm prompt:profile run --out tests/test-results/import-profile/<run> --step entry-e2e -- pnpm test:prompt <slug> --checks <path>
pnpm prompt:profile report --out tests/test-results/import-profile/<run>
```

`start` finds this task's session through CODEX_THREAD_ID, or accepts `--session <absolute log>`. Initial scope is development; ordinary imports can start with `--scope import --phase "Preparation"`. Marks partition workflow time; command wrappers measure monotonic subprocess duration and retain exit status. Distinct names preserve retries. Independent command files allow concurrent links/verify without shared-state writes.

At completion, start one report process with `--follow-terminal --timeout 600`; it scans once and reads appended bytes until the current turn ends, then allows three seconds for final accounting. Use `--baseline <prior report.json>` only for reports with activeSeconds and tokens. A snapshot is explicitly incomplete until final accounting. Cached input/reasoning are subsets; missing accounting is unavailable. Phase allocation follows model-response boundaries and never invents token shares for parallel commands.

[PROTOCOL]: Update this header when making changes, then check README.md.
