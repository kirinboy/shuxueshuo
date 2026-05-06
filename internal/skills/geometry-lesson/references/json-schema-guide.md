# JSON Schema Guide

The compiled geometry lesson page is driven by three JSON files in `internal/lesson-specs/<problem-id>/`.

This guide explains how to fill them. The exact field and type constraints are defined by the real schema files:

- `internal/schemas/geometry-spec.schema.json`
- `internal/schemas/step-decorations.schema.json`
- `internal/schemas/lesson-data.schema.json`

Run this after editing them:

```bash
node tools/validate-geometry-spec.mjs internal/lesson-specs/<problem-id>/
```

## `geometry-spec.json`

Required top-level fields:

- `version`: integer, currently `1`
- `id`: must match `lesson-data.json.meta.id`
- `domain`: `{ "minX", "maxX", "minY", "maxY" }`
- `fixedPoints`: point coordinates as expression strings
- `movingParam`: usually `"t"`
- `movingPoints`: moving point coordinates as expression strings
- `basePolygon`: fixed polygon point ids
- `movingPolygon`: moving polygon point ids

Optional common fields:

- `derivedIntersections`: declare intersections by two point-pair lines: `{ "name": "E", "a": ["A", "C"], "b": ["M", "N"] }`
- `originalFigures`: problem-card figures, each with an `id` that must match `lesson-data.problem.lines[].figures[].id`

Rules:

- Use expression strings such as `"3*S3"`, `"t/2"`, `"S3*(9-t)/4"`.
- Do not hand-write dynamic intersection formulas; use `derivedIntersections`.
- `fallback` may be used for original/static figure rendering.

## `step-decorations.json`

Required top-level fields:

- `layers`: named context layers
- `steps`: step-id keyed additions

Layer shape:

```json
{
  "layers": {
    "global": {
      "elements": [
        { "type": "grid" },
        { "type": "basePoly" }
      ]
    },
    "II": {
      "sectionNot": "第（I）问",
      "elements": [
        { "type": "movingPoly" },
        { "type": "overlap" }
      ]
    }
  }
}
```

Step shape:

```json
{
  "steps": {
    "q1s1": {
      "add": [
        { "type": "segment", "from": "D", "to": "P", "label": "DP=t-3" }
      ]
    }
  }
}
```

Supported decoration types include:

- `grid`, `basePoly`, `movingPoly`, `overlap`
- `point`, `derivedPoint`
- `segment`, `dashedLine`, `coloredLine`
- `rightAngle`, `angleArc`
- `coordinateLabel`, `coincidentLabel`
- `cutRegion`, `outlineRegion`
- `areaLabel`, `areaFormulaCard`

Rules:

- Put stable context in `layers`, not repeated step additions.
- Put only current-step helper/highlight elements in `steps[stepId].add`.
- Every `lesson-data.steps[].id` must have a matching `step-decorations.steps[id]`.

## `lesson-data.json`

Required top-level fields:

- `meta`
- `problem`
- `steps`
- `policies`
- `stepLabels`

`problem.lines` supports only these data shapes:

```json
{ "text": "普通题目行" }
{ "text": "带答案行", "answerId": "answerI", "answer": "答案：..." }
{ "heading": "原题图形" }
{ "ariaLabel": "原题图 1 和图 2", "figures": [{ "id": "originalFigure1", "title": "图 1" }] }
```

`ui.legend` supports only:

```json
{ "colorVar": "paper", "label": "固定图形" }
```

Step alignment:

- Each `steps[].id` must exist in `policies`.
- Each `steps[].id` must exist in `stepLabels`.
- Each `steps[].id` must exist in `step-decorations.steps`.

## Common Validation Errors

- HTML appears in JSON text: remove `<span>`, `<div>`, `style=`, or SVG strings.
- `meta.id` does not match `geometry-spec.id`.
- A step id is missing from `policies`, `stepLabels`, or `step-decorations.steps`.
- An original figure id appears in `lesson-data` but not in `geometry-spec.originalFigures`.
- A decoration `type` is misspelled.
- A point id in a segment or polygon is not declared in fixed, moving, or derived points.
