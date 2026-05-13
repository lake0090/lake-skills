---
name: figma-to-code
compatibility:
  tools:
    - Framelink_Figma_MCP
description: >-
  将 Figma 设计稿转换为生产级代码（Vue / React / HTML / CSS）。
  只要消息中出现 figma.com/design/ 或 figma.com/file/ 格式的链接，
  都立即使用本 skill，包括"帮我实现这个"、"照这个写组件"、"按这个设计做"、"把这个变成代码"
  等隐式表达，或任何附带 Figma 链接的组件/页面实现请求。
  未调用 get_figma_data 成功之前，禁止开始写任何界面代码。
---

# figma-to-code

## Quick Path

最短执行路径（先做完主链路，再补细节）：

1. 解析 URL（提取 `fileKey` 与 `node-id`）
2. 拉 MCP 数据（`get_figma_data` 成功后才进入代码阶段）
3. 结构拆解（先列区域与模块，再写代码）
4. 样式映射（优先 Figma MCP 设计语义，再映射到项目已有 token/class/component）
5. 生成代码（优先 flex/grid，减少无意义嵌套）
6. 验证结果（预览或构建/typecheck）
7. 输出摘要（`Figma MCP / Assumptions / TODOs / Tokens / Preview`）


## Required Inputs

- Figma 链接（含 `fileKey` 与可解析的 `node-id`）
- 目标技术栈（Vue / React / HTML / CSS / Tailwind 等）
- 目标落地路径（组件文件或页面文件）
- 预览目标（路由或可访问 URL；若无则需用户确认）

## Expected Output

- 可维护的前端结构代码（优先 flex/grid，避免无意义嵌套）
- 清晰的样式映射结果（design token 映射与字面量使用说明）
- 标准化输出摘要（`Figma MCP`、`Assumptions`、`TODOs`、`Tokens`、`Preview`）

## Failure Modes

- `get_figma_data` 调用失败（权限、参数、连接异常）时必须立即停止
- 检测到 `IMAGE` / `imageRef` 节点但 `download_figma_images` 失败时，必须停止并说明失败原因（不得静默用占位符冒充完成）
- URL 无法解析 `fileKey/node-id` 时必须先澄清，不得猜测
- 路由映射不明确时必须先询问用户，不得自行拼接 URL
- MCP 或预览链路不可用时，必须在摘要中说明 `Preview: skipped (<原因>)`

## Verification

- 结构验证：区域拆解清单与生成结构一致
- 样式验证：token 映射统计与字面量数量可解释
- 资产验证：若存在 `IMAGE` / `imageRef`，必须确认资源文件在目标项目路径内且已在代码中被真实引用（`<img>` / `background-image`）
- 预览验证：页面可打开、关键文本存在、主要布局无明显错位
- 结果验证：输出摘要块完整，且不遗漏失败/跳过原因

## Step 1：从链接提取参数并抓取数据

从 Figma URL 中解析：
- `fileKey`：`figma.com/design/<fileKey>/` 或 `figma.com/file/<fileKey>/`
- `nodeId`：URL 参数 `node-id=1234-5678`，转为 `1234:5678` 格式

调用前先确认 `get_figma_data` 的 JSON schema，确保参数格式正确。
每次只抓一个 frame / component，除非用户明确要求整页。
跳过 `visible: false` 的节点，在最终摘要的 Assumptions 中列出。

**抓取失败时立即停止**，输出：
```
Figma MCP: <错误类型>
```
然后提示用户检查文件权限或 MCP 连接后重试。**不继续实现任何界面代码。**

## Step 2：结构拆解（先做再写）

无论节点大小，都先输出结构拆解，再进入代码阶段。  
**未完成结构拆解清单前，禁止开始写任何界面代码。**

拆解顺序：
1. 先定页面骨架：`top / sidebar / main`
2. 再拆主内容：`left / right` 或 `content / aside`
3. 最后拆区域内部模块：按视觉块划分（header、list、card、toolbar、footer）

先给出粗粒度 checklist（每个区域 1-3 个任务）：

```markdown
Structure Breakdown
- [ ] Region: top
  - [ ] 搭建容器与主轴方向（flex/grid）
  - [ ] 放置核心子块（logo/nav/actions）
- [ ] Region: sidebar
  - [ ] 搭建容器与分区（header/menu/footer）
  - [ ] 处理选中态与滚动区
- [ ] Region: main
  - [ ] 先确定 left-right 二栏或单栏结构
  - [ ] 放置主内容块与次级信息块
- [ ] Region: overlays（可选）
  - [ ] 仅保留 tooltip/modal/badge 的 absolute 层
```

输出该清单后，再进入下一步。

## Step 3：样式映射

在写代码前，先处理 Figma MCP 返回的 variables、styles、components 等设计语义，再侦测项目的样式体系（详细规则见 `references/style-mapping.md`）。

映射顺序：Figma MCP 语义 / Code Connect → 项目组件与 token → CSS 变量 → Tailwind 配置 → 组件局部字面量

- **找到语义或组件匹配** → 优先复用项目已有组件、变量或 class，保持设计系统一致性
- **只有 raw value** → 在组件 scoped 样式里写字面量（hex / rem），不新增全局变量或 token 文件

## Step 3.5：图片资产处理（命中 IMAGE fill 时）

当节点含 `IMAGE` / `imageRef` / `gifRef`（或 MCP 返回图片 URL）时，优先按以下方式处理：

1. 尽量下载到项目内路径（如 `src/assets`、`public/images`）。
2. 下载后检查文件是否存在，且路径位于项目目录内。
3. 代码优先使用本地资产，避免长期依赖临时 URL。
4. 若用户明确同意占位符，可先用占位方案，并在摘要标记 `Assets: placeholder (user-approved)` 与 TODO。

Rules:
- 图片路径应保持在仓库内。

## Step 4：布局转换

详细规则见 `references/layout-rules.md`。核心原则：

用 flex / grid + gap / padding 表达所有间距和排列——这样组件天然响应式，
而 absolute 定位会把布局钉死在特定像素上，让后续维护极难。
`position: absolute` 只保留给真正的叠加层（tooltip、modal、badge 等）。
GROUP 节点默认扁平化，不在 DOM 里新增包裹层；若承载语义、交互或布局边界，则保留必要容器。

## Step 5：交互与事件

默认只实现视觉样式，不写业务逻辑。
需要事件处理的地方写 `// TODO: wire handler`，让调用方决定如何接入。
如果用户明确说"帮我写交互逻辑"，再按需补充。

## Step 6：输出摘要

代码输出后，**必须**附上以下摘要块：

```
─────────────────────────────
Figma MCP   : success
Assumptions : [跳过的节点 / 做出的推断，无则写"无"]
TODOs       : [待接入的 handler 列表，无则写"无"]
Assets      : downloaded: N | linked: N | placeholder: N
Tokens      : figma variables: N | project mapped: N | literals: N
Preview     : ok | skipped (<原因>)
─────────────────────────────
```

## Step 7：预览（有 UI 改动时执行）

优先使用当前环境可用的浏览器预览工具，并按以下顺序执行：

1. 读 `package.json` 或框架配置确认端口；未声明时按 3000 → 5173 → 8080 依次探测。
2. 根据项目类型（Next.js / Nuxt / Vue / Vite 等）追溯组件对应页面路由，结合 `base` 与 hash/history 模式拼出完整 URL。
3. 路由映射不明确时，**先询问用户，不得猜测 URL**。
4. 使用可用浏览器工具打开目标 URL，并完成至少一次可视化确认（如快照或截图）。
5. 若页面未加载完成，采用短等待重试（1-3 秒 + 状态检查），避免长时间盲等。

若当前环境无浏览器预览工具，则至少执行构建或类型检查（`lint` / `typecheck`）作为验证。

若预览与构建/类型检查都无法执行，跳过预览，并在摘要写 `Preview: skipped (<原因>)`。

Execution sketch:
```text
if preview tool is available:
  open target URL
  capture snapshot or screenshot
  set Preview = ok
else if lint/typecheck is available:
  run the strongest available command
  set Preview = skipped (no preview tool; lint/typecheck passed)
else:
  set Preview = skipped (<reason>)
```