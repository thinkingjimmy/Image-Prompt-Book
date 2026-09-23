/**
 * [INPUT]: 依赖 @/i18n/config 的 Locale，依赖 @/lib/site 的 REPO_URL/repoIssueUrl/repoReadmeUrl
 * [OUTPUT]: 对外提供 STATIC_COPY（About/Contribute/Licenses 的中英文完整正文）与 StaticSection 类型
 * [POS]: components/pages 的说明页文案；每种语言维护完整句式，不逐词拼接，链接只指向真实仓库与模板
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { Locale } from "@/i18n/config";
import type { StaticPage } from "@/lib/seo/urls";
import { REPO_URL, repoIssueUrl, repoReadmeUrl } from "@/lib/site";

export type StaticLink = { label: string; href: string };
export type StaticSection = { heading: string; paragraphs?: string[]; items?: string[]; links?: StaticLink[] };
export type StaticCopy = { lead: string; sections: StaticSection[] };

const CONTENT_DOCS = `${REPO_URL}/blob/main/content/README.md`;
const LICENSE = `${REPO_URL}/blob/main/LICENSE`;

export const STATIC_COPY: Record<StaticPage, Record<Locale, StaticCopy>> = {
  about: {
    en: {
      lead: "Image Prompt Book is an open-source gallery of image generation prompts. Start from a real example you like, adjust the options that matter, and copy the complete prompt in your language.",
      sections: [
        {
          heading: "How to use it",
          items: [
            "Browse the gallery, search, or filter by category and tag.",
            "Open a prompt to see its example images, author and license.",
            "Change the highlighted options inside the text. The complete prompt updates immediately.",
            "Switch between the short and full versions when both exist, then copy the prompt or open it directly in ChatGPT.",
          ],
        },
        {
          heading: "What the example images mean",
          paragraphs: [
            "Example images show what the source or a maintainer actually produced. Changing options never regenerates, filters or swaps an image — the images show the style, not a preview of your current settings.",
          ],
        },
        {
          heading: "What this site does not do",
          items: [
            "It does not upload your reference images or generate images.",
            "It does not send your options or prompts to any model provider.",
            "It has no accounts, ratings or ads, and it does not translate prompts with AI at runtime.",
          ],
        },
        {
          heading: "Languages",
          paragraphs: [
            "The interface and every editable template are available in English and Simplified Chinese. The prompt always follows the site language you choose at the bottom of the page.",
          ],
        },
      ],
    },
    "zh-CN": {
      lead: "Image Prompt Book 是一个开源的生图 Prompt Gallery：从喜欢的真实案例出发，调整关键选项，再以自己的语言复制完整 Prompt。",
      sections: [
        {
          heading: "如何使用",
          items: [
            "浏览 Gallery，或通过搜索、分类与标签筛选。",
            "打开一个 Prompt，查看案例图、作者与许可。",
            "修改正文中高亮的选项，完整 Prompt 会立即同步更新。",
            "有精简版与完整版时可以切换，然后复制 Prompt，或直接在 ChatGPT 中打开。",
          ],
        },
        {
          heading: "案例图代表什么",
          paragraphs: [
            "案例图展示的是来源作者或维护者实际得到的结果。修改选项不会重新生成、加滤镜或替换图片——图片展示的是风格，而不是你当前设置的预览。",
          ],
        },
        {
          heading: "本站不做什么",
          items: ["不上传你的参考图，也不在站内生成图片。", "不把你的选项或 Prompt 发送给任何模型服务。", "没有账号、评分或广告，也不在运行时用 AI 翻译 Prompt。"],
        },
        {
          heading: "语言",
          paragraphs: ["界面与每个可编辑模板均提供英文与简体中文。Prompt 始终跟随页面底部选择的站点语言。"],
        },
      ],
    },
  },
  contribute: {
    en: {
      lead: "Anyone can help. You do not need to write code to suggest a prompt.",
      sections: [
        {
          heading: "Suggest a source",
          paragraphs: ["Found a great prompt? Share the link, what it does, and how to reach the author. Maintainers check the license before anything is imported."],
          links: [{ label: "Suggest a source on GitHub", href: repoIssueUrl("source-lead.yml") }],
        },
        {
          heading: "Submit a complete template",
          items: [
            "Create a new folder under content/prompts/<slug>/ with metadata, sources and license.",
            "Add the original text plus complete English and Simplified Chinese templates.",
            "Declare every option in parameters.json and add reviewed example images.",
            "Open a pull request. CI validates structure; a maintainer reviews rights and quality.",
          ],
          links: [
            { label: "Content format", href: CONTENT_DOCS },
            { label: "Contributing guide", href: repoReadmeUrl("en", "submit") },
          ],
        },
        {
          heading: "Improve a translation",
          paragraphs: ["Each language keeps complete sentences. Suggest better wording through an issue or edit the template file directly in a pull request."],
          links: [{ label: "Report a translation issue", href: repoIssueUrl("translation.yml") }],
        },
        {
          heading: "Rights or privacy concerns",
          paragraphs: ["If content on this site involves your work or personal data, open a rights request. You never need to post sensitive identity documents publicly."],
          links: [
            { label: "Open a rights request", href: repoIssueUrl("rights-request.yml") },
            { label: "Security policy", href: repoReadmeUrl("en", "security") },
          ],
        },
      ],
    },
    "zh-CN": {
      lead: "任何人都可以参与。推荐 Prompt 不需要会写代码。",
      sections: [
        {
          heading: "提交来源线索",
          paragraphs: ["发现了优秀的 Prompt？提供链接、效果说明，以及可联系作者的方式即可。维护者会在导入前核对许可。"],
          links: [{ label: "在 GitHub 提交来源线索", href: repoIssueUrl("source-lead.yml") }],
        },
        {
          heading: "提交完整模板",
          items: [
            "在 content/prompts/<slug>/ 下新建目录，填写元信息、来源与许可。",
            "提交原文，以及完整的英文与简体中文模板。",
            "在 parameters.json 中声明所有选项，并添加经过审核的案例图。",
            "发起 Pull Request。CI 校验结构，维护者审核权利与质量。",
          ],
          links: [
            { label: "内容格式说明", href: CONTENT_DOCS },
            { label: "贡献指南", href: repoReadmeUrl("zh-CN", "submit") },
          ],
        },
        {
          heading: "改进翻译",
          paragraphs: ["每种语言都维护完整句式。你可以通过 Issue 提出更好的表述，或在 Pull Request 中直接修改模板文件。"],
          links: [{ label: "反馈翻译问题", href: repoIssueUrl("translation.yml") }],
        },
        {
          heading: "权利或隐私问题",
          paragraphs: ["如果本站内容涉及你的作品或个人信息，请提交权利反馈。你无需公开任何敏感身份证明。"],
          links: [
            { label: "提交权利反馈", href: repoIssueUrl("rights-request.yml") },
            { label: "安全报告说明", href: repoReadmeUrl("zh-CN", "security") },
          ],
        },
      ],
    },
  },
  licenses: {
    en: {
      lead: "The website code and the content it shows are licensed separately. Open-source code does not make third-party prompts or images free for any use.",
      sections: [
        {
          heading: "Website code — MIT",
          paragraphs: ["The source code of this website is released under the MIT License. It does not cover third-party prompts, their translations or adaptations, or example images."],
          links: [{ label: "LICENSE", href: LICENSE }],
        },
        {
          heading: "Prompts, translations and adaptations",
          paragraphs: [
            "Every prompt keeps the license chosen by its author, shown on its page with attribution, source links and a description of our changes. Translations and parameterized versions stay under that same license and are marked as adaptations.",
            "Some prompts, such as the first Grokbot-style entry (CC BY-NC 4.0), include noncommercial conditions. Free access to this website does not remove those conditions, and copying a prompt here grants no extra rights.",
          ],
        },
        {
          heading: "Example images",
          paragraphs: ["Images have their own rights, recorded per image. An image is only shown after its display basis has been reviewed; the prompt license does not automatically apply to it."],
        },
        {
          heading: "Sharing a prompt",
          paragraphs: ["When you publish or share a prompt, credit its author and license — both are shown right under the title on every prompt page — and note that it was adapted."],
        },
        {
          heading: "Report a rights issue",
          paragraphs: ["If you believe content here infringes your rights, open a rights request. We respond without requiring public identity documents."],
          links: [{ label: "Open a rights request", href: repoIssueUrl("rights-request.yml") }],
        },
      ],
    },
    "zh-CN": {
      lead: "网站代码与网站展示的内容分别授权。代码开源并不意味着第三方 Prompt 或图片可以任意使用。",
      sections: [
        {
          heading: "网站代码 — MIT",
          paragraphs: ["本网站源代码以 MIT 许可证发布，不覆盖第三方 Prompt、其翻译或改编，也不覆盖案例图片。"],
          links: [{ label: "LICENSE", href: LICENSE }],
        },
        {
          heading: "Prompt、翻译与改编",
          paragraphs: [
            "每个 Prompt 保留作者选择的许可，并在详情页显示署名、来源链接与我们的修改说明。翻译与参数化版本沿用相同许可，并标注为改编。",
            "部分 Prompt（例如首个 Grokbot 风格条目，CC BY-NC 4.0）包含非商业条件。本站免费访问并不会取消这些条件，在此复制 Prompt 也不会获得任何额外权利。",
          ],
        },
        {
          heading: "案例图片",
          paragraphs: ["图片拥有独立的权利，并按图记录。图片只有在展示依据审核通过后才会显示；Prompt 许可不会自动适用于图片。"],
        },
        {
          heading: "分享 Prompt",
          paragraphs: ["公开发布或转载 Prompt 时，请注明作者与许可（每个 Prompt 详情页的标题下方都有），并说明内容经过改编。"],
        },
        {
          heading: "权利问题反馈",
          paragraphs: ["如果你认为本站内容侵犯了你的权利，请提交权利反馈。我们不会要求你公开身份证明材料。"],
          links: [{ label: "提交权利反馈", href: repoIssueUrl("rights-request.yml") }],
        },
      ],
    },
  },
};
