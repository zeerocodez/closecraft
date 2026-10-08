import React from 'react';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default';
}

export default function MetricCard({ title, value, subtitle, trend, icon, color = 'default' }: MetricCardProps) {
  const colorMap = {
    primary: 'text-primary bg-primary-container',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    error: 'text-error bg-error-container',
    info: 'text-info bg-info/10',
    default: 'text-on-surface-variant bg-surface-container-highest'
  };

  return (
    <Card className="p-4 md:p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold text-on-surface-variant">{title}</h3>
        {icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color]}`}>
            <Icon name={icon} size={16} />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface tabular-nums">{value}</span>
          {trend !== undefined && (
            <span className={`text-sm font-medium ${trend >= 0 ? 'text-success' : 'text-error'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        {subtitle && <span className="text-xs text-on-surface-muted">{subtitle}</span>}
      </div>
    </Card>
  );
}
