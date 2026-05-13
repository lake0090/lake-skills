---
name: image-optimizer
description: >-
  Audits and fixes <img> for CLS (width/height), WebP, srcset/sizes, alt, and LCP
  attributes. Reads build config first, outputs a full scan-code plan, then runs
  npx lake-cimg. Use when optimizing images, srcset, WebP, CLS, LCP, or img tags;
  or when HTML/JSX/Vue with images was just produced and should be validated.
---

# Image Optimizer

Real repo: **analyze first, run second** — read config, output the full `scan-code` command in the reply, *then* run `npx`. Skip the tool flow for pure generated snippets with no project on disk.

## Best For

- 前端项目中的 `<img>` 质量治理（CLS/LCP/WebP/srcset/alt）
- AI 新生成页面后的图片问题快速审计与修复
- 需要批量梳理图片性能规范并输出可复查报告的场景

## Not For

- 只有纯文本示例、没有本地项目文件的场景
- 用户明确要求“仅讨论方案，不执行扫描命令”的终端受限场景
- 非 `<img>` 体系（如纯 Canvas/WebGL 渲染）的图像优化问题

## Required Inputs

- 项目根目录（或可推断的 `package.json` 路径）
- 扫描范围路径（建议传本次任务相关子目录）
- 构建配置文件（Nuxt/Vite/Vue/tsconfig/jsconfig 等）
- 用户对执行策略的约束（仅分析 / 允许执行终端）

## Expected Output

- 一条可执行且完整的 `lake-cimg scan-code` 命令
- 基于扫描结果的问题摘要（不粘贴整段 JSON）
- 修复策略与改动说明（含可跳过项和人工复查项）
- 复扫结果（Track A 通过或仅剩 Track B 例外）

## Failure Modes

- `referencePoints = 0` 或 `items` 为空：不是通过，需先排查 scope/root/alias
- 大量 `cannot_resolve`：优先纠正路径映射，不要直接改标记
- 缺失构建配置导致 alias 推断不可靠：需明确“假设”并提示风险
- 用户禁止执行命令：仅输出计划与命令草案，停止在分析阶段

## Verification

- 扫描前后结果对比可复查（同一路径、同一组 flags）
- 关键问题闭环：尺寸、alt、LCP 策略、懒加载策略
- Track A/Track B 分类清晰且可解释
- 输出报告遵循 `reference.md` 的 reporting 结构

## Reply focus (to avoid off-topic output)

- **This skill’s job** is: `lake-cimg` **plan** → **run** (if allowed) → reply in [Reporting](reference.md#reporting) form → **edit** `<img>`/Vue/JSX per steps below. That is the expected “shape” of the answer.
- **Do not** write long tangents on Node / `npx` / `pnpm` / why dependencies download, **unless** the user *explicitly* asked for that troubleshooting. A one-sentence “install `sharp` as devDependency, then run script” is enough for batch WebP; no pedagogy.
- **Batch file conversion** (e.g. sharp CLI) is only when the user asked to convert files on disk; it is **not** the default for `@image-optimizer` (default is **markup** + `lake-cimg` audit). If they only @ the skill, prioritize scan + diffs, not a conversion tutorial.

## Instructions

0. **Analyze before running** — Read `nuxt.config` / `vite.config` / `vue.config` / `tsconfig` (whichever the repo uses) and decide scope *before* any `npx lake-cimg`. Then **write the full intended command** in the reply (see step 3 format). If the user said "只分析 / 不跑命令 / 不要执行终端", stop at the plan.

1. **Collect scan params** from config:
   - `--project-root`: `package.json` dir → git root → cwd (state which).
   - `--public-dir`: default `public` + `static`; add any extra static dirs found in config. Repeatable.
   - `--alias` (repeatable; Nuxt → Vite/Vue → tsconfig, merge all):
     - **Nuxt**: map `~` → `.`, `@/` → `src`, `@@` → `.`, plus any custom `alias` entries in `nuxt.config`.
     - **Vite / Vue CLI**: `resolve.alias` / `chainWebpack` alias (e.g. `@images=src/assets/images`, `~=src`).
     - **tsconfig / jsconfig**: `compilerOptions.paths` → repo-relative dirs; merge with bundler entries.
     - Fallback: `@=src` only if nothing found. Never add unverified keys.

2. **Scope**: always pass a `path` (subtree the PR or task touches). Full-tree only on explicit baseline request. Start with `--issues-only --limit 100`; raise only if needed. A capped run is not a complete audit.

3. **Scan** (only after writing the plan in step 0):
   ```bash
   npx --yes lake-cimg@latest scan-code --issues-only --limit 100 \
     --project-root <root> --public-dir public --public-dir static \
     --alias "@=src" --alias "~=." <path>
   ```
   ```powershell
   npx --yes lake-cimg@latest scan-code --issues-only --limit 100 --project-root <root> --public-dir public --public-dir static --alias "@=src" --alias "~=." "<path>"
   ```
   PowerShell: use `;` not `&&`. Re-scan with the same flags; only add a flag when you find a genuinely missed config key.

4. **Read** the JSON: `referencePoints` (or `items.length`), per-item `issues[]` / `hints[]`, and the `summary` line (string in current `lake-cimg@latest`, not an object). **`referencePoints = 0` (or `items` empty) → not a pass** — no `<img>` refs in scope, wrong root, or wrong extensions. [Summarize](reference.md#reporting); do not paste full JSON.

5. **Pass — two tracks**
   - **Track A** (static/resolvable): `referencePoints > 0` and every item has `issues.length === 0` after real fixes.
   - **Track B** (dynamic: `v-lazyload`, runtime `src`, directive-only images, etc.): document pattern + waiver; still apply `width`/`height`/`alt`/`decoding` where useful. Track A clean + Track B list = done.

6. **Fix** each `<img>`: dimensions → WebP (skip <10 kB icons/logos) → `srcset`/`sizes` (skip <10 kB icons/logos) → `alt` → LCP (`fetchpriority`/`loading`/`decoding`). Use `hints` and [templates](reference.md#templates). **No `data:` placeholder `src`** (see [anti-patterns](reference.md#anti-patterns)).

7. Priority if time is limited: P0 = dimensions + alt + lazy/LCP; P1 = WebP + file convert; P2 = multi-width srcset.

8. **Re-scan** same path + same flags until Track A passes or only Track B gaps remain (documented).

9. **Skip+note** `needs_manual_review`, `cannot_resolve` (re-check `--project-root`/`--public-dir`/`--alias` before touching markup), `cannot_read_metadata`, and Track B items.

[reference.md](reference.md): command examples, scan scope table, reporting format, JSON shape, anti-patterns, srcset table, HTML templates, troubleshooting.

## Examples

- **Nuxt repo**: read `nuxt.config` aliases → `... --alias "@=src" --alias "~=." --alias "@images=assets/images" "views/ai"`.
- **mass `cannot_resolve`**: re-check alias/public-dir from config before touching markup.
- **Dynamic lazy-load**: Track B list + markup improvements (`width`/`height`/`alt`); no `data:` src.
