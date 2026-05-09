# Nankai 25 Few-Shot

**题目：** 2026 年天津市南开区一模第 25 题（二次函数综合）  
**Problem ID：** `tj-2026-nankai-yimo-25`

Use this as a template for quadratic function problems where:
- A coefficient constraint (e.g. `2a+b=0`) fixes the axis and D.
- A geometric construction (∠MDN=90°, DM=DN) determines N from M(m, y₀).
- Part I gives specific `a`, `c` (fixed parabola).
- Part II makes `a`, `b`, `c` depend on `m` (dynamic parabola).
- An optimization target `EG + FG` is minimized subject to a constraint `DE = √2·NG`.

Do not copy mechanically. Use it to match shape, id alignment, expressionEnv ordering, and layer-to-stepStartsWith mapping.

---

## `geometry-spec.json`

```json
{
  "version": 1,
  "id": "tj-2026-nankai-yimo-25",
  "domain": { "minX": -1.6, "maxX": 9.6, "minY": -8.6, "maxY": 3.2 },
  "movingParam": "m",
  "expressionEnv": [
    { "name": "a1", "expr": "2"       },
    { "name": "b1", "expr": "-4"      },
    { "name": "c1", "expr": "-5"      },
    { "name": "a",  "expr": "1/(m-2)" },
    { "name": "b",  "expr": "-2/(m-2)"},
    { "name": "c",  "expr": "1-m"     }
  ],
  "fixedPoints": {
    "O": ["0",  "0"  ],
    "D": ["1",  "0"  ],
    "C": ["0",  "c1" ]
  },
  "movingPoints": {
    "M": ["m",         "1"         ],
    "N": ["2",         "1-m"       ],
    "F": ["3/2",       "(1-m)/2"   ],
    "E": ["(2*m+1)/3", "2/3"       ],
    "G": ["(m+4)/3",   "(3-2*m)/3" ],
    "H": ["5/3",       "2*(1-m)/3" ],
    "K": ["(m+2)/3",   "1/3"       ],
    "Dprime": ["m+1",  "2-m"       ]
  },
  "curves": [
    { "id": "parabolaPart1", "type": "parabola", "a": "a1", "b": "b1", "c": "c1" },
    { "id": "parabolaMain",  "type": "parabola", "a": "a",  "b": "b",  "c": "c"  }
  ],
  "derivedIntersections": [],
  "originalFigures": [
    { "id": "originalFigure1", "t": 3, "showMoving": false, "showOverlap": false, "showIntersections": false }
  ]
}
```

Key patterns:
- `a1/b1/c1` defined before `a/b/c` (ordering rule).
- E and G are `movingPoints` at the optimum position `t=2/3` (functions of m only).
- Two curves share the same renderer; layer visibility separates them.

---

## `step-decorations.json` Layer Pattern

```json
{
  "layers": {
    "global": {
      "elements": [
        { "type": "grid" },
        { "type": "point", "at": "O", "color": "#1f2937", "showLabel": false }
      ]
    },
    "partI": {
      "stepStartsWith": ["i1"],
      "elements": [
        { "type": "parabola",         "curveId": "parabolaPart1", "color": "#2563eb", "width": 2.9 },
        { "type": "axisOfSymmetry",   "curveId": "parabolaPart1", "color": "#94a3b8", "width": 1.4, "dash": "8 6" },
        { "type": "point", "at": "D", "color": "#1f2937", "dx": 12, "dy": 22 }
      ]
    },
    "partII": {
      "stepStartsWith": ["q1", "q2"],
      "elements": [
        { "type": "parabola",         "curveId": "parabolaMain", "color": "#2563eb", "width": 2.9 },
        { "type": "axisOfSymmetry",   "curveId": "parabolaMain", "color": "#94a3b8", "width": 1.4, "dash": "8 6" },
        { "type": "point", "at": "D", "color": "#1f2937",  "dx": -22, "dy": 22 },
        { "type": "point", "at": "M", "color": "#0f766e",  "showLabel": false },
        { "type": "point", "at": "N", "color": "#0f766e",  "showLabel": false },
        { "type": "coloredLine", "from": "D", "to": "M",   "color": "#0f766e", "width": 2 },
        { "type": "coloredLine", "from": "D", "to": "N",   "color": "#0f766e", "width": 2 }
      ]
    },
    "EFG": {
      "stepStartsWith": ["q1s3", "q1s4", "q2"],
      "elements": [
        { "type": "point",       "at": "F",  "color": "#7c3aed", "dx": 14, "dy": 8 },
        { "type": "point",       "at": "E",  "color": "#dc2626",  "dx": 14, "dy": -14 },
        { "type": "point",       "at": "G",  "color": "#dc2626",  "dx": 14, "dy": 14 },
        { "type": "coloredLine", "from": "D", "to": "G",  "color": "#dc2626", "width": 2.2 },
        { "type": "coloredLine", "from": "F", "to": "G",  "color": "#7c3aed", "width": 2.2 },
        { "type": "coloredLine", "from": "M", "to": "N",  "color": "#94a3b8", "width": 1.8 }
      ]
    }
  }
}
```

Key patterns:
- `stepStartsWith: ["i1"]` shows Part I curve only.
- `stepStartsWith: ["q1","q2"]` shows Part II curve for Part II sub-question steps.
- `stepStartsWith: ["q1s3","q1s4","q2"]` shows E/G/F only when the line-sum transformation is relevant.

---

## Step Decoration Patterns

```json
{
  "steps": {
    "q1s1": {
      "add": [
        { "type": "rightAngle", "vertex": "D", "rayA": "M", "rayB": "N", "size": 12, "color": "#b45309" },
        { "type": "coordinateLabel", "at": "D", "text": "D(1, 0)", "dx": -48, "dy": 18 },
        { "type": "coordinateLabel", "at": "M", "text": "M(m, 1)",   "dx": 14, "dy": -24 },
        { "type": "coordinateLabel", "at": "N", "text": "N(2, 1−m)", "dx": 14, "dy": 22 },
        { "type": "dashedLine", "from": "M", "to": "U", "color": "#64748b", "width": 1.5, "dash": "5 5" },
        { "type": "dashedLine", "from": "N", "to": "V", "color": "#64748b", "width": 1.5, "dash": "5 5" },
        { "type": "point", "at": "U", "labelText": "U", "color": "#64748b", "dx": 10, "dy": 18 },
        { "type": "point", "at": "V", "labelText": "V", "color": "#64748b", "dx": 10, "dy": 18 }
      ]
    },
    "i1s2": {
      "add": [
        { "type": "coordinateLabel", "at": "D", "text": "D(1, 0)",  "dx": 14, "dy": -26 }
      ]
    },
    "q1s2": {
      "add": [
        { "type": "rightAngle", "vertex": "D", "rayA": "M", "rayB": "N", "size": 12, "color": "#b45309" },
        { "type": "coordinateLabel", "at": "D", "text": "D(1, 0)", "dx": -48, "dy": 18 },
        { "type": "coloredLine", "from": "M", "to": "N", "color": "#94a3b8", "width": 1.8 },
        { "type": "coordinateLabel", "at": "M", "text": "M(3, 1)",   "dx": 14, "dy": -24 },
        { "type": "coordinateLabel", "at": "N", "text": "N(2, −2)",  "dx": 14, "dy": 22 }
      ]
    },
    "q1s3": {
      "domain": { "minX": 0.2, "maxX": 4.6, "minY": -3.0, "maxY": 1.8 },
      "pointOverrides": {
        "E": ["1+2*s", "s"],
        "G": ["2+s/2", "-2+3*s/2"],
        "H": ["2-s/2", "-2+s"],
        "K": ["1+s", "s/2"]
      },
      "add": [
        { "type": "rightAngle", "vertex": "D", "rayA": "M", "rayB": "N", "size": 12, "color": "#b45309" },
        { "type": "coordinateLabel", "at": "M", "text": "M", "dx": 14, "dy": -16 },
        { "type": "coordinateLabel", "at": "N", "text": "N", "dx": 14, "dy": 14 },
        { "type": "coloredLine", "from": "E", "to": "G", "color": "#dc2626", "width": 2.2 },
        { "type": "dashedLine", "from": "G", "to": "H", "color": "#64748b", "width": 1.5, "dash": "5 5" },
        { "type": "dashedLine", "from": "G", "to": "K", "color": "#64748b", "width": 1.5, "dash": "5 5" },
        { "type": "rightAngle", "vertex": "H", "rayA": "G", "rayB": "N", "size": 9, "color": "#64748b" },
        { "type": "rightAngle", "vertex": "K", "rayA": "G", "rayB": "M", "size": 9, "color": "#64748b" },
        { "type": "point", "at": "H", "labelText": "H", "color": "#64748b", "dx": 20, "dy": 30 },
        { "type": "point", "at": "K", "labelText": "K", "color": "#64748b", "dx": 10, "dy": -10 }
      ]
    },
    "q1s4": {
      "domain": { "minX": 0.2, "maxX": 4.8, "minY": -3.0, "maxY": 1.8 },
      "pointOverrides": {
        "G": ["2+u", "-2+3*u"]
      },
      "add": [
        { "type": "point", "at": "Dprime", "labelText": "D′", "color": "#b45309", "dx": 12, "dy": -10 },
        { "type": "dashedLine", "from": "D", "to": "Dprime", "color": "#b45309", "width": 1.8 },
        { "type": "coloredLine", "from": "M", "to": "Dprime", "color": "#b45309", "width": 2 },
        { "type": "coloredLine", "from": "N", "to": "Dprime", "color": "#b45309", "width": 2 },
        { "type": "coloredLine", "from": "Dprime", "to": "G", "color": "#b45309", "width": 2 },
        { "type": "coloredLine", "from": "Dprime", "to": "F", "color": "#b45309", "width": 2.2 }
      ]
    }
  }
}
```

---

## `lesson-data.json` Alignment Pattern

```json
{
  "meta": {
    "id": "tj-2026-nankai-yimo-25",
    "outputPath": "site/problems/tj/25/tj-2026-nankai-yimo-25.html",
    "pageTitle": "2026 年天津市南开区一模 第 25 题（二次函数综合）",
    "pageDescription": "...",
    "breadcrumbTitle": "2026 天津市南开区一模 第 25 题"
  },
  "ui": {
    "legend": [
      { "colorVar": "paper", "label": "第（Ⅰ）问抛物线  y＝2x²－4x－5" },
      { "colorVar": "fold",  "label": "第（Ⅱ）问动态抛物线（随 m 变化）" }
    ],
    "sliderLabel": "参数 m",
    "paramLabelPrefix": "m=",
    "goToProblemMode": "doubleScroll",
    "groupTitles": {
      "第（Ⅰ）问":     "第（Ⅰ）问  求 D 与解析式",
      "第（Ⅱ）①问":   "第（Ⅱ）①  MN＝√10 情形",
      "第（Ⅱ）②问":   "第（Ⅱ）②  最小值已知情形"
    }
  },
  "steps": [
    {
      "id": "q1s1",
      "section": "第（Ⅱ）①问",
      "title": "第1步：用全等三角形确定 N 的坐标",
      "t": 3,
      "derive": [
        ["∵", "对称轴恒为 x＝1"],
        ["∴", "D(1,0)"],
        ["作", "MU⊥x轴于 U，NV⊥x轴于 V"],
        ["∵", "M(m,1)"],
        ["∴", "U(m,0)，DU＝m−1，MU＝1"],
        ["∵", "∠MDN＝90°，DM＝DN"],
        ["∴", "Rt△DUM≌Rt△VND"],
        ["∴", "DV＝MU＝1，NV＝DU＝m−1"],
        ["∵", "N 在第四象限"],
        ["∴", "V(2,0)，N(2,1−m)"]
      ],
      "box": ["N＝(2, 1−m)"]
    },
    {
      "id": "q1s3",
      "section": "第（Ⅱ）①问",
      "title": "第3步：把两动点问题转化为单动点问题（EG+FG→DG+FG）",
      "t": 3,
      "derive": [
        ["作", "GH⊥DN 于 H，GK⊥DM 于 K"],
        ["∵", "△DMN 是等腰直角三角形，G 在 MN 上"],
        ["∴", "△GNH 是等腰直角三角形"],
        ["∴", "GH＝NH＝NG/√2"],
        ["∵", "四边形 DKGH 是矩形"],
        ["∴", "DK＝GH，GK＝DH"],
        ["∵", "DE＝√2·NG＝2GH"],
        ["∴", "EK＝DE−DK＝GH＝DK"],
        ["∵", "GK⊥DM，D、E、K 在 DM 上"],
        ["∴", "GK 垂直平分 DE"],
        ["∴", "△DGE 为等腰三角形，EG＝DG"],
        ["∴", "EG＋FG＝DG＋FG"]
      ],
      "box": ["EG＝DG", "EG＋FG＝DG＋FG"],
      "localControls": {
        "values": { "s": 0.666667 },
        "note": "拖动任一动点组件，另一个会按 DE＝√2·NG 自动联动。",
        "controls": [
          { "var": "s", "label": "动点 E：DE/DM", "min": 0, "max": 1, "step": 0.01, "scale": 1, "precision": 2 },
          { "var": "s", "label": "动点 G：NG/MN", "min": 0, "max": 0.5, "step": 0.005, "scale": 0.5, "precision": 2 }
        ]
      }
    },
    {
      "id": "q1s4",
      "section": "第（Ⅱ）①问",
      "title": "第4步：用将军饮马求最小值并合并答案",
      "t": 3,
      "derive": [
        ["作", "以 DM、DN 为邻边的正方形 DMD′N"],
        ["∵", "MN 是正方形的对角线"],
        ["∴", "D 与 D′ 关于 MN 对称"],
        ["∵", "G 在 MN 上"],
        ["∴", "DG＝D′G"],
        ["∴", "EG＋FG＝DG＋FG＝D′G＋FG≥D′F"],
        ["∵", "DM＝DN＝√5，F 是 DN 中点"],
        ["∴", "D′N＝√5，NF＝√5/2，且 D′N⊥DN"],
        ["∴", "D′F＝√[(√5)²＋(√5/2)²]＝5/2"],
        ["∴", "y＝x²−2x−2；最小值＝5/2"]
      ],
      "box": ["y＝x²−2x−2", "最小 EG＋FG＝5/2"],
      "localControls": {
        "values": { "u": 0.333333 },
        "note": "拖动 G 观察：D′、G、F 三点共线时，D′G＋FG 最短。",
        "controls": [
          { "var": "u", "label": "动点 G：NG/MN", "min": 0, "max": 1, "step": 0.01, "scale": 1, "precision": 2 }
        ]
      }
    }
  ],
  "policies": {
    "i1s1": { "movable": false, "range": [3.5, 3.5] },
    "q1s1": { "movable": false, "range": [3, 3]      },
    "q1s2": { "movable": false, "range": [3, 3]      },
    "q1s3": { "movable": false, "range": [3, 3]      },
    "q1s4": { "movable": false, "range": [3, 3]      },
    "q2s1": { "movable": false, "range": [8, 8]      },
    "q2s2": { "movable": false, "range": [8, 8]      }
  },
  "stepLabels": {
    "i1s1": "1 求D坐标",
    "q1s1": "1 求N坐标",
    "q1s2": "2 求解析式",
    "q1s3": "3 转化线段和",
    "q1s4": "4 求最小值"
  }
}
```

Key patterns:
- Same `id` in `steps`, `policies`, `stepLabels`, and `step-decorations.steps`.
- Part I policies locked at `range: [3.5, 3.5]` (safe, avoids `m=2` singularity).
- Do not create a separate `第（Ⅱ）问准备` group for this pattern; fold setup into the target sub-question.
- In `derive`, prefer `∵` / `∴` / `作`, and specialize state after solving values (for example use `N(2,−2)` after `m=3`).
- In the EG+FG transformation diagram, draw both `EG` and `DG`, draw helper feet `H/K`, and mark the right angles at `H/K`; in the reflection diagram, draw `MD′`, `ND′`, and `D′F`, and avoid coordinate labels unless the step is computing coordinates.
- Sub-question ② locked at `m=8` (derived answer).
- `section` strings match `groupTitles` keys exactly.
- `t` in each step equals the locked `range` value or a representative value for movable steps.
