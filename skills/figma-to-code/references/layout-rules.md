# 布局转换规则

本文件被 `figma-to-code` 的 Step 3 引用。

## 坐标 → Flex/Grid 转换

Figma 用 x/y 绝对坐标描述布局，但直接翻译成 `position: absolute` 
会让组件丧失响应式能力。转换逻辑如下：

### 判断轴方向

```
子元素按 x 方向排列（水平）→ flex-direction: row
子元素按 y 方向排列（垂直）→ flex-direction: column
子元素构成二维网格       → grid
```

计算方式：取所有子节点的 `x` / `y`，若 `x` 差异 > `y` 差异 → row，反之 → column。

### 间距计算

```
相邻元素间距 = 下一个元素的起始坐标 - 上一个元素的结束坐标
→ gap: <间距>px
```

容器内边距 = 第一个子元素到容器边缘的距离 → `padding`

### 对齐

| Figma 对齐 | CSS |
|---|---|
| LEFT / TOP | `justify-content: flex-start` / `align-items: flex-start` |
| CENTER | `justify-content: center` / `align-items: center` |
| RIGHT / BOTTOM | `justify-content: flex-end` / `align-items: flex-end` |
| SPACE_BETWEEN | `justify-content: space-between` |

### Auto Layout → Flex

Figma 的 Auto Layout 直接对应 flex：

```
layoutMode: HORIZONTAL → flex-direction: row
layoutMode: VERTICAL   → flex-direction: column
primaryAxisSizingMode: FIXED → width / height 固定值
counterAxisSizingMode: HUG   → width / height: fit-content
```

## 节点类型处理

### GROUP 节点

GROUP 在 Figma 里只是视觉分组，无布局语义。
**直接扁平化**，不在 DOM 里生成额外包裹层，
除非子元素的布局关系需要一个容器来表达（此时用有意义的语义标签）。

### FRAME → 容器元素

```
FRAME（顶层）  → <section> / <main> / <article>（根据语义选择）
FRAME（嵌套）  → <div>
FRAME（导航）  → <nav>
FRAME（按钮）  → <button>
```

### COMPONENT / INSTANCE

识别为可复用组件，单独抽成文件。
Props 对应 Figma 的 component properties。

## 特殊情况

### 叠加层（允许 absolute）

以下场景可以使用 `position: absolute`：
- Modal / Dialog 的背景遮罩
- Tooltip / Popover
- Badge / Notification dot（相对于父元素定位）
- 装饰性图形（不参与文档流）

父容器需设置 `position: relative`。

### 响应式断点

若 Figma 文件包含多个尺寸的 frame（Mobile / Tablet / Desktop），
按断点生成对应的 media query，而不是只实现一个尺寸。

### 滚动容器

```
clipsContent: true + 子元素高度超出 → overflow: hidden / auto
```

## 示例：卡片组件转换

**Figma 数据（简化）：**
```json
{
  "type": "FRAME",
  "name": "Card",
  "layoutMode": "VERTICAL",
  "paddingTop": 24, "paddingRight": 24,
  "paddingBottom": 24, "paddingLeft": 24,
  "itemSpacing": 16,
  "children": [
    { "type": "TEXT", "name": "Title" },
    { "type": "TEXT", "name": "Description" },
    { "type": "FRAME", "name": "Actions", "layoutMode": "HORIZONTAL", "itemSpacing": 12 }
  ]
}
```

**输出 CSS：**
```css
.card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;          /* 24px */
  gap: 1rem;                /* 16px */
}

.card__actions {
  display: flex;
  flex-direction: row;
  gap: 0.75rem;             /* 12px */
}
```