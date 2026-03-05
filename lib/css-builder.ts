/**
 * CSS building utilities for content script style injection.
 */

/** Builds display:none rules for each selector under a given prefix. */
export function hide(prefix: string, selectors: readonly string[]): string {
  return selectors.map((s) => `${prefix} ${s} { display: none !important; }`).join('\n');
}

/** Injects a <style> tag into the page. */
export function injectCss(css: string): void {
  const style = document.createElement('style');
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);
}
