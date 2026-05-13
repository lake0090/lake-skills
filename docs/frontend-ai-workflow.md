# 前端 AI 工作流

这份文档用于决定一个前端任务应该先走哪条 AI 工作流、何时停止、如何验证。它是总控流程，不替代具体 Skill。

## 任务路由

| 用户意图 / 输入 | 优先使用 | 说明 |
|---|---|---|
| 需求较大、跨模块、边界不清 | `large-task-planner` | 先拆 Scope、Non-goals、Subtasks、Acceptance Criteria，再进入实现。 |
| 包含 Figma 链接或设计节点 | `figma-to-code` | 必须先通过 Figma MCP 获取结构化数据，不基于截图猜测。 |
| 涉及图片、LCP、CLS、WebP、srcset、alt | `image-optimizer` | 先读项目配置，再确定扫描范围和修复策略。 |
| 需要 Review、PR 检查、代码质量审查 | `frontend-code-review` | 优先找行为回归、状态缺口、性能、可访问性和响应式问题。 |
| 需要把 DevTools CSS 修改回写源码 | `devtool-css-debug` | Experimental。仅在目标 URL 和映射路径明确时使用。 |

## 默认顺序

1. 如果任务模糊或超过一个编码会话，先使用 `large-task-planner`。
2. 如果任务来自设计稿，先使用 `figma-to-code`，再进入实现或调整。
3. 如果页面包含关键图片或媒体资源，再使用 `image-optimizer`。
4. 如果是已有代码变更或准备合并，使用 `frontend-code-review`。
5. 如果涉及浏览器里临时调样式，再考虑 `devtool-css-debug`。
6. 最后执行可用的验证命令，并说明未覆盖风险。

## 停止规则

- 没有 Figma 权限或 MCP 数据获取失败时，不继续猜测设计稿。
- 没有 API 字段、权限规则或验收标准时，不编造业务逻辑。
- `devtool-css-debug` 缺少明确 `targetUrl` 时，不猜 URL。
- 图片扫描结果为 0 个引用点时，不标记为通过，需要确认扫描范围。
- 无法运行验证命令时，必须说明原因和剩余风险。

## 验证矩阵

| 任务类型 | 最小验证 | 更强验证 |
|---|---|---|
| Figma 转代码 | `npm run build`、人工预览 | 桌面/移动端截图检查 |
| 图片优化 | 重新扫描同一范围 | Lighthouse / Web Vitals |
| 代码评审 | 文件级 Review 结论 | lint / typecheck / test |
| 中大型任务拆解 | Scope 和验收标准可检查 | 子任务可独立交给编码 Agent |
| CSS 回写 | 刷新页面确认样式生效 | diff 与源码位置双向核对 |

## 交付格式

完成任务时，最终输出至少包含：

```text
Summary:
- Task type:
- Workflow used:
- Files changed:
- Verification:
- Skipped / risks:
- Next step:
```

## 当前建议

当前仓库优先打磨：

- `figma-to-code` 的可运行 Vue 示例
- `validate_skills.py` 与 CI 校验
- `frontend-code-review` 的真实 Review 案例

`devtool-css-debug` 继续保持 Experimental，先记录限制，不急于承诺完整自动化。
