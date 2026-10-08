import React from 'react';
import { Icon } from '@/components/ui/Icon';

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; icon: string; label: string }> = {
    PENDING: { color: 'text-warning bg-warning/10 border-warning/20', icon: 'Clock', label: 'Pending' },
    QUEUED: { color: 'text-info bg-info/10 border-info/20', icon: 'List', label: 'Queued' },
    EXECUTING: { color: 'text-primary-fixed bg-primary-container border-primary/20', icon: 'Loader2', label: 'Executing' },
    COMPLETED: { color: 'text-success bg-success/10 border-success/20', icon: 'CheckCircle2', label: 'Completed' },
    FAILED: { color: 'text-error bg-error-container border-error/20', icon: 'AlertCircle', label: 'Failed' },
    CANCELLED: { color: 'text-on-surface-muted bg-surface-container-highest border-outline-variant/50', icon: 'XCircle', label: 'Cancelled' },
  };

  const config = map[status] || { color: 'text-on-surface-variant bg-surface-container-high', icon: 'Circle', label: status };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-semibold tracking-wide uppercase ${config.color}`}>
      <Icon name={config.icon} size={12} className={status === 'EXECUTING' ? 'animate-spin' : ''} />
      {config.label}
    </span>
  );
}

export function ActorBadge({ actor }: { actor: string }) {
  const map: Record<string, { color: string; icon: string; label: string }> = {
    AI: { color: 'text-primary bg-primary/10 border-primary/20', icon: 'Sparkles', label: 'AI Engine' },
    AUTOMATION: { color: 'text-info bg-info/10 border-info/20', icon: 'Bot', label: 'Automation' },
    HUMAN: { color: 'text-warning bg-warning/10 border-warning/20', icon: 'User', label: 'Human' },
    SYSTEM: { color: 'text-on-surface-muted bg-surface-container-highest border-outline-variant/50', icon: 'Settings', label: 'System' },
  };

  const config = map[actor] || { color: 'text-on-surface-variant bg-surface-container-high', icon: 'User', label: actor };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium ${config.color}`}>
      <Icon name={config.icon} size={14} />
      {config.label}
    </span>
  );
}
