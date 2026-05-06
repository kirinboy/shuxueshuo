# Piecewise Area Trends

Use these rules for moving-figure overlap problems that ask for an area range, maximum/minimum, or phase-by-phase behavior.

## Solution Shape

1. Start with one trend step before formulas.
2. Classify every interval or special state in order.
3. State monotonicity in classroom language.
4. Use the trend step to decide which formulas or candidate values are worth calculating.
5. End with one compact final answer step.

Do not assign one boundary value to two different shape intervals unless the same geometric shape truly continues across that boundary. If the shape changes at `t=c`, either make `t=c` a separate state or include it on only one side.

## Trend Step Pattern

Use this compact structure when there are two or three major shape phases:

```json
{
  "id": "q2s1",
  "section": "第（II）②问",
  "title": "第1步：由图形变化判断面积分段",
  "t": 3.75,
  "derive": [
    ["∵", "1＜t≤3 时，△MPN 完全在 △ABC 内"],
    ["∴", "此时重叠部分是整个 △MPN，随着 t 变大，面积变大"],
    ["∵", "3＜t＜9/2 时，重叠部分为五边形"],
    ["∴", "此时重叠部分为五边形，面积先变大再变小"],
    ["∵", "9/2≤t＜5 时，重叠部分为四边形并继续缩小"],
    ["∴", "先按这三种形状分段，再分别求面积范围"]
  ],
  "box": [
    "1＜t≤3：三角形，面积变大",
    "3＜t＜9/2：五边形，面积先变大再变小",
    "9/2≤t＜5：四边形，面积变小"
  ],
  "minis": [
    { "title": "1＜t≤3", "caption": "△MPN 完全在 △ABC 内，面积变大。", "t": 2.2 },
    { "title": "3＜t＜9/2", "caption": "重叠部分是五边形，面积先变大再变小。", "t": 3.75 },
    { "title": "9/2≤t＜5", "caption": "重叠部分为四边形并继续缩小。", "t": 4.75 }
  ]
}
```

## Visual Rules

- Use `minis` as representative phase cards, not as a dump of every boundary/candidate value.
- Thumbnail titles should usually be interval labels, such as `1＜t≤3`.
- Thumbnail captions should be one sentence naming the shape and trend.
- Thumbnails should show only the fixed figure, moving figure, and overlap region.
- Do not put point labels, length labels, guide-line labels, or formula cards in thumbnails unless they are essential.
- Keep target overlap area `S` visually consistent across all phases.

## Calculation Steps

- For each formula step, name the overlap shape first.
- Derive the needed lengths, heights, or decomposition immediately before writing the area formula.
- Reuse prior results such as `CG`, `DH`, or `CD` instead of restarting from coordinates.
- If an extremum occurs at a boundary, make sure the policy range or mini can show that boundary.

## Endpoint Checklist

- Problem text, answer chips, solution, visual steps, `policies.range`, minis, formula boxes, and final answer must use the same endpoint inclusiveness.
- If an endpoint is included, use `≤`, compute the attained value, and say it is attained.
- If an endpoint is excluded, use `<`, use a strict bound, and do not claim the extremum is attained.
