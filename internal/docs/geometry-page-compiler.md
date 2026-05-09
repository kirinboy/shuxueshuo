# 几何互动题页编译器：架构与构建指南

> 本文档描述 `shuxueshuo` 仓库中将中学几何题目转化为互动教学网页的完整技术方案，涵盖设计动机、架构分层、运行时组件、构建流程和新题接入步骤。

---

## 一、设计动机

### 旧方式的问题

早期每道题对应一个由 LLM 手写的 HTML 文件（约 500 行），其中包含：

- 图形渲染逻辑（`toScreen`、多边形裁剪、SVG path 拼接）
- 步骤导航、滑块、缩略图等 UI 代码
- 题目文字和答案 HTML 片段

**结果**：每次生成都容易出现 hallucination（坐标错误、交点公式错误、UI 逻辑漂移），而且无法复用，改一处 bug 要同步到所有页面。

### 新方式的目标


| 职责                    | 承担者                             |
| --------------------- | ------------------------------- |
| 数学计算（多边形裁剪、交点、坐标变换）   | `geometry-engine.js`（一次实现，持续复用） |
| SVG 渲染与图层编排           | `geometry-lesson-from-spec.js`  |
| UI 交互（步骤导航、滑块、缩略图、折叠） | `lesson-page-runtime.js`        |
| **页面数据**              | 三份声明式 JSON（LLM 只写这里）            |
| **HTML 组装**           | `build-lesson-page.mjs`（编译脚本）   |


LLM 只需填写**纯数据 JSON**，不写任何 HTML 标签或命令式 JS。

互动组件（主参数滑块、局部动点组件、联动动点控制）的公共说明见
[`internal/docs/interactive-lesson-components.md`](interactive-lesson-components.md)。新增或调整交互组件时，优先更新该文档和共享 runtime/schema，而不是在单题 HTML 中写特例。

---

## 二、整体架构

```
internal/lesson-specs/<problem-id>/
├── geometry-spec.json       ← 坐标系、点、多边形、交点、原题图配置
├── step-decorations.json    ← 图层 + 每步增量装饰（线段、角弧、标注…）
└── lesson-data.json         ← 元数据、题目行、图例、步骤推导、答案

                    ↓  node tools/build-lesson-page.mjs

site/problems/<city>/<slot>/<problem-id>.html   ← 编译产物

                    ↓  浏览器加载

site/assets/js/geometry-engine.js              ← 数学引擎
site/assets/js/geometry-lesson-from-spec.js    ← 几何渲染器
site/assets/js/geometry-label-layout.js        ← 标注避让
site/assets/js/lesson-page-runtime.js          ← UI 运行时
site/assets/js/interactive-lesson-ui.js        ← 通用 UI 组件
```

---

## 三、三份声明式 JSON

### 3.1 `geometry-spec.json` — 几何数据

定义坐标系和所有几何对象，**不含任何渲染逻辑**。

```json
{
  "version": 1,
  "id": "tj-2026-nankai-yimo-24",
  "domain": { "minX": -0.9, "maxX": 7.3, "minY": -1.65, "maxY": 6.05 },
  "fixedPoints": {
    "O": ["0", "0"],
    "A": ["0", "3*S3"],
    "C": ["6", "S3"]
  },
  "movingParam": "t",
  "movingPoints": {
    "P": ["t", "0"],
    "M": ["t/2", "S3*t/2"]
  },
  "basePolygon":   ["A", "B", "C"],
  "movingPolygon": ["M", "P", "N"],
  "derivedIntersections": [
    { "name": "E", "a": ["A","C"], "b": ["M","N"], "fallback": ["9-3*t/2","S3*t/2"] }
  ],
  "originalFigures": [
    { "id": "originalFigure1", "t": 2, "showMoving": true, "showOverlap": false }
  ]
}
```

**关键约定：**

- 坐标用字符串表达式：`S3` = √3，支持 `t`、`t/2`、`3*S3` 等
- 交点一律用 `derivedIntersections` 声明两条线段，引擎负责计算，**不要手推公式**
- `fallback` 用于原题图（静态渲染）时的替代坐标

### 3.2 `step-decorations.json` — 步骤装饰

定义图层（持续显示的元素）和每步增量装饰（新增/强调）。

```json
{
  "layers": {
    "global": {
      "elements": [
        { "type": "grid" },
        { "type": "basePoly" },
        { "type": "point", "at": "A", "color": "#1f2937", "dx": -28, "dy": -10 }
      ]
    },
    "II": {
      "sectionNot": "第（I）问",
      "elements": [
        { "type": "movingPoly" },
        { "type": "overlap" }
      ]
    }
  },
  "steps": {
    "i1s1": {
      "add": [
        { "type": "segment", "from": "A", "to": "B", "label": "AB=4√3",
          "color": "#0f766e", "offsetPx": 38 },
        { "type": "rightAngle", "vertex": "I", "rayA": "A", "rayB": "C" }
      ]
    }
  }
}
```

**图层可见性条件：**


| 字段                              | 含义         |
| ------------------------------- | ---------- |
| *(无)*                           | 全局始终可见     |
| `"section": "第（I）问"`            | 仅当步骤属于该小问  |
| `"sectionNot": "第（I）问"`         | 不属于该小问时    |
| `"stepStartsWith": ["q1","q2"]` | 步骤 id 前缀匹配 |


**装饰类型速查（共 ~14 种）：**


| type                                           | 说明          |
| ---------------------------------------------- | ----------- |
| `grid` / `basePoly` / `movingPoly` / `overlap` | 基础图层元素      |
| `point` / `derivedPoint`                       | 点与交点        |
| `segment` / `dashedLine` / `coloredLine`       | 线段          |
| `rightAngle` / `angleArc`                      | 角度标记        |
| `coordinateLabel` / `coincidentLabel`          | 坐标标注 / 重合标注 |
| `cutRegion` / `outlineRegion`                  | 面积拆分辅助区域    |
| `areaLabel` / `areaFormulaCard`                | 面积标注与公式卡片   |


### 3.3 `lesson-data.json` — 题目与步骤数据

**不包含任何 HTML 字符串。** 所有内容为纯文字，由编译脚本生成 HTML。

```json
{
  "meta": {
    "id": "tj-2026-nankai-yimo-24",
    "outputPath": "site/problems/tj/24/tj-2026-nankai-yimo-24.html",
    "pageTitle": "2026 年天津市南开区一模 第 24 题",
    "pageDescription": "…",
    "breadcrumbTitle": "…"
  },
  "problem": {
    "summary": "一行摘要（折叠状态显示）",
    "lines": [
      { "text": "（24）（本题共 10 分）…题目主体…" },
      { "text": "（I）填空：…", "answerId": "answerI", "answer": "答案：C＝（6，√3）" },
      { "heading": "原题图形" },
      { "ariaLabel": "原题图 1 和图 2", "figures": [
          { "id": "originalFigure1", "title": "图 1", "ariaLabel": "…" }
        ]
      }
    ]
  },
  "ui": {
    "legend": [
      { "colorVar": "paper",   "label": "固定等边 △ABC" },
      { "colorVar": "fold",    "label": "旋转得到 △MPN" },
      { "colorVar": "overlap", "label": "当前重叠区域 S" }
    ],
    "sliderLabel": "P 点 · t＝OP",
    "paramLabelPrefix": "t=",
    "goToProblemMode": "doubleScroll",
    "groupTitles": { "第（I）问": "第（I）问 坐标和长度" }
  },
  "steps": [
    {
      "id": "i1s1",
      "section": "第（I）问",
      "title": "第1步：利用等边三角形性质求 C 点坐标",
      "t": 2,
      "derive": [
        ["∵", "A（0，3√3），B（0，-√3）"],
        ["∴", "AB＝4√3，设中点 I＝（0，√3）"],
        ["∴", "C＝（6，√3）"]
      ],
      "box": ["AB＝4√3", "C＝（6，√3）"]
    }
  ],
  "policies": {
    "i1s1": { "movable": false, "range": [2, 2] },
    "q1s1": { "movable": true,  "range": [3.001, 4.499] }
  },
  "stepLabels": {
    "i1s1": "1 求C坐标"
  }
}
```

`**problem.lines` 四种行类型：**


| 结构                                                         | 渲染效果            |
| ---------------------------------------------------------- | --------------- |
| `{ "text": "…" }`                                          | 普通文字行           |
| `{ "text": "…", "answerId": "answerX", "answer": "答案：…" }` | 文字行 + 答案 chip   |
| `{ "heading": "原题图形" }`                                    | 粗体小标题行          |
| `{ "ariaLabel": "…", "figures": [{id, title}] }`           | 原题图形区域（SVG 占位符） |


---

## 四、编译脚本 `build-lesson-page.mjs`

### 职责

读取三份 JSON + HTML 模板，输出一个完整的静态 HTML 文件：

1. `problem.lines` → `{{PROBLEM_FULL_HTML}}`（生成 `problem-line` div 结构）
2. `ui.legend` → `__LESSON_LEGEND_HTML__`（生成 `<span><i class="sw">…` 字符串）
3. `geometry-spec.json` → `<script type="application/json" id="geometrySpec">…</script>`
4. `step-decorations.json` → 内联 JS 常量 `__STEP_DECORATIONS__`
5. `steps / policies / stepLabels` → `var STEPS / POLICIES / STEP_LABELS`

### 模板三段式脚本结构

编译产物的 `<body>` 末尾有**三段独立** `<script>` 块：

```html
<!-- ① 数据段：var 声明，跨脚本块全局可见 -->
<script>
  var STEPS      = [...];
  var STEP_LABELS = {...};
  var POLICIES   = {...};
  var __LESSON_LEGEND_HTML__ = "";
  var __AFTER_RENDER_ALL_STEPS__;
</script>

<!-- ② 几何段：多个独立 <script> 标签（不能嵌入上面的块） -->
<script type="application/json" id="geometrySpec">…</script>
<script src="../../../assets/js/geometry-engine.js"></script>
<script src="../../../assets/js/geometry-lesson-from-spec.js"></script>
<script>
  var __GEOMETRY_SPEC__ = JSON.parse(document.getElementById('geometrySpec').textContent);
  var __STEP_DECORATIONS__ = {…};
  var renderer = GeometryLessonFromSpec.createSpecRenderer(…);
  var diagramMarkupFor = renderer.diagramMarkupFor;
  var drawMini = renderer.drawMini;
  var __LESSON_LEGEND_HTML__ = "…";   // 覆盖①段的默认值
  var __AFTER_RENDER_ALL_STEPS__ = renderer.renderOriginalFigures;
</script>

<!-- ③ 初始化段 -->
<script>
  LessonPageRuntime.init({
    afterRenderAllSteps: typeof __AFTER_RENDER_ALL_STEPS__ === "function"
      ? __AFTER_RENDER_ALL_STEPS__ : undefined,
    STEPS, POLICIES, STEP_LABELS,
    diagramMarkupFor, drawMini, groupTitle, legendHtml: __LESSON_LEGEND_HTML__,
    sliderLabel: "…", paramLabelPrefix: "…", goToProblemMode: "…"
  });
</script>
```

> **设计原因**：`{{GEOMETRY_SCRIPT}}` 自身含 `<script>…</script>` 标签，必须置于任何外层 `<script>` 块之外；否则 HTML 解析器看到内部 `</script>` 会提前关闭外层脚本，导致 `LessonPageRuntime.init(…)` 永远不执行。

### 用法

```bash
node tools/build-lesson-page.mjs internal/lesson-specs/<problem-id>/
```

---

## 五、验证脚本 `validate-geometry-spec.mjs`

对指定题目目录做三项校验：

1. **Schema 校验**：验证三份 JSON 符合 `internal/schemas/*.schema.json`
2. **运行时试跑**：在 Node.js `vm` 上下文中加载引擎和渲染器，确认 `createSpecRenderer` 可以正常初始化
3. **交点计算**：对 `derivedIntersections` 中每个交点在默认 `t` 值下做一次计算，检查是否返回合法坐标

```bash
node tools/validate-geometry-spec.mjs internal/lesson-specs/<problem-id>/
```

---

## 六、运行时 JS 组件

### `geometry-engine.js`

**数学引擎**，不依赖 DOM。

- Sutherland–Hodgman 多边形裁剪（计算重叠区域）
- 表达式求值（`3*S3`、`t/2` 等字符串 → 浮点数）
- 线段求交点
- **抛物线**：`sampleParabola`、`svgOpenPathFromMathPoints`、`segmentParabolaIntersections`
- 坐标系变换（`domain` → SVG 像素）
- SVG 辅助函数：`svgConclusionBox`、`svgMini`、`svgAngleArcPath`、`svgAreaFormulaCard`

表达式环境与几何规格：`geometry-spec.expressionEnv` 写入的名称、`movingParam` 对应的字母（如 `m`）以及内置 `t`/`S3` 可作为 `evalExpr` / `evalPoint` 中的变量。

### `geometry-lesson-from-spec.js`

**题目渲染器**，调用 `geometry-engine.js`，暴露一个工厂函数：

```javascript
GeometryLessonFromSpec.createSpecRenderer(spec, decoData, STEPS, POLICIES)
// 返回：
// - diagramMarkupFor(stepIndex, overrideT) → SVG innerHTML
// - drawMini(t) → 缩略图 SVG 字符串
// - renderOriginalFigures() → 填充原题图 SVG（afterRenderAllSteps 回调）
```

图层可见性逻辑、装饰类型分发、标注避让调用都在此模块；另有抛物线相关装饰：`parabola`、`axisOfSymmetry`、`vertex`、`curvePoint`。

### `geometry-label-layout.js`

**标注避让引擎**，独立模块，暴露 `window.GeometryLabelLayout`。

- 点标签碰撞避让（优选位置 → 备选位置）
- 角度标签放置
- 线段尺寸线（dimension / parallel / inline 三种策略）
- 直角标记 SVG 生成

### `lesson-page-runtime.js`

**UI 运行时**，暴露 `window.LessonPageRuntime`。题页调用 `LessonPageRuntime.init({…})` 后：

- 渲染全部步骤卡片（含推导面板、图示、滑块、缩略图）
- 构建桌面侧边栏导航 + 手机底部 step sheet
- 监听滑块 `input` 事件，触发 `diagramMarkupFor(index, t)` 重绘
- IntersectionObserver 自动跟踪当前可见步骤
- 题目折叠/展开（用户偏好持久化到页面会话）
- 题面答案 chip 初始化显示（`.answer-chip.show`）

### `interactive-lesson-ui.js`

通用 UI 组件（手风琴、tooltip 等），被多个页面类型共用。

---

## 七、Schemas

位于 `internal/schemas/`：


| 文件                             | 校验目标                    |
| ------------------------------ | ----------------------- |
| `geometry-spec.schema.json`    | `geometry-spec.json`    |
| `step-decorations.schema.json` | `step-decorations.json` |
| `lesson-data.schema.json`      | `lesson-data.json`      |


Schema 遵循 JSON Schema Draft 2020-12。

---

## 八、模板 `interactive-problem-page.template.html`

位于 `internal/templates/`，包含：

- 页眉导航（breadcrumb）
- 题目卡片（`#problemCard`）：折叠/展开区域，`{{PROBLEM_FULL_HTML}}` 占位
- 全步骤容器（`#stepCards`）
- 桌面侧边栏（`.lesson-rail`）步骤导航
- 手机底部 dock（`#mobileStepDock`）和 sheet（`#mobileStepSheet`）
- 三段 `<script>` 结构（见第四节）

模板占位符：


| 占位符                     | 内容                   |
| ----------------------- | -------------------- |
| `{{PAGE_TITLE}}`        | meta.pageTitle       |
| `{{PAGE_DESCRIPTION}}`  | meta.pageDescription |
| `{{BREADCRUMB_TITLE}}`  | meta.breadcrumbTitle |
| `{{PROBLEM_SUMMARY}}`   | problem.summary      |
| `{{PROBLEM_FULL_HTML}}` | 由 problem.lines 编译生成 |
| `{{STEPS_JSON}}`        | steps 数组             |
| `{{POLICIES_JSON}}`     | policies 对象          |
| `{{STEP_LABELS_JSON}}`  | stepLabels 对象        |
| `{{GEOMETRY_SCRIPT}}`   | 几何段三个 `<script>` 块   |


---

## 九、新题接入步骤

### 1. 建目录

```bash
mkdir -p internal/lesson-specs/<problem-id>
```

### 2. 准备原题图片

```bash
cp <原题截图> internal/source-images/<problem-id>/
```

### 3. 运行 Skill 生成三份 JSON

按题型选用 skill：`geometry-lesson`（`internal/skills/geometry-lesson/SKILL.md`）或二次函数页 `quadratic-lesson`（`internal/skills/quadratic-lesson/SKILL.md`），产出：

```
internal/lesson-specs/<problem-id>/
├── geometry-spec.json
├── step-decorations.json
└── lesson-data.json
```

**规则提醒：三份 JSON 里不能有任何 HTML 字符串。**

- `problem.lines` 只写纯文字行数据
- `ui.legend` 只写 `colorVar` 和 `label`
- 坐标用字符串表达式（`S3` = √3）
- 交点用 `derivedIntersections` 声明，不要手推公式
- `originalFigures[].id` 必须与 `problem.lines` 中 `figures[].id` 一一对应

### 4. 校验

```bash
node tools/validate-geometry-spec.mjs internal/lesson-specs/<problem-id>/
```

### 5. 编译

```bash
node tools/build-lesson-page.mjs internal/lesson-specs/<problem-id>/
```

输出路径由 `lesson-data.json` 中的 `meta.outputPath` 决定。

### 6. 添加到总索引

向 `site/data/problems.json` 追加一条记录：

```json
{
  "id": "<problem-id>",
  "city": "tj",
  "cityLabel": "天津",
  "year": 2026,
  "exam": "nankai-yimo",
  "examLabel": "南开区一模",
  "slot": "24",
  "title": "…",
  "tags": ["动点", "旋转", "重叠面积"],
  "path": "problems/tj/24/<problem-id>.html",
  "status": "live"
}
```

### 7. 验收检查

- 桌面侧边栏导航和手机 dock 均正常显示
- 每步骤图示渲染正确（无空白图、无坐标错位）
- 可移动步骤的滑块能拖动，图示实时更新
- 缩略图可点击，跳转至对应参数值
- 题目折叠/展开正常，答案 chip 可见
- 原题图形（如有）在 `afterRenderAllSteps` 后正确渲染
- 总索引页面能在正确地区/题位下聚合出该题

---

## 十、Skill 版本管理

### 目录结构

Skill 的规范源存放在仓库内：

```
internal/skills/
├── geometry-lesson/
│   ├── SKILL.md                           ← 几何综合题（折叠/旋转等）
│   └── references/
│       ├── geometry-solving-principles.md
│       ├── json-schema-guide.md
│       ├── nankai-24-fewshot.md
│       └── piecewise-area-trends.md
└── quadratic-lesson/
    ├── SKILL.md                           ← 二次函数综合题（共用同一套 JSON + 编译链）
    └── references → ../geometry-lesson/references
```

`references/` 只放 agent 写规格需要阅读的文档，不放 JS/CSS 实现文件。渲染能力由 `site/assets/js/` 下的引擎、渲染器和运行时提供。

### Cursor Agent 如何读到 Skill

Cursor 从 `~/.codex/skills/` 目录加载 skill。通过将该目录下的条目指向仓库路径，让 agent 读到的始终是仓库里的版本：

```
~/.codex/skills/geometry-lesson   →  <repo>/internal/skills/geometry-lesson
~/.codex/skills/quadratic-lesson →  <repo>/internal/skills/quadratic-lesson
```

### 首次设置（clone 后执行一次）

```bash
# 移除旧的本地目录（如果存在）
rm -rf ~/.codex/skills/geometry-lesson

# 创建指向仓库的符号链接
bash tools/setup-skills.sh
```

`tools/setup-skills.sh` 会自动扫描 `internal/skills/` 下的所有 skill 目录，逐一在 `~/.codex/skills/` 建立符号链接。支持 `--dry-run` 预览。

### 更新 Skill

直接修改仓库里的 `internal/skills/geometry-lesson/SKILL.md`，提交即可。不需要额外的同步操作——符号链接始终指向仓库文件。

### 添加新 Skill

1. 在 `internal/skills/<skill-name>/` 下新建目录，写 `SKILL.md`
2. 运行 `bash tools/setup-skills.sh` 建立链接

---

## 十二、参考示例

完整 JSON 示例（南开 2026 一模第 24 题）：

- `internal/lesson-specs/tj-2026-nankai-yimo-24/geometry-spec.json`
- `internal/lesson-specs/tj-2026-nankai-yimo-24/step-decorations.json`
- `internal/lesson-specs/tj-2026-nankai-yimo-24/lesson-data.json`

字段速查表与更多注释：`internal/docs/json-spec-examples.md`

---

## 十三、设计原则总结

1. **LLM 只写数据，不写代码**——三份 JSON 均为纯结构数据，无 HTML、无 JS、无 SVG path
2. **HTML 是编译产物**——不手工编辑编译输出，只修改 JSON 或引擎/模板
3. **一次实现，处处复用**——数学引擎、渲染器、UI 运行时各只有一份实现，新题只需填 JSON
4. **三段脚本有序执行**——数据段 → 几何段（含多个 `<script>` 标签）→ 初始化段，不可混用
5. **Schema 护栏**——提交前用 `validate-geometry-spec.mjs` 校验，比浏览器调试更早发现问题
6. **渲染错误改 JSON 或引擎**——不允许在题页内补丁式覆盖引擎行为
