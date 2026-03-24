/** Blur focused control before closing Headless UI dialogs to avoid aria-hidden/focus warnings. */
export function blurActiveElement() {
  const el = document.activeElement;
  if (el && typeof el.blur === "function") el.blur();
}

export function closeModalSafely(callback) {
  blurActiveElement();
  requestAnimationFrame(() => callback());
}
