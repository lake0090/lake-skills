# lake-skills

Shared agent skills for the team.

This repository contains reusable `SKILL.md`-based skills for tools such as Cursor and Codex.

## Skills

| Skill | Purpose |
|---|---|
| `figma-to-code` | Convert Figma designs into maintainable frontend code. |
| `devtool-css-debug` | Sync DevTools CSS edits back to local source files. |

## Use with `npx skills`

```bash
# List available skills
npx skills add <owner>/lake-skills --list

# Install one skill
npx skills add <owner>/lake-skills --skill figma-to-code

# Install multiple skills
npx skills add <owner>/lake-skills --skill figma-to-code --skill devtool-css-debug

# Install to specific agents
npx skills add <owner>/lake-skills -a cursor -a codex

# Install all skills
npx skills add <owner>/lake-skills --all

# Install all skills to a specific agent
npx skills add <owner>/lake-skills --skill '*' -a cursor

# Install a specific skill to all agents
npx skills add <owner>/lake-skills --agent '*' --skill figma-to-code
```

Update installed skills:

```bash
npx skills update
```

## Development

1. Update the skill docs and referenced files
2. Test installation with `npx skills add <owner>/lake-skills --list` or `--skill <name>`
3. Open a PR and get at least one review
