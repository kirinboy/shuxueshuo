/**
 * Interactive lesson UI helpers (shuxueshuo).
 *
 * Keep small, dependency-free, and usable from single-file HTML pages.
 * Exposes: window.InteractiveLessonUI
 */
(function (global) {
  function canMoveForPolicy(policy) {
    return Boolean(policy && policy.movable);
  }

  function applyMoveControls(params) {
    const policy = params.policy || { movable: false, range: [0, 0] };
    const canMove = Boolean(params.canMove);
    const t = Number(params.t);
    const precision = params.precision ?? 3;

    const controlEl = params.controlEl;
    const rangeEl = params.rangeEl;
    const labelEl = params.labelEl;
    const buttonEl = params.buttonEl;

    if (controlEl) {
      controlEl.hidden = !policy.movable;
    }

    if (rangeEl) {
      rangeEl.min = String(policy.range[0]);
      rangeEl.max = String(policy.range[1]);
      rangeEl.value = String(t);
      rangeEl.disabled = !canMove || !policy.movable;
    }

    if (labelEl) {
      labelEl.textContent = `t=${Number.isFinite(t) ? t.toFixed(precision) : "—"}`;
    }

    if (buttonEl) {
      buttonEl.disabled = false;
      buttonEl.textContent = policy.movable ? (canMove ? "关闭移动" : "打开移动") : "本步锁定";
      buttonEl.className = policy.movable ? (canMove ? "move-on" : "warn") : "warn";
    }
  }

  global.InteractiveLessonUI = {
    canMoveForPolicy,
    applyMoveControls
  };
})(window);

