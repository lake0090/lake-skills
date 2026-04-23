# 样式映射规则

本文件被 `figma-to-code` 的 Step 2 引用。

## 侦测优先级

### 1. Tailwind CSS

若项目存在 `tailwind.config.js / .ts / .cjs`：

- 颜色：在 `theme.colors` / `theme.extend.colors` 中查找最近似的 key，使用其 class（如 `text-brand-500`）
- 间距：对照 `theme.spacing` 映射为 `p-*` / `gap-*` / `m-*`
- 字体：对照 `theme.fontFamily` 使用 `font-*`
- 找不到精确匹配时，使用 Tailwind 任意值语法：`text-[#1A2B3C]`、`w-[320px]`

### 2. CSS 自定义属性（`:root` 变量）

在项目的全局 CSS / SCSS 文件中搜索 `:root { --* }`：

- 颜色变量：优先匹配（允许 ±5% 色差）
- 尺寸变量：优先匹配（允许 ±2px 误差）
- 匹配后在组件 `style` 中写 `var(--token-name)`

### 3. Token 文件

搜索 `tokens.json` / `tokens.ts` / `design-tokens.*`：

- 解析后建立颜色 → token 名称的映射表
- 使用 token 引用而非字面量

### 4. 无匹配时的字面量写法

若以上均未找到匹配，在组件 scoped style 中直接写字面量：

```css
/* Vue */
<style scoped>
.card {
  color: #1A2B3C;
  border-radius: 0.75rem;
  padding: 1.5rem;
}
</style>
```

```tsx
// React - CSS Modules 或 inline style
const styles = {
  card: {
    color: '#1A2B3C',
    borderRadius: '0.75rem',
    padding: '1.5rem',
  }
}
```

**禁止**新增全局 `--*` CSS 变量或 token 文件，避免污染项目样式体系。

## Figma → CSS 属性映射速查

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