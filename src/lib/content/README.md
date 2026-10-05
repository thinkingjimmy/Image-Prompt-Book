# src/lib/content/

> L2 | 父级: ../README.md

成员清单
schema.ts: Zod 单文件契约（meta/locale/parameters/examples（可选 input 对比原图）/taxonomy/collectionMeta/collectionContent），严格对象、HTTPS 链接、ISO 日期
files.ts: readJson()/readText()，条目与专题共用的文件读取和单文件 schema 校验
collections.ts: loadCollections()/collectionBlockers()，专题跨文件校验（成员存在、双语点评齐全、同系列重叠上限、至少 3 条已发布成员）
load.ts: loadContentLibrary() 读取条目后再读专题并做跨文件校验（token↔参数、默认值、翻译、真实图片尺寸、唯一性、fixture 隔离、发布前置条件），publicationBlockers()
catalog.ts: 服务端目录门面，isVisible() 为唯一发布谓词；getVisibleEntries/findEntry/findRedirect/getActiveCategories/queryCatalog，以及 getVisibleCollections/findCollection/featuredCollections/collectionsWithMember
query.ts: 纯函数列表规则（参数白名单解析、NFKC 与大小写折叠、AND 子串匹配、featured/latest 稳定排序、48 条分页）

[PROTOCOL]: Update this header when making changes, then check README.md.
