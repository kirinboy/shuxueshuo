/**
 * 从 geometry-spec（声明式）解析动点状态，并提供完整的 SVG 渲染管线。
 * 依赖：GeometryEngine（必须先加载）
 * 可选：GeometryLabelLayout（有则自动启用标注避让）
 * 暴露：window.GeometryLessonFromSpec
 */
(function (global) {
  "use strict";

  /** 解析交叉点与裁剪重叠区域（spec 格式见 geometry-spec.json）。 */
  function resolveClipOverlap(spec, t) {
    var GE = global.GeometryEngine;
    if (!GE) throw new Error("GeometryEngine is required");
    var env = { t: Number(t), S3: GE.SQRT3 };
    var pts = {};

    var fp = spec.fixedPoints || {};
    Object.keys(fp).forEach(function (k) { pts[k] = GE.evalPoint(fp[k], env); });

    var mp = spec.movingPoints || {};
    Object.keys(mp).forEach(function (k) { pts[k] = GE.evalPoint(mp[k], env); });

    var derived = spec.derivedIntersections || [];
    for (var i = 0; i < derived.length; i++) {
      var d = derived[i];
      var p1 = pts[d.a[0]], p2 = pts[d.a[1]];
      var p3 = pts[d.b[0]], p4 = pts[d.b[1]];
      var hit = GE.segmentIntersection(p1, p2, p3, p4);
      if (hit) {
        pts[d.name] = hit;
      } else if (d.fallback) {
        pts[d.name] = { x: GE.evalExpr(d.fallback[0], env), y: GE.evalExpr(d.fallback[1], env) };
      } else {
        pts[d.name] = { x: NaN, y: NaN };
      }
    }

    var base = (spec.basePolygon || []).map(function (n) { return pts[n]; });
    var moving = (spec.movingPolygon || []).map(function (n) { return pts[n]; });
    var overlap = GE.clipPolygon(moving, base);

    return { points: pts, base: base, moving: moving, overlap: overlap, area: GE.polygonArea(overlap), t: env.t };
  }

  /** 将 resolveClipOverlap 结果适配成南开页旧字段名（兼容现存代码）。 */
  function asNankaiStateShape(resolved) {
    var p = resolved.points;
    return { P: p.P, M: p.M, N: p.N, E: p.E, F: p.F, H: p.H, G: p.G, K: p.K, R: p.R, moving: resolved.moving, overlap: resolved.overlap, area: resolved.area };
  }

  // ────────────────────────────────────────────────────────────────────────
  // 声明式渲染管线
  // ────────────────────────────────────────────────────────────────────────

  /**
   * 创建一个基于 geometry-spec + step-decorations 的渲染器。
   *
   * @param {object} spec          geometry-spec.json 对象
   * @param {object} decoData      step-decorations.json 对象（含 layers + steps）
   * @param {Array}  STEPS         STEPS 数组（来自题页）
   * @param {object} POLICIES      POLICIES 对象（来自题页）
   * @param {object} opts          可选配置：W, H, PAD（画布和内边距）
   * @returns {{ diagramMarkupFor, drawMini, renderOriginalFigures }}
   */
  function createSpecRenderer(spec, decoData, STEPS, POLICIES, opts) {
    var GE = global.GeometryEngine;
    var GLL = global.GeometryLabelLayout || null;
    opts = opts || {};

    var W = opts.W || 1080;
    var H = opts.H || 760;
    var PAD = opts.PAD || { left: 92, right: 78, top: 48, bottom: 66 };
    var domain = spec.domain;

    var toScreen = GE.createToScreen(domain, PAD, W, H);
    var layers = decoData.layers || {};
    var stepDecos = decoData.steps || {};

    var _layout = null; // 当前 label layout（每次 render 开始时创建，结束时清空）

    // ── 内部 SVG 工具 ────────────────────────────────────────────────────

    function pathD(pts) {
      if (!pts || !pts.length) return "";
      var first = toScreen(pts[0]);
      var d = "M " + first.x + " " + first.y;
      for (var i = 1; i < pts.length; i++) {
        var q = toScreen(pts[i]);
        d += " L " + q.x + " " + q.y;
      }
      return d + " Z";
    }

    function lineSvg(a, b, color, width, dash) {
      var p = toScreen(a), q = toScreen(b);
      var da = dash ? ' stroke-dasharray="' + dash + '"' : "";
      return '<line x1="' + p.x + '" y1="' + p.y + '" x2="' + q.x + '" y2="' + q.y +
        '" stroke="' + (color || "#334155") + '" stroke-width="' + (width || 2) + '"' + da + ' />';
    }

    function textAtSvg(p, text, color, dx, dy, size) {
      var s = toScreen(p);
      return '<text x="' + (s.x + (dx || 8)) + '" y="' + (s.y + (dy || -10)) +
        '" font-size="' + (size || 14) + '" font-weight="900" fill="' + (color || "#334155") + '">' +
        GE.svgEsc(text) + '</text>';
    }

    function pointSvg(p, label, color, dx, dy, popts) {
      popts = popts || {};
      var s = toScreen(p);
      var r = popts.r || 5.2;
      var col = color || "#1f2937";
      var circle = '<circle cx="' + s.x + '" cy="' + s.y + '" r="' + r +
        '" fill="' + col + '" stroke="#fff" stroke-width="1.8" />';
      if (!label) return circle;
      var fs = popts.fontSize || 15, fw = popts.fontWeight || 900;
      if (GLL && _layout) {
        _layout.occupied.push({ left: s.x - 8, top: s.y - 8, right: s.x + 8, bottom: s.y + 8, kind: "self-point" });
        var candidates = [{ dx: dx || 8, dy: dy || -8 }];
        if (popts.altDx != null) candidates.push({ dx: popts.altDx, dy: popts.altDy != null ? popts.altDy : (dy || -8) });
        if (GLL.candidateOffsets) candidates = candidates.concat(GLL.candidateOffsets(dx || 8, dy || -8));
        return circle + GLL.labelSvg(_layout, p, label, { color: col, fontSize: fs, fontWeight: fw, preferredDx: dx || 8, preferredDy: dy || -8, candidates: candidates, allowNearPoint: true });
      }
      return circle + '<text x="' + (s.x + (dx || 8)) + '" y="' + (s.y + (dy || -8)) +
        '" font-size="' + fs + '" font-weight="' + fw + '" fill="' + col + '">' + GE.svgEsc(label) + '</text>';
    }

    function segmentSvg(a, b, text, color, offsetPx, sopts) {
      sopts = sopts || {};
      if (!GLL || !_layout) return "";
      return GLL.segmentMeasureSvg(_layout, toScreen, a, b, text, {
        color: color || "#0f766e",
        style: sopts.style || "dimension",
        showGuide: sopts.showGuide !== false,
        rotateWithLine: sopts.rotateWithLine || false,
        fontSize: 14, fontWeight: 900,
        offsetPx: offsetPx || 20,
        extraNormal: sopts.extraNormal,
        extraAlong: sopts.extraAlong,
        segmentRole: sopts.segmentRole || "derived",
        crowded: sopts.crowded !== false,
        collinearGroup: sopts.collinearGroup !== false,
        reusedInFormula: sopts.reusedInFormula !== false,
        named: sopts.named || false,
        segmentName: sopts.segmentName
      });
    }

    function angleArcSvg(c, a, b, aopts) {
      aopts = aopts || {};
      var cs = toScreen(c), as = toScreen(a), bs = toScreen(b);
      var r = aopts.radius || 24, color = aopts.color || "#b45309", label = aopts.label || "";
      var arc = GE.svgAngleArcPath(cs, as, bs, r);
      var out = '<path d="' + arc.path + '" fill="none" stroke="' + color + '" stroke-width="2" />';
      if (label && GLL && _layout) {
        out += GLL.polarLabelSvg(_layout, cs, label, {
          radius: aopts.labelRadius || (r + 18),
          angle: aopts.labelAngle || arc.midAngle,
          color: color, fontSize: aopts.fontSize || 14, fontWeight: 900,
          candidates: aopts.candidates
        });
      }
      return out;
    }

    function rightAngleSvg(vertex, rayA, rayB, ropts) {
      ropts = ropts || {};
      if (!GLL || !_layout) return "";
      return GLL.rightAngleSvg(_layout, toScreen, vertex, rayA, rayB, { size: ropts.size || 12, color: ropts.color || "#0f766e" });
    }

    function gridSvg() {
      var lines = [];
      for (var x = Math.ceil(domain.minX); x <= domain.maxX; x++) {
        var p1 = toScreen({ x: x, y: domain.minY }), p2 = toScreen({ x: x, y: domain.maxY });
        lines.push('<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" stroke="rgba(15,23,42,.06)" stroke-width="1" />');
      }
      for (var y = Math.ceil(domain.minY); y <= domain.maxY; y++) {
        var q1 = toScreen({ x: domain.minX, y: y }), q2 = toScreen({ x: domain.maxX, y: y });
        lines.push('<line x1="' + q1.x + '" y1="' + q1.y + '" x2="' + q2.x + '" y2="' + q2.y + '" stroke="rgba(15,23,42,.06)" stroke-width="1" />');
      }
      var ax1 = toScreen({ x: domain.minX, y: 0 }), ax2 = toScreen({ x: domain.maxX, y: 0 });
      var ay1 = toScreen({ x: 0, y: domain.minY }), ay2 = toScreen({ x: 0, y: domain.maxY });
      lines.push('<line x1="' + ax1.x + '" y1="' + ax1.y + '" x2="' + ax2.x + '" y2="' + ax2.y + '" stroke="#93a0ad" stroke-width="2" />');
      lines.push('<line x1="' + ay1.x + '" y1="' + ay1.y + '" x2="' + ay2.x + '" y2="' + ay2.y + '" stroke="#93a0ad" stroke-width="2" />');
      lines.push(textAtSvg({ x: domain.maxX - 0.25, y: 0 }, "x", "#334155", 0, -10, 18));
      lines.push(textAtSvg({ x: 0, y: domain.maxY - 0.18 }, "y", "#334155", 10, 0, 18));
      lines.push(textAtSvg({ x: 0, y: 0 }, "O", "#334155", -26, 24, 18));
      return lines.join("");
    }

    /** 添加多边形段落到 label layout 的障碍物列表 */
    function addObstacles(state) {
      if (!GLL || !_layout) return;
      var pts = state.points;
      var segs = [];
      // base polygon edges
      var base = state.base || [];
      for (var i = 0; i < base.length; i++) segs.push([base[i], base[(i + 1) % base.length]]);
      // moving polygon edges
      var mov = state.moving || [];
      for (var j = 0; j < mov.length; j++) segs.push([mov[j], mov[(j + 1) % mov.length]]);
      // key derived segments (if they exist)
      [["P", "G"], ["P", "H"], ["C", "G"]].forEach(function (pair) {
        var a = pts[pair[0]], b = pts[pair[1]];
        if (a && b) segs.push([a, b]);
      });
      segs.forEach(function (seg) {
        GLL.addSegmentObstacle(_layout, toScreen, seg[0], seg[1], { radius: 6, step: 18 });
      });
    }

    /** 检查派生点是否在可见区域内 */
    function inBounds(p) {
      return p && !isNaN(p.x) && !isNaN(p.y) && p.x > -0.3 && p.x < 6.3 && p.y > -0.6 && p.y < 5.4;
    }

    // ── 单个装饰元素渲染 ────────────────────────────────────────────────

    function renderElem(elem, pts, state) {
      if (!elem || !elem.type) return "";
      var a, b, v;
      switch (elem.type) {
        case "grid":
          return gridSvg();
        case "basePoly":
          return state.base.length
            ? '<path d="' + pathD(state.base) + '" fill="var(--paper)" stroke="var(--paper-stroke)" stroke-width="3" />'
            : "";
        case "movingPoly":
          return state.moving.length
            ? '<path d="' + pathD(state.moving) + '" fill="var(--fold)" stroke="var(--fold-stroke)" stroke-width="3" />'
            : "";
        case "overlap":
          return state.overlap.length
            ? '<path d="' + pathD(state.overlap) + '" fill="var(--overlap)" stroke="var(--overlap-stroke)" stroke-width="3" />'
            : "";
        case "point": {
          var at = pts[elem.at];
          if (!at) return "";
          var lbl = elem.showLabel === false ? null : (elem.labelText || elem.at);
          return pointSvg(at, lbl, elem.color || "#1f2937", elem.dx || 8, elem.dy || -8,
            { r: elem.r, fontSize: elem.fontSize, altDx: elem.altDx, altDy: elem.altDy });
        }
        case "derivedPoint": {
          var dp = pts[elem.at];
          if (!inBounds(dp)) return "";
          return pointSvg(dp, elem.at, elem.color || "#dc2626", elem.dx || 8, elem.dy || -8, { r: elem.r || 4.6 });
        }
        case "segment": {
          a = pts[elem.from]; b = pts[elem.to];
          if (!a || !b) return "";
          return segmentSvg(a, b, elem.label || "", elem.color || "#0f766e", elem.offsetPx || 20, elem);
        }
        case "coloredLine": {
          a = pts[elem.from]; b = pts[elem.to];
          if (!a || !b) return "";
          return lineSvg(a, b, elem.color || "#dc2626", elem.width || 2, "");
        }
        case "dashedLine":
        case "dottedLine": {
          a = pts[elem.from]; b = pts[elem.to];
          if (!a || !b) return "";
          return lineSvg(a, b, elem.color || "#0f766e", elem.width || 2, elem.dash || "6 5");
        }
        case "rightAngle": {
          v = pts[elem.vertex]; a = pts[elem.rayA]; b = pts[elem.rayB];
          if (!v || !a || !b) return "";
          return rightAngleSvg(v, a, b, { size: elem.size, color: elem.color });
        }
        case "angleArc": {
          v = pts[elem.vertex]; a = pts[elem.rayA]; b = pts[elem.rayB];
          if (!v || !a || !b) return "";
          return angleArcSvg(v, a, b, elem);
        }
        case "coordinateLabel": {
          var cp = pts[elem.at];
          if (!cp) return "";
          return textAtSvg(cp, elem.text || "", "#334155", elem.dx || 8, elem.dy || -10, 14);
        }
        case "areaLabel": {
          var region = (elem.region === "moving") ? state.moving : state.overlap;
          if (!region || !region.length) return "";
          var cen = GE.centroid(region);
          return textAtSvg(cen, elem.text || "S", elem.color || "#dc2626", elem.dx || -5, elem.dy || 5, elem.size || 16);
        }
        case "cutRegion": {
          var verts = (elem.vertices || []).map(function (n) { return pts[n]; }).filter(Boolean);
          if (verts.length < 3) return "";
          var fill = elem.style === "subtracted" ? "rgba(245,158,11,.28)" : "none";
          var out2 = '<path d="' + pathD(verts) + '" fill="' + fill + '" stroke="#b45309" stroke-width="2.2" stroke-dasharray="6 5" />';
          if (elem.centroidLabel) {
            var cen2 = GE.centroid(verts);
            var cs = toScreen(cen2);
            out2 += '<text x="' + cs.x + '" y="' + cs.y + '" dx="-5" dy="5" font-size="16" font-weight="900" fill="#b45309">' + GE.svgEsc(elem.centroidLabel) + '</text>';
          }
          return out2;
        }
        case "outlineRegion": {
          var verts2 = (elem.vertices || []).map(function (n) { return pts[n]; }).filter(Boolean);
          if (verts2.length < 3) return "";
          return '<path d="' + pathD(verts2) + '" fill="none" stroke="#b45309" stroke-width="2.2" stroke-dasharray="6 5" />';
        }
        case "areaFormulaCard": {
          var pos = elem.pos;
          if (!pos) return "";
          var sp = toScreen({ x: pos[0], y: pos[1] });
          return GE.svgAreaFormulaCard(sp.x, sp.y, elem.terms || []);
        }
        case "coincidentLabel": {
          var eps = elem.eps || 0.04;
          if (Math.abs(state.t - (elem.when || 0)) >= eps) return "";
          var anchor = pts[elem.anchor];
          if (!anchor) return "";
          return textAtSvg(anchor, elem.text || "", elem.color || "#dc2626", elem.dx || 10, elem.dy || -18, elem.size || 14);
        }
        default:
          return "";
      }
    }

    // ── 图层可见性判断 ────────────────────────────────────────────────────

    function isLayerActive(layerDef, stepId, section) {
      if (layerDef.sectionNot) return section !== layerDef.sectionNot;
      if (layerDef.stepStartsWith) {
        return layerDef.stepStartsWith.some(function (prefix) { return stepId.indexOf(prefix) === 0; });
      }
      return true;
    }

    function renderLayers(stepId, section, pts, state) {
      var out = "";
      Object.keys(layers).forEach(function (layerName) {
        var layerDef = layers[layerName];
        var active = (layerName === "global") ? true : isLayerActive(layerDef, stepId, section);
        if (!active) return;
        var elems = Array.isArray(layerDef.elements) ? layerDef.elements : [];
        elems.forEach(function (elem) {
          if (typeof elem === "string" && elem === "grid") { out += gridSvg(); return; }
          out += renderElem(elem, pts, state);
        });
      });
      return out;
    }

    // ── 完整步骤 SVG ─────────────────────────────────────────────────────

    function diagramMarkupFor(index, overrideT) {
      var step = STEPS[index];
      var policy = POLICIES[step.id];
      var rng = policy.range || [0, 10];
      var localT = Math.max(rng[0], Math.min(rng[1], overrideT != null ? overrideT : step.t));
      var state = resolveClipOverlap(spec, localT);
      var pts = state.points;

      if (GLL) {
        _layout = GLL.createLabelLayout({ toScreen: toScreen, padding: 4, pointRadius: 8 });
        addObstacles(state);
      }

      var out = renderLayers(step.id, step.section, pts, state);

      var deco = stepDecos[step.id] || {};
      (deco.add || []).forEach(function (elem) { out += renderElem(elem, pts, state); });

      var liveBox = policy.movable
        ? (step.box || []).concat(["示例 t=" + Number(localT).toFixed(3).replace(/\.?0+$/, "")])
        : (step.box || []);
      out += GE.svgConclusionBox(liveBox);

      _layout = null;
      return out;
    }

    // ── 缩略图 SVG ───────────────────────────────────────────────────────

    function drawMini(t) {
      var s = resolveClipOverlap(spec, t);
      return GE.svgMini(s.base, s.moving, s.overlap, domain);
    }

    // ── 原题图形渲染 ─────────────────────────────────────────────────────

    function renderOriginalFigureSvg(t, figConfig) {
      figConfig = figConfig || {};
      var FIG_PAD = { left: 92, right: 78, top: 48, bottom: 66 };
      var FIG_W = W, FIG_H = H;
      // 使用同一 toScreen（原题图和步骤图共用同一画布尺寸）
      var state = resolveClipOverlap(spec, t);
      var pts = state.points;

      if (GLL) {
        _layout = GLL.createLabelLayout({ toScreen: toScreen, padding: 4, pointRadius: 8 });
      }

      var out = gridSvg();
      // base poly
      out += state.base.length ? '<path d="' + pathD(state.base) + '" fill="var(--paper)" stroke="var(--paper-stroke)" stroke-width="3" />' : "";
      // fixed points with larger size
      var fixedLabels = [
        { k: "A", dx: -28, dy: -10 }, { k: "B", dx: -28, dy: 22 },
        { k: "C", dx: 10, dy: 4 }, { k: "D", dx: 8, dy: 22 }
      ];
      fixedLabels.forEach(function (fl) {
        var p = pts[fl.k];
        if (p) out += pointSvg(p, fl.k, "#1f2937", fl.dx, fl.dy, { r: 6.6, fontSize: 20 });
      });
      if (figConfig.showMoving !== false && state.moving.length) {
        out += '<path d="' + pathD(state.moving) + '" fill="var(--fold)" stroke="var(--fold-stroke)" stroke-width="3" />';
        if (figConfig.showOverlap && state.overlap.length) {
          out += '<path d="' + pathD(state.overlap) + '" fill="var(--overlap)" stroke="var(--overlap-stroke)" stroke-width="3" />';
        }
        out += pointSvg(pts.P, "P", "#0f766e", 8, 26, { r: 7, fontSize: 20 });
        out += pointSvg(pts.M, "M", "#0f766e", -40, -12, { r: 6.6, fontSize: 20 });
        out += pointSvg(pts.N, "N", "#0f766e", 12, -12, { r: 6.6, fontSize: 20 });
      }
      if (figConfig.showIntersections) {
        [["E", 10, -12], ["F", 10, 20], ["H", -24, 18], ["G", 10, 20]].forEach(function (it) {
          var p = pts[it[0]];
          if (inBounds(p)) out += pointSvg(p, it[0], "#dc2626", it[1], it[2], { r: 6, fontSize: 19 });
        });
      }

      _layout = null;
      return out;
    }

    function renderOriginalFigures() {
      var figs = spec.originalFigures || [];
      figs.forEach(function (fig) {
        var el = document.getElementById(fig.id);
        if (!el) return;
        el.innerHTML = renderOriginalFigureSvg(fig.t, fig);
      });
    }

    return { diagramMarkupFor: diagramMarkupFor, drawMini: drawMini, renderOriginalFigures: renderOriginalFigures };
  }

  global.GeometryLessonFromSpec = {
    resolveClipOverlap: resolveClipOverlap,
    asNankaiStateShape: asNankaiStateShape,
    createSpecRenderer: createSpecRenderer
  };
})(window);
