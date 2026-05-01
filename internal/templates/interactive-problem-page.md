# 互动题目页模板说明

`interactive-problem-page.template.html` 是后续题目页生成的标准模板，目标是复用南开区一模 24 题已经验证过的页面形态。

## 页面形态

- 所有步骤直接竖直展开，学生通过下滑连续阅读。
- 桌面和平板端右侧显示 sticky 步骤目录。
- 手机端底部显示步骤 dock，点击后打开步骤目录抽屉。
- 每个步骤都是独立卡片，包含本步图形、本步推导、本步局部交互。
- 可移动参数只出现在对应步骤的图形下方，不使用全局滑块。
- 边界状态或分段状态用缩略图表示，桌面端显示 chip + 缩略图，手机端显示低矮横向缩略图。
- 模板不内联布局 CSS，统一引用 `site/assets/css/interactive-geometry-page.css`。

## 模板占位符

- `{{PAGE_TITLE}}`：浏览器标题。
- `{{PAGE_DESCRIPTION}}`：页面 meta 描述。
- `{{BREADCRUMB_TITLE}}`：顶部面包屑标题。
- `{{PROBLEM_SUMMARY}}`：折叠状态下的一行题目摘要。
- `{{PROBLEM_FULL_HTML}}`：完整题目 HTML，含必要答案 chip。
- `{{STEPS_JSON}}`：步骤数组。
- `{{STEP_LABELS_JSON}}`：步骤短标签映射。
- `{{POLICIES_JSON}}`：每步交互策略映射。
- `{{GEOMETRY_SCRIPT}}`：当前题目的几何绘图逻辑。
- `{{LEGEND_HTML}}`：图例 HTML。

## 样式边界

- 公共页面布局样式放在 `site/assets/css/interactive-geometry-page.css`。
- `internal/templates/interactive_geometry_page_style.css` 仅作为 skill/reference 的同步副本。
- 新题页不要复制模板布局 CSS 到 HTML 内部。
- 只有当前题特有、无法公共化的极少数样式才允许写在题页内联 `<style>` 中。

## `STEPS_JSON` 约定

每个 step 至少包含：

```js
{
  id: "q2s3",
  section: "第（II）②问",
  title: "第3步：在 3＜t＜9/2 中由五边形面积求范围",
  t: 3.75,
  derive: [
    ["∵", "3＜t＜9/2 时，重叠部分为五边形"],
    ["∴", "..."]
  ],
  box: ["右上角结论框内容"],
  minis: [
    { "title": "t＝3", "caption": "重叠部分为三角形。", "t": 3 }
  ]
}
```

规则：

- `section` 使用题目小问，例如 `第（I）问`、`第（II）①问`、`第（II）②问`。
- `title` 的步号按每个小问重新编号，不按整题连续编号。
- `derive` 只写本步推导，不把下一个步骤的结论提前写入。
- `box` 只放当前步骤真正依赖的已得结论和本步结论。
- `minis` 用于边界状态、分段状态、代表状态，可点击联动本步滑块。

## `POLICIES_JSON` 约定

```js
{
  q2s3: {
    movable: true,
    range: [3.001, 4.499],
    step: 0.001,
    reason: "本步在五边形阶段观察最大值。"
  }
}
```

规则：

- 只有需要观察变化或公式适用区间的步骤才设为 `movable: true`。
- 范围必须与当前步骤的数学条件一致。
- 手机端会隐藏 `reason`，桌面端可显示简短说明。

## `GEOMETRY_SCRIPT` 约定

必须提供：

```js
function diagramMarkupFor(index, overrideT) {
  // 返回当前步骤 SVG innerHTML
}

function drawMini(t) {
  // 返回边界/状态缩略图 SVG
}
```

可选提供：

```js
function groupTitle(section) {
  // 返回右侧目录分组标题
}
```

绘图规则：

- 题目页必须引用仓库公共脚本 `geometry-label-layout.js`。
- 点标、角标、直角标识、长度标识优先使用公共 helper。
- 图中不要标注当前步骤正在求的答案，答案放在右上角结论框或推导区。
- 面积重叠区域统一标 `S`，不要在图中写 `S=...`。
- 面积拆分用 `area-formula` 系列 class 表示 `S = 大图形 - 小图形`。
