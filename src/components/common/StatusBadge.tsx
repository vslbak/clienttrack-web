import { Badge } from '../ui/badge';
import type { DealStage, ProposalStatus, ActivityType } from '../../types';

const stageColors: Record<DealStage, string> = {
  LEAD: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
  DISCOVERY: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  PROPOSAL: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
  CLOSED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  LOST: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

const statusColors: Record<ProposalStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
  SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

interface StatusBadgeProps {
  type: 'stage' | 'status';
  value: DealStage | ProposalStatus;
  className?: string;
}

export function StatusBadge({ type, value, className }: StatusBadgeProps) {
  const colorClass = type === 'stage'
    ? stageColors[value as DealStage]
    : statusColors[value as ProposalStatus];

  return (
    <Badge className={`${colorClass} ${className || ''}`}>
      {value}
    </Badge>
  );
}
