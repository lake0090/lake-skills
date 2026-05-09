# lake-skills

团队共享的 Agent Skills 仓库。

本仓库收录了可复用的 `SKILL.md` 技能，适用于 Cursor、Codex 等工具。

## 技能列表

| 技能名 | 用途 |
|---|---|
| `figma-to-code` | 将 Figma 设计稿转换为可维护的前端代码。 |
| `devtool-css-debug` | 将 DevTools 中的 CSS 调整同步回本地源码。 |
| `image-optimizer` | 使用 `npx lake-cimg scan-code` 审查并修复 `<img>`（CLS、WebP、srcset、LCP）。 |

## 使用 `npx skills`

```bash
# 查看可用技能
npx skills add lake0090/lake-skills --list

# 安装单个技能
npx skills add lake0090/lake-skills --skill figma-to-code

# 安装多个技能
npx skills add lake0090/lake-skills --skill figma-to-code --skill devtool-css-debug --skill image-optimizer

# 安装到指定 agent
npx skills add lake0090/lake-skills -a cursor -a codex

# 安装全部技能
npx skills add lake0090/lake-skills --all

# 安装全部技能到指定 agent
npx skills add lake0090/lake-skills --skill '*' -a cursor

# 将某个技能安装到全部 agent
npx skills add lake0090/lake-skills --agent '*' --skill figma-to-code
```

更新已安装技能：

```bash
npx skills update
```

## 开发说明

1. 更新技能文档及其引用文件
2. **本地仓库验证：** 在仓库根目录执行 `npx skills add . --list`（或 `npx skills add . --skill <name> -a cursor`），确认技能可用后再提交
3. **远程 / 已发布验证：** 执行 `npx skills add lake0090/lake-skills --list` 或 `npx skills add lake0090/lake-skills --skill <name>`
4. 提交 PR 并至少完成一次 Code Review

## `large-task-planner` 子代理（长任务规划）

当前端任务属于中大型、跨模块，或需求边界不清晰时，建议先用该子代理做规划，再进入编码。

该子代理擅长：
- 明确范围（Scope）与非目标（Non-goals）
- 将任务拆成可执行子任务（Subtasks）
- 生成可直接交给编码代理的交接提示（Handoff Prompts）

### 调用方式

使用 Subagent 工具时，建议至少包含：
- `subagent_type: "large-task-planner"`
- 简洁的 `description`（例如：`plan checkout refactor`）
- 包含目标、约束、期望输出格式的 `prompt`

示例（概念示例）：

```json
{
  "description": "plan checkout refactor",
  "subagent_type": "large-task-planner",
  "prompt": "Plan a medium-sized checkout page refactor. Define scope, split into subtasks, and generate handoff prompts. Do not implement code."
}
```

### 命令行直接下载 `large-task-planner.md`

PowerShell（Windows）：

```powershell
New-Item -ItemType Directory -Force ".cursor/agents" | Out-Null
Invoke-WebRequest "https://raw.githubusercontent.com/lake0090/lake-skills/main/.cursor/agents/large-task-planner.md" -OutFile ".cursor/agents/large-task-planner.md"
```

curl（macOS / Linux / Git Bash）：

```bash
mkdir -p .cursor/agents
curl -L "https://raw.githubusercontent.com/lake0090/lake-skills/main/.cursor/agents/large-task-planner.md" -o ".cursor/agents/large-task-planner.md"
```
