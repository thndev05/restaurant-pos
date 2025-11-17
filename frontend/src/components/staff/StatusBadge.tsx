import { Badge } from '@/components/ui/badge';
import type { TableStatus, SessionStatus } from '@/types/staff';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: TableStatus | SessionStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getVariant = (status: string) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Occupied':
      case 'Active':
        return 'warning';
      case 'Reserved':
        return 'info';
      case 'Paid':
      case 'Closed':
        return 'default';
      case 'Pending':
        return 'outline';
      case 'Confirmed':
        return 'success';
      case 'Cancelled':
      case 'Failed':
        return 'destructive';
      case 'Cooking':
        return 'warning';
      case 'Ready':
        return 'info';
      case 'Served':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Badge variant={getVariant(status)} className={cn('text-xs', className)}>
      {status}
    </Badge>
  );
}
