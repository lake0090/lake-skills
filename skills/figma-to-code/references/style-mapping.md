# 样式映射策略

本文件被 `figma-to-code` 的 Step 3 引用。

目标不是重新实现一套 token 算法，而是把 MCP 返回的设计语义，尽量映射到项目已有组件、变量、class 和样式体系中。

## Figma MCP 语义优先

如果 MCP 数据提供了变量名、样式名或组件语义，优先保留语义，不要只复制 raw value。

例如：

```text
Figma variable: color/bg/surface
优先映射为：var(--color-bg-surface)、bg-surface、theme token 或项目等价命名

Figma component: Button / Primary
优先查找：项目已有 Button 组件或 Code Connect 映射
```

规则：

- 不要凭空发明 token 名称。
- 不要把语义 token 降级成 hex，除非项目没有可用映射。
- 不要新增全局 token，除非项目已有明确 token 贡献流程。
- 如果只有 raw value，允许使用局部字面量，并在输出摘要中记录。

## 组件映射优先于重写

若 MCP / Code Connect / 项目上下文能指向已有组件，优先复用已有组件，而不是重写一个视觉相似版本。

适合复用的组件：

- Button
- Input / Select / Checkbox / Radio
- Modal / Drawer / Popover
- Card / Table / Tabs
- Avatar / Badge / Tag

复用前检查：

- props 是否能表达设计状态
- variant / size / status 是否匹配
- 是否需要业务 handler，占位写 `// TODO: wire handler`
- 是否会引入不必要依赖或跨模块耦合

无法确认组件 API 时，不要猜 props；先读取项目组件用法或标记 TODO。

## 项目样式系统映射

### 1. Design token 文件

搜索并优先读取：

- `tokens.json`
- `tokens.ts`
- `design-tokens.*`
- `theme.*`
- `packages/*/tokens*`

使用项目已有 token 名称，不新增同义 token。

### 2. CSS 自定义属性

在全局 CSS / SCSS 中搜索 `:root { --* }` 或主题变量文件。

- 颜色变量：优先匹配语义，再匹配近似颜色。
- 尺寸变量：优先匹配 spacing / radius / shadow 语义。
- 命中后使用 `var(--token-name)`。

### 3. Tailwind CSS

若项目存在 `tailwind.config.js / .ts / .cjs`：

- 颜色：优先使用配置中的语义 class，如 `text-brand-500`、`bg-surface`。
- 间距：对照 `theme.spacing` 映射为 `p-*`、`gap-*`、`m-*`。
- 字体：对照 `theme.fontFamily`、`fontSize`、`fontWeight`。
- 找不到匹配时，允许使用任意值语法，如 `text-[#1A2B3C]`、`w-[1.3rem]`。

任意值属于兜底，应在摘要中计入 literals。

## 字面量兜底

当 MCP 只有 raw value，且项目没有可复用 token/class/component 时，在局部样式中写字面量。

```css
/* Vue */
<style scoped>
.card {
  color: #1a2b3c;
  border-radius: 0.75rem;
  padding: 1.5rem;
}
</style>
```

```tsx
// React - CSS Modules 或 inline style
const styles = {
  card: {
    color: '#1a2b3c',
    borderRadius: '0.75rem',
    padding: '1.5rem',
  },
}
```

字面量规则：

- 只写在当前组件作用域内。
- 不新增全局变量。
- 不新增 token 文件。
- 在最终摘要中说明 literals 数量和原因。

## Figma → CSS 属性速查

| Figma 属性 | CSS 属性 |
|---|---|
| `fills[].color` | `color` / `background-color` |
| `cornerRadius` | `border-radius` |
| `strokeWeight` + `strokes` | `border` |
| `effects[].type: DROP_SHADOW` | `box-shadow` |
| `effects[].type: INNER_SHADOW` | `box-shadow: inset` |
| `effects[].type: LAYER_BLUR` | `filter: blur()` |
| `style.fontSize` | `font-size` |
| `style.fontWeight` | `font-weight` |
| `style.lineHeightPx` | `line-height` |
| `style.letterSpacing` | `letter-spacing` |
| `opacity` | `opacity` |
| `blendMode: MULTIPLY` | `mix-blend-mode: multiply` |

## 输出摘要要求

最终摘要中的 `Tokens` 必须说明映射结果：

```text
Tokens: figma variables: N | project mapped: N | literals: N
```

若没有使用 Figma 变量，也要写明原因：

```text
Tokens: figma variables: 0 (MCP returned raw values only) | project mapped: 0 | literals: 6
```
