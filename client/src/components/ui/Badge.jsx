import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variants = {
    neutral: 'bg-surface-container-high text-on-surface-variant border-outline-variant/60 dark:bg-[#221e17] dark:text-[#bdae9b] dark:border-[#3a342b]/60',
    primary: 'bg-primary/10 text-primary border-primary/30 dark:bg-[#d4af37]/15 dark:text-[#ffd700] dark:border-[#d4af37]/35',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-500/30',
    error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-500/30',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-[#221e17] dark:text-[#d4af37] dark:border-[#d4af37]/30',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-bold',
    md: 'text-xs px-2.5 py-1 font-bold',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      <span>{children}</span>
    </span>
  );
};
