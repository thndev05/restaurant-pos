import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from './StatusBadge';
import type { Table } from '@/types/staff';
import { Clock, Users, MapPin, Utensils, Receipt, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface TableCardProps {
  table: Table;
  onClick?: () => void;
  className?: string;
}

export function TableCard({ table, onClick, className }: TableCardProps) {
  const session = table.session;
  const pendingOrders = session?.orders?.filter((o) => o.status === 'Pending').length || 0;
  const confirmedOrders = session?.orders?.filter((o) => o.status === 'Confirmed').length || 0;
  const totalOrders = session?.orders?.length || 0;
  const readyItems =
    session?.orders?.reduce((count, order) => {
      return count + (order.items?.filter((item) => item.status === 'Ready').length || 0);
    }, 0) || 0;
  const totalItems =
    session?.orders?.reduce((count, order) => {
      return count + (order.items?.length || 0);
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
      <CardContent className="space-y-3 p-4">
        {/* Table Number and Status */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold">Table {table.table_number}</h3>
            <div className="mt-1 flex items-center gap-2">
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <Users className="h-3 w-3" />
                <span>{table.capacity} seats</span>
              </div>
              {table.area && (
                <>
                  <span className="text-muted-foreground text-xs">•</span>
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <MapPin className="h-3 w-3" />
                    <span>{table.area}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <StatusBadge status={table.status} />
        </div>

        {/* Session Info */}
        {session && session.status === 'Active' && (
          <div className="space-y-2 border-t pt-3">
            {/* Guest and Duration */}
            <div className="flex items-center justify-between">
              <div>
                {session.guest_name && <p className="text-sm font-medium">{session.guest_name}</p>}
                {session.party_size && (
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Users className="h-3 w-3" />
                    <span>{session.party_size} guests</span>
                  </div>
                )}
              </div>
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                <span>{getSessionDuration(session.start_time)}</span>
              </div>
            </div>

            {/* Orders Summary */}
            {totalOrders > 0 && (
              <div className="bg-muted/50 rounded-md p-2">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium">
                  <Receipt className="h-3 w-3" />
                  <span>
                    {totalOrders} {totalOrders === 1 ? 'Order' : 'Orders'}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <Utensils className="h-3 w-3" />
                  <span>
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
            )}

            {/* Status Badges */}
            <div className="flex flex-wrap gap-1">
              {pendingOrders > 0 && (
                <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                  {pendingOrders} Pending
                </Badge>
              )}
              {confirmedOrders > 0 && (
                <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">
                  {confirmedOrders} Confirmed
                </Badge>
              )}
              {readyItems > 0 && (
                <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700">
                  {readyItems} Ready
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Available State */}
        {table.status === 'Available' && (
          <div className="border-t pt-3">
            <p className="text-muted-foreground text-center text-xs">Ready for new guests</p>
          </div>
        )}

        {/* Reserved Info with Upcoming Reservations */}
        {table.status === 'Reserved' && table.reservations && table.reservations.length > 0 && (
          <div className="border-t pt-3">
            <div className="rounded-md border border-blue-200 bg-blue-50 p-2">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-blue-700">
                <Calendar className="h-3 w-3" />
                <span>Reserved</span>
              </div>
              {table.reservations.slice(0, 2).map((reservation) => (
                <div key={reservation.id} className="mt-1 text-xs text-blue-600">
                  <div className="font-medium">{reservation.guestName}</div>
                  <div className="text-muted-foreground">
                    {format(parseISO(reservation.reservationTime), 'p')} • {reservation.partySize}{' '}
                    guests
                  </div>
                </div>
              ))}
              {table.reservations.length > 2 && (
                <div className="mt-1 text-xs text-blue-600">
                  +{table.reservations.length - 2} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Available State with Upcoming Reservations */}
        {table.status === 'Available' && (
          <div className="border-t pt-3">
            {table.reservations && table.reservations.length > 0 ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-2">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-amber-700">
                  <Calendar className="h-3 w-3" />
                  <span>Upcoming Reservations</span>
                </div>
                {table.reservations.slice(0, 1).map((reservation) => (
                  <div key={reservation.id} className="mt-1 text-xs text-amber-600">
                    <div className="font-medium">{reservation.guestName}</div>
                    <div className="text-muted-foreground">
                      {format(parseISO(reservation.reservationTime), 'PPp')}
                    </div>
                  </div>
                ))}
                {table.reservations.length > 1 && (
                  <div className="mt-1 text-xs text-amber-600">
                    +{table.reservations.length - 1} more
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center text-xs">Ready for new guests</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
