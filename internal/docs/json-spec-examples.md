# 声明式 JSON 规范示例

> 以南开 2026 一模第 24 题为完整参考示例。
> LLM 生成新题时，对照此文件填写三份 JSON——不要编写任何 HTML 代码。

---

## 文件清单

每道题对应 `internal/lesson-specs/<problem-id>/` 目录下的三份文件：

| 文件 | 用途 |
|---|---|
| `geometry-spec.json` | 坐标系、点、多边形、交点、原题图配置 |
| `step-decorations.json` | 图层控制 + 每步增量装饰（线段、角弧、标注…） |
| `lesson-data.json` | 元数据、题目文字、图例、步骤推导、答案 |

编译命令：
```bash
node tools/build-lesson-page.mjs internal/lesson-specs/<problem-id>/
```

---

## 一、geometry-spec.json

```json
{
  "version": 1,
  "id": "tj-2026-nankai-yimo-24",

  "domain": { "minX": -0.9, "maxX": 7.3, "minY": -1.65, "maxY": 6.05 },

  "fixedPoints": {
    "O": ["0", "0"],
    "A": ["0", "3*S3"],
    "B": ["0", "-S3"],
    "C": ["6", "S3"],
    "D": ["3", "0"],
    "I": ["0", "S3"]
  },

  "movingParam": "t",
  "movingPoints": {
    "P": ["t", "0"],
    "M": ["t/2", "S3*t/2"],
    "N": ["3*t/2", "S3*t/2"]
  },

  "basePolygon":   ["A", "B", "C"],
  "movingPolygon": ["M", "P", "N"],

  "derivedIntersections": [
    { "name": "E", "a": ["A", "C"], "b": ["M", "N"], "fallback": ["9-3*t/2", "S3*t/2"] },
    { "name": "F", "a": ["A", "C"], "b": ["P", "N"], "fallback": ["3*(t+3)/4", "S3*(9-t)/4"] },
    { "name": "H", "a": ["B", "C"], "b": ["P", "M"], "fallback": ["3*(t+1)/4", "S3*(t-3)/4"] },
    { "name": "G", "a": ["B", "C"], "b": ["P", "N"], "fallback": ["3*(t-1)/2", "S3*(t-3)/2"] },
    { "name": "K", "a": ["A", "B"], "b": ["M", "N"], "fallback": ["0", "S3*t/2"] },
    { "name": "R", "a": ["A", "C"], "b": ["P", "M"], "fallback": ["3*(t-3)/2", "S3*(9-t)/2"] }
  ],

  "originalFigures": [
    { "id": "originalFigure1", "t": 2,    "showMoving": true, "showOverlap": false, "showIntersections": false },
    { "id": "originalFigure2", "t": 3.75, "showMoving": true, "showOverlap": true,  "showIntersections": true }
  ]
}
```

### 关键字段说明

- `domain`：SVG 视口的数学坐标范围，决定缩放比例
- `fixedPoints` / `movingPoints`：坐标表达式字符串，`S3` = √3，`t` 为动态参数
- `basePolygon` / `movingPolygon`：填充色分别为 `--paper` / `--fold`，重叠区为 `--overlap`
- `derivedIntersections`：两线段的交点，`fallback` 为 t 动态范围外的替代坐标（用于原题图渲染）
- `originalFigures`：原题图配置，`t` 是冻结在该图的参数值

---

## 二、step-decorations.json

```json
{
  "_comment": "南开 24 题 — 步骤装饰。layers 控制图层可见性；steps 定义各步增量元素。",

  "layers": {
    "global": {
      "elements": [
        { "type": "grid" },
        { "type": "basePoly" },
        { "type": "point", "at": "A", "color": "#1f2937", "dx": -28, "dy": -10 },
        { "type": "point", "at": "B", "color": "#1f2937", "dx": -28, "dy": 22 },
        { "type": "point", "at": "C", "color": "#1f2937", "dx": 10,  "dy": 4 },
        { "type": "point", "at": "D", "color": "#1f2937", "dx": 8,   "dy": 22 }
      ]
    },
    "II": {
      "sectionNot": "第（I）问",
      "elements": [
        { "type": "movingPoly" },
        { "type": "overlap" },
        { "type": "point",   "at": "P", "color": "#0f766e", "dx": 8,   "dy": 24, "r": 6 },
        { "type": "point",   "at": "M", "color": "#0f766e", "dx": -34, "dy": -10 },
        { "type": "point",   "at": "N", "color": "#0f766e", "dx": 10,  "dy": -10 },
        { "type": "segment", "from": "O", "to": "P", "label": "OP=t",
          "color": "#0f766e", "offsetPx": -24, "collinearGroup": true }
      ]
    },
    "intersections": {
      "stepStartsWith": ["q1", "q2"],
      "elements": [
        { "type": "derivedPoint", "at": "E", "color": "#dc2626", "dx": 10,  "dy": -12 },
        { "type": "derivedPoint", "at": "F", "color": "#dc2626", "dx": 10,  "dy": 20 },
        { "type": "derivedPoint", "at": "H", "color": "#dc2626", "dx": -24, "dy": 18 },
        { "type": "derivedPoint", "at": "G", "color": "#dc2626", "dx": 10,  "dy": 20 }
      ]
    }
  },

  "steps": {
    "i1s1": {
      "add": [
        { "type": "segment", "from": "A", "to": "B", "label": "AB=4√3",
          "color": "#0f766e", "offsetPx": 38, "collinearGroup": false, "extraNormal": 12 },
        { "type": "dashedLine", "from": "I", "to": "C", "color": "#0f766e", "width": 2.4 },
        { "type": "segment",   "from": "I", "to": "C", "label": "CI=6",
          "color": "#0f766e", "offsetPx": 22, "collinearGroup": false, "named": false },
        { "type": "rightAngle", "vertex": "I", "rayA": "A", "rayB": "C", "size": 12, "color": "#0f766e" },
        { "type": "point", "at": "I", "color": "#0f766e", "dx": -26, "dy": -10, "r": 4.8 },
        { "type": "coordinateLabel", "at": "I", "text": "I(0,√3)",  "dx": 12, "dy": 28 },
        { "type": "coordinateLabel", "at": "A", "text": "A(0,3√3)", "dx": 12, "dy": -18 },
        { "type": "coordinateLabel", "at": "B", "text": "B(0,-√3)", "dx": 12, "dy": 32 }
      ]
    },
    "i1s2": {
      "add": [
        { "type": "coloredLine", "from": "B", "to": "C", "color": "#dc2626", "width": 3 },
        { "type": "segment", "from": "B", "to": "O", "label": "OB=√3",
          "color": "#0f766e", "offsetPx": -34, "collinearGroup": false, "extraNormal": -10 },
        { "type": "segment", "from": "B", "to": "D", "label": "BD=2√3",
          "color": "#0f766e", "offsetPx": -24, "style": "parallel", "rotateWithLine": true, "collinearGroup": false },
        { "type": "angleArc", "vertex": "B", "rayA": "O", "rayB": "D",
          "radius": 28, "color": "#b45309", "label": "60°", "candidates": [{ "dx": 40, "dy": -34 }] },
        { "type": "rightAngle", "vertex": "O", "rayA": "B", "rayB": "D", "size": 12, "color": "#0f766e" }
      ]
    },
    "q1s1": {
      "add": [
        { "type": "segment", "from": "D", "to": "P", "label": "DP=t-3",
          "color": "#0f766e", "offsetPx": 24, "collinearGroup": true },
        { "type": "angleArc", "vertex": "P", "rayA": "D", "rayB": "H",
          "radius": 22, "color": "#b45309", "label": "60°", "fontSize": 12, "labelRadius": 33 },
        { "type": "angleArc", "vertex": "P", "rayA": "H", "rayB": "G",
          "radius": 25, "color": "#b45309", "label": "60°", "fontSize": 12, "labelRadius": 35,
          "candidates": [{ "dx": 16, "dy": -30 }, { "dx": 24, "dy": -18 }, { "dx": 8, "dy": -24 }] },
        { "type": "rightAngle", "vertex": "H", "rayA": "D", "rayB": "P", "size": 9, "color": "#0f766e" }
      ]
    },
    "q1s2": {
      "add": [
        { "type": "coloredLine", "from": "C", "to": "G", "color": "#dc2626", "width": 4.2 },
        { "type": "segment", "from": "C", "to": "D", "label": "CD=2√3",
          "color": "#dc2626", "offsetPx": 30,  "style": "parallel", "rotateWithLine": true, "collinearGroup": false },
        { "type": "segment", "from": "D", "to": "G", "label": "DG=√3(t-3)",
          "color": "#0f766e", "offsetPx": -28, "style": "parallel", "rotateWithLine": true, "collinearGroup": false }
      ]
    },
    "q1s3": {
      "add": [
        { "type": "coloredLine", "from": "C", "to": "G", "color": "#dc2626", "width": 4.2 },
        { "type": "coincidentLabel", "anchor": "D", "when": 3,   "eps": 0.04,
          "text": "P=H=G=D",  "color": "#dc2626", "dx": 10, "dy": -18 },
        { "type": "coincidentLabel", "anchor": "M", "when": 4.5, "eps": 0.04,
          "text": "M 在 AC 上", "color": "#dc2626", "dx": 12, "dy": -18 }
      ]
    },
    "q2s3": {
      "add": [
        { "type": "cutRegion", "vertices": ["P", "H", "G"], "style": "subtracted", "centroidLabel": "−" },
        { "type": "cutRegion", "vertices": ["N", "E", "F"], "style": "subtracted", "centroidLabel": "−" },
        { "type": "dashedLine", "from": "K", "to": "N", "color": "#0f766e", "width": 1.8 },
        { "type": "point", "at": "K", "color": "#0f766e", "dx": -26, "dy": -8, "r": 4.4 },
        { "type": "areaLabel", "region": "overlap", "text": "S", "color": "#dc2626", "dx": -5, "dy": 5, "size": 16 },
        { "type": "areaFormulaCard", "pos": [0.45, 5.72], "terms": [
          { "text": "S",     "kind": "target" }, { "text": "=", "kind": "op" },
          { "text": "△MPN", "kind": "base"   }, { "text": "−", "kind": "op" },
          { "text": "△PHG", "kind": "cut"    }, { "text": "−", "kind": "op" },
          { "text": "△NEF", "kind": "cut"    }
        ]}
      ]
    },
    "q2s4": {
      "add": [
        { "type": "outlineRegion", "vertices": ["R", "H", "C"] },
        { "type": "cutRegion",     "vertices": ["C", "G", "F"], "style": "subtracted" },
        { "type": "point", "at": "R", "color": "#dc2626", "dx": -24, "dy": -12, "r": 4.6 },
        { "type": "areaFormulaCard", "pos": [0.45, 5.72], "terms": [
          { "text": "S",     "kind": "target" }, { "text": "=", "kind": "op" },
          { "text": "△RHC", "kind": "base"   }, { "text": "−", "kind": "op" },
          { "text": "△CGF", "kind": "cut"    }
        ]}
      ]
    }
  }
}
```

### layers 可见性控制规则

| 字段 | 含义 |
|---|---|
| `"section": "第（II）①问"` | 仅当当前步骤属于该小问时显示 |
| `"sectionNot": "第（I）问"` | 当步骤**不属于**该小问时显示 |
| `"stepStartsWith": ["q1","q2"]` | 步骤 id 以指定前缀开头时显示 |
| _(无条件字段)_ | 全局始终显示 |

### 支持的装饰类型速查

| type | 必填字段 | 说明 |
|---|---|---|
| `grid` | — | 坐标轴+网格 |
| `basePoly` | — | 固定多边形（蓝色填充） |
| `movingPoly` | — | 动态多边形（绿色填充） |
| `overlap` | — | 重叠区域（红色/橙色填充） |
| `point` | `at` | 点（圆点+标签） |
| `derivedPoint` | `at` | 交点（用 derivedIntersections 中的名字） |
| `segment` | `from` `to` `label` | 带文字标注的线段 |
| `dashedLine` | `from` `to` | 虚线（无标注） |
| `coloredLine` | `from` `to` `color` | 强调色实线 |
| `rightAngle` | `vertex` `rayA` `rayB` | 直角标记小方块 |
| `angleArc` | `vertex` `rayA` `rayB` `radius` `label` | 角度弧线+标注 |
| `coordinateLabel` | `at` `text` | 坐标文字标注 |
| `coincidentLabel` | `anchor` `when` `eps` `text` | 当 t≈when 时显示的重合提示 |
| `cutRegion` | `vertices` | 被减去的子区域（带斜线阴影） |
| `outlineRegion` | `vertices` | 辅助区域轮廓（虚线描边） |
| `areaLabel` | `region` `text` | 区域内面积文字标注 |
| `areaFormulaCard` | `pos` `terms` | 面积公式卡片 |

---

## 三、lesson-data.json

```json
{
  "meta": {
    "id": "tj-2026-nankai-yimo-24",
    "outputPath": "site/problems/tj/24/tj-2026-nankai-yimo-24.html",
    "pageTitle": "2026 年天津市南开区一模 第 24 题（旋转三角形与重叠面积）",
    "pageDescription": "2026 天津市南开区一模第 24 题：等边三角形、旋转构造 △MPN、五边形重叠状态、CG 与面积 S 的动态变化。",
    "breadcrumbTitle": "2026 天津市南开区一模 第 24 题"
  },

  "problem": {
    "summary": "第 24 题（2026 天津市南开区一模）旋转三角形：求 C、CD，求 CG 与 t 范围，求 S 范围",
    "lines": [
      { "text": "（24）（本题共 10 分）题目主体文字……" },
      { "text": "（I）点 C 的坐标为__________，线段 CD 的长为__________；",
        "answerId": "answerI", "answer": "答案：C＝（6，√3），CD＝2√3" },
      { "text": "（II）设 OP＝t，△MPN 与 △ABC 重合部分面积为 S。" },
      { "text": "① 试用含有 t 的式子表示线段 CG 的长，并写出 t 的取值范围；",
        "answerId": "answerQ1", "answer": "答案：CG＝（5－t）√3，3＜t＜9/2" },
      { "text": "② 当 1＜t＜5 时，求 S 的取值范围（直接写出结果即可）。",
        "answerId": "answerQ2", "answer": "答案：√3/4＜S≤45√3/16" },
      { "heading": "原题图形" },
      { "ariaLabel": "原题图 1 和图 2",
        "figures": [
          { "id": "originalFigure1", "title": "图 1", "ariaLabel": "图 1 说明文字" },
          { "id": "originalFigure2", "title": "图 2", "ariaLabel": "图 2 说明文字" }
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
    "groupTitles": {
      "第（I）问":   "第（I）问 坐标和长度",
      "第（II）①问": "第（II）① CG 长度",
      "第（II）②问": "第（II）② S 范围"
    }
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
        ["∴", "CI⊥AB，CI＝6，C＝（6，√3）"]
      ],
      "box": ["AB＝4√3", "I＝（0，√3）", "CI＝6", "C＝（6，√3）"]
    }
  ],

  "policies": {
    "i1s1": { "movable": false, "range": [2, 2] },
    "q1s1": { "movable": true,  "range": [3.001, 4.499] }
  },

  "stepLabels": {
    "i1s1": "1 求C坐标",
    "q1s1": "1 求DG"
  }
}
```

### 关键字段说明

**`problem.lines` 四种行类型：**

| 字段结构 | 渲染结果 |
|---|---|
| `{ "text": "…" }` | 普通题目行 |
| `{ "text": "…", "answerId": "answerX", "answer": "答案：…" }` | 题目行 + 点击显示答案按钮 |
| `{ "heading": "原题图形" }` | 粗体小标题行 |
| `{ "ariaLabel": "…", "figures": [{id, title, ariaLabel}] }` | 原题图形区域（SVG 占位符） |

> `figures[].id` 必须与 `geometry-spec.json` 中 `originalFigures[].id` 一一对应。

**`ui.legend` 颜色变量：**

| colorVar | 对应 CSS 变量 | 默认颜色 |
|---|---|---|
| `paper` | `var(--paper)` | 蓝色（固定图形） |
| `fold` | `var(--fold)` | 绿色（运动图形） |
| `overlap` | `var(--overlap)` | 红橙色（重叠区域） |

**`steps[].derive`：** 每条为 `["符号", "内容"]`，符号可用 `∵` `∴` `∵∴` `设` `∵` 等。

**`policies`：**
- `movable: false` → 步骤固定在指定 `t` 值，不显示滑块
- `movable: true` + `range: [min, max]` → 滑块限制在此范围内

---

## 生成规范（给 LLM 的注意事项）

1. **不要写任何 HTML**——`lines` 里只写纯文字，`legend` 里只写 `colorVar` 和 `label`。
2. **坐标用字符串表达式**——`S3` 代表 √3，可以写 `"3*S3"` `"t/2"` 等，不要写浮点数。
3. `derivedIntersections` 的 `fallback` 必须填（用于原题图中的静止渲染）。
4. 步骤 id 格式：`i<小问号>s<步骤号>`（第I问）或 `q<小问号>s<步骤号>`（第II问起）。
5. `originalFigures[].id` 与 `problem.lines` 中 `figures[].id` 必须一致。
6. 生成后运行验证器：`node tools/validate-geometry-spec.mjs internal/lesson-specs/<id>/`
