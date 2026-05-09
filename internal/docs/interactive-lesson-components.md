# Interactive Lesson Components

This document defines reusable interaction components for compiled lesson pages. It is the shared source of truth for geometry and quadratic lesson skills.

The HTML page is compiled from:

- `geometry-spec.json`
- `step-decorations.json`
- `lesson-data.json`

Do not hand-write generated HTML or one-off JavaScript for these components. Add declarative fields to the JSON specs and update the shared runtime/schema when a new behavior is generally useful.

## Main Parameter Slider

Use the main parameter slider when a step explores the problem's global moving parameter, such as `t`, `m`, or another exam parameter.

Declaration:

```json
"policies": {
  "q1s1": { "movable": true, "range": [3.001, 4.499], "step": 0.001 }
}
```

Runtime behavior:

- Rendered by `site/assets/js/lesson-page-runtime.js`.
- Uses `input[data-step-range]`.
- Calls `diagramMarkupFor(index, nextT, localVars)`.
- Updates `geometry-spec.movingParam` through `resolveClipOverlap(spec, nextT)`.
- Recomputes all points, expressions, curves, polygons, and derived quantities that depend on the main parameter.

Use it for:

- whole-step exploration of a moving point defined by the exam parameter;
- phase changes, endpoint behavior, area trends, or parameter-dependent parabolas;
- geometry 24-style pages where each step is about moving the primary figure.

Avoid it when:

- the exam parameter should remain fixed for the step;
- students only need to drag a local auxiliary point inside a proof or shortest-path construction.

## Local Point Controls

Use local point controls when a step needs students to drag one or more points while the main exam parameter stays fixed.

This component has two parts:

1. `lesson-data.steps[].localControls` declares the visible slider controls.
2. `step-decorations.steps[stepId].pointOverrides` maps local variables to temporary point positions for that step.

Example: one local moving point `G` on `MN`.

```json
{
  "id": "q1s4",
  "t": 3,
  "localControls": {
    "values": { "u": 0.333333 },
    "note": "拖动 G 观察最短状态。",
    "controls": [
      { "var": "u", "label": "动点 G：NG/MN", "min": 0, "max": 1, "step": 0.01, "scale": 1, "precision": 2 }
    ]
  }
}
```

```json
{
  "steps": {
    "q1s4": {
      "pointOverrides": {
        "G": ["2+u", "-2+3*u"]
      },
      "add": []
    }
  }
}
```

Runtime behavior:

- Rendered by `site/assets/js/lesson-page-runtime.js`.
- Uses `input[data-local-control-step]`.
- Does not change `geometry-spec.movingParam`.
- Calls `diagramMarkupFor(index, currentT, localVars)`.
- `geometry-lesson-from-spec.js` applies `pointOverrides` after resolving the normal geometry state.
- Overrides only the named points for that step. Other steps and default moving-point formulas are unchanged.

Use it for:

- local proof diagrams where students drag an auxiliary point;
- shortest-path/reflection diagrams where one point moves on a line;
- constrained point pairs where two visual points move together by one mathematical degree of freedom.

## Linked Controls For Constrained Points

When two points are constrained, do not give them independent variables. Use multiple controls backed by the same source variable, with `scale` if the displayed ratio differs.

Example: `E` on `DM` and `G` on `MN` constrained by `DE = sqrt(2) * NG`.

```json
"localControls": {
  "values": { "s": 0.666667 },
  "note": "拖动任一动点组件，另一个会按 DE＝√2·NG 自动联动。",
  "controls": [
    { "var": "s", "label": "动点 E：DE/DM", "min": 0, "max": 1, "step": 0.01, "scale": 1, "precision": 2 },
    { "var": "s", "label": "动点 G：NG/MN", "min": 0, "max": 0.5, "step": 0.005, "scale": 0.5, "precision": 2 }
  ]
}
```

```json
"pointOverrides": {
  "E": ["1+2*s", "s"],
  "G": ["2+s/2", "-2+3*s/2"],
  "H": ["2-s/2", "-2+s"],
  "K": ["1+s", "s/2"]
}
```

The two sliders look like two point components to the student, but both update `s`, so the constraint is never broken.

## Main Slider Versus Local Controls

These components are intentionally separate.

| Component | JSON source | DOM marker | Changes | Scope |
|---|---|---|---|---|
| Main parameter slider | `policies[stepId].movable` | `data-step-range` | `geometry-spec.movingParam` | whole step geometry |
| Local point controls | `steps[].localControls` + `pointOverrides` | `data-local-control-step` | local variables only | selected points in one step |

They can coexist in one step, but only do that when the math meaning is clear. In most teaching pages, prefer one of these:

- main slider for broad parameter exploration;
- local point controls for focused auxiliary construction or shortest-path observation.

## Design Principles

- Keep controls faithful to the math constraint. Do not let students move constrained points independently.
- Label controls by geometric meaning, not implementation variables. Use labels like `动点 G：NG/MN`.
- Use local point controls with a local step `domain` when the proof depends on a small auxiliary figure.
- Keep local controls out of algebra-only steps.
- If a local control changes a helper foot or dependent point, override those dependent points too.
- Do not use visible instructional paragraphs to explain the UI. A short `note` is acceptable when it names the invariant or observation.

## Validation

After adding or changing components:

```bash
node tools/validate-geometry-spec.mjs internal/lesson-specs/<problem-id>/
node tools/build-lesson-page.mjs internal/lesson-specs/<problem-id>/
node --check site/assets/js/lesson-page-runtime.js
node --check site/assets/js/geometry-lesson-from-spec.js
```

For regression confidence, validate existing lessons that use the main parameter slider.
