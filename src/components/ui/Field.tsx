'use client';

import React from 'react';
import { Search, ChevronDown, AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', leftIcon, rightIcon, hasError, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3.5 text-on-surface-variant pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`flex h-11 w-full rounded-xl border bg-surface-container-lowest px-3.5 py-2.5 text-sm text-on-surface ring-offset-surface placeholder:text-on-surface-variant/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent focus-visible:shadow-[0_0_0_4px_rgba(16,185,129,0.15)] disabled:cursor-not-allowed disabled:opacity-50 ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${
            hasError ? 'border-error/80 focus-visible:ring-error' : 'border-outline-variant/50 hover:border-outline-variant'
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 text-on-surface-variant flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', hasError, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`flex min-h-[96px] w-full rounded-xl border bg-surface-container-lowest px-3.5 py-2.5 text-sm text-on-surface ring-offset-surface placeholder:text-on-surface-variant/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
          hasError ? 'border-error/80 focus-visible:ring-error' : 'border-outline-variant/50 hover:border-outline-variant'
        } ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', hasError, children, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <select
          ref={ref}
          className={`flex h-11 w-full appearance-none rounded-xl border bg-surface-container-lowest px-3.5 pr-10 py-2.5 text-sm text-on-surface ring-offset-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
            hasError ? 'border-error/80 focus-visible:ring-error' : 'border-outline-variant/50 hover:border-outline-variant'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3.5 w-4 h-4 text-on-surface-variant pointer-events-none" />
      </div>
    );
  }
);
Select.displayName = 'Select';

export const SearchInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', placeholder = 'Search...', ...props }, ref) => {
    return (
      <Input
        ref={ref}
        leftIcon={<Search className="w-4 h-4" />}
        placeholder={placeholder}
        className={className}
        {...props}
      />
    );
  }
);
SearchInput.displayName = 'SearchInput';

export interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Field = ({
  label,
  hint,
  error,
  required = false,
  children,
  className = '',
}: FieldProps) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant select-none">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
          {hint && <span className="text-xs text-on-surface-variant/70">{hint}</span>}
        </div>
      )}
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-error font-medium pt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default Field;
