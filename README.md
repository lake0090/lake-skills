# lake-skills

面向前端团队的 AI Agent Skills 工程化仓库。

`lake-skills` 的目标不是做“大而全提示词集合”，而是沉淀前端高频 AI 工作流，形成可安装、可验证、可演示、可持续维护的技能资产。

## 这个仓库解决什么问题

- Figma 转代码容易靠截图猜测，结果难复现
- AI 生成代码缺少工程边界与设计系统约束
- 图片性能问题（CLS/LCP/WebP/srcset）缺乏系统化治理
- DevTools 的样式修改难回写到源码
- 中大型需求缺少可执行拆解与交接规范

## 核心 Skills

| Skill | 典型场景 | 状态 |
|---|---|---|
| `figma-to-code` | 基于 Figma MCP 数据生成 Vue/React/HTML/CSS 代码 | Active |
| `image-optimizer` | 审计并修复图片性能问题（CLS/LCP/WebP/srcset/alt） | Active |
| `devtool-css-debug` | 将 DevTools CSS 调整同步回源码文件 | Experimental |
| `frontend-code-review` | 前端变更评审（行为、状态、性能、可访问性、响应式） | Active |
| `large-task-planner`（subagent） | 将中大型前端任务拆解成可执行子任务 | Active |

## 快速开始

```bash
# 查看技能列表
npx skills add lake0090/lake-skills --list

# 安装单个技能
npx skills add lake0090/lake-skills --skill figma-to-code

# 安装多个技能
npx skills add lake0090/lake-skills --skill figma-to-code --skill image-optimizer

# 安装全部技能
npx skills add lake0090/lake-skills --all
```

## 本地开发与校验

1. 修改 `skills/` 下的 `SKILL.md` 和相关 references。
2. 运行校验脚本：
   - `python .github/scripts/validate_skills.py`
3. 验证本地可安装：
   - `npx skills add . --list`
4. 提交 PR 并完成至少一轮评审。

## 示例工程

- `examples/figma-to-code-vue`：Figma 转 Vue 的可复现实例

## 文档导航

- [Skill 设计指南](docs/skill-design-guide.md)
- [前端 AI 工作流](docs/frontend-ai-workflow.md)

## Blog

- [Harness 不是提示词，而是驾驭 Agent 的工程机制](blog/harness-engineering.md)
- [如何写好 AGENTS.md](blog/writing-agents-md.md)
- [Spec 驱动的 Agent 工作流](blog/spec-driven-agent-workflow.md)

## Roadmap

- 将 `examples/figma-to-code-vue` 纳入 CI 构建验证
- 为 `large-task-planner` 补充一个真实拆解案例
- 为 `image-optimizer` 增加一个最小图片性能示例

## 实验性说明

`devtool-css-debug` 当前为 `Experimental`。在受控场景下可用，但不同构建链路下的样式映射策略仍在持续打磨。

## 子代理：`large-task-planner`

当需求跨模块、边界不清晰，或预计超过一个编码会话时，建议先调用 `large-task-planner` 产出可执行计划与交接提示，再进入实现阶段。

快速安装（请根据系统选择命令复制执行）：

**Mac/Linux：**
```sh
mkdir -p ~/.agents
curl -o ~/.agents/large-task-planner.md https://raw.githubusercontent.com/lake0090/lake-skills/main/agents/large-task-planner.md
```

**Windows（PowerShell）：**
```powershell
mkdir $HOME\.agents -Force
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/lake0090/lake-skills/main/agents/large-task-planner.md" -OutFile "$HOME\.agents\large-task-planner.md"
```
