# Prompt Record

## Figma Input

- Figma URL: `https://www.figma.com/design/gX7vvKzOeejFM9rdmlbd4a/Figma-basics?node-id=4368-321163&t=nSybk8rgPbS8cmYs-4`
- Target node: `Summary` card (`4368:321163`).
- Constraints:
  - Vue Single File Component output
  - Maintainable layout (`flex`/`grid` first, avoid unnecessary absolute positioning)
  - Keep UI scope small and production-readable

## Example Agent Prompt

```text
Use skill `figma-to-code`.

Figma URL:
https://www.figma.com/design/gX7vvKzOeejFM9rdmlbd4a/Figma-basics?node-id=4368-321163&t=nSybk8rgPbS8cmYs-4

Generate a Vue SFC named StatsPanel with:
- title: "Order summary"
- summary rows: Subtotal / Shipping / Tax / Total
- CTA button: "Continue to payment" with a right icon

Requirements:
- Use semantic sections and readable class names
- Keep styles scoped
- Output assumptions and TODOs in summary block
```
