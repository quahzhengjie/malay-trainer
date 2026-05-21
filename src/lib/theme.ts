// Theme is applied to <html data-theme="..."> by an inline script in index.html
// (before first paint, to avoid a flash). These helpers just read and flip it.
export type Theme = 'light' | 'dark';

const KEY = 'malay-trainer:theme';

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // localStorage unavailable — theme just won't persist.
  }
}
