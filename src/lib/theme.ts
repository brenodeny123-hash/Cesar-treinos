import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';
const KEY = 'cesar:theme';

export const getTheme = (): Theme => {
  try { return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'; } catch { return 'light'; }
};

export const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  root.classList.toggle('light', theme === 'light');
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f4f6f4' : '#09090b');
};

export const useTheme = (): { theme: Theme; toggle: () => void } => {
  const [theme, setTheme] = useState<Theme>(getTheme);
  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem(KEY, theme); } catch { /* sem armazenamento */ }
    const sync = () => setTheme(t => (getTheme() === t ? t : getTheme()));
    window.addEventListener('cesar-theme', sync);
    return () => window.removeEventListener('cesar-theme', sync);
  }, [theme]);
  return {
    theme,
    toggle: () => {
      const next: Theme = theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(KEY, next); } catch { /* sem armazenamento */ }
      setTheme(next);
      window.dispatchEvent(new Event('cesar-theme'));
    },
  };
};
