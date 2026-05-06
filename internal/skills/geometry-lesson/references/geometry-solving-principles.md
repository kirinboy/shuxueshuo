# Geometry Solving Principles

Use these principles when writing `02_solution.md`, planning `03_visual_steps.md`, and deciding what belongs in `step-decorations.json` versus `lesson-data.json`.

This file is the compact teaching-quality reference. It should preserve the high-value rules from the old all-in-one skill without pulling renderer or HTML implementation details back into the skill.

## Step Design

- Keep cognitive load low: one step should do one main thing.
- Prefer `观察 -> 构造 -> 计算 -> 结论`.
- Restart step numbering inside each sub-question, such as `第（I）问 Step 1/2` and `第（II）①问 Step 1/2/3`.
- Use method-based titles in the form `方法 + 目标量`, such as `由直角三角形求 DG`, `由线段差求 CG`, `由边界位置判断范围`.
- Use a title like `参数状态 + 方法 + 目标` only when the step is explicitly about a special parameter value, boundary state, or case split.
- Avoid weak titles such as `先求...`, `观察...`, or vague titles such as `由图形关系求...`.
- Step titles must match the visual step. Do not write `构建...` unless that step really introduces a new auxiliary construction.
- If a step mixes boundary-state judgment, boundary-value solving, and final interval writing, split it.

## Reasoning Style

- Use given conditions directly before introducing derived quantities.
- Reuse named points from the problem statement instead of redefining them.
- Reuse conclusions from earlier sub-questions instead of re-deriving them.
- Prefer familiar middle-school geometry before analytic coordinates: right triangles, perpendiculars, equal segments, angle equality, rotations, folds, and similar triangles.
- Coordinates are acceptable when they are the clearest route, but they should not replace an easier geometric idea.
- Split any sentence with multiple reasoning jumps.
- Avoid `显然`, `容易得到`, `同理可得`, and vague phrases such as `代入折叠关系`.
- Use mathematical notation for calculations and formulas, but use classroom language for boundary states and positional descriptions.
- Do not restate visually obvious collinearity or on-line facts unless they are a real logical bridge.

## Angles And Triangles

- When a given angle can be used directly in the current triangle, use that original angle statement instead of renaming it through extra intermediate angles.
- Avoid redundant re-proofs that only rename the same right angle or known angle with different letters.
- For 30°-60°-90° helper triangles, identify the right angle and 30° or 60° angle, then use the side-ratio relation directly.
- Avoid coordinate projection when a standard right triangle gives the needed length cleanly.
- For right-triangle area steps, state the exact base and height used.
- If a labeled segment is the hypotenuse of an isosceles right triangle, either derive the legs first or use a student-friendly formula such as `斜边为 c 的等腰直角三角形面积为 c²/4`.

## Rotation And Local Coordinates

- For rotation-generated moving triangles, do not introduce full coordinates for every moving vertex by default.
- If the target is a segment length, range, or overlap shape, first try rotation angles, right triangles, similar triangles, and line-segment differences.
- If a local coordinate calculation makes one helper length clearer, compute only the needed nearby point or segment, then return to geometric reasoning.
- Avoid setting up a full coordinate system for the whole moving figure when only one local segment such as `ME` is needed.

## Auxiliary Lines And Points

- Name every auxiliary point or foot explicitly, such as `过 A' 向 x 轴作垂线，垂足为 H`.
- Do not leave a construction implicit.
- Do not reuse the same auxiliary letter for different nearby constructions.
- If a horizontal or vertical helper segment is easier from an extended line, introduce the extension and named intersection first.
- Distinct perpendicular feet or helper intersections should use distinct names unless they are truly the same point.

## Boundary And Range Work

- If a range depends on a core expression, derive the expression before solving boundary values.
- First describe what figure appears at the left boundary and right boundary, then solve or state the interval.
- Prefer classroom wording such as `左边界：...`, `右边界：...`, `重叠部分变成三角形`.
- Keep endpoint inclusiveness exactly aligned across problem text, solution, visual steps, `policies.range`, minis, answer chips, and final answer.
- If a boundary is excluded, do not say the value is attained.
- If a boundary is included, show the attained value when it matters for the final range or extremum.
- If the diagram already reveals monotonic change or candidate extrema, use that trend to reduce unnecessary formulas.
- Once candidate values are known, end with one compact `合并最终答案` step.

## Area Reasoning

- For overlap area, first identify the target region shape, then derive needed lengths/heights, then write the area formula.
- Prefer visible decompositions such as `大图形 - 小图形`, `矩形 - 三角形`, `大三角形 - 两个小三角形`, or another student-visible split.
- When an overlap region is a standard shape, say that shape before writing a formula.
- For piecewise overlap-area problems, create one trend/classification step before formula steps. Use `references/piecewise-area-trends.md` for detailed phase and thumbnail rules.
- Reuse earlier lengths in later area steps; later steps should feel like calling prior conclusions, not restarting the problem.
- When a later overlap shape sits near a known vertex and a previous segment is available, prefer decompositions that reuse known segments.
- Do not introduce helper area formulas such as `S△PHG=...` or a whole-stage expression such as `S=...` without deriving the needed base, height, included angle, or decomposition immediately before it.
- If the target area is `S`, keep `S` as the target throughout the problem. Helper shapes are calculation aids, not new target regions.
- Use candidate values and visual trends when they are enough; do not default to deriving every piecewise formula.

## Visual Layering

- Treat each step as a static teaching snapshot, not an animation frame.
- Use a layered display system:
  - global layer: fixed axes, base shape, original fixed vertices
  - sub-question layer: objects useful throughout one sub-question
  - phase layer: repeated local context across adjacent steps
  - step layer: one-step helper lines, angle marks, highlights, or temporary labels
  - derived-results layer: values shown in `lesson-data.steps[].box`
- Assign each object to the first layer where it becomes pedagogically meaningful.
- Do not repeat parent-layer objects in child layers unless the child adds a new role or presentation.
- Keep useful elements stable across consecutive steps by placing them in a phase or section layer.
- Hide helper elements after they no longer support the current inference.
- If a named point from the problem is reused across a sub-question, keep it in the sub-question layer unless a boundary case changes how it should display.

## Diagram Content

- The diagram should show conditions that support the current inference, not the answer currently being solved.
- Do not place the answer currently being solved directly into the main diagram.
- Prefer condition labels over result labels during the solving step.
- Put current-step conclusions in `lesson-data.steps[].box`.
- Choose box contents by dependency, not recency: show prior conclusions the current derivation actually uses plus the new conclusion.
- If a reused conclusion has strong spatial meaning, such as a segment length actively used in the step, it may also appear on the diagram.
- Do not show live values for quantities outside the current sub-question.
- Keep diagram text minimal; use the derivation panel for explanations.
- Keep labels exact. A wrong segment name, coordinate, or length label is a teaching bug.

## Area Visuals

- Keep the target overlap region `S` in one consistent color across all steps of the same problem.
- Do not recolor the target region just because helper regions are introduced.
- Draw helper containers with subtle outlines or pale fills.
- Draw subtracted/cut regions with a distinct secondary style.
- Make the visual hierarchy match formulas such as `S = large area - small triangle - small triangle`.
- When an area formula uses a triangle, expose the exact base/height or included-angle data used by that formula.
- Avoid putting low-value helper-shape names inside crowded diagram regions; prefer formula cards or the derivation panel.

## Original Problem Figures

- If the problem references `图①`, `图②`, include an `原题图形` block in the problem card.
- Original figures are source-context diagrams, not teaching-step diagrams.
- Redraw original figures cleanly when possible instead of embedding blurry worksheet photos.
- Do not add derived answers, conclusion boxes, live values, extra length annotations, or instructional highlights to original figures.
- If an original figure does not show a later construction, do not include it there just because a later solution step uses it.
- Original figures may use larger point markers and labels than teaching-step diagrams, but should still use the same geometry system and color semantics when possible.

## Wording Checklist

- Does each step title name both the method and target?
- Does each step do only one main thing?
- Are given conditions used directly?
- Are auxiliary points explicitly named?
- Are boundary judgment, boundary solving, and interval writing separated when needed?
- Are angle statements used directly instead of repeatedly renamed?
- Are previous conclusions reused instead of re-derived?
- Does the visual step show why the result is true, rather than duplicating the algebra panel?
- Would a middle-school student know exactly what to inspect or draw from the text alone?
