import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from './StatusBadge';
import type { Table } from '@/types/staff';
import { Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableCardProps {
  table: Table;
  onClick?: () => void;
  className?: string;
}

export function TableCard({ table, onClick, className }: TableCardProps) {
  const session = table.session;
  const pendingOrders = session?.orders?.filter((o) => o.status === 'Pending').length || 0;
  const readyItems =
    session?.orders?.reduce((count, order) => {
      return count + (order.items?.filter((item) => item.status === 'Ready').length || 0);
    }, 0) || 0;

  const getSessionDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <Card
      className={cn(
        'relative cursor-pointer transition-all hover:shadow-md',
        table.status === 'Available' && 'border-success/30 bg-success/5',
        table.status === 'Occupied' && 'border-warning/30 bg-warning/5',
        table.status === 'Reserved' && 'border-info/30 bg-info/5',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Table Number and Status */}
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">{table.table_number}</h3>
            <p className="text-muted-foreground text-xs">Capacity: {table.capacity} guests</p>
          </div>
          <StatusBadge status={table.status} />
        </div>

        {/* Session Info */}
        {session && session.status === 'Active' && (
          <div className="space-y-2 border-t pt-3">
            {session.guest_name && <p className="text-sm font-medium">{session.guest_name}</p>}
            <div className="text-muted-foreground flex items-center gap-3 text-xs">
              {session.party_size && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{session.party_size}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{getSessionDuration(session.start_time)}</span>
              </div>
            </div>

            {/* Badges for alerts */}
            <div className="flex flex-wrap gap-1">
              {pendingOrders > 0 && (
                <Badge variant="outline" className="text-xs">
                  {pendingOrders} Pending
                </Badge>
              )}
              {readyItems > 0 && (
                <Badge variant="info" className="text-xs">
                  {readyItems} Ready
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Reserved Info */}
        {table.status === 'Reserved' && (
          <div className="border-t pt-3">
            <p className="text-muted-foreground text-xs">Reserved</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
