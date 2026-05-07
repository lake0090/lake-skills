---
name: figma-to-code
compatibility:
  tools:
    - Framelink_Figma_MCP
description: >-
  将 Figma 设计稿转换为生产级代码（Vue / React / HTML / CSS）。
  只要消息中出现 figma.com/design/ 或 figma.com/file/ 格式的链接，
  ，都立即使用本 skil, 包括"帮我实现这个"、"照这个写组件"、"按这个设计做"、"把这个变成代码"
  等隐式表达，或任何附带 Figma 链接的组件/页面实现请求。
  未调用 get_figma_data 成功之前，禁止开始写任何界面代码。
---

# figma-to-code

将 Figma 节点转换为干净、可维护的前端代码。核心原则：**先拉数据，再写代码**——
不靠截图猜测，不凭记忆臆造，所有尺寸、颜色、层级均来自 Figma MCP 的真实数据。

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

## Step 2：样式映射

在写代码前，先侦测项目的样式体系（详细规则见 `references/style-mapping.md`）。

侦测顺序：`tailwind.config.*` → `:root` CSS 变量 → `tokens*` 文件

- **找到匹配** → 用仓库已有的变量/class，保持设计系统一致性
- **未找到匹配** → 在组件 scoped 样式里写字面量（hex / rem），不新增全局变量或 token 文件

## Step 3：布局转换

详细规则见 `references/layout-rules.md`。核心原则：

用 flex / grid + gap / padding 表达所有间距和排列——这样组件天然响应式，
而 absolute 定位会把布局钉死在特定像素上，让后续维护极难。
`position: absolute` 只保留给真正的叠加层（tooltip、modal、badge 等）。
无意义的 GROUP 节点直接扁平化，不在 DOM 里新增包裹层。

## Step 4：交互与事件

默认只实现视觉样式，不写业务逻辑。
需要事件处理的地方写 `// TODO: wire handler`，让调用方决定如何接入。
如果用户明确说"帮我写交互逻辑"，再按需补充。

## Step 5：输出摘要

代码输出后，**必须**附上以下摘要块：

```
─────────────────────────────
Figma MCP   : success
Assumptions : [跳过的节点 / 做出的推断，无则写"无"]
TODOs       : [待接入的 handler 列表，无则写"无"]
Tokens      : mapped: N | literals: N | none
Preview     : ok | skipped (<原因>)
─────────────────────────────
```

## Step 6：预览（有 UI 改动时执行）

**优先使用 Cursor Browser Tab（`cursor-ide-browser`）**，并按以下顺序执行：

1. 先用 `browser_tabs` 检查并复用现有 tab；需要时新建 tab 再导航。
2. 读 `package.json` 或框架配置确认端口；未声明时按 3000 → 5173 → 8080 依次探测。
3. 根据项目类型（Next.js / Nuxt / Vue / Vite 等）追溯组件对应页面路由，结合 `base` 与 hash/history 模式拼出完整 URL。
4. 路由映射不明确时，**先询问用户，不得猜测 URL**。
5. 使用 `browser_navigate` 打开目标 URL；导航后必须执行 `browser_snapshot`，并至少一次 `browser_take_screenshot` 做可视化确认。
6. 若页面未加载完成，采用短等待重试（1-3 秒 + snapshot 检查），避免长时间盲等。

`cursor-ide-browser` 不可用时，降级调用 skill `devtool-css-debug`（`targetUrl` 必须明确，不得猜测）。

两种方式均失败时，跳过预览，并在摘要写 `Preview: skipped (<原因>)`。
`