'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  hideCloseButton?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className = '',
  hideCloseButton = false,
}: ModalProps) => {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
    full: 'max-w-[calc(100vw-32px)] h-[calc(100vh-32px)]',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click area */}
      <div className="fixed inset-0 -z-10" onClick={onClose} aria-hidden="true" />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={`bg-surface-container-lowest border border-outline-variant/60 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 ${sizeStyles[size]} ${className}`}
      >
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="px-6 py-4.5 border-b border-outline-variant/30 flex items-center justify-between shrink-0 bg-surface-container-lowest/80 backdrop-blur-md">
            <div className="space-y-0.5 pr-6">
              {title && (
                <h2 className="text-base sm:text-lg font-bold text-on-surface tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-outline-variant/30 hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto overscroll-contain flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
