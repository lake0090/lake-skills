# 如何写好 AGENTS.md

`AGENTS.md` 的目标不是把所有规范都写进去，而是让一个对项目一无所知的 AI 编程 Agent 快速理解最容易做错的部分。

## 为什么需要 AGENTS.md

大语言模型每次会话都像从零开始。Agent 对代码库的理解主要来自当前上下文、工具读取到的文件，以及项目提供的指令文件。

不同工具有不同约定：

| 工具 | 常见指令文件 |
|---|---|
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursorrules` / `CURSOR.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Gemini CLI | `GEMINI.md` |
| 通用约定 | `AGENTS.md` |

如果团队同时使用多个 AI 工具，维护一份通用的 `AGENTS.md` 会更省力。

## 指令越多，质量越差

`AGENTS.md` 不是越长越好。它和系统提示词、对话历史、代码上下文共享同一个上下文窗口。

文件越臃肿，真正关键的规则越容易被稀释。

一个实用判断标准：

> 删除这一行，Agent 会因此犯项目特有错误吗？

如果不会，就不该写进 `AGENTS.md`。

## 该写什么

用“新工程师第一天测试”判断：

> 如果一个高级工程师刚加入项目，哪些事情不明确告诉他，他第一天就会搞错？

这些内容值得写：

- 项目特有的反直觉约定。
- 包管理器、构建方式、测试命令等关键命令。
- 高风险目录和修改边界。
- 禁止事项。
- 技术栈和关键版本。
- 不能从代码里直接推断出的流程。

这些内容不适合写：

- “写整洁代码”“变量名要清晰”这类泛泛要求。
- ESLint / Prettier 能自动处理的格式规则。
- 短期 TODO 和当前状态。
- 过多风格偏好。

## 指令要可验证

差的指令：

```text
注意错误处理。
代码要保持简洁。
```

好的指令：

```text
所有接口请求必须处理 loading / success / empty / error 四种状态。
禁止直接修改 migrations/ 下已有文件，只能新增迁移。
```

可验证的规则更容易被 Agent 遵守，也更容易被 Review。

## 用指针代替内容

`AGENTS.md` 只放每次会话都需要的全局上下文。场景化细节应该放到单独文档，并通过链接引用。

```md
## 更多规范

- API 设计规范：docs/api-conventions.md
- 前端工作流：docs/frontend-ai-workflow.md
- Skill 设计指南：docs/skill-design-guide.md
```

这样可以避免入口文件无限膨胀。

## 简洁模板

```md
# Project Name

一句话说明项目是什么。

## Tech Stack

- Framework:
- Package manager:
- Test:

## Commands

- dev:
- build:
- test:

## Hard Rules

- 禁止 ...
- 修改 ... 会影响 ...

## References

- docs/xxx.md
```

## 结论

`AGENTS.md` 的核心是克制。它应该是路由器，不是百科全书。
