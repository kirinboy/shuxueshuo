# Nankai 24 Few-Shot

This is a compact reference for the compiled JSON style. Do not copy it mechanically; use it to match shape, id alignment, and level of detail.

## `geometry-spec.json` Shape

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
    "D": ["3", "0"]
  },
  "movingParam": "t",
  "movingPoints": {
    "P": ["t", "0"],
    "M": ["t/2", "S3*t/2"],
    "N": ["3*t/2", "S3*t/2"]
  },
  "basePolygon": ["A", "B", "C"],
  "movingPolygon": ["M", "P", "N"],
  "derivedIntersections": [
    { "name": "E", "a": ["A", "C"], "b": ["M", "N"], "fallback": ["9-3*t/2", "S3*t/2"] },
    { "name": "G", "a": ["B", "C"], "b": ["P", "N"], "fallback": ["3*(t-1)/2", "S3*(t-3)/2"] }
  ],
  "originalFigures": [
    { "id": "originalFigure1", "t": 2, "showMoving": true, "showOverlap": false },
    { "id": "originalFigure2", "t": 3.75, "showMoving": true, "showOverlap": true }
  ]
}
```

## `step-decorations.json` Layer Pattern

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
        { "type": "overlap" },
        { "type": "point", "at": "P", "color": "#0f766e", "dx": 8, "dy": 24 },
        { "type": "segment", "from": "O", "to": "P", "label": "OP=t" }
      ]
    }
  }
}
```

## Step Decoration Patterns

```json
{
  "steps": {
    "q1s1": {
      "add": [
        { "type": "segment", "from": "D", "to": "P", "label": "DP=t-3", "color": "#0f766e" },
        { "type": "angleArc", "vertex": "P", "rayA": "D", "rayB": "H", "label": "60°" },
        { "type": "rightAngle", "vertex": "H", "rayA": "D", "rayB": "P" }
      ]
    },
    "q2s3": {
      "add": [
        { "type": "cutRegion", "vertices": ["P", "H", "G"], "style": "subtracted", "centroidLabel": "−" },
        { "type": "cutRegion", "vertices": ["N", "E", "F"], "style": "subtracted", "centroidLabel": "−" },
        { "type": "areaFormulaCard", "pos": [0.45, 5.72], "terms": [
          { "text": "S", "kind": "target" },
          { "text": "=", "kind": "op" },
          { "text": "△MPN", "kind": "base" },
          { "text": "−", "kind": "op" },
          { "text": "△PHG", "kind": "cut" }
        ]}
      ]
    }
  }
}
```

## `lesson-data.json` Alignment Pattern

```json
{
  "steps": [
    {
      "id": "q1s1",
      "section": "第（II）①问",
      "title": "第1步：由 Rt△DHP 与旋转角求 DG",
      "t": 3.75,
      "derive": [
        ["∵", "OP＝t，OD＝3"],
        ["∴", "DP＝t－3"],
        ["∵", "PM 由 OP 顺时针旋转 60° 得到"],
        ["∴", "DG＝√3(t－3)"]
      ],
      "box": ["DP＝t－3", "DG＝√3(t－3)"]
    }
  ],
  "policies": {
    "q1s1": { "movable": true, "range": [3.001, 4.499] }
  },
  "stepLabels": {
    "q1s1": "1 求DG"
  }
}
```

The same id, `q1s1`, appears in `lesson-data.steps`, `lesson-data.policies`, `lesson-data.stepLabels`, and `step-decorations.steps`.
