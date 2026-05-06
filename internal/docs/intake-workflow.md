# 新题接入流程

## 目标

从原题图片出发，产出符合网站结构的一道具体题目页面，并把它插入正确的题位聚合中。

## 标准步骤

1. 确定题目的 `problem-id`
2. 将原题图片放入 `internal/source-images/<problem-id>/`
3. 选择合适的题型 skill
4. 基于统一题页模板生成单文件题页（并视需要同目录放置静态资源）：
   - `site/problems/<城市>/<题位>/<problem-id>.html`
   - HTML 生成优先使用 `internal/templates/interactive-problem-page.template.html`
   - 模板说明见 `internal/templates/interactive-problem-page.md`
   - 同目录静态资源用带 `problem-id` 前缀的文件名（如 `…-diagram.svg`），避免同题位多题重名
   - 样式使用公共表 `site/assets/css/interactive-geometry-page.css`（与 `internal/templates/interactive_geometry_page_style.css` 说明一致，题页中 `<link rel="stylesheet" href="../../../assets/css/interactive-geometry-page.css" />`）
   - 需要「SVG 点标注避让、线段尺寸线」时，在题页内联脚本**之前**增加公共库：`<script src="../../../assets/js/geometry-label-layout.js"></script>`，在脚本中使用全局 `window.GeometryLabelLayout`（与河东区一模 24 等题一致）
   - **不要**复制步骤导航 / `renderAllSteps` / `renderMinisMarkup` 等 UI 代码：引入 `site/assets/js/lesson-page-runtime.js`，在定义 `STEPS`、`POLICIES`、`STEP_LABELS`、`diagramMarkupFor`、`drawMini` 后调用 `LessonPageRuntime.init({ ... })`（参考南开、河北一模 24 题页）
   - 可选：声明式几何 `internal/lesson-specs/<problem-id>/geometry-spec.json`，并用 `node tools/validate-geometry-spec.mjs internal/lesson-specs/<problem-id>/geometry-spec.json` 校验；题内可用 `<script type="application/json" id="...">` 嵌入同构 JSON
   - 面积拆分图统一使用公共 CSS 类：`area-formula`、`area-formula-target`、`area-formula-base`、`area-formula-cut`、`area-formula-op`，表达 `目标面积 = 大图形 - 小图形 - 小图形`
5. 向 `site/data/problems.json` 增加一条元信息
6. 检查导航页是否能在正确的“地区 -> 题位”下聚合出该题

## 选择 skill 的建议

- 动点题：使用 `dynamic-point-problem`
- 旋转题：使用 `rotation-problem`
- 折叠题：使用 `folding-problem`
- 相似题：使用 `similarity-problem`
- 函数图像题：使用 `function-graph-problem`
- 题型不明确或只是先接入占位页：使用 `common-problem-ingest`

## 接入完成后的检查

- 页面路径是否唯一且稳定
- 页面是否沿用 `interactive-problem-page.template.html` 的全步骤展开骨架
- 桌面端是否有右侧 sticky 步骤目录
- 手机端是否有底部步骤 dock，并显示当前小问、步骤进度、步骤名
- 可移动步骤的滑块是否位于对应步骤图形下方
- 边界/分段缩略图是否能点击联动当前步骤滑块和图形
- 标签与考试来源是否正确
- 导航页是否按题位正确聚合
- 局部资源是否与该题 HTML 同目录、且命名不与同题位其他题冲突
