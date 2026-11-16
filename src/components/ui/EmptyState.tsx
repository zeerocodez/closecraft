'use client';

import React from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string | React.ReactNode;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export const EmptyState = ({
  title,
  description,
  icon = 'Inbox',
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-outline-variant/50 bg-surface-container-lowest/50 ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-high border border-outline-variant/40 mb-4 shadow-sm text-on-surface-variant">
        {typeof icon === 'string' ? (
          <Icon name={icon} size={28} className="text-primary-fixed" />
        ) : (
          icon
        )}
      </div>

      <h3 className="text-base sm:text-lg font-bold text-on-surface tracking-tight max-w-md">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm mt-1.5 leading-relaxed">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {action && (
            action.href ? (
              <Link href={action.href}>
                <Button variant="primary" size="sm">
                  {action.label}
                </Button>
              </Link>
            ) : (
              <Button variant="primary" size="sm" onClick={action.onClick}>
                {action.label}
              </Button>
            )
          )}

          {secondaryAction && (
            secondaryAction.href ? (
              <Link href={secondaryAction.href}>
                <Button variant="outline" size="sm">
                  {secondaryAction.label}
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
