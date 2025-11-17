import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import type { Order } from '@/types/staff';
import { Clock, User, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderCardProps {
  order: Order;
  onConfirm?: () => void;
  onCancel?: () => void;
  onView?: () => void;
  showActions?: boolean;
  className?: string;
}

export function OrderCard({
  order,
  onConfirm,
  onCancel,
  onView,
  showActions = true,
  className,
}: OrderCardProps) {
  const getItemStatusCounts = () => {
    if (!order.items) return { cooking: 0, ready: 0, served: 0 };
    return order.items.reduce(
      (acc, item) => {
        if (item.status === 'Cooking') acc.cooking++;
        if (item.status === 'Ready') acc.ready++;
        if (item.status === 'Served') acc.served++;
        return acc;
      },
      { cooking: 0, ready: 0, served: 0 }
    );
  };

  const statusCounts = getItemStatusCounts();
  const totalItems = order.items?.length || 0;

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const hours = Math.floor(diffMinutes / 60);
    return `${hours}h ago`;
  };

  const getTableInfo = () => {
    if (order.order_type === 'DineIn' && order.session?.table) {
      return order.session.table.table_number;
    }
    return order.order_type;
  };

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        order.status === 'Pending' && 'border-warning/30',
        order.status === 'Confirmed' && 'border-success/30',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">
              Order #{order.order_id.slice(0, 8)}
            </CardTitle>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <UtensilsCrossed className="h-4 w-4" />
              <span>{getTableInfo()}</span>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Order Info */}
        <div className="text-muted-foreground flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{getTimeSince(order.created_at)}</span>
          </div>
          {order.staff_name && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{order.staff_name}</span>
            </div>
          )}
        </div>

        {/* Items Count and Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{totalItems} items</span>
          <div className="flex gap-1">
            {statusCounts.cooking > 0 && (
              <Badge variant="warning" className="text-xs">
                {statusCounts.cooking} Cooking
              </Badge>
            )}
            {statusCounts.ready > 0 && (
              <Badge variant="info" className="text-xs">
                {statusCounts.ready} Ready
              </Badge>
            )}
            {statusCounts.served > 0 && (
              <Badge variant="success" className="text-xs">
                {statusCounts.served} Served
              </Badge>
            )}
          </div>
        </div>

        {/* Total Amount */}
        {order.total_amount !== undefined && (
          <div className="border-t pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold">${order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div className="rounded-md bg-amber-50 p-2 text-xs text-amber-900">
            <strong>Note:</strong> {order.notes}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            {order.status === 'Pending' && onConfirm && (
              <Button size="sm" className="flex-1" onClick={onConfirm}>
                Confirm
              </Button>
            )}
            {onView && (
              <Button size="sm" variant="outline" className="flex-1" onClick={onView}>
                View Details
              </Button>
            )}
            {order.status === 'Pending' && onCancel && (
              <Button size="sm" variant="destructive" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
