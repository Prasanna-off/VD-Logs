import React from 'react';
import { Check } from 'lucide-react';

export function SpringCheck({
  label = '',
  checked = false,
  onChange,
  disabled = false,
  className = '',
  sublabel = ''
}) {
  return (
    <div
      onClick={() => {
        if (!disabled && onChange) {
          onChange(!checked);
        }
      }}
      className={`group flex items-start gap-3.5 p-3.5 rounded-xl border transition-all duration-200 select-none ${
        disabled
          ? 'opacity-60 cursor-not-allowed border-outline-variant/40 bg-surface-container-low/40 dark:border-[#3a342b]/40 dark:bg-[#14120e]/40'
          : checked
          ? 'bg-primary/10 border-primary/45 shadow-sm dark:bg-[#d4af37]/10 dark:border-[#d4af37]/45 cursor-pointer dark:shadow-[0_4px_16px_rgba(212,175,55,0.15)]'
          : 'bg-surface border-outline-variant/60 hover:border-primary/50 hover:bg-surface-container-low dark:bg-[#181612]/70 dark:border-[#3a342b]/60 dark:hover:border-[#d4af37]/40 dark:hover:bg-[#201c15] cursor-pointer'
      } ${className}`}
    >
      {/* Checkbox square */}
      <div
        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-all duration-200 ${
          checked
            ? 'bg-primary border-primary text-on-primary dark:bg-gradient-to-br dark:from-[#fbd46e] dark:to-[#b89228] dark:border-[#fde7a6] dark:text-[#0a0802] shadow-sm scale-105'
            : 'border-outline bg-surface-container-low dark:border-[#6d6355] dark:bg-[#12100d] group-hover:border-primary dark:group-hover:border-[#d4af37]'
        }`}
      >
        {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <span
          className={`text-xs font-semibold tracking-wide transition-all duration-200 ${
            checked
              ? 'line-through text-outline'
              : 'text-on-surface group-hover:text-primary dark:group-hover:text-[#ffd700]'
          }`}
        >
          {label}
        </span>
        {sublabel && (
          <span className="text-[10px] text-on-surface-variant mt-0.5">{sublabel}</span>
        )}
      </div>
    </div>
  );
}

export default SpringCheck;
