/**
 * [INPUT]: 依赖 zod 的 schema 能力，依赖 @/i18n/config 的 LOCALES
 * [OUTPUT]: 对外提供 metaSchema/localeContentSchema/parametersSchema/examplesSchema/taxonomySchema 及对应类型、isHttpsUrl()
 * [POS]: lib/content 的单文件结构契约，被 load.ts 做跨文件校验前的第一道闸门；跨文件规则不在此处
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { z } from "zod";
import { LOCALES, type Locale } from "@/i18n/config";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const PARAMETER_ID_PATTERN = /^[A-Za-z][A-Za-z0-9]*$/;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;

export function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.length > 0 && !url.username && !url.password;
  } catch {
    return false;
  }
}

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD")
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().startsWith(value), "invalid calendar date");
const httpsUrl = z.string().refine(isHttpsUrl, "must be an absolute HTTPS URL");
const slug = z.string().regex(SLUG_PATTERN, "must be lowercase kebab-case");
const nonEmpty = z.string().trim().min(1);
/** Content files live next to meta.json or one folder below it (e.g. a variant's `full/`); no traversal. */
const siblingFile = z
  .string()
  .regex(/^(?:[A-Za-z0-9_-]+\/)?[A-Za-z0-9._-]+$/, "must be a file in the entry folder or one subfolder")
  .refine((name) => !name.split("/").some((part) => part.startsWith(".")), "hidden files are not allowed");

const localeEnum = z.enum(LOCALES);
function localized<T extends z.ZodType>(value: T) {
  return z.strictObject(Object.fromEntries(LOCALES.map((locale) => [locale, value])) as Record<Locale, T>);
}

const sourceSchema = z.strictObject({
  id: slug,
  type: z.enum(["website", "x", "github", "other"]),
  role: z.enum(["original", "supplementary"]),
  title: nonEmpty,
  url: httpsUrl,
  author: z
    .strictObject({
      name: nonEmpty,
      handle: nonEmpty.optional(),
      url: httpsUrl.optional(),
    })
    .optional(),
  checkedAt: isoDate,
});

/** One editable version of a prompt (e.g. short / full), each with its own template and options. */
const variantSchema = z.strictObject({
  id: slug,
  labels: localized(nonEmpty),
  templateVersion: z.string().regex(SEMVER_PATTERN, "must be MAJOR.MINOR.PATCH"),
  templatePaths: z.partialRecord(localeEnum, siblingFile),
  parametersPath: siblingFile,
});

export const metaSchema = z.strictObject({
  schemaVersion: z.literal(1),
  id: slug,
  slug,
  templateVersion: z.string().regex(SEMVER_PATTERN, "must be MAJOR.MINOR.PATCH"),
  status: z.enum(["draft", "published", "archived"]),
  createdAt: isoDate,
  updatedAt: isoDate,
  publishedAt: isoDate.nullable(),
  /** Lower ranks come first in the featured sort; null means not featured. */
  featuredRank: z.number().int().positive().nullable().optional(),
  /** Old slugs that permanently redirect here. Only add when an entry is renamed. */
  redirectFrom: z.array(slug).optional(),
  /** Synthetic test data. Rejected by every non-fixture content root. */
  fixture: z.boolean().optional(),
  category: slug,
  tags: z.array(slug).min(1),
  originalLocale: z.string().regex(/^[a-z]{2,3}(?:-[A-Z][a-z]{3})?(?:-[A-Z]{2})?$/, "must be a BCP 47 tag"),
  contentLocales: z.array(localeEnum).min(1),
  outputLocales: z.array(localeEnum).min(1),
  originalPath: siblingFile,
  templatePaths: z.partialRecord(localeEnum, siblingFile),
  parametersPath: siblingFile,
  /** Optional list of versions; the first one must match the top-level template and is the default. */
  variants: z.array(variantSchema).min(2).optional(),
  examplesPath: siblingFile,
  requiresReferenceImage: z.boolean(),
  /** What the source recommends. Never rendered as a "verified" claim. */
  sourceRecommendedTools: z.array(nonEmpty),
  verifiedModels: z.array(
    z.strictObject({
      model: nonEmpty,
      verifiedAt: isoDate,
      verifiedBy: nonEmpty,
      evidence: nonEmpty,
    }),
  ),
  sources: z.array(sourceSchema).min(1),
  rights: z.strictObject({
    promptLicense: nonEmpty,
    licenseUrl: httpsUrl,
    sourceLicenseUrl: httpsUrl.nullable(),
    commercialUse: z.enum(["allowed", "restricted", "unknown"]),
  }),
});

export const localeContentSchema = z.strictObject({
  title: nonEmpty,
  summary: nonEmpty,
  seoTitle: nonEmpty,
  seoDescription: nonEmpty,
  inputRequirement: nonEmpty,
  howToUse: z.array(nonEmpty).min(1),
  exampleNotice: nonEmpty,
  verificationNotice: nonEmpty,
  adaptationNotice: nonEmpty,
  licenseNotice: nonEmpty,
  parameterLabels: z.record(z.string(), nonEmpty),
  /** Extra search terms maintained by hand; the full prompt text is never searched. */
  keywords: z.array(nonEmpty).optional(),
});

const optionSchema = z.strictObject({
  id: slug,
  labels: localized(nonEmpty),
  replacements: localized(nonEmpty),
});

export const parameterSchema = z.strictObject({
  id: z.string().regex(PARAMETER_ID_PATTERN),
  type: z.literal("select"),
  renderAs: z.enum(["inline", "block"]),
  default: slug,
  options: z.array(optionSchema).min(2),
});

export const parametersSchema = z.strictObject({
  schemaVersion: z.literal(1),
  parameters: z.array(parameterSchema),
});

export const exampleSchema = z.strictObject({
  id: slug,
  src: z.string().regex(/^images\/[A-Za-z0-9._-]+\.(?:webp|png|jpe?g|avif)$/, "must be an images/<file> path inside the entry folder"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: localized(nonEmpty),
  caption: localized(nonEmpty).optional(),
  sourceUrl: httpsUrl,
  provenance: z.enum(["source-reported", "project-verified"]),
  /** Where the image comes from and on what terms it is shown; a record, not a gate. */
  rights: z.strictObject({ basis: nonEmpty, evidence: nonEmpty }),
  recipe: z
    .strictObject({
      templateVersion: z.string().regex(SEMVER_PATTERN),
      outputLocale: localeEnum,
      selections: z.record(z.string(), z.string()),
      model: nonEmpty,
      generatedAt: isoDate,
    })
    .nullable(),
});

export const examplesSchema = z.array(exampleSchema);

const termSchema = z.strictObject({ id: slug, labels: localized(nonEmpty) });
export const taxonomySchema = z.strictObject({
  schemaVersion: z.literal(1),
  categories: z.array(termSchema.extend({ descriptions: localized(nonEmpty) })).min(1),
  tags: z.array(termSchema).min(1),
});

export type PromptMeta = z.infer<typeof metaSchema>;
export type LocaleContent = z.infer<typeof localeContentSchema>;
export type Parameter = z.infer<typeof parameterSchema>;
export type ParameterOption = z.infer<typeof optionSchema>;
export type Example = z.infer<typeof exampleSchema>;
export type Taxonomy = z.infer<typeof taxonomySchema>;
export type TaxonomyTerm = Taxonomy["tags"][number];
export type Category = Taxonomy["categories"][number];
export type Source = z.infer<typeof sourceSchema>;
export type VariantMeta = z.infer<typeof variantSchema>;
