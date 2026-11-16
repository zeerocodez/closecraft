'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = ({
  children,
  hoverable = false,
  padding = 'md',
  className = '',
  ...props
}: CardProps) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyle = hoverable
    ? 'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer'
    : '';

  return (
    <div
      className={`rounded-2xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface shadow-sm ${paddingStyles[padding]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`space-y-1.5 pb-4 border-b border-outline-variant/20 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-lg font-bold text-on-surface tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-on-surface-variant leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`pt-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`pt-4 mt-4 border-t border-outline-variant/20 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
