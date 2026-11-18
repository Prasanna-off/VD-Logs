import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Shell */}
      <div className={`relative w-full ${maxWidth} bg-surface dark:bg-[#14120e] rounded-2xl shadow-2xl border border-outline-variant/60 dark:border-[#d4af37]/30 overflow-hidden z-10 my-8 flex flex-col text-on-surface`}>
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-outline-variant/40 dark:border-[#3a342b]/60 flex items-center justify-between bg-surface-container-low dark:bg-[#181612]/70">
          <div>
            <h3 className="text-base font-bold text-on-surface tracking-tight">{title}</h3>
            {subtitle && (
              <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
