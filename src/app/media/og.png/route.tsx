/**
 * [INPUT]: 依赖 next/og 的 ImageResponse，依赖 @/lib/content/catalog 的 getVisibleEntries，依赖 @/lib/site 的 contentConfig/SITE_NAME，依赖 node:fs 读取封面图与 app/apple-icon.png
 * [OUTPUT]: GET 处理器：/media/og.png，1200×630 站点分享图（logo + 单行品牌名 + 标语 + 已发布条目封面拼贴）
 * [POS]: app/media 的默认分享图；首页、分类与说明页的 og:image，详情页仍用各自封面；构建期静态生成
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getVisibleEntries } from "@/lib/content/catalog";
import { contentConfig, SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

const TILE = 236;
// The site icon: same stacked-cards mark as the header, drawn on the page colour.
const LOGO = path.join(process.cwd(), "src", "app", "apple-icon.png");
const MIME: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

/** Covers of the first visible entries as data URLs; formats Satori cannot decode are skipped. */
async function covers(limit: number): Promise<string[]> {
  const urls: string[] = [];
  for (const entry of getVisibleEntries()) {
    const cover = entry.examples[0];
    const type = cover && MIME[path.extname(cover.src).toLowerCase()];
    if (!cover || !type) continue;
    const body = await readFile(path.join(contentConfig().root, "prompts", entry.meta.slug, cover.src));
    urls.push(`data:${type};base64,${body.toString("base64")}`);
    if (urls.length === limit) break;
  }
  return urls;
}

export async function GET() {
  const [tiles, logo] = await Promise.all([covers(4), readFile(LOGO)]);
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#f7f6f3", color: "#1c1b19", padding: 56, alignItems: "center", gap: 48 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> only. */}
          <img src={`data:image/png;base64,${logo.toString("base64")}`} width={112} height={112} alt="" style={{ marginLeft: -12, marginBottom: 8 }} />
          <div style={{ fontSize: 60, letterSpacing: -1.5, lineHeight: 1.05, whiteSpace: "nowrap" }}>{SITE_NAME}</div>
          {/* One sentence per line, so the tagline never leaves a single word behind. */}
          <div style={{ display: "flex", flexDirection: "column", fontSize: 32, lineHeight: 1.3, color: "#57534e" }}>
            <span>Explore image prompts.</span>
            <span>Make them yours.</span>
          </div>
          <div style={{ fontSize: 24, marginTop: 24, color: "#78716c" }}>imagepromptbook.com</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", width: TILE * 2 + 16, gap: 16 }}>
          {tiles.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> only.
            <img key={src.slice(-32)} src={src} width={TILE} height={TILE} alt="" style={{ objectFit: "cover", borderRadius: 20 }} />
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
