'use client';

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'destructive'
    | 'success'
    | 'warning'
    | 'info'
    | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  ...props
}: BadgeProps) => {
  const baseStyle =
    'inline-flex items-center font-medium select-none tracking-wide transition-colors';

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md gap-1.5',
    md: 'text-xs px-2.5 py-1 rounded-full gap-1.5',
  };

  const variantStyles = {
    default:
      'bg-[#C7F36B]/15 text-[#C7F36B] border border-[#C7F36B]/30',
    primary:
      'bg-[#C7F36B]/15 text-[#C7F36B] border border-[#C7F36B]/30 font-semibold',
    secondary:
      'bg-surface-container-high text-on-surface-variant border border-outline-variant/50',
    outline:
      'text-on-surface border border-outline-variant bg-transparent',
    destructive:
      'bg-error-container/30 text-error border border-error/40',
    success:
      'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    warning:
      'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    info:
      'bg-blue-500/15 text-blue-300 border border-blue-500/30',
    neutral:
      'bg-white/5 text-gray-300 border border-white/10',
  };

  const dotColors = {
    default: 'bg-[#C7F36B]',
    primary: 'bg-[#C7F36B]',
    secondary: 'bg-on-surface-variant',
    outline: 'bg-on-surface',
    destructive: 'bg-error',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    info: 'bg-blue-400',
    neutral: 'bg-gray-400',
  };

  return (
    <div
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </div>
  );
};

export default Badge;
