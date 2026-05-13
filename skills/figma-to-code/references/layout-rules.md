# 布局转换启发式

本文件被 `figma-to-code` 的 Step 4 引用。

## 核心原则（硬约束 + 启发式）

- 硬约束：普通布局不要机械翻译成 `position: absolute`，优先 `flex/grid`。
- 硬约束：`absolute` 仅用于叠加层、角标、提示层、装饰层等脱离文档流元素。
- 硬约束：避免无意义 DOM 嵌套，但允许为语义、交互、裁剪、背景、复用边界保留必要容器。
- 启发式：优先使用 Figma Auto Layout 信息；无 Auto Layout 时再结合坐标分布与视觉分组推断。
- 启发式：尺寸与间距优先对齐设计值，允许按项目 token/栅格做合理归一化。

## 坐标 → Flex/Grid 转换（启发式）

Figma 用 x/y 绝对坐标描述布局，但直接翻译成 `position: absolute` 
会让组件丧失响应式能力。转换逻辑如下：

### 判断轴方向（先 Auto Layout，后坐标）

```
优先读取 Auto Layout：
layoutMode: HORIZONTAL → flex-direction: row
layoutMode: VERTICAL   → flex-direction: column

无 Auto Layout 时再推断：
子元素按 x 方向主导分布（水平）→ row
子元素按 y 方向主导分布（垂直）→ column
子元素构成二维网格               → grid
```

坐标差异（如 `x` 差异与 `y` 差异）仅作为参考信号，不应单独作为最终判定依据。
若存在混排（如 icon + text + badge、左右列中嵌套纵向块），以视觉块与语义边界优先。

### 间距与内边距（启发式）

```
相邻元素间距 = 下一个元素的起始坐标 - 上一个元素的结束坐标
→ gap: <间距>px
```

容器内边距 = 第一个子元素到容器边缘的距离 → `padding`
优先保留设计值；若项目有 token/栅格体系，可做就近映射。

### 对齐（建议映射）

| Figma 对齐 | CSS |
|---|---|
| LEFT / TOP | `justify-content: flex-start` / `align-items: flex-start` |
| CENTER | `justify-content: center` / `align-items: center` |
| RIGHT / BOTTOM | `justify-content: flex-end` / `align-items: flex-end` |
| SPACE_BETWEEN | `justify-content: space-between` |

### Auto Layout → Flex（建议映射）

Figma 的 Auto Layout 直接对应 flex：

```
layoutMode: HORIZONTAL → flex-direction: row
layoutMode: VERTICAL   → flex-direction: column
primaryAxisSizingMode: FIXED → width / height 固定值
counterAxisSizingMode: HUG   → 优先自然内容流；必要时再使用 fit-content 或 min/max 约束
```

## 节点类型处理

### GROUP 节点

GROUP 在 Figma 里只是视觉分组，无布局语义。
默认扁平化，不在 DOM 里生成额外包裹层。
但若 group 承载以下边界，应保留为有意义容器：
- 布局边界（grid item / stack / 对齐上下文）
- 交互边界（hover / click / focus 区域）
- 裁剪边界（overflow / mask）
- 背景边界（背景层与内容层组合）
- 复用边界（可独立抽象的局部块）

### FRAME → 容器元素（语义优先）

```
可选映射建议：
- 顶层内容区：`section` / `main` / `article`（按语义选择）
- 嵌套结构：`div`
- 导航语义：`nav`
- 可点击且具按钮语义：`button`
```

### COMPONENT / INSTANCE

默认先评估是否抽组件，再决定是否单独文件：
- 重复出现、语义独立、复杂度足够时：抽为组件文件
- 一次性小片段（如局部 icon/badge）且复用价值低时：可先内联
若抽组件，Props 可对应 Figma 的 component properties。

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
且交付目标要求多端适配时，按断点生成 media query。
若当前任务只要求单端实现，至少在输出中说明适配范围与假设。

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

**输出 Tailwind（同一 Figma 数据）：**
```html
<section class="flex flex-col gap-4 p-6">
  <h3>Title</h3>
  <p>Description</p>
  <div class="flex flex-row gap-3">
    <!-- actions -->
  </div>
</section>
```

说明：
- 若项目已有可匹配的 token/class，优先复用设计系统 class。
- 若未命中，再使用 Tailwind arbitrary values（如 `w-[320px]`、`text-[#1A2B3C]`）。