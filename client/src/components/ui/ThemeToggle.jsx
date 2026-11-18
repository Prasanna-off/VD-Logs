import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 focus:outline-none select-none cursor-pointer ${
        isDark
          ? 'bg-[#1a1713]/90 border-[#d4af37]/40 text-[#f7f2ea] hover:border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.2)]'
          : 'bg-[#f4f0e8] border-[#cbb382] text-[#2c261e] hover:border-[#967830] shadow-sm'
      } ${className}`}
      aria-label="Toggle theme"
      title={`Current: ${isDark ? 'Dark Mode' : 'Light Mode'}. Click to switch.`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-[#ffd700] animate-pulse" />
        ) : (
          <Moon className="w-4 h-4 text-[#7b5f20]" />
        )}
      </div>
      <span className="text-[11px] font-bold tracking-wider uppercase font-mono">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};
