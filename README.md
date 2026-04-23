# lake-skills

Shared agent skills for the team.

This repository contains reusable `SKILL.md`-based skills for tools such as Cursor and Codex.

## Skills

| Skill | Purpose |
|---|---|
| `figma-to-code` | Convert Figma designs into maintainable frontend code. |
| `devtool-css-debug` | Sync DevTools CSS edits back to local source files. |
| `image-optimizer` | Audit and fix `<img>` markup (CLS, WebP, srcset, LCP) using `npx lake-cimg scan-code`. |

## Use with `npx skills`

```bash
# List available skills
npx skills add lake0090/lake-skills --list

# Install one skill
npx skills add lake0090/lake-skills --skill figma-to-code

# Install multiple skills
npx skills add lake0090/lake-skills --skill figma-to-code --skill devtool-css-debug --skill image-optimizer

# Install to specific agents
npx skills add lake0090/lake-skills -a cursor -a codex

# Install all skills
npx skills add lake0090/lake-skills --all

# Install all skills to a specific agent
npx skills add lake0090/lake-skills --skill '*' -a cursor

# Install a specific skill to all agents
npx skills add lake0090/lake-skills --agent '*' --skill figma-to-code
```

Update installed skills:

```bash
npx skills update
```

## Development

1. Update the skill docs and referenced files
2. **Local checkout:** from the repository root, run `npx skills add . --list` (or `npx skills add . --skill <name> -a cursor`) to verify skills before pushing
3. **Remote / published:** `npx skills add lake0090/lake-skills --list` or `npx skills add lake0090/lake-skills --skill <name>`
4. Open a PR and get at least one review
