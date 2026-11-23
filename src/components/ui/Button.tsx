'use client';

import React from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  iconLeft?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconRight?: React.ReactNode;
  href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loading = false,
      leftIcon,
      iconLeft,
      rightIcon,
      iconRight,
      href,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const isBusy = isLoading || loading;
    const lIcon = leftIcon || iconLeft;
    const rIcon = rightIcon || iconRight;

    const baseStyle =
      'inline-flex items-center justify-center font-medium transition-all select-none active:scale-[0.98] ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ' +
      'focus-visible:ring-offset-surface disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

    const sizeStyles = {
      xs: 'text-xs px-2.5 py-1 rounded-md gap-1.5 min-h-[30px]',
      sm: 'text-xs px-3 py-1.5 rounded-lg gap-2 min-h-[36px]',
      md: 'text-sm px-4 py-2.5 rounded-xl gap-2 min-h-[44px]',
      lg: 'text-base px-6 py-3.5 rounded-xl gap-2.5 min-h-[50px] font-semibold',
    };

    const variantStyles = {
      primary:
        'bg-[#C7F36B] text-[#111827] hover:bg-[#d9f99d] shadow-sm hover:shadow-[#C7F36B]/20 border border-[#C7F36B]/60 font-bold tracking-tight',
      secondary:
        'bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant/60 shadow-sm font-medium',
      outline:
        'border border-outline-variant/80 hover:border-outline text-on-surface hover:bg-surface-container-high/60 bg-transparent font-medium',
      ghost:
        'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/70 bg-transparent font-medium',
      danger:
        'bg-error-container/30 text-error hover:bg-error-container/50 border border-error/40 font-semibold',
    };

    const combinedClassName = `${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

    if (href) {
      return (
        <Link href={href} className={combinedClassName}>
          {lIcon && <span className="shrink-0">{lIcon}</span>}
          <span>{children}</span>
          {rIcon && <span className="shrink-0">{rIcon}</span>}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isBusy}
        className={combinedClassName}
        {...props}
      >
        {isBusy ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0 text-current" />
        ) : (
          lIcon && <span className="shrink-0">{lIcon}</span>
        )}
        <span>{children}</span>
        {!isBusy && rIcon && <span className="shrink-0">{rIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
