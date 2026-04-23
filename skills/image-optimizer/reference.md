# image-optimizer — reference

## Commands

```bash
# Typical first run — all alias/public-dir from config, scoped path
npx --yes lake-cimg@latest scan-code --issues-only --limit 100 \
  --project-root . --public-dir public --public-dir static \
  --alias "@=src" --alias "~=." --alias "@images=src/assets/images" \
  "src/pages/ai/components"

# Inspect a single file
npx lake-cimg@latest /path/to/image.png
```

Extensions scanned: `.html` `.vue` `.pug` `.js` `.ts` `.tsx` `.jsx`  
`--limit` default: 500; a capped run on 800+ refs is not exhaustive.  
PowerShell: use `;` not `&&`.

## Scan scope

| Situation | Use |
|----------|-----|
| Single feature / PR | Smallest subtree + `--limit 100`, e.g. `"src/pages/foo"` |
| Multi-module audit | One dir at a time; raise `--limit` only after it's clean |
| Explicit full baseline | Omit `path` or `.`; high `--limit` or run per package |
| CI / stable | Pin: `npx --yes lake-cimg@<version>` or add as devDependency |

## Reporting

Do not paste full JSON. Use:

1. **Command** (all flags used).
2. `referencePoints` and how many `items` have non-empty `issues` (or read the one-line `summary` string from `lake-cimg@latest`).
3. Up to 10 rows: file + one-line issue/hint.
4. **Track B** exemptions: pattern, files, reason.
5. If hit `--limit`: state "**Not exhaustive** — raise limit or narrow path."

Optional: pipe JSON to a local file and read only a slice.

**Not part of this skill’s default reply:** long explanations of `pnpm`/`npx`/`sharp` install behavior, lockfile size, or download progress — unless the user asked for that explicitly. For skill sessions, keep the reply to the Reporting bullets above + concrete fixes.

## JSON

Current `npx lake-cimg@latest` prints top-level fields such as `scannedSourceFiles`, `referencePoints`, `truncated`, and a string `summary` (localized one-liner), plus `items` as below. Older docs showed `summary: { total, withIssues }` — if your CLI still returns that object, use it; otherwise count `items` and non-empty per-item `issues[]`.

```json
{
  "scannedSourceFiles": 1,
  "referencePoints": 1,
  "items": [
    {
      "file": "src/index.html",
      "line": 10,
      "column": 0,
      "issues": ["missing_dimensions", "suggest_modern_format"],
      "hints": ["Add width=\"1200\" height=\"600\"", "Convert to WebP"],
      "intrinsicWidth": 1200,
      "intrinsicHeight": 600
    }
  ],
  "summary": "…扫描…引用点 1 个；含问题 1 条"
}
```

## Anti-patterns

- **`data:` placeholder `src`** — creates `cannot_resolve`; use correct alias/public-dir or Track B waiver instead.
- **Full-tree scan as only gate** — a default-500-capped run on a large repo is not a complete audit.
- **`npx scan-code` before reading config** — wastes a JSON round trip; plan all flags first (see SKILL.md step 0).

## srcset / sizes (by role)

| Role | srcset | sizes |
|------|--------|-------|
| Full-width / hero | `img-320.webp 320w, img-768.webp 768w, img-1200.webp 1200w` | `100vw` |
| Half-width (2-col) | `img-320.webp 320w, img-600.webp 600w, img-900.webp 900w` | `(max-width: 600px) 100vw, 50vw` |
| Card / thumbnail | `img-160.webp 160w, img-320.webp 320w, img-480.webp 480w` | `(max-width: 600px) 100vw, 25vw` |
| Unknown | `img-400.webp 400w, img-800.webp 800w, img-1200.webp 1200w` | `(max-width: 600px) 100vw, 50vw` |

One file only: same URL in all `w` entries; list missing sizes for user to generate.

## Templates

Default (standard image):

```html
<img
  src="hero.webp"
  width="1200"
  height="600"
  alt="Describe the content"
  loading="lazy"
  decoding="async"
/>
```

LCP (first, above the fold):

```html
<img
  src="hero.webp"
  width="1200"
  height="600"
  alt="Describe the content"
  fetchpriority="high"
  loading="eager"
  decoding="sync"
/>
```

Responsive (multi-resolution):

```html
<img
  src="hero-1200.webp"
  srcset="hero-320.webp 320w, hero-768.webp 768w, hero-1200.webp 1200w"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
  width="1200"
  height="600"
  alt="Describe the content"
  fetchpriority="high"
  loading="eager"
  decoding="async"
/>
```

## Troubleshooting

| Symptom | Action |
|--------|--------|
| `npx` missing | Node ≥ 16: `node -v` |
| npx install noise | `npx --yes lake-cimg@latest …` |
| `cannot_resolve` | Re-check `--project-root`, `--public-dir`, `--alias` from config *before* editing markup |
| `~` in paths | `--alias "~=."` (Nuxt root) or `--alias "~=src"` (Vue CLI) |
| `referencePoints = 0` / `items` empty | Wrong `path`/`--project-root`, or no `html`/`vue`/`pug`/`js`/`ts`/`tsx`/`jsx` files in scope; **not** a clean pass |
| `.md` / other extensions | Not scanned — use a source tree that contains real templates |
| Huge JSON / log | `--issues-only` + smaller `--limit`, narrow `path` |
| No project on disk | Markup only; list files for user to convert |
