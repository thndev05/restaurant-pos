import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/staff/StatusBadge';
import { kitchenService, type KitchenItem, type KitchenStats } from '@/lib/api/services';
import type { OrderItemStatus } from '@/lib/api/services/orders.service';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Play,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';

const OVERDUE_MINUTES = 15;

export default function KitchenDashboardPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<KitchenItem[]>([]);
  const [stats, setStats] = useState<KitchenStats | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState({ open: false, itemId: '', reason: '' });

  // Silent refresh without loading state (for auto-refresh)
  const refreshQueueSilently = useCallback(async () => {
    try {
      const response = await kitchenService.getQueue({
        includeCompleted: showCompleted,
        search: searchTerm.trim() || undefined,
      });
      setItems(response.items);
      setStats(response.stats);
      setLastUpdated(response.lastUpdated);
    } catch (error) {
      console.error('Failed to refresh kitchen queue:', error);
      // Silent error - don't show toast for auto-refresh failures
    }
  }, [searchTerm, showCompleted]);

  // Load queue with loading state (for initial load and manual refresh)
  const fetchQueue = useCallback(async () => {
    setRefreshing(true);

    try {
      const response = await kitchenService.getQueue({
        includeCompleted: showCompleted,
        search: searchTerm.trim() || undefined,
      });
      setItems(response.items);
      setStats(response.stats);
      setLastUpdated(response.lastUpdated);
    } catch (error) {
      console.error('Failed to load kitchen queue', error);
      toast({
        title: 'Unable to load kitchen queue',
        description: 'Please try again or check your connection.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [searchTerm, showCompleted, toast]);

  useEffect(() => {
    setIsLoading(true);
    fetchQueue();
  }, [fetchQueue]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(refreshQueueSilently, 5000);
    return () => clearInterval(interval);
  }, [refreshQueueSilently]);

  const handleStatusUpdate = async (itemId: string, status: OrderItemStatus, reason?: string) => {
    setUpdatingItemId(itemId);
    try {
      await kitchenService.updateItemStatus(itemId, {
        status,
        reason: reason?.trim() || undefined,
      });
      toast({
        title: 'Status updated',
        description: 'Kitchen item updated successfully.',
      });
      fetchQueue();
    } catch (error) {
      console.error('Failed to update kitchen item status', error);
      toast({
        title: 'Unable to update item',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingItemId(null);
    }
  };

  const openRejectDialog = (itemId: string) => {
    setRejectDialog({ open: true, itemId, reason: '' });
  };

  const closeRejectDialog = () => {
    setRejectDialog({ open: false, itemId: '', reason: '' });
  };

  const confirmReject = async () => {
    if (!rejectDialog.itemId) return;
    await handleStatusUpdate(rejectDialog.itemId, 'CANCELLED', rejectDialog.reason);
    closeRejectDialog();
  };

  const formatDuration = (dateString?: string | null) => {
    if (!dateString) return '0m';
    const date = new Date(dateString);
    const diffMinutes = Math.max(Math.floor((Date.now() - date.getTime()) / 60000), 0);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const isOverdue = (item: KitchenItem) => {
    const startReference = item.cookingStartedAt || item.orderPlacedAt;
    const diffMinutes = Math.max(
      Math.floor((Date.now() - new Date(startReference).getTime()) / 60000),
      0
    );
    return item.status === 'COOKING' && diffMinutes >= OVERDUE_MINUTES;
  };

  const renderActions = (item: KitchenItem) => {
    const isUpdating = updatingItemId === item.id;

    if (item.status === 'PENDING') {
      return (
        <Button
          size="sm"
          className="w-full"
          disabled={isUpdating}
          onClick={() => handleStatusUpdate(item.id, 'COOKING')}
        >
          {isUpdating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Start Cooking
        </Button>
      );
    }

    if (item.status === 'COOKING') {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            disabled={isUpdating}
            onClick={() => handleStatusUpdate(item.id, 'READY')}
          >
            {isUpdating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Mark Ready
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={isUpdating}
            onClick={() => openRejectDialog(item.id)}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <Button size="sm" variant="outline" className="w-full" disabled>
        <CheckCircle className="mr-2 h-4 w-4" /> Ready for Pickup
      </Button>
    );
  };

  const summaryCards = [
    {
      label: 'Pending',
      value: stats?.pending ?? 0,
      tone: 'text-amber-600',
      border: 'border-amber-200 bg-amber-50',
    },
    {
      label: 'Cooking',
      value: stats?.cooking ?? 0,
      tone: 'text-orange-600',
      border: 'border-orange-200 bg-orange-50',
    },
    {
      label: 'Ready',
      value: stats?.ready ?? 0,
      tone: 'text-emerald-600',
      border: 'border-emerald-200 bg-emerald-50',
    },
    {
      label: 'Avg Prep',
      value: `${stats?.avgPrepMinutes ?? 0}m`,
      tone: 'text-blue-600',
      border: 'border-blue-200 bg-blue-50',
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kitchen Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track every ticket across the kitchen in real time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search tickets, tables, customers"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchQueue} disabled={refreshing}>
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className={cn('border', card.border)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn('text-3xl font-bold', card.tone)}>{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-2 p-4">
          <Button
            size="sm"
            variant={showCompleted ? 'default' : 'outline'}
            className="ml-auto"
            onClick={() => setShowCompleted((prev) => !prev)}
          >
            {showCompleted ? 'Hide' : 'Show'} Ready
          </Button>
        </CardContent>
      </Card>

      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Use the refresh button to pull latest tickets</span>
        </div>
        {lastUpdated && <span>Last updated {new Date(lastUpdated).toLocaleTimeString('vi-VN')}</span>}
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
            <span className="text-muted-foreground">Loading kitchen queue…</span>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="text-success mb-4 h-12 w-12" />
            <p className="text-lg font-semibold">All caught up!</p>
            <p className="text-muted-foreground text-sm">No tickets waiting for your attention.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <Card
              key={item.id}
              className={cn(
                'border transition-all',
                item.status === 'COOKING' && 'border-amber-200 bg-amber-50/80',
                item.status === 'READY' && 'border-emerald-200 bg-emerald-50/80',
                isOverdue(item) && 'border-destructive/60 bg-destructive/10'
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {item.quantity}× {item.itemName}
                      </CardTitle>
                      {isOverdue(item) && <AlertCircle className="text-destructive h-5 w-5" />}
                    </div>
                    <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
                      <span>{item.orderCode}</span>
                      <span>•</span>
                      <span>{item.tableLabel}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.orderType === 'DINE_IN' ? 'Dine-in' : 'Takeaway'}
                      </Badge>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-muted-foreground flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {item.cookingStartedAt
                        ? `Cooking ${formatDuration(item.cookingStartedAt)}`
                        : `Waiting ${formatDuration(item.orderPlacedAt)}`}
                    </span>
                  </div>
                </div>

                {item.notes && (
                  <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                    <strong>Note:</strong> {item.notes}
                  </div>
                )}

                {item.allergies.length > 0 && (
                  <div className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-900">
                    <AlertCircle className="mt-0.5 h-4 w-4" />
                    <div>
                      <strong>Allergies:</strong> {item.allergies.join(', ')}
                    </div>
                  </div>
                )}

                {renderActions(item)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => (!open ? closeRejectDialog() : null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject item</DialogTitle>
            <DialogDescription>
              Please add a short note so the service team understands the issue.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectDialog.reason}
            onChange={(event) =>
              setRejectDialog((prev) => ({ ...prev, reason: event.target.value }))
            }
            placeholder="Reason for rejection"
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={closeRejectDialog}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectDialog.reason.trim()}
              onClick={confirmReject}
            >
              Reject Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
