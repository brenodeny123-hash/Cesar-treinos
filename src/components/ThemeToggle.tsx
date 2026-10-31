import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/theme.ts';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggle } = useTheme();
  const isLight = theme === 'light';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? 'Ativar tema escuro' : 'Ativar tema claro'}
      title={isLight ? 'Tema escuro' : 'Tema claro'}
      className={`w-8 h-8 rounded-xl bg-[#121214] hover:bg-[#1c1c21] text-[#a1a1aa] hover:text-white flex items-center justify-center transition-colors ${className}`}
    >
      {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
    </button>
  );
};
