// Theme is applied to <html data-theme="..."> by an inline script in index.html
// (before first paint, to avoid a flash). These helpers read, flip and broadcast it.
export type Theme = 'light' | 'dark';

const KEY = 'malay-trainer:theme';
const THEME_COLOR: Record<Theme, string> = { light: '#0d9488', dark: '#0f172a' };

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLOR[theme]);
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // localStorage unavailable — theme just won't persist.
  }
  // Let every mounted ThemeToggle re-sync (e.g. one in a lesson, one in an overlay).
  window.dispatchEvent(new CustomEvent('themechange'));
}

/** Subscribe to theme changes; returns an unsubscribe function. */
export function onThemeChange(handler: () => void): () => void {
  window.addEventListener('themechange', handler);
  return () => window.removeEventListener('themechange', handler);
}
