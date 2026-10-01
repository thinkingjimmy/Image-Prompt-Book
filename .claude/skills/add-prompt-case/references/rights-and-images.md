# Rights and image handling

## Rights

- Read actual terms. For repositories, read README and LICENSE; record conflicts and follow the stricter terms.
- Use SPDX or LicenseRef-<Name> for custom terms. A new display label belongs in LICENSE_NAMES in src/components/prompt/prompt-detail.tsx; this is an app change with relevant validation.
- commercialUse is restricted for restrictive terms, allowed only for explicit permission, unknown when unstated.
- Unstated: LicenseRef-Unspecified; licenseUrl is checked source; sourceLicenseUrl is null; commercialUse is unknown. Notice: License: none stated. All rights remain with the author; shown here with credit and a link to the original post. Follow the standing credit-and-takedown policy without another permission request.
- Forbidden redistribution or a known public figure without the owner's decision is a blocker. Keep unaffected preparation moving and ask one bundled question.

Acknowledgements row:

```md
| <English title><br><Chinese title> | <Author> ([@handle](<profile URL>)) | [<source title>](<source URL>) | [<license name>](<license URL>) |
```

Match meta.json names, handles, source, license. Unstated label: No license stated / 未声明许可. Preserve existing closing paragraphs.

## Images

The source link authorizes importing examples from that post and the author's relevant thread. X originals:

```bash
curl -fsS 'https://pbs.twimg.com/media/<id>?format=jpg&name=orig' -o /tmp/<task>/<id>.jpg
```

Download independently permitted assets concurrently, view every small preview, select featured examples, and omit unrelated/older contradictory results. No hotlinks/placeholders.

- Check dimensions first. JPEG quality about 82, long edge at most 1600 px; omit resize for smaller images because sips -Z can enlarge them. Preserve PNG transparency when needed.
- Prompt-requested collage/diptych/comparison: retain full composition. A comparison layout is not automatically an input/result pair.
- Independent examples assembled in a grid: split clear gutters when needed; record crops.
- Genuine separate input/result stages: crop matching frames and use example.input. Inspect alignment; fix simple drift only when needed. Normal imports do not require automated registration of recomposed scenes.
- Use a documented tool such as ffmpeg for crops; inspect seams/results. Record actual dimensions and neutral bilingual alt text.
- Third-party characters/logos are covered by the owner's standing choice; state this in rights.basis. Do not infer real-person identity.

Each source example needs rights.basis (source, request, terms), rights.evidence, sourceUrl, provenance: source-reported, recipe: null. Image rights are independent of prompt licensing.

Project-verified examples require an actual recipe (template version, locale, selections, model, date) and meta.verifiedModels evidence. Never generate art just to make an import publishable.

[PROTOCOL]: Update this header when making changes, then check README.md.
