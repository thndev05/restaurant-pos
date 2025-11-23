import { Badge } from '@/components/ui/badge';
import type { TableStatus, SessionStatus } from '@/types/staff';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: TableStatus | SessionStatus | string;
  className?: string;
}

const STATUS_CONFIG: Record<
  string,
  {
    variant: 'default' | 'success' | 'warning' | 'outline' | 'destructive' | 'info';
    className?: string;
  }
> = {
  // Table Status
  Available: {
    variant: 'success',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  },
  Occupied: {
    variant: 'warning',
    className: 'bg-rose-100 text-rose-700 border-rose-300',
  },
  Reserved: {
    variant: 'info',
    className: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  // Session Status
  Active: {
    variant: 'success',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-300 font-medium',
  },
  Paid: {
    variant: 'warning',
    className: 'bg-amber-100 text-amber-700 border-amber-300 font-medium',
  },
  Closed: {
    variant: 'outline',
    className: 'bg-slate-100 text-slate-600 border-slate-300',
  },
  // Order Status
  Pending: {
    variant: 'outline',
    className: 'bg-gray-100 text-gray-600 border-gray-300',
  },
  Confirmed: {
    variant: 'success',
    className: 'bg-green-100 text-green-700 border-green-300',
  },
  Preparing: {
    variant: 'warning',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  },
  Ready: {
    variant: 'info',
    className: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  Served: {
    variant: 'success',
    className: 'bg-green-100 text-green-700 border-green-300',
  },
  Cancelled: {
    variant: 'destructive',
    className: 'bg-red-100 text-red-700 border-red-300',
  },
  Failed: {
    variant: 'destructive',
    className: 'bg-red-100 text-red-700 border-red-300',
  },
  // Order Item Status
  Cooking: {
    variant: 'warning',
    className: 'bg-orange-100 text-orange-700 border-orange-300',
  },
  // Payment Status
  Success: {
    variant: 'success',
    className: 'bg-green-100 text-green-700 border-green-300',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { variant: 'default' as const };

  return (
    <Badge variant={config.variant} className={cn('text-xs', config.className, className)}>
      {status}
    </Badge>
  );
}
