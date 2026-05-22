import { useEffect, useState } from 'react';
import type { Theme } from '../lib/theme';
import { applyTheme, currentTheme, onThemeChange } from '../lib/theme';
import { MoonIcon, SunIcon } from './icons';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  // Stay in sync if another ThemeToggle instance flips the theme.
  useEffect(() => onThemeChange(() => setTheme(currentTheme())), []);

  const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
  return (
    <button
      type="button"
      className="icon-btn"
      onClick={() => applyTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={label}
      title={label}
    >
      {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
    </button>
  );
}
