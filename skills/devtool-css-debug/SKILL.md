---
name: devtool-css-debug
compatibility:
  tools:
    - chrome-devtools
    - ask-question
description: Syncs DevTools CSS edits to local source files via injected page script. Triggers on write-back, CSS-to-source sync, style integration, DevTools edits, and CSS debugging.
---

# DevTools CSS Debug

## Best For

- 前端页面样式微调后，需要把 DevTools 改动回写源码
- 需要保留一次调试会话中的样式变更 diff 证据
- Vue/React 等项目中“样式已确认、待落盘”的场景

## Not For

- `targetUrl` 不明确或无法访问的场景
- 无法使用 `chrome-devtools` MCP 的环境
- 动态运行时样式（频繁 transform/transition）需长期绑定逻辑的场景

## Required Inputs

- `targetUrl`（必填，禁止猜测）
- 项目路径（用于推断 `sourceRoot` 与 `srcDir`）
- 可访问的 `chrome-devtools` MCP 工具
- 用户对删改策略的确认（尤其是 `removed` 规则）

## Expected Output

- 可复查的 CSS diff（`modified/added/removed/inline/skipped`）
- 明确的源码映射结果（已落盘文件与未解析项）
- 写回后的验证结论（刷新后样式生效情况）
- 一行总结（文件数量 + 分类计数 + 未解决原因）

## Failure Modes

- 未提供 `targetUrl`：必须先询问，禁止继续
- 基线丢失（刷新/导航导致 session reset）：必须重走 Step 1
- URL 与目标不一致：必须停止写回
- 样式表跨域/无 source map：需标记 unresolved，不得强行猜测

## Verification

- `assertUrlMatchesTarget` 返回 `ok: true`
- `getDiff()` 非空且结构合法
- 写回后页面刷新，关键样式符合预期
- 最终 summary 含 unresolved 与 skipped/runtime 计数

## Hard Rules
 
- **No guessed URL.** If `targetUrl` missing, ask first.
- **No `getDiff` before Step 2b gate.** Exception: defined in Step 2b, fires once per session.
- **Never embed the script** — no paste, base64, `atob`, `JSON.stringify`, temp file, or node relay. Step 1 is a short snippet only.
- **All URL/wait/norm logic lives in `scripts/css-tracker.js`.** Do not re-implement.
- **Session resets** on navigate/refresh/Step 1 re-run — gate exception voids.
- **All browser interactions use `chrome-devtools`**: `navigate_page`, `evaluate_script`. Never open a browser manually.

---

 
## Prerequisites

| Item | Rule |
|------|------|
| `targetUrl` | Required every run; if missing, ask. |
| `sourceRoot` | Static serve dir: check project root for `public/` → `static/` → `assets/`; fallback to project root. |
| `srcDir` | Source dir: check project root for `src/` → `app/` → `pages/`; use first match. |
 
Navigate to `targetUrl` (or refresh if already there). Open browser DevTools console before injecting.

---

## Step 1 — Inject + Baseline
 
Copy to `sourceRoot` (one-time, skip if exists). Priority: `public/` → `static/` → project root.
 
```bash
if [ ! -f "<sourceRoot>/css-tracker-dev.js" ]; then cp "<skill-path>/scripts/css-tracker.js" "<sourceRoot>/css-tracker-dev.js"; fi
```

```powershell
if (!(Test-Path "<sourceRoot>/css-tracker-dev.js")) { Copy-Item "<skill-path>/scripts/css-tracker.js" "<sourceRoot>/css-tracker-dev.js" }
```
 
Use `chrome-devtools.evaluate_script()` (`s.src` matches actual path):
```javascript
(async (T) => {
  if (!window.__cssTracker) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "/css-tracker-dev.js";
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  const r = await window.__cssTracker.runLoadAndUrlGates(T);
  if (!r.ok) return JSON.stringify({ phase: "gates", ...r });
  return JSON.stringify({ phase: "ok", init: window.__cssTracker.init() });
})("PASTE_targetUrl");
```
 
On `!r.ok`: stop, report mismatch. On success: tell user to edit in DevTools.

---

## Step 2b — Gate

Use `AskQuestion` when available; otherwise the same binary in plain text.

- **Apply** 已改完 → Step 3
- **Exit** — stop (no later steps)

**Exception (once per session):** User already said editing is done → skip gate. Resets with **Session resets** in Hard Rules.

---

## Step 3 — Diff

Via `chrome-devtools.evaluate_script()`:
```javascript
JSON.stringify(window.__cssTracker.assertUrlMatchesTarget("PASTE_targetUrl"));
JSON.stringify(window.__cssTracker.getDiff());
```

| Condition | Action |
|-----------|--------|
| `__cssTracker` undefined | Baseline lost — offer Step 1 |
| `assertUrlMatchesTarget` `ok: false` | Stop — no write |
| `getDiff()` → empty | No changes detected — offer Step 1 |

Cross-domain sheets are unreadable; note in Step 6.

---

## Step 4 — Map to Files
 
**diff shape：**
- `sheets[].modified[]`: `{ sel, props, sourceFile?, type?, className? }`
- `sheets[].added[]` / `sheets[].removed[]`
- `sheets[].skipped`: `{ skipped: true, reason, count }`
- `inline[]`: `{ el, props }` 或 `{ el, added/removed }`

**Mapping 规则（按顺序匹配，首中即止）：**
 
**sheets[]：**
1. `sourceFile` 存在（常见于 `data-v-*`）→ 直接打开文件，在 `<style scoped>` 定位 `sel` 写回。
2. `href` 为同源 URL → 映射本地文件；build URL（`/_next/`、`/assets/`）先 grep selector 再定位。
3. `href === "Inline"` 且无 `sourceFile` → 依次推导：  
   `routeHint.path/hash` → `srcDir/router/index.js` + `location.pathname/hash` → 页面 import 链（`sel` 关键词或 `routeHint.classes`）→ 目标 `.vue` 的 `<style scoped>`。  
   仍失败则 grep `srcDir`；多结果让用户确认。
4. `skipped: true` → 不写回，记入 Step 6。
**inline[]：**
5. `sourceFile` 存在（元素有 `data-v-*`）→ 打开文件，在 template 定位元素并写回 class/style。
6. 元素无 `data-v-*` → 依次推导：  
   `routeHint.path/hash` + `routeHint.classes` → `srcDir/router/index.js` + `location.pathname/hash` + import 链。  
   命中后写回 class/style。  
   框架运行时元素（如 `van-*`/`el-*` 根、明显动态 `transform`/`transition-duration`/`width`）不写回，标记 `runtime` 记入 Step 6。
7. grep 无结果或不明确 → 询问用户，不猜。

---

## Step 5 — Write Back

- `modified`: replace existing rule/block.
- `added`: append to target block/file.
- `removed`: confirm with user before delete.
- After write-back, refresh page and verify styles take effect.

---

## Step 6 — Summary

One line:
- files touched
- counts (`modified` / `added` / `removed` / `inline` / `skipped` / `runtime`)
- unresolved mapping (untraceable `href`, ambiguous grep, cross-domain unreadable sheets)

---

## Script Reference

`scripts/css-tracker.js`: `runLoadAndUrlGates(url)` · `assertUrlMatchesTarget(url)` · `init()` · `getDiff() → { sheets, inline }`