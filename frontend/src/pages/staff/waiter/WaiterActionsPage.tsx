import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/staff/StatusBadge';
import type { StaffAction } from '@/types/staff';
import { Bell, Clock, CheckCircle, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WaiterActionsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'handled'>('pending');

  // Mock data
  const mockActions: StaffAction[] = [
    {
      action_id: 'act-001',
      session_id: 'ses-001',
      action_type: 'Call_Staff',
      status: 'Pending',
      created_at: new Date(Date.now() - 2 * 60000).toISOString(),
      session: {
        session_id: 'ses-001',
        table_id: 'tbl-001',
        start_time: new Date(Date.now() - 30 * 60000).toISOString(),
        status: 'Active',
        guest_name: 'John Doe',
        party_size: 2,
        table: {
          table_id: 'tbl-001',
          table_number: 'A1',
          capacity: 4,
          status: 'Occupied',
          qr_code_key: 'qr1',
        },
      },
    },
    {
      action_id: 'act-002',
      session_id: 'ses-002',
      action_type: 'Request_Bill',
      status: 'Pending',
      created_at: new Date(Date.now() - 5 * 60000).toISOString(),
      session: {
        session_id: 'ses-002',
        table_id: 'tbl-002',
        start_time: new Date(Date.now() - 60 * 60000).toISOString(),
        status: 'Active',
        party_size: 4,
        table: {
          table_id: 'tbl-002',
          table_number: 'B2',
          capacity: 6,
          status: 'Occupied',
          qr_code_key: 'qr2',
        },
      },
    },
    {
      action_id: 'act-003',
      session_id: 'ses-003',
      action_type: 'Call_Staff',
      status: 'Handled',
      created_at: new Date(Date.now() - 15 * 60000).toISOString(),
      handled_by_staff_id: 'staff-001',
      handled_by_staff_name: 'Jane Smith',
      handled_at: new Date(Date.now() - 13 * 60000).toISOString(),
      session: {
        session_id: 'ses-003',
        table_id: 'tbl-003',
        start_time: new Date(Date.now() - 45 * 60000).toISOString(),
        status: 'Active',
        guest_name: 'Alice Johnson',
        table: {
          table_id: 'tbl-003',
          table_number: 'A3',
          capacity: 4,
          status: 'Occupied',
          qr_code_key: 'qr3',
        },
      },
    },
    {
      action_id: 'act-004',
      session_id: 'ses-001',
      action_type: 'Call_Staff',
      status: 'Pending',
      created_at: new Date(Date.now() - 8 * 60000).toISOString(),
      session: {
        session_id: 'ses-001',
        table_id: 'tbl-001',
        start_time: new Date(Date.now() - 30 * 60000).toISOString(),
        status: 'Active',
        guest_name: 'John Doe',
        party_size: 2,
        table: {
          table_id: 'tbl-001',
          table_number: 'A1',
          capacity: 4,
          status: 'Occupied',
          qr_code_key: 'qr1',
        },
      },
    },
  ];

  const filteredActions = mockActions
    .filter((action) => {
      if (filter === 'all') return true;
      if (filter === 'pending') return action.status === 'Pending';
      if (filter === 'handled') return action.status === 'Handled';
      return true;
    })
    .sort((a, b) => {
      // Pending first, then by time
      if (a.status === 'Pending' && b.status !== 'Pending') return -1;
      if (a.status !== 'Pending' && b.status === 'Pending') return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const stats = {
    total: mockActions.length,
    pending: mockActions.filter((a) => a.status === 'Pending').length,
    handled: mockActions.filter((a) => a.status === 'Handled').length,
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

  const handleTakeAction = (actionId: string) => {
    alert(`Taking action ${actionId}`);
  };

  const handleMarkHandled = (actionId: string) => {
    alert(`Marking action ${actionId} as handled`);
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'Call_Staff':
        return Bell;
      case 'Request_Bill':
        return CheckCircle;
      default:
        return AlertCircle;
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'Call_Staff':
        return 'Call Staff';
      case 'Request_Bill':
        return 'Request Bill';
      default:
        return type;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'Call_Staff':
        return 'bg-blue-500';
      case 'Request_Bill':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Customer Requests</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Manage customer service requests and actions
        </p>
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
      <div className="space-y-3">
        {filteredActions.map((action) => {
          const ActionIcon = getActionIcon(action.action_type);
          const urgent = isUrgent(action.created_at);

          return (
            <Card
              key={action.action_id}
              className={cn(
                'transition-all hover:shadow-md',
                action.status === 'Pending' && 'border-amber-500/30 bg-amber-50/50',
                urgent && action.status === 'Pending' && 'border-red-500/50 bg-red-50'
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                      action.status === 'Pending'
                        ? urgent
                          ? 'bg-red-500'
                          : getActionColor(action.action_type)
                        : 'bg-slate-300'
                    )}
                  >
                    <ActionIcon className="h-5 w-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{getActionLabel(action.action_type)}</h3>
                      <span className="text-muted-foreground text-sm">•</span>
                      <span className="text-sm font-medium">
                        Table {action.session?.table?.table_number}
                      </span>
                      {action.session?.guest_name && (
                        <>
                          <span className="text-muted-foreground text-sm">•</span>
                          <span className="text-muted-foreground text-sm">
                            {action.session.guest_name}
                          </span>
                        </>
                      )}
                      <StatusBadge status={action.status} className="ml-auto" />
                    </div>

                    <div className="text-muted-foreground flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{getTimeSince(action.created_at)}</span>
                      </div>
                      {urgent && action.status === 'Pending' && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Urgent
                        </Badge>
                      )}
                    </div>

                    {action.status === 'Handled' && action.handled_by_staff_name && (
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <User className="h-4 w-4" />
                        <span>Handled by {action.handled_by_staff_name}</span>
                        {action.handled_at && <span>• {getTimeSince(action.handled_at)}</span>}
                      </div>
                    )}

                    {/* Actions */}
                    {action.status === 'Pending' && (
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" onClick={() => handleTakeAction(action.action_id)}>
                          Take Action
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkHandled(action.action_id)}
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

      {filteredActions.length === 0 && (
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
