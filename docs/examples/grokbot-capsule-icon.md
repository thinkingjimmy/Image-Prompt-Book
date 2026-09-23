# 首个案例规范：极简机器人头像 · Grokbot 风格

- 状态：需求与内容基线；尚未导入运行中的网站，也未在本项目中生图验证。
- 日期：2026-09-23
- 对应 [PRD](../../PRD.md) 第 6–10 节；本文件是规范性附录，不是可省略的参考链接。
- 条目 ID / slug：`grokbot-capsule-icon`
- 参数模板版本：`1.0.0`

**开发者不需要重新写 Prompt。** 按本文件逐段复制为目标内容文件，完成解析、渲染、校验与测试即可。不得用“请按原网站风格生成”之类短句代替全文，也不得让网站运行时从原站抓取正文。

## 1. 来源、署名与许可

原作者/许可方：**APG / X @multi_serio_ai**。

- [原始案例页面](https://grokbot-icon-studio.serio-ai.chatgpt.site/en)
- [来源站许可页](https://grokbot-icon-studio.serio-ai.chatgpt.site/en/license)
- [作者 X 主页](https://x.com/multi_serio_ai)
- [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)

原始韩文由项目所有者在本次需求中直接提供。来源网页明确区分短版和完整版；本项目只导入本次提供的完整版。原网站界面的语言不代表原始 Prompt 已经翻译。

本附录的韩文原文及由它产生的中英文翻译、参数化改编按所标注的 **CC BY-NC 4.0** 条件处理，不因存入本仓库而变为 MIT、无条件商用素材或本项目原创。

改动记录：韩文仅规范转贴产生的换行与 Markdown 转义；另外提供完整中英文翻译/改编，开放构图、背景、腮红、上色和特征数量五项参数。可定制版不是原作者逐字原文，也不表示原作者认可或验证了新选项。

来源站将图片、代码、标志等素材排除在 Prompt 许可的自动适用范围之外。下文图片地址仅是待审核候选，不代表已经取得转载权限。实际公开用途与图片权利需要分别核对。许可条款和原站说明包含相应免责与第三方权利限制，应保留上述链接，不提供生成质量、权利归属或商用适用保证。

## 2. 文件导入表

| 本文件章节 | 目标文件 |
| --- | --- |
| 第 3 节 | `content/prompts/grokbot-capsule-icon/meta.json` |
| 第 4 节 | `en.json`、`zh-CN.json` |
| 第 5 节完整韩文 code fence 内容 | `original.ko.txt` |
| 第 6 节英文 code fence 内容 | `template.en.txt` |
| 第 7 节中文 code fence 内容 | `template.zh-CN.txt` |
| 第 8 节 JSON | `parameters.json` |
| 第 9 节实际获准资产 | `examples.json` 与 `public/examples/grokbot-capsule-icon/` |
| 第 10 节署名信息 | `ATTRIBUTION.md`，并供详情与“复制来源说明”使用 |

所有路径除特别标出外，均相对于本案例内容目录。正文文件不包含 code fence 或本文件的章节说明。UTF-8、LF、末尾一个换行；不能把用户转贴中的行尾反斜线保留成提示词的一部分。

## 3. 元信息初始值

初始状态必须为 draft，因为尚未在本项目确认案例图片与实际公开用途。文本可以直接用于本地开发；不得把该初始记录伪装为完成发布审批。

```json
{
  "schemaVersion": 1,
  "id": "grokbot-capsule-icon",
  "slug": "grokbot-capsule-icon",
  "templateVersion": "1.0.0",
  "status": "draft",
  "createdAt": "2026-09-23",
  "updatedAt": "2026-09-23",
  "publishedAt": null,
  "category": "avatars",
  "tags": ["minimal", "2d", "bot-icon", "image-to-image"],
  "originalLocale": "ko",
  "contentLocales": ["en", "zh-CN"],
  "outputLocales": ["en", "zh-CN"],
  "originalPath": "original.ko.txt",
  "templatePaths": {
    "en": "template.en.txt",
    "zh-CN": "template.zh-CN.txt"
  },
  "parametersPath": "parameters.json",
  "examplesPath": "examples.json",
  "requiresReferenceImage": true,
  "sourceRecommendedTools": ["ChatGPT"],
  "verifiedModels": [],
  "sources": [
    {
      "id": "grokbot-site",
      "type": "website",
      "role": "original",
      "title": "Grokbot Icon",
      "url": "https://grokbot-icon-studio.serio-ai.chatgpt.site/en",
      "author": {
        "name": "APG",
        "handle": "@multi_serio_ai",
        "url": "https://x.com/multi_serio_ai"
      },
      "checkedAt": "2026-09-23"
    }
  ],
  "rights": {
    "promptLicense": "CC-BY-NC-4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-nc/4.0/",
    "sourceLicenseUrl": "https://grokbot-icon-studio.serio-ai.chatgpt.site/en/license",
    "commercialUse": "restricted",
    "releaseReview": {
      "status": "pending",
      "reviewedBy": null,
      "reviewedAt": null,
      "evidence": null
    }
  }
}
```

日期字段在本内容 schema 中允许 ISO `YYYY-MM-DD`；不能为了补字段假设生成时间或模型版本。`sourceRecommendedTools` 是来源的说明，不用于生成“本站已验证”徽章。

分类词表至少声明：`avatars`（Avatars / 头像）；标签至少声明 `minimal`（Minimal / 极简）、`2d`（2D / 2D）、`bot-icon`（Bot icon / 机器人头像）、`image-to-image`（Reference image / 参考图转换）。

## 4. 现成页面文案

### 4.1 `en.json`

```json
{
  "title": "Minimal Bot Icon — Grokbot Style",
  "summary": "Turn a person or character in a reference image into a minimal 2D bot avatar with solid black capsule eyes. Adjust the composition, background and finishing details.",
  "seoTitle": "Minimal Bot Icon Prompt (Grokbot Style) | Image Prompt Book",
  "seoDescription": "Turn a reference image into a minimal 2D bot avatar. Customize composition, background, blush and shading, then copy the complete image prompt.",
  "inputRequirement": "Requires one reference image. Attach it in your image generation tool; this website does not upload or generate images.",
  "howToUse": [
    "Choose the available options and your prompt output language.",
    "Copy the complete prompt and paste it into an image generation tool that accepts reference images.",
    "Attach one image containing the person or character you want to transform, then submit it in that tool."
  ],
  "exampleNotice": "Example result, not a live preview. Changing options updates the prompt, not the image.",
  "verificationNotice": "Source examples have not been reproduced by Image Prompt Book. The exact model and settings are not verified.",
  "adaptationNotice": "Translated and parameterized from the original Korean prompt. These variations are not the author's original wording or an endorsement.",
  "licenseNotice": "Prompt: CC BY-NC 4.0. Attribution and noncommercial conditions apply. Example images have separate rights.",
  "parameterLabels": {
    "composition": "Composition",
    "background": "Background",
    "blush": "Blush",
    "shading": "Coloring",
    "featureBudget": "Key features"
  }
}
```

### 4.2 `zh-CN.json`

```json
{
  "title": "极简机器人头像 · Grokbot 风格",
  "summary": "将参考图中的人物或角色转换为带黑色胶囊眼的极简 2D 机器人头像，保留原图的关键外形，并调整构图、背景和上色细节。",
  "seoTitle": "极简机器人头像 Prompt（Grokbot 风格）| Image Prompt Book",
  "seoDescription": "把参考图转换为极简 2D 机器人头像。调整构图、背景、腮红和上色方式，复制完整生图提示词，并查看原始出处。",
  "inputRequirement": "需要一张参考图。请在生图工具中附上图片；本站不上传图片，也不直接生成图片。",
  "howToUse": [
    "选择需要调整的选项，并设置 Prompt 输出语言。",
    "复制完整 Prompt，粘贴到支持参考图的生图工具。",
    "在该工具中附上一张包含目标人物或角色的图片，再发送生成请求。"
  ],
  "exampleNotice": "案例效果，非实时预览。修改选项只更新 Prompt，不会重新生成图片。",
  "verificationNotice": "原站案例尚未由 Image Prompt Book 复现，具体模型与生成参数未验证。",
  "adaptationNotice": "根据韩文原文翻译并参数化改编；新增选项不等于原作者的原始表述或认可。",
  "licenseNotice": "Prompt 使用 CC BY-NC 4.0，包含署名和非商业条件；案例图片的权利另行确认。",
  "parameterLabels": {
    "composition": "构图",
    "background": "背景",
    "blush": "腮红",
    "shading": "上色方式",
    "featureBudget": "关键特征"
  }
}
```

## 5. 完整韩文原始 Prompt

本节以用户提供的原文为权威基线。仅去掉转贴中为排版添加的行尾 `\`、`\~`、数字后的转义点，恢复正常文本；不翻译、不删段落、不插入参数或署名到 Prompt 正文中。

```text
[목표]

사용자가 제공한 이미지 속 인물 또는 캐릭터를 검은 캡슐 눈을 가진 미니멀 2D 봇 아이콘 한 장으로 재해석한다.

원본에서 대상을 알아보는 데 필요한 외형적 특징을 가져오고, 얼굴 구조·눈·표정·구도·채색은 아래 규격을 따른다. 이 지침에서 Grok bot icon은 이 시각 규격을 가리킨다.

[원본에서 가져올 정보]

변환 대상의 피부톤 또는 얼굴 표면의 기본색, 머리색과 헤어 실루엣을 확인한다. 머리카락의 길이, 가르마, 곱슬기, 대표적인 앞머리와 묶음 형태는 원본을 기준으로 정한다.

특징적인 귀, 모자, 안경, 수염, 장식, 기계 부품 중 식별에 필요한 요소를 선택한다. 기본색은 유지하고, 형태로 보존할 핵심 특징은 최대 세 가지 정도로 추린다. 작은 디테일보다는 큰 실루엣을 우선한다.

피부색과 머리색을 특정 색으로 통일하지 않는다. 머리카락이 없거나 가려져 있다면 그 상태를 유지하며, 원본에 없는 앞머리·장신구·기계 부품을 추가하지 않는다.

원본의 표정과 사실적인 얼굴 구조는 복사하지 않는다. 복잡한 의상과 장비는 식별에 필요한 부분만 남긴다.

별도의 스타일 참고 이미지가 있더라도 캐릭터의 외형 정보는 변환 대상에서만 가져온다. 스타일 참고 이미지 속 피부색·머리색·헤어스타일·장식을 옮기지 않는다.

[얼굴]

크고 둥근 봇 얼굴에 단순화된 머리카락과 식별 특징을 결합한다. 귀여움은 표정 장식보다 둥근 비율과 기울어진 구도로 표현한다.

얼굴은 원본의 피부톤 또는 표면색을 바탕으로 넓고 매끈한 색면으로 그린다. 볼과 턱을 부드럽게 연결하고, 뾰족하거나 각진 턱과 사실적인 골격 묘사는 피한다.

입과 코는 그리지 않는다. 웃는 입, 작은 점 형태의 입, 고양이 입도 넣지 않는다.

양 볼에는 피부톤과 어울리는 낮은 채도의 옅은 타원형 홍조를 작게 넣는다. 홍조는 선이나 반짝임 없는 납작한 색면으로 표현한다.

눈과 홍조 주변에는 충분한 빈 얼굴 면적을 남긴다. 안경이나 수염이 핵심 식별 특징이라면 최소한의 형태로 유지할 수 있다. 안경은 두 눈을 가리지 않게 하고, 수염은 입이나 사실적인 얼굴 구조를 묘사하는 방식으로 그리지 않는다.

[눈]

눈은 검은색에 가까운 단색 캡슐 도형 정확히 두 개로 그린다. 얼굴을 똑바로 세웠을 때 세로로 긴 막대이며 양 끝은 둥글다. 세로 길이는 가로 폭의 약 2.5~3배로 하고, 두 눈은 같은 크기로 서로 평행하게 배치한다.

각 눈의 긴 축은 두 눈의 중심을 잇는 선과 직각을 이룬다. 이 배치를 유지하면서 [구도]에서 지정한 방향과 각도로 머리와 두 눈을 함께 기울인다. 가로로 누운 막대나 감은 눈 형태로 그리지 않는다.

각 캡슐을 빈틈없는 한 가지 색으로 채운다. 이 도형 자체가 눈이므로 내부에 별도의 안구나 동공을 그리지 않는다.

홍채, 흰자, 반사광, 반짝임, 그라데이션, 속눈썹, 눈꺼풀, 눈썹, 테두리 장식은 넣지 않는다. 숫자 1의 갈고리나 밑받침처럼 보이는 획도 없다.

원본의 눈 모양과 눈 색보다 이 규격을 우선한다.

[구도]

1:1 정사각형 캔버스에 캐릭터 한 명을 배치한다. 얼굴과 머리카락 또는 머리의 외곽 형태를 매우 크게 확대하여 화면 대부분을 채운다.

캐릭터가 화면 왼쪽 아래에서 고개를 기울여 들여다보는 구도다. 머리를 시계 방향으로 약 15~20도 기울여 화면 왼쪽 눈이 오른쪽 눈보다 조금 높게 보이게 한다. 얼굴, 두 눈, 머리카락과 부착된 장식은 같은 기울기를 따른다.

머리의 왼쪽과 아래쪽 가장자리는 화면 경계에서 자연스럽게 잘린다. 턱은 화면 아래에 닿거나 일부가 화면 밖으로 나가며, 오른쪽 위에는 짙은 배경의 여백을 남긴다.

두 눈은 앞머리나 장식에 가려지지 않고 온전히 보여야 한다. 머리 전체를 작게 넣는 정중앙 증명사진 구도나 좌우 대칭 구도는 피한다.

몸통과 손은 그리지 않는다. 식별에 필요한 경우에만 목이나 옷깃의 작은 일부를 화면 아래에 남긴다. 얼굴 확대와 가장자리 크롭은 의도된 구성이다.

[머리카락·장식·채색]

머리카락은 잔가닥 대신 몇 개의 크고 매끈한 덩어리로 단순화한다. 원본의 앞머리 방향, 길이감과 전체 실루엣을 유지한다.

외곽선이 거의 없는 색면 중심의 미니멀 2D 표현을 사용한다. 굵은 검은 윤곽선 대신 인접한 색면의 차이로 형태를 구분한다.

원본의 대표색으로 플랫하고 부드럽게 채색한다. 기본색에 한 단계 정도의 넓고 약한 음영만 더하며, 머리카락 하이라이트가 필요하면 큰 색면 한두 개로 제한한다.

장식과 기계 부품은 실루엣과 큰 연결부만 남긴다. 작은 나사, 배선, 회로, 촘촘한 패널선, 복잡한 문양은 생략한다.

작은 프로필 아이콘으로 축소해도 검은 캡슐 눈 두 개와 원본의 핵심 실루엣이 즉시 읽혀야 한다.

[배경과 제외 요소]

배경은 캔버스 전체에 이어지는 거의 검은색의 짙은 차콜 단색으로 한다. 배경 사물과 패턴은 넣지 않는다.

원형 프레임, 배지 테두리, 글자, 숫자, 로고, 워터마크, 말풍선, 감탄 표시, 글리터, 파티클, 빛 번짐, 렌즈 플레어는 제외한다.

실사, 3D 렌더, 유화 질감, 거친 스케치선, 과도한 광택, 복잡한 명암, 잔머리 묘사, 과밀한 장식은 피한다.

[충돌 처리]

규칙이 충돌하면 다음 순서를 따른다.

1. 장식 없는 검은 캡슐 눈 두 개.
2. 입과 코 없는 둥근 봇 얼굴.
3. 두 눈이 온전히 보이는 기울어진 초근접 구도.
4. 원본의 기본색과 핵심 식별 특징.
5. 기타 세부 사항.

앞머리가 눈을 가리면 대표적인 흐름을 유지하면서 길이·폭·위치를 조정한다. 핵심 장식이 크롭으로 완전히 사라지면 알아볼 수 있는 부분이 남도록 크기와 위치를 소폭 조정한다. 이 과정에서 원본에 없는 특징을 만들어내지 않는다.

[실행과 후속 수정]

사용자가 생성 또는 변환을 요청하면 설명이나 문구 없이 실제로 생성한 완성 아이콘 한 장으로 응답한다. 변환할 이미지 한 장만 첨부하고 별도의 질문을 하지 않았다면 기본 변환 요청으로 처리한다.

변환 대상 이미지를 확인할 수 없다면 첨부를 요청한다. 이미지에 여러 인물이 있고 대상이 지정되지 않았다면 누구를 변환할지 확인한다.

프롬프트 수정, 규칙 설명, 결과 분석 또는 사용법만 질문하면 글로 답하고 새 이미지를 생성하지 않는다. 제작 명세는 요청받았을 때만 글로 제공하며 이미지 안에는 넣지 않는다.

후속 수정에서는 요청한 부분만 변경하고, 별도 변경 요청이 없는 스타일 규격과 캐릭터 특징은 유지한다.

실제로 생성하거나 확인하지 않은 결과를 생성 완료 또는 검증 완료라고 설명하지 않는다.
```

## 6. 完整英文可定制模板

这是一份完整翻译与参数化改编，而不是短版。仅有五个占位符；它们的全部替换值已在第 8 节给出。用户复制时必须得到替换后的全文。

```text
[Goal]

Reinterpret the person or character in the image supplied by the user as a single minimal 2D bot icon with black capsule eyes.

Take the appearance details needed to recognize the subject from the original image. Follow the specifications below for facial structure, eyes, expression, composition and coloring. In these instructions, “Grok bot icon” refers to this visual specification.

[Information to take from the original]

Identify the subject's skin tone or base facial surface color, hair color and hair silhouette. Base the hair length, parting, curl, characteristic bangs and tied-up shapes on the original image.

Select the distinctive ears, hat, glasses, facial hair, accessories or mechanical parts needed for recognition. Preserve their base colors and retain at most {{featureBudget}} key distinguishing features in their shapes. Prioritize the overall silhouette over small details.

Do not standardize skin and hair to predetermined colors. If the hair is absent or covered, preserve that state. Do not add bangs, jewelry or mechanical parts that are not present in the original.

Do not copy the original expression or realistic facial anatomy. Keep only the parts of complex clothing and equipment needed for recognition.

Even if a separate style reference image is provided, take the character's appearance information only from the subject image. Do not transfer skin color, hair color, hairstyle or accessories from the style reference.

[Face]

Combine a large, round bot face with simplified hair and identifying features. Express cuteness through rounded proportions and the tilted composition rather than decorative facial expressions.

Draw the face as broad, smooth areas of color based on the original skin tone or surface color. Connect the cheeks and chin softly. Avoid a pointed or angular chin and realistic skeletal structure.

Do not draw a mouth or nose. Do not add a smiling mouth, a tiny dot mouth or a cat-shaped mouth.

{{blush}}

Leave plenty of empty facial area around the eyes and, when present, the blush. If glasses or facial hair are essential identifying features, they may be retained in minimal form. Glasses must not hide either eye. Facial hair must not be drawn in a way that depicts a mouth or realistic facial anatomy.

[Eyes]

Draw exactly two solid capsule shapes in a single near-black color. When the face is upright, each eye is a vertically elongated bar with rounded ends. Its height is approximately 2.5–3 times its width. Make both eyes the same size and parallel to each other.

The long axis of each eye must be perpendicular to the line connecting the centers of the two eyes. Preserve this relationship while tilting the head and both eyes together in the direction and at the angle specified under [Composition]. Do not draw horizontal bars or closed-eye shapes.

Fill each capsule completely with one uniform color. The shape itself is the eye; do not draw a separate eyeball or pupil inside it.

Do not add irises, eye whites, reflections, sparkles, gradients, eyelashes, eyelids, eyebrows or decorative borders. Do not add hooks or base strokes resembling the numeral 1.

Prioritize this specification over the shape and color of the original eyes.

[Composition]

{{composition}}

[Hair, accessories and coloring]

Simplify hair into a few large, smooth masses instead of individual strands. Preserve the original direction of the bangs, the sense of length and the overall silhouette.

Use minimal 2D rendering based on areas of color with almost no outlines. Separate forms through differences between adjacent colors rather than thick black contours.

{{shading}}

Retain only the silhouettes and major connections of accessories and mechanical parts. Omit small screws, wiring, circuits, dense panel lines and complex patterns.

Even when reduced to a small profile icon, the two black capsule eyes and the original subject's key silhouette must remain immediately legible.

[Background and exclusions]

Use {{background}} as a solid background across the entire canvas. Do not include background objects or patterns.

Exclude circular frames, badge borders, text, numbers, logos, watermarks, speech bubbles, exclamation marks, glitter, particles, glow and lens flare.

Avoid photorealism, 3D rendering, oil-paint texture, rough sketch lines, excessive gloss, complex light and shadow, individual flyaway hairs and overcrowded decoration.

[Conflict resolution]

If rules conflict, apply the following priority order.

1. Two undecorated black capsule eyes.
2. A round bot face without a mouth or nose.
3. A tilted extreme close-up composition in which both eyes are fully visible.
4. The original base colors and key identifying features.
5. Other details.

If bangs cover an eye, adjust their length, width or position while preserving their characteristic flow. If an essential accessory would disappear completely in the crop, slightly adjust its size and position so a recognizable part remains. Do not invent features absent from the original during these adjustments.

[Execution and follow-up edits]

When the user requests generation or transformation, respond with one actually generated, finished icon and no explanation or wording. If the user attaches only one image to transform and asks no separate question, treat it as a default transformation request.

If the subject image is unavailable, ask the user to attach it. If the image contains multiple people and no subject is specified, ask which person to transform.

If the user asks only for prompt editing, an explanation of the rules, result analysis or usage instructions, respond in text and do not generate a new image. Provide the production specification in text only when requested, and never put it inside the image.

For follow-up edits, change only the requested parts. Preserve the style specifications and character features unless the user explicitly requests changes to them.

Do not describe a result as generated or verified unless it has actually been generated or checked.
```

## 7. 完整简体中文可定制模板

```text
[目标]

将用户提供的图片中的人物或角色，重新诠释为一张带黑色胶囊眼的极简 2D 机器人头像。

从原图中提取识别该主体所必需的外形特征；脸部结构、眼睛、表情、构图和上色遵循以下规范。本说明中的 Grok bot icon 指的是这套视觉规范。

[从原图提取的信息]

确认转换对象的肤色或脸部表面的基础颜色、发色和头发轮廓。头发长度、分缝、卷曲程度、标志性刘海和束发形式均以原图为准。

从有辨识度的耳朵、帽子、眼镜、胡须、装饰和机械部件中，选择识别主体所必需的元素。保留基础颜色，形态上最多保留{{featureBudget}}项关键识别特征。优先保留整体轮廓，而非细小细节。

不要把肤色和发色统一成预设颜色。没有头发或头发被遮住时，应保留这种状态；不要添加原图中不存在的刘海、首饰或机械部件。

不要照搬原图的表情和写实脸部结构。复杂服装和装备只保留识别主体所必需的部分。

即使另有风格参考图，也只能从待转换主体的图片中提取角色外形信息。不要把风格参考图中的肤色、发色、发型或装饰移植到主体上。

[脸部]

将大而圆润的机器人脸，与简化的头发及识别特征结合。通过圆润比例和倾斜构图表现可爱感，而不是依靠表情装饰。

以原图的肤色或表面颜色为基础，用宽阔、平滑的色块绘制脸部。让脸颊与下巴柔和连接，避免尖下巴、棱角分明的下巴和写实骨骼结构。

不画嘴巴和鼻子。不要添加笑嘴、点状小嘴或猫嘴。

{{blush}}

在眼睛周围以及存在腮红时的腮红周围，留出充分的空白脸部区域。如果眼镜或胡须是关键识别特征，可以保留最简形式。眼镜不得遮挡双眼；不要通过胡须描绘出嘴巴或写实脸部结构。

[眼睛]

准确绘制两个接近黑色、单色实心的胶囊形眼睛。脸部摆正时，眼睛为两端圆润的竖长条，纵向长度约为横向宽度的 2.5～3 倍。两个眼睛大小相同，彼此平行。

每只眼睛的长轴，与两只眼睛中心连线垂直。在保持这种关系的同时，让头部与双眼一起按[构图]规定的方向和角度倾斜。不要画成横躺的长条或闭眼形状。

用同一种颜色无缝填满每个胶囊。这个图形本身就是眼睛，不要在内部另画眼球或瞳孔。

不要添加虹膜、眼白、反光、闪光、渐变、睫毛、眼皮、眉毛或边框装饰，也不要出现类似数字 1 的弯钩或底部横线。

这套眼睛规范优先于原图的眼形和眼睛颜色。

[构图]

{{composition}}

[头发、装饰与上色]

将头发简化为几个大而平滑的块面，而不是逐根发丝。保留原图刘海的方向、长度感和整体轮廓。

使用几乎没有轮廓线、以色块为主的极简 2D 表现。通过相邻色块的差异区分形体，而不是使用粗黑描边。

{{shading}}

装饰和机械部件只保留外轮廓与主要连接结构。省略小螺丝、布线、电路、密集面板线和复杂花纹。

即使缩小为很小的个人头像，也应立即看清两个黑色胶囊眼和原图主体的关键轮廓。

[背景与排除元素]

背景使用覆盖整个画布的{{background}}纯色。不要加入背景物体或图案。

排除圆形框、徽章边框、文字、数字、标志、水印、对话气泡、感叹符号、亮片、粒子、光晕和镜头眩光。

避免写实、3D 渲染、油画纹理、粗糙草图线、过度光泽、复杂明暗、零碎发丝和过于密集的装饰。

[冲突处理]

规则冲突时，按以下顺序优先处理。

1. 两个没有装饰的黑色胶囊眼。
2. 没有嘴巴和鼻子的圆润机器人脸。
3. 双眼完整可见的倾斜超近景构图。
4. 原图的基础颜色和关键识别特征。
5. 其他细节。

如果刘海遮住眼睛，在保留代表性走向的前提下调整其长度、宽度或位置。如果关键装饰会被裁切得完全消失，小幅调整其大小与位置，让可识别的部分留在画面中。此过程中不要创造原图里不存在的特征。

[执行与后续修改]

当用户要求生成或转换时，只返回一张实际生成完成的头像，不附解释或文字。如果用户只附上一张待转换图片，没有提出其他问题，则按默认转换请求处理。

如果无法查看待转换图片，请用户附图。如果图片中有多人而用户没有指定目标，先确认需要转换谁。

如果用户只询问 Prompt 修改、规则解释、结果分析或使用方法，则用文字回答，不生成新图片。只有在用户要求时才用文字提供制作规范，不要把规范放进图片中。

后续修改只改变用户要求的部分；没有被明确要求修改的风格规范和角色特征应保持不变。

对于没有实际生成或检查过的结果，不要声称已经生成完成或验证完成。
```

## 8. 全部参数与替换值

### 8.1 默认配置与约束

```json
{
  "composition": "left-standard",
  "background": "charcoal",
  "blush": "subtle",
  "shading": "soft",
  "featureBudget": "three"
}
```

| 参数 | 选项数量 | 类型 | UI 位置 |
| --- | --- | --- | --- |
| composition | 4 | 整段替换 | 构图章节 |
| background | 3 | 短语替换 | 背景句子内部 |
| blush | 2 | 整段替换 | 脸部章节的腮红段落 |
| shading | 2 | 整段替换 | 上色章节 |
| featureBudget | 2 | 短值替换 | 特征数量所在句子内部 |

四个构图选项将探头方向、旋转、眼睛高低、裁切边与留白作为一整个不可拆的值，避免只替换“左”字后留下右侧语义冲突。每个选项已经含有完整构图，不依赖其他隐藏文字或嵌套 token。

可编辑的 96 种组合仍全部维持正方形、单主体、两个胶囊眼、无嘴鼻与极简 2D。肤色与发色不是参数；它们必须来自参考图。

### 8.2 `parameters.json` 完整内容

`labels` 用于当前 UI 语言的短标签，`replacements` 用于完整 Prompt 替换。两者不能混用。

```json
{
  "schemaVersion": 1,
  "parameters": [
    {
      "id": "composition",
      "type": "select",
      "renderAs": "block",
      "default": "left-standard",
      "options": [
        {
          "id": "left-standard",
          "labels": {"en": "Lower left · 15–20°", "zh-CN": "左下探头 · 15–20°"},
          "replacements": {
            "en": "Place one character on a 1:1 square canvas. Enlarge the face and hair or outer head shape to fill most of the frame.\n\nThe character leans into view from the lower-left corner. Tilt the head approximately 15–20 degrees clockwise so that the eye on the left side of the image appears slightly higher than the eye on the right. The face, both eyes, hair and attached accessories must share the same tilt.\n\nCrop the left and bottom edges of the head naturally at the canvas boundary. The chin touches the bottom edge or extends partially outside the frame. Leave dark background negative space in the upper-right corner.\n\nBoth eyes must remain fully visible, unobstructed by bangs or accessories. Avoid a centered passport-photo composition with a small complete head, and avoid left-right symmetry.\n\nDo not draw a torso or hands. Leave only a small part of the neck or collar at the bottom when essential for recognition. The extreme close-up and edge cropping are intentional.",
            "zh-CN": "在 1:1 正方形画布中放置一个角色。将脸部及头发或头部外轮廓大幅放大，占据画面的大部分区域。\n\n角色从画面左下角倾斜探头。头部顺时针倾斜约 15～20 度，使画面左侧的眼睛略高于右侧。脸部、双眼、头发和附着的装饰保持相同倾斜。\n\n头部左侧和下侧边缘在画布边界自然裁切。下巴触及画面底边或部分超出画面，右上角保留深色背景的留白。\n\n双眼必须完整可见，不被刘海或装饰遮住。避免将完整头部缩小放在正中的证件照式构图，也避免左右对称。\n\n不画身体和手。只有在识别主体必需时，才在画面底部保留很小一部分脖子或衣领。脸部放大和边缘裁切是有意的构图。"
          }
        },
        {
          "id": "right-standard",
          "labels": {"en": "Lower right · 15–20°", "zh-CN": "右下探头 · 15–20°"},
          "replacements": {
            "en": "Place one character on a 1:1 square canvas. Enlarge the face and hair or outer head shape to fill most of the frame.\n\nThe character leans into view from the lower-right corner. Tilt the head approximately 15–20 degrees counterclockwise so that the eye on the right side of the image appears slightly higher than the eye on the left. The face, both eyes, hair and attached accessories must share the same tilt.\n\nCrop the right and bottom edges of the head naturally at the canvas boundary. The chin touches the bottom edge or extends partially outside the frame. Leave dark background negative space in the upper-left corner.\n\nBoth eyes must remain fully visible, unobstructed by bangs or accessories. Avoid a centered passport-photo composition with a small complete head, and avoid left-right symmetry.\n\nDo not draw a torso or hands. Leave only a small part of the neck or collar at the bottom when essential for recognition. The extreme close-up and edge cropping are intentional.",
            "zh-CN": "在 1:1 正方形画布中放置一个角色。将脸部及头发或头部外轮廓大幅放大，占据画面的大部分区域。\n\n角色从画面右下角倾斜探头。头部逆时针倾斜约 15～20 度，使画面右侧的眼睛略高于左侧。脸部、双眼、头发和附着的装饰保持相同倾斜。\n\n头部右侧和下侧边缘在画布边界自然裁切。下巴触及画面底边或部分超出画面，左上角保留深色背景的留白。\n\n双眼必须完整可见，不被刘海或装饰遮住。避免将完整头部缩小放在正中的证件照式构图，也避免左右对称。\n\n不画身体和手。只有在识别主体必需时，才在画面底部保留很小一部分脖子或衣领。脸部放大和边缘裁切是有意的构图。"
          }
        },
        {
          "id": "left-gentle",
          "labels": {"en": "Lower left · 10–15°", "zh-CN": "左下探头 · 10–15°"},
          "replacements": {
            "en": "Place one character on a 1:1 square canvas. Enlarge the face and hair or outer head shape to fill most of the frame.\n\nThe character leans into view from the lower-left corner. Tilt the head approximately 10–15 degrees clockwise so that the eye on the left side of the image appears slightly higher than the eye on the right. The face, both eyes, hair and attached accessories must share the same tilt.\n\nCrop the left and bottom edges of the head naturally at the canvas boundary. The chin touches the bottom edge or extends partially outside the frame. Leave dark background negative space in the upper-right corner.\n\nBoth eyes must remain fully visible, unobstructed by bangs or accessories. Avoid a centered passport-photo composition with a small complete head, and avoid left-right symmetry.\n\nDo not draw a torso or hands. Leave only a small part of the neck or collar at the bottom when essential for recognition. The extreme close-up and edge cropping are intentional.",
            "zh-CN": "在 1:1 正方形画布中放置一个角色。将脸部及头发或头部外轮廓大幅放大，占据画面的大部分区域。\n\n角色从画面左下角倾斜探头。头部顺时针倾斜约 10～15 度，使画面左侧的眼睛略高于右侧。脸部、双眼、头发和附着的装饰保持相同倾斜。\n\n头部左侧和下侧边缘在画布边界自然裁切。下巴触及画面底边或部分超出画面，右上角保留深色背景的留白。\n\n双眼必须完整可见，不被刘海或装饰遮住。避免将完整头部缩小放在正中的证件照式构图，也避免左右对称。\n\n不画身体和手。只有在识别主体必需时，才在画面底部保留很小一部分脖子或衣领。脸部放大和边缘裁切是有意的构图。"
          }
        },
        {
          "id": "right-gentle",
          "labels": {"en": "Lower right · 10–15°", "zh-CN": "右下探头 · 10–15°"},
          "replacements": {
            "en": "Place one character on a 1:1 square canvas. Enlarge the face and hair or outer head shape to fill most of the frame.\n\nThe character leans into view from the lower-right corner. Tilt the head approximately 10–15 degrees counterclockwise so that the eye on the right side of the image appears slightly higher than the eye on the left. The face, both eyes, hair and attached accessories must share the same tilt.\n\nCrop the right and bottom edges of the head naturally at the canvas boundary. The chin touches the bottom edge or extends partially outside the frame. Leave dark background negative space in the upper-left corner.\n\nBoth eyes must remain fully visible, unobstructed by bangs or accessories. Avoid a centered passport-photo composition with a small complete head, and avoid left-right symmetry.\n\nDo not draw a torso or hands. Leave only a small part of the neck or collar at the bottom when essential for recognition. The extreme close-up and edge cropping are intentional.",
            "zh-CN": "在 1:1 正方形画布中放置一个角色。将脸部及头发或头部外轮廓大幅放大，占据画面的大部分区域。\n\n角色从画面右下角倾斜探头。头部逆时针倾斜约 10～15 度，使画面右侧的眼睛略高于左侧。脸部、双眼、头发和附着的装饰保持相同倾斜。\n\n头部右侧和下侧边缘在画布边界自然裁切。下巴触及画面底边或部分超出画面，左上角保留深色背景的留白。\n\n双眼必须完整可见，不被刘海或装饰遮住。避免将完整头部缩小放在正中的证件照式构图，也避免左右对称。\n\n不画身体和手。只有在识别主体必需时，才在画面底部保留很小一部分脖子或衣领。脸部放大和边缘裁切是有意的构图。"
          }
        }
      ]
    },
    {
      "id": "background",
      "type": "select",
      "renderAs": "inline",
      "default": "charcoal",
      "options": [
        {
          "id": "charcoal",
          "labels": {"en": "Near-black charcoal", "zh-CN": "近黑炭灰"},
          "replacements": {"en": "near-black dark charcoal", "zh-CN": "接近黑色的深炭灰色"}
        },
        {
          "id": "midnight-blue",
          "labels": {"en": "Midnight blue", "zh-CN": "午夜深蓝"},
          "replacements": {"en": "near-black midnight blue", "zh-CN": "接近黑色的午夜深蓝色"}
        },
        {
          "id": "deep-plum",
          "labels": {"en": "Deep plum", "zh-CN": "深梅紫"},
          "replacements": {"en": "near-black deep plum", "zh-CN": "接近黑色的深梅紫色"}
        }
      ]
    },
    {
      "id": "blush",
      "type": "select",
      "renderAs": "block",
      "default": "subtle",
      "options": [
        {
          "id": "subtle",
          "labels": {"en": "Subtle blush", "zh-CN": "淡腮红"},
          "replacements": {
            "en": "Add a small, pale, low-saturation oval blush on each cheek that suits the skin tone. Render the blush as flat areas of color without lines or sparkles.",
            "zh-CN": "在两侧脸颊各加入一小块与肤色协调、低饱和度的浅椭圆形腮红。腮红使用平面的色块表现，不加线条或闪光。"
          }
        },
        {
          "id": "none",
          "labels": {"en": "No blush", "zh-CN": "无腮红"},
          "replacements": {
            "en": "Do not add blush or decorative cheek marks. Keep the cheeks as clean areas of the original skin tone or facial surface color.",
            "zh-CN": "不添加腮红或装饰性脸颊标记。脸颊保持原始肤色或脸部表面颜色的干净色块。"
          }
        }
      ]
    },
    {
      "id": "shading",
      "type": "select",
      "renderAs": "block",
      "default": "soft",
      "options": [
        {
          "id": "soft",
          "labels": {"en": "Soft shading", "zh-CN": "轻柔阴影"},
          "replacements": {
            "en": "Use the original representative colors in a flat, soft rendering. Add only one broad, subtle level of shading to the base colors. If hair highlights are needed, limit them to one or two large areas of color.",
            "zh-CN": "以原图的代表色进行平面、柔和的上色。仅在基础颜色上增加一层宽阔而微弱的阴影；如果需要头发高光，限制为一到两个大的色块。"
          }
        },
        {
          "id": "flat",
          "labels": {"en": "Fully flat", "zh-CN": "完全平涂"},
          "replacements": {
            "en": "Use the original representative colors as uniform flat areas. Do not add shading, gradients, highlights or gloss to the face, hair or accessories. Separate forms only through adjacent flat colors.",
            "zh-CN": "使用原图代表色进行均匀平涂。脸部、头发和装饰均不添加阴影、渐变、高光或光泽；仅通过相邻的平面色块区分形体。"
          }
        }
      ]
    },
    {
      "id": "featureBudget",
      "type": "select",
      "renderAs": "inline",
      "default": "three",
      "options": [
        {
          "id": "three",
          "labels": {"en": "Up to three features", "zh-CN": "最多三项特征"},
          "replacements": {"en": "three", "zh-CN": "三"}
        },
        {
          "id": "two",
          "labels": {"en": "Up to two features", "zh-CN": "最多两项特征"},
          "replacements": {"en": "two", "zh-CN": "两"}
        }
      ]
    }
  ]
}
```

### 8.3 核心渲染规则

以 `parameters[].default` 构建默认 selections，根据选项 ID 读取 `replacements[outputLocale]`，一次性替换对应 token。所有 replacement 均是最终字符串，没有下一层模板解释。

UI 短标签不进入复制文本。例如 `left-standard` 在按钮上显示“左下探头 · 15–20°”，但复制时写入整个五段构图说明。英文输出的特征数量必须使用 `three/two`，中文输出使用“三/两”，不能把“最多两项特征”再插进“最多保留…”形成重复语句。

更换无腮红或完全平涂时替换整个对应段落，不在原版“添加腮红/阴影”后附加一句相反要求。各组合无需调用 LLM。

## 9. 案例图候选与真实素材要求

原站 Full prompt results 中已定位的三个候选，均为 1000 × 1000 的图片。下面只记录来源地址，不嵌入或自动下载它们，也不将其视为与当前改编参数匹配的结果。

| 候选 | 原图地址 | 建议展示说明 |
| --- | --- | --- |
| dark-bob | `https://grokbot-icon-studio.serio-ai.chatgpt.site/images/full/dark-bob.png` | 深色短发、黑色胶囊眼的极简机器人头像 |
| blonde | `https://grokbot-icon-studio.serio-ai.chatgpt.site/images/full/blonde.png` | 金色头发、黑色胶囊眼的极简机器人头像 |
| teal | `https://grokbot-icon-studio.serio-ai.chatgpt.site/images/full/teal.png` | 青蓝色头发、黑色胶囊眼的极简机器人头像 |

该页也有 Short prompt results；不要把短版示例错误标成完整 Prompt 的结果。没有输入图时不创造 Before/After 配对，也不从输出图猜测原图或具体角色身份。

开发阶段 `examples.json` 的合法初始内容为：

```json
[]
```

生产 published 条目则不允许空 examples。维护者取得图片展示许可后，下载并处理为本地图片、核对尺寸和 alt、补齐以下数据，再启用展示。也可以替换为维护者实际生成、具有所需权利的新案例，但不能用占位图假装生图结果。

单张图片结构要求：

```ts
type Example = {
  id: string;
  src: string; // 本地 /examples/... 路径
  width: number;
  height: number;
  alt: { en: string; 'zh-CN': string };
  sourceUrl: string;
  provenance: 'source-reported' | 'project-verified';
  rights: {
    status: 'approved';
    basis: string;
    evidence: string;
    reviewedBy: string;
    reviewedAt: string;
  };
  recipe: null | {
    templateVersion: string;
    outputLocale: 'en' | 'zh-CN';
    selections: Record<string, string>;
    model: string;
    generatedAt: string;
  };
};
```

对于原站候选，若仅有转载许可而没有完整生成记录，使用 `provenance: 'source-reported'`、`recipe: null`；不得据此填写本站模板 `1.0.0` 或推断具体模型版本。`project-verified` 必须对应真实执行记录，不能从网页描述自动升级。

建议补图后的本地路径分别为 `/examples/grokbot-capsule-icon/dark-bob.webp` 等；这些是目标路径，目前不是已存在文件。

页面恒定显示案例来源与“非实时预览”。修改参数不会给案例图套滤镜、镜像或假生成动画。

## 10. 署名与公开分享文案

建议 `ATTRIBUTION.md` 同时保留以下两段，来源、许可和改动随内容一同分发。

### 英文

```text
Original prompt: Grokbot Icon — full prompt
Author/licensor: APG (@multi_serio_ai)
Source: https://grokbot-icon-studio.serio-ai.chatgpt.site/en
License: CC BY-NC 4.0 — https://creativecommons.org/licenses/by-nc/4.0/
Source license notice: https://grokbot-icon-studio.serio-ai.chatgpt.site/en/license
Changes by Image Prompt Book: formatting normalization of the supplied Korean text; English and Simplified Chinese translations; parameterized composition, background, blush, coloring and feature-count variations.
These adaptations are not endorsed or independently verified by the original author. The prompt is provided without a guarantee of output quality or suitability; consult the linked license and source notice. Example images have separate rights and are not automatically covered by the prompt license.
```

### 简体中文

```text
原始 Prompt：Grokbot Icon 完整版
作者/许可方：APG（@multi_serio_ai）
来源：https://grokbot-icon-studio.serio-ai.chatgpt.site/en
许可：CC BY-NC 4.0 — https://creativecommons.org/licenses/by-nc/4.0/
来源站许可说明：https://grokbot-icon-studio.serio-ai.chatgpt.site/en/license
Image Prompt Book 的修改：规范所提供韩文文本的排版；提供英文与简体中文翻译；将构图、背景、腮红、上色和特征数量整理为参数选项。
以上改编不代表原作者认可或独立验证。本 Prompt 不保证输出质量或特定用途适用性，请查看所链接的许可和来源说明。案例图片具有单独的权利条件，不自动适用 Prompt 许可。
```

给生图工具使用的“复制 Prompt”不附这段来源说明；“复制来源说明”单独复制该段，供用户公开分享或转载 Prompt 时使用。界面不可因此暗示署名是唯一条件或商业使用限制被取消。

## 11. 内容验收与回归测试

### 11.1 原文完整性

韩文原文恰有以下九个顶层章节，保持顺序，不遗漏最后一节：

`[목표]` → `[원본에서 가져올 정보]` → `[얼굴]` → `[눈]` → `[구도]` → `[머리카락·장식·채색]` → `[배경과 제외 요소]` → `[충돌 처리]` → `[실행과 후속 수정]`。

导入后对 original.ko.txt 建立字节快照或 SHA-256，并将后续变更视为来源版本更新，而不是普通 UI 调整。末尾“不声称未经生成/检查的结果已经完成”必须保留。

### 11.2 确定性测试

- 五个 parameter ID 与两份模板 token 集合完全一致；每个模板当前各使用一次。
- 默认值都存在，各 option ID 在参数内部唯一。
- 每个选项具备 en/zh-CN 的 label 和 replacement，且 replacement 内无嵌套 token。
- 对全部 `4 × 3 × 2 × 2 × 2 = 96` 种参数组合，各渲染两种语言，共 192 次；无 token 残留，无 undefined、代码围栏或 UI 标签误插入。
- 默认 en/zh-CN 完整输出建立两个 golden snapshot；包含九个对应语义章节、优先级列表和后续修改规则。
- 重复调用 composer 输出相同，不能依赖日期、浏览器语言或随机值。
- 与当前 UI 不同的输出语言也必须完成所有替换，不能混入另一种语言的 replacement。

### 11.3 语义回归重点

| 场景 | 断言 |
| --- | --- |
| left-standard / left-gentle | 左下探头、顺时针、左眼高、左/下边裁切、右上留白 |
| right-standard / right-gentle | 右下探头、逆时针、右眼高、右/下边裁切、左上留白 |
| standard / gentle | 只采用所选的 15–20 或 10–15 度，不混用 |
| blush=none | 使用完整“不添加腮红”段，不残留要求添加椭圆腮红的句子 |
| shading=flat | 使用完整平涂段，不残留要求增加阴影或头发高光的句子 |
| featureBudget=two | 特征段为最多两项，不影响眼睛比例中的 2.5–3 或其他数字 |
| 所有组合 | 两个黑色胶囊眼、无嘴鼻、原图颜色、1:1、单主体、极简 2D 保持 |

测试应检查完整所选段落和明确的冲突句，而不是简单禁止出现 blush/shadow/3D 等词，因为排除项和否定句本来会合法包含这些词。

以上测试只证明模板编排与已定义文本约束，不证明模型必然生成符合规范的图片。真实生图检查及图片权利审核需另行记录；本附录没有声称已经完成这些工作。
