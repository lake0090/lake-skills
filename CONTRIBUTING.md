# 参与贡献指南

感谢你为 `lake-skills` 做贡献。

本仓库强调“前端 AI Agent 工程化实践”，请优先提交**小步可评审**、**可验证**、**边界清晰**的改动。

## 分支命名

- `feat/<skill-name>`
- `fix/<skill-name>`
- `docs/<topic>`
- `chore/<topic>`

## 提交信息

推荐使用 Conventional Commits：

- `feat: add xxx skill`
- `fix: correct xxx trigger rule`
- `docs: update xxx examples`
- `test: add validator fixtures`

## Pull Request 检查项

- [ ] 改动目标清晰，且只聚焦一个主题（文档 / 示例 / 校验 / CI）
- [ ] Skill 文档包含使用边界（Best For / Not For）
- [ ] 改动可验证（脚本结果、示例结果或截图证据）
- [ ] 若有破坏性变更，已明确迁移方式
- [ ] 相关文档已同步更新

## 本地校验

提交前请至少执行：

```bash
python .github/scripts/validate_skills.py
npx skills add . --list
```

## 评审规则

- 合并前至少 1 个通过评审
- 禁止直接推送到 `main`
- 优先小 PR，避免超大混合改动
