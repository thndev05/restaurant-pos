import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/staff/StatusBadge';
import type { OrderItem } from '@/types/staff';
import { Clock, AlertCircle, Play, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KitchenDashboardPage() {
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  // Mock data - grouped orders/items
  const mockKitchenItems: (OrderItem & {
    order_number: string;
    table_info: string;
    order_time: string;
  })[] = [
    {
      order_item_id: 'oi-001',
      order_id: 'ord-001',
      item_id: 'item-001',
      item_name_at_order: 'Beef Steak',
      quantity: 2,
      price_at_order: 19.99,
      status: 'Cooking',
      notes: 'Medium rare, no onions',
      allergies: ['Dairy'],
      station: 'Grill',
      cooking_started_at: new Date(Date.now() - 8 * 60000).toISOString(),
      order_number: '#001',
      table_info: 'Table A1',
      order_time: new Date(Date.now() - 10 * 60000).toISOString(),
    },
    {
      order_item_id: 'oi-002',
      order_id: 'ord-001',
      item_id: 'item-002',
      item_name_at_order: 'Caesar Salad',
      quantity: 1,
      price_at_order: 6.01,
      status: 'Cooking',
      station: 'Cold Kitchen',
      cooking_started_at: new Date(Date.now() - 5 * 60000).toISOString(),
      order_number: '#001',
      table_info: 'Table A1',
      order_time: new Date(Date.now() - 10 * 60000).toISOString(),
    },
    {
      order_item_id: 'oi-003',
      order_id: 'ord-002',
      item_id: 'item-003',
      item_name_at_order: 'Grilled Salmon',
      quantity: 1,
      price_at_order: 22.99,
      status: 'Cooking',
      notes: 'Extra lemon',
      station: 'Grill',
      cooking_started_at: new Date(Date.now() - 12 * 60000).toISOString(),
      order_number: '#002',
      table_info: 'Table A3',
      order_time: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      order_item_id: 'oi-004',
      order_id: 'ord-002',
      item_id: 'item-004',
      item_name_at_order: 'French Fries',
      quantity: 1,
      price_at_order: 4.99,
      status: 'Ready',
      station: 'Fryer',
      cooking_started_at: new Date(Date.now() - 10 * 60000).toISOString(),
      ready_at: new Date(Date.now() - 2 * 60000).toISOString(),
      order_number: '#002',
      table_info: 'Table A3',
      order_time: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      order_item_id: 'oi-005',
      order_id: 'ord-003',
      item_id: 'item-005',
      item_name_at_order: 'Margherita Pizza',
      quantity: 2,
      price_at_order: 14.25,
      status: 'Cooking',
      station: 'Pizza Oven',
      cooking_started_at: new Date(Date.now() - 15 * 60000).toISOString(),
      order_number: '#003',
      table_info: 'Takeaway',
      order_time: new Date(Date.now() - 18 * 60000).toISOString(),
    },
  ];

  const stations = ['all', 'Grill', 'Cold Kitchen', 'Fryer', 'Pizza Oven', 'Bar'];

  const filteredItems = mockKitchenItems.filter((item) => {
    const matchesStation = selectedStation === 'all' || item.station === selectedStation;
    const matchesCompleted = showCompleted || item.status !== 'Ready';
    return matchesStation && matchesCompleted;
  });

  const stats = {
    cooking: mockKitchenItems.filter((i) => i.status === 'Cooking').length,
    ready: mockKitchenItems.filter((i) => i.status === 'Ready').length,
    avgTime: 8, // minutes - placeholder
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    return `${diffMinutes}m`;
  };

  const isOvertime = (startTime: string, threshold = 15) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / 60000);
    return diffMinutes > threshold;
  };

  const handleStartCooking = (itemId: string) => {
    alert(`Starting cooking for item ${itemId}`);
  };

  const handleCompleteItem = (itemId: string) => {
    alert(`Marking item ${itemId} as ready`);
  };

  const handleRejectItem = (itemId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      alert(`Rejecting item ${itemId}: ${reason}`);
    }
  };

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Kitchen Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Manage cooking queue and track preparation
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cooking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-warning text-3xl font-bold">{stats.cooking}</div>
            <p className="text-muted-foreground text-xs">Items in progress</p>
          </CardContent>
        </Card>
        <Card className="border-success/30 bg-success/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-success text-3xl font-bold">{stats.ready}</div>
            <p className="text-muted-foreground text-xs">Ready to serve</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgTime}m</div>
            <p className="text-muted-foreground text-xs">Per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Station Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {stations.map((station) => (
              <Button
                key={station}
                variant={selectedStation === station ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStation(station)}
              >
                {station === 'all' ? 'All Stations' : station}
              </Button>
            ))}
            <Button
              variant={showCompleted ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
              className="ml-auto"
            >
              {showCompleted ? 'Hide' : 'Show'} Completed
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Kitchen Items */}
      <div className="grid gap-4 lg:grid-cols-2">
        {filteredItems.map((item) => (
          <Card
            key={item.order_item_id}
            className={cn(
              'transition-all',
              item.status === 'Cooking' && 'border-warning/30 bg-warning/5',
              item.status === 'Ready' && 'border-success/30 bg-success/5',
              isOvertime(item.cooking_started_at || item.order_time, 15) &&
                item.status === 'Cooking' &&
                'border-destructive/50 bg-destructive/10'
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">
                      {item.quantity}x {item.item_name_at_order}
                    </CardTitle>
                    {isOvertime(item.cooking_started_at || item.order_time, 15) &&
                      item.status === 'Cooking' && (
                        <AlertCircle className="text-destructive h-5 w-5" />
                      )}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <span>{item.order_number}</span>
                    <span>•</span>
                    <span>{item.table_info}</span>
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Timer */}
              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {item.cooking_started_at
                      ? `Cooking: ${getTimeSince(item.cooking_started_at)}`
                      : `Ordered: ${getTimeSince(item.order_time)}`}
                  </span>
                </div>
                {item.station && (
                  <Badge variant="outline" className="text-xs">
                    {item.station}
                  </Badge>
                )}
              </div>

              {/* Notes & Allergies */}
              {item.notes && (
                <div className="rounded-md bg-amber-50 p-2 text-sm text-amber-900">
                  <strong>Note:</strong> {item.notes}
                </div>
              )}
              {item.allergies && item.allergies.length > 0 && (
                <div className="flex items-start gap-2 rounded-md bg-red-50 p-2 text-sm text-red-900">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <strong>Allergy Alert:</strong> {item.allergies.join(', ')}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {item.status === 'Cooking' && (
                  <>
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1"
                      onClick={() => handleCompleteItem(item.order_item_id)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark Ready
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRejectItem(item.order_item_id)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {item.status === 'Pending' && (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleStartCooking(item.order_item_id)}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Cooking
                  </Button>
                )}
                {item.status === 'Ready' && (
                  <Button size="sm" variant="outline" className="w-full" disabled>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Ready for Pickup
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="text-success mb-4 h-12 w-12" />
            <p className="text-lg font-medium">All caught up!</p>
            <p className="text-muted-foreground text-sm">No items to cook right now</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
