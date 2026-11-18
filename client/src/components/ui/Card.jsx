import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  glass = true,
  interactive = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl transition-all duration-300 relative overflow-hidden bg-white dark:bg-gradient-to-b dark:from-[#181511]/90 dark:to-[#100e0b]/95 border border-outline-variant/60 dark:border-[#d4af37]/20 shadow-sm dark:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.7)] text-on-surface ${
        glass ? 'backdrop-blur-xl' : ''
      } ${
        hover || interactive
          ? 'hover:border-primary/50 dark:hover:border-[#d4af37]/50 hover:shadow-md dark:hover:shadow-[0_20px_45px_-10px_rgba(212,175,55,0.22)] hover:-translate-y-0.5 cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {/* Subtle Specular Highlight in Dark Mode */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 dark:via-[#d4af37]/35 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};
