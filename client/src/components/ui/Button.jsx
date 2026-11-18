import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer';

  const variants = {
    primary: 'bg-primary dark:bg-gradient-to-r dark:from-[#e6c564] dark:via-[#d4af37] dark:to-[#aa8218] text-on-primary dark:text-[#0a0802] font-bold shadow-sm dark:shadow-[0_4px_20px_rgba(212,175,55,0.35)] hover:brightness-105 border border-primary/20 dark:border-[#fef0c7]/40',
    secondary: 'bg-surface-container-high text-on-surface dark:bg-[#221e17] dark:text-[#f7f2ea] hover:bg-surface-container-highest dark:hover:bg-[#2c271e] border border-outline-variant/60 dark:border-[#d4af37]/25 shadow-sm',
    outline: 'border border-outline-variant dark:border-[#d4af37]/35 bg-surface text-on-surface dark:bg-[#14120e]/60 dark:text-[#f7f2ea] hover:bg-surface-container dark:hover:bg-[#221e17] hover:border-primary dark:hover:border-[#d4af37]',
    ghost: 'bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface dark:text-[#bdae9b] dark:hover:bg-[#221e17]/80 dark:hover:text-[#f7f2ea]',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm border border-red-500/30',
    gold: 'bg-gradient-to-r from-amber-500 to-amber-700 dark:from-[#ffeaa7] dark:via-[#d4af37] dark:to-[#8c6e1c] text-white dark:text-[#0a0802] font-extrabold shadow-md border border-amber-400/40'
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 rounded-lg',
    md: 'text-sm px-5 py-2.5 gap-2 rounded-xl',
    lg: 'text-base px-6 py-3 gap-2.5 rounded-xl font-bold',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span className="truncate">{children}</span>
    </button>
  );
};
