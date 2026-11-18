import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-surface-container-low/50 dark:bg-[#14120e]/60 border border-dashed border-outline-variant/60 dark:border-[#3a342b]/60 ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-surface-container-high dark:bg-[#221e17] flex items-center justify-center text-primary dark:text-[#d4af37] mb-4 shadow-sm border border-outline-variant/40 dark:border-[#d4af37]/20">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-bold text-on-surface">{title}</h3>
      <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm mt-1 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
