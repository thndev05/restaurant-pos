import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/staff/StatusBadge';
import { Bell, Clock, CheckCircle, User, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { actionsService } from '@/lib/api/services';
import type { Action, ActionStatus as APIActionStatus } from '@/lib/api/services';
import { useAuth } from '@/contexts';
import { useToast } from '@/hooks/use-toast';

export default function WaiterActionsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'handled'>('pending');
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Silent refresh without loading state (for auto-refresh)
  const refreshActionsSilently = useCallback(async () => {
    try {
      const data = await actionsService.getAllActions();
      setActions(data);
    } catch (error) {
      console.error('Failed to refresh actions:', error);
      // Silent error - don't show toast for auto-refresh failures
    }
  }, []);

  // Fetch actions from API with loading state (for initial load and manual refresh)
  const fetchActions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await actionsService.getAllActions();
      setActions(data);
    } catch (error) {
      console.error('Failed to fetch actions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load customer requests. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(refreshActionsSilently, 5000);
    return () => clearInterval(interval);
  }, [refreshActionsSilently]);

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchActions();
    setIsRefreshing(false);
    toast({
      title: 'Refreshed',
      description: 'Customer requests updated.',
    });
  };

  // Map API status to display status
  const mapStatus = (status: APIActionStatus): 'Pending' | 'Handled' => {
    if (status === 'PENDING') return 'Pending';
    return 'Handled'; // IN_PROGRESS, COMPLETED, CANCELLED all map to Handled
  };

  const filteredActions = actions
    .filter((action) => {
      const displayStatus = mapStatus(action.status);
      if (filter === 'all') return true;
      if (filter === 'pending') return displayStatus === 'Pending';
      if (filter === 'handled') return displayStatus === 'Handled';
      return true;
    })
    .sort((a, b) => {
      // Pending first, then by time
      const statusA = mapStatus(a.status);
      const statusB = mapStatus(b.status);
      if (statusA === 'Pending' && statusB !== 'Pending') return -1;
      if (statusA !== 'Pending' && statusB === 'Pending') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const stats = {
    total: actions.length,
    pending: actions.filter((a) => mapStatus(a.status) === 'Pending').length,
    handled: actions.filter((a) => mapStatus(a.status) === 'Handled').length,
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const hours = Math.floor(diffMinutes / 60);
    return `${hours}h ${Math.floor(diffMinutes % 60)}m ago`;
  };

  const isUrgent = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    return diffMinutes > 5;
  };

  const handleTakeAction = async (actionId: string) => {
    if (!user) return;

    try {
      await actionsService.handleAction(actionId, user.id);
      toast({
        title: 'Success',
        description: 'Action marked as in progress.',
      });
      await refreshActionsSilently();
    } catch (error) {
      console.error('Failed to handle action:', error);
      toast({
        title: 'Error',
        description: 'Failed to update action. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkHandled = async (actionId: string) => {
    if (!user) return;

    try {
      await actionsService.completeAction(actionId, user.id);
      toast({
        title: 'Success',
        description: 'Action marked as completed.',
      });
      await refreshActionsSilently();
    } catch (error) {
      console.error('Failed to complete action:', error);
      toast({
        title: 'Error',
        description: 'Failed to update action. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'CALL_STAFF':
        return Bell;
      case 'REQUEST_BILL':
        return CheckCircle;
      case 'REQUEST_WATER':
      case 'REQUEST_UTENSILS':
      case 'OTHER':
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'CALL_STAFF':
        return 'Call Staff';
      case 'REQUEST_BILL':
        return 'Request Bill';
      case 'REQUEST_WATER':
        return 'Request Water';
      case 'REQUEST_UTENSILS':
        return 'Request Utensils';
      case 'OTHER':
        return 'Other Request';
      default:
        return type;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'CALL_STAFF':
        return 'bg-blue-500';
      case 'REQUEST_BILL':
        return 'bg-green-500';
      case 'REQUEST_WATER':
        return 'bg-cyan-500';
      case 'REQUEST_UTENSILS':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Customer Requests</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage customer service requests and actions
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="border-success/30 bg-success/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Handled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-success text-3xl font-bold">{stats.handled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Pending
              {stats.pending > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {stats.pending}
                </Badge>
              )}
            </Button>
            <Button
              variant={filter === 'handled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('handled')}
            >
              Handled
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions List */}
      {isLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="text-muted-foreground h-12 w-12 animate-spin" />
            <p className="text-muted-foreground mt-4 text-sm">Loading customer requests...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredActions.map((action) => {
            const ActionIcon = getActionIcon(action.actionType);
            const urgent = isUrgent(action.createdAt);
            const displayStatus = mapStatus(action.status);

            return (
              <Card
                key={action.id}
                className={cn(
                  'transition-all hover:shadow-md',
                  displayStatus === 'Pending' && 'border-amber-500/30 bg-amber-50/50',
                  urgent && displayStatus === 'Pending' && 'border-red-500/50 bg-red-50'
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                        displayStatus === 'Pending'
                          ? urgent
                            ? 'bg-red-500'
                            : getActionColor(action.actionType)
                          : 'bg-slate-300'
                      )}
                    >
                      <ActionIcon className="h-5 w-5 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{getActionLabel(action.actionType)}</h3>
                        <span className="text-muted-foreground text-sm">•</span>
                        <span className="text-sm font-medium">
                          Table {action.session?.table?.number || 'N/A'}
                        </span>
                        <StatusBadge status={displayStatus} className="ml-auto" />
                      </div>

                      {action.description && (
                        <div className="rounded-md bg-blue-50 p-2 text-sm text-blue-900">
                          {action.description}
                        </div>
                      )}

                      <div className="text-muted-foreground flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{getTimeSince(action.createdAt)}</span>
                        </div>
                        {urgent && displayStatus === 'Pending' && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Urgent
                          </Badge>
                        )}
                        {action.status === 'IN_PROGRESS' && (
                          <Badge variant="warning" className="text-xs">
                            In Progress
                          </Badge>
                        )}
                      </div>

                      {displayStatus === 'Handled' && action.handledBy && (
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                          <User className="h-4 w-4" />
                          <span>Handled by {action.handledBy.name}</span>
                          <span>• {getTimeSince(action.updatedAt)}</span>
                        </div>
                      )}

                      {/* Actions */}
                      {displayStatus === 'Pending' && (
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" onClick={() => handleTakeAction(action.id)}>
                            Take Action
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkHandled(action.id)}
                          >
                            Mark as Handled
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && filteredActions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="text-success mb-4 h-12 w-12" />
            <p className="text-lg font-medium">All caught up!</p>
            <p className="text-muted-foreground text-sm">
              No {filter === 'pending' ? 'pending' : filter === 'handled' ? 'handled' : ''} requests
              at the moment
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
