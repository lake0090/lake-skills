# Skill 设计指南

本指南用于维护 `skills/*/SKILL.md`。目标是让每个 Skill 都能被 Agent 正确触发、稳定执行、失败可停止、结果可验证，并可长期维护。

## 设计目标

- 可触发：`description` 明确 WHAT + WHEN，包含关键触发词。
- 可执行：输入、步骤、工具依赖、输出格式清晰且可操作。
- 可停止：关键依赖失败时立即停止，不猜测补全。
- 可验证：有明确验收动作（脚本、构建、快照、检查清单）。
- 可维护：边界、失败模式、引用文件、术语定义一致。

## Frontmatter 规范（必填）

每个 `SKILL.md` 都必须包含 YAML frontmatter：

```md
---
name: your-skill-name
description: Brief description of what this skill does and when to use it
disable-model-invocation: true
---
```

字段要求：

- `name`：仅小写字母、数字、连字符，长度不超过 64。
- `description`：非空，长度不超过 1024，使用第三人称描述。
- `disable-model-invocation`：默认 `true`；仅当需要环境自动触发时省略。

命名建议：

- 推荐：`figma-to-code`、`image-optimizer`、`split-to-prs`
- 避免：`helper`、`toolkit`、`utils`

## description 写法（决定是否会被触发）

`description` 至少包含两部分：

1. WHAT：Skill 能做什么（具体能力）
2. WHEN：什么场景应触发（关键词、用户表达、文件类型）

示例（推荐）：

```yaml
description: Convert Figma nodes into production-ready Vue/React/HTML/CSS code. Use when a message includes figma.com/design or figma.com/file links, or when the user asks to implement UI from a Figma design.
```

示例（不推荐）：

```yaml
description: Helps with frontend work.
```

## 推荐正文结构

核心 Skill 建议包含以下章节（可按实际精简，但不要缺失关键信息）：

```md
## Quick Path
## Required Inputs
## Expected Output
## Failure Modes
## Verification
## Step 1...
## Step 2...
```

可选章节：

```md
## Best For
## Not For
## Rules
## Additional Resources
```

## 编写原则

- 先边界后步骤：先写“不该做什么/何时停止”，再写“如何执行”。
- 强约束用词：用“必须 / 禁止 / 立即停止”，避免模糊语言。
- 术语统一：同一概念全篇只用一个词（例如始终用“nodeId”）。
- 渐进披露：`SKILL.md` 保持精简（建议 < 500 行），细节放 `references/`。
- 引用可达：只引用会被读取且真实存在的文件，优先一层引用。
- 校验优先：能脚本化检查的规则，不要只写口头建议。

## 工作流设计建议

当 Skill 需要多步执行时，优先使用“主链路 + 分支条件”写法：

1. 主链路：最短可成功路径（解析输入 -> 执行 -> 验证 -> 输出）
2. 分支条件：失败、缺参、工具不可用时的处理方式
3. 停止条件：哪些错误必须终止并向用户报告

建议在 `SKILL.md` 内直接给出最小执行草图：

```text
if dependency_ok:
  run main workflow
  validate result
else:
  stop with explicit error
```

## 输出与验收

每个 Skill 都应定义固定输出格式，便于人工或 CI 检查。例如：

- 摘要块（状态、假设、TODO、验证结果）
- 标准标题结构（Summary / Test Plan / Risks）
- 机器可解析 JSON（字段固定）

验收至少覆盖以下两项：

- 过程验收：关键步骤是否执行（如 API 调用成功、脚本返回 0）
- 结果验收：产物是否符合预期（构建通过、页面可见、文件存在）

## 反模式

- 只写“怎么做”，不写“不适用场景”和“停止条件”。
- 外部依赖失败后仍要求 Agent 继续产出“看起来正确”的结果。
- 写“优化体验”“保持优雅”等不可验证的泛化要求。
- 将大量背景知识塞进 `SKILL.md`，导致核心规则被淹没。
- 引用不存在、不可读、过深层级的文档。
- 给出多个同等默认方案，导致执行路径摇摆。

## 示例与配套文件要求

核心 Skill 建议配一个最小示例目录（`examples/<skill-name>/`）。至少包含：

- `Scenario`：场景与触发条件
- `Input`：输入样例
- `Run` 或 `Verification`：执行或验证方式
- `Expected Result`：期望产物
- `Known Limits`：已知限制

可选配套：

- `references/*.md`：详细规则、映射表、术语表
- `scripts/*`：校验脚本、辅助生成脚本

## 发布前检查清单

- [ ] `name` 与 `description` 满足格式约束
- [ ] `description` 同时写清 WHAT + WHEN
- [ ] 有明确停止条件，且失败不会继续“猜测实现”
- [ ] 有最小验证动作，且可重复执行
- [ ] `SKILL.md` 不臃肿，细节已拆分到 reference
- [ ] 所有引用文件都存在且路径正确
