# Harness 不是提示词，而是驾驭 Agent 的工程机制

Harness engineering 的核心不是写更复杂的提示词，而是把 AI 放进一套可控、可验证、可恢复的工作系统里。

Prompt engineering 主要解决“怎么告诉模型做事”。Harness engineering 解决的是“怎么让模型在真实任务中稳定地做事”。

## 核心判断

- 失败优先归因于 harness，而不是模型。
- 仓库必须成为 Agent 的唯一事实来源。
- 指令文件不能无限膨胀，入口文件应像路由器。
- 长任务必须有进度、决策、验证状态的持久化。
- Agent 不知道什么叫“完成”，完成必须由外部验证判定。
- 端到端测试、运行时信号、清洁交接，是长期可靠性的基础。

## Harness 的组成

一个 Agent harness 至少包括这些机制：

- `context delivery`：Agent 看见什么上下文。
- `tool interfaces`：Agent 如何使用工具。
- `planning artifacts`：任务如何被拆解、记录、恢复。
- `verification loops`：结果如何被检查。
- `memory systems`：状态如何跨会话保留。
- `sandboxes`：Agent 在什么边界内行动。
- `permissions`：哪些行为需要授权。

这些机制共同决定 Agent 能不能被驾驭，而不是只靠模型本身“聪明”。

## Workflow 和 Agent 的区别

`Workflow` 是 LLM 和工具通过预定义路径完成任务，流程基本固定。

`Agent` 是 LLM 动态决定流程和工具使用方式，自己掌控如何完成任务。

这个区别提醒我们：不是所有 AI 自动化都是 Agent。固定步骤、强约束、强验证的场景更适合 workflow；需要动态读代码、跑测试、根据错误调整策略的场景才更接近 agent。

## 可靠性不能只靠模型能力

生产级可靠性不能依赖“模型这次看起来很聪明”，而要靠 harness 提供：

- 明确边界
- 可重复检查
- 失败恢复
- 权限限制
- 人类介入点
- 自动化验证

更准确地说：

> 模型负责生成候选行动，harness 负责约束、检验和纠偏。

AI 能力的上限，不只取决于会不会 prompt，而取决于有没有把任务环境设计成 AI 能稳定工作的形态。
