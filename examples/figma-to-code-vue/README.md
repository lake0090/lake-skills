# figma-to-code-vue 示例

该示例用于演示 `figma-to-code` 的输出形态（output shape）：从 Figma 节点输入到 Vue 组件产出，再到预览与构建校验。
它主要验证“生成结构是否可维护、Vue 工程是否可运行”，不是完整的线上 MCP 凭据打通案例。

## Scenario

从 Figma 设计稿中的“数据统计面板”节点生成一个可维护的 Vue 组件，用于后台首页模块。

## Input

- Figma URL：`https://www.figma.com/design/<fileKey>/<name>?node-id=<nodeId>`
- 目标技术栈：Vue 3 + SFC + scoped CSS
- 目标页面：`/`

## Run

```bash
npm install
npm run dev
```

构建验证：

```bash
npm run build
```

## Agent Workflow

1. 准备 Figma URL 与 `node-id`。
2. 调用 `figma-to-code` skill，先拉取 MCP 数据。
3. 按结构拆解生成或完善 Vue 组件代码。
4. 运行 `npm run dev` 做可视化检查。
5. 运行 `npm run build` 验证构建通过。

## Expected Result

- 页面能渲染统计面板，主结构和文本完整可见
- 布局主要使用 `flex/grid`，避免无意义 absolute 定位
- 输出包含 assumptions/TODOs/token 映射摘要信息
- 本地构建命令可通过

## Notes

- 本仓库不包含真实 Figma 凭据或授权流程样例。
- Figma MCP 可用性依赖你的本地认证与文件权限，因此该示例不保证在未授权环境下可直接复现完整抓取链路。
- 当前示例重点是验证 output shape 与 Vue 构建链路（`dev/build`）。
- 后续可补充公开可访问的 Figma case，用于展示端到端 MCP 实战链路。
- 完整记录见 `docs/prompt.md`、`docs/output-summary.md`、`docs/verification.md`。
