import React from 'react';
import Badge, { BadgeProps } from './Badge';

export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'label'> {
  status: TaskStatus;
}

const statusConfig: Record<TaskStatus, { label: string; variant: BadgeProps['variant'] }> = {
  OPEN: { label: 'Open', variant: 'success' },
  IN_PROGRESS: { label: 'In Progress', variant: 'warning' },
  COMPLETED: { label: 'Completed', variant: 'primary' },
  CANCELLED: { label: 'Cancelled', variant: 'danger' },
};

export default function StatusBadge({ status, ...props }: StatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge label={config.label} variant={config.variant} {...props} />;
}

