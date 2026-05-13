---
name: frontend-code-review
description: Review frontend code changes for React, Vue, HTML, CSS, and TypeScript. Use when asked to review a PR, inspect frontend changes, check UI implementation quality, or find issues in components, pages, styling, performance, accessibility, responsiveness, state handling, or image usage.
---

# Frontend Code Review

## Goal

在合并前发现前端高风险问题，优先识别行为回归、状态缺口、性能问题、可访问性问题和可维护性问题。

## Inputs

- 变更范围（PR diff、提交列表或文件清单）
- 目标技术栈（React/Vue/Next.js/Nuxt/HTML/CSS/TS）
- 评审边界（仅前端、是否包含测试、是否允许建议重构）
- 质量门槛（lint/typecheck/build/截图验证/性能指标）

## Workflow

1. 先看变更文件，再看上下文依赖，避免脱离 diff 给建议。
2. 识别框架与样式体系（CSS Modules/Tailwind/SCSS/设计系统组件）。
3. 优先检查行为正确性，再检查样式一致性与代码风格。
4. 检查状态完整性：`loading`、`empty`、`error`、`success`、`permission denied`。
5. 检查响应式与可读性：断点布局、文本溢出、交互可点击区域。
6. 检查图片与媒体：`alt`、尺寸、LCP 策略、懒加载策略。
7. 检查状态管理与渲染开销：无效状态、重复请求、不必要副作用和重渲染。
8. 输出带定位与影响说明的问题列表，区分必须修复和建议优化。

## Rules

- 不重写无关代码，不把“评审”变成“重构提案”。
- 禁止空泛建议（如“可以更优雅”）；每条问题必须可执行。
- 每个问题都要包含：影响、触发条件、位置、修复方向。
- 证据优先于主观偏好；同类问题可合并，但不能省略关键影响。
- 若未发现阻断问题，必须明确写出“未发现阻断项”，并说明残余风险。

## Output

按固定顺序输出：

1. Findings（按严重级别排序）
2. Open Questions（信息不足导致无法确认的点）
3. Test Gaps（缺失的验证项）
4. Brief Summary（1-3 行结论）

每条 Finding 建议格式：

```text
[Severity] 标题
- Impact: ...
- Location: <file/symbol>
- Why: ...
- Suggestion: ...
```

## Verification

- 能运行时：`npm run lint`、`npm run typecheck`、`npm run build`
- UI 变更建议补：关键页面截图检查（桌面/移动端）
- 性能敏感变更建议补：Lighthouse 或等价指标检查
- 无法执行命令时：明确标注“未执行项”和潜在风险

## Failure Modes

- 只有片段代码、缺少上下文：先标记评审范围，再给有限结论。
- 无法访问 diff 或目标文件：停止猜测，要求补充输入。
- 产品规则缺失（权限、状态预期不明）：列为 Open Questions，不臆造结论。
- 验证命令不可运行：输出可执行的最小验证清单，并标注未覆盖风险。
