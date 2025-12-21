import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, Users, Phone, MapPin, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { reservationsService, type Reservation, type ReservationStatus } from '@/lib/api/services/reservations.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const STATUS_COLORS: Record<ReservationStatus, string> = {
  PENDING: 'bg-yellow-500',
  CONFIRMED: 'bg-blue-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-gray-500',
  NO_SHOW: 'bg-red-500',
};

const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
};

export default function ReservationManagementPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');

  const { toast } = useToast();

  useEffect(() => {
    loadReservations();
    loadStatistics();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [reservations, statusFilter, searchQuery, dateFilter]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationsService.getReservations();
      setReservations(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load reservations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await reservationsService.getReservationStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const filterReservations = () => {
    let filtered = [...reservations];

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Search filter (guest name or phone)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.guestName?.toLowerCase().includes(query) ||
          r.guestPhone?.toLowerCase().includes(query) ||
          r.table?.number.toString().includes(query)
      );
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter((r) => {
        const reservationDate = format(parseISO(r.reservationTime), 'yyyy-MM-dd');
        return reservationDate === dateFilter;
      });
    }

    setFilteredReservations(filtered);
  };

  const handleConfirm = async (id: string) => {
    try {
      await reservationsService.confirmReservation(id);
      toast({
        title: 'Success',
        description: 'Reservation confirmed successfully',
      });
      loadReservations();
      loadStatistics();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to confirm reservation',
        variant: 'destructive',
      });
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await reservationsService.completeReservation(id);
      toast({
        title: 'Success',
        description: 'Reservation marked as completed',
      });
      loadReservations();
      loadStatistics();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete reservation',
        variant: 'destructive',
      });
    }
  };

  const handleNoShow = async (id: string) => {
    try {
      await reservationsService.markAsNoShow(id);
      toast({
        title: 'Success',
        description: 'Reservation marked as no-show',
      });
      loadReservations();
      loadStatistics();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark as no-show',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await reservationsService.cancelReservation(id);
      toast({
        title: 'Success',
        description: 'Reservation cancelled successfully',
      });
      loadReservations();
      loadStatistics();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel reservation',
        variant: 'destructive',
      });
    }
  };

  const viewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowDetailDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reservation Management</h1>
          <p className="text-muted-foreground">Manage and track restaurant reservations</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.today.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.today.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.today.confirmed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.today.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Cancelled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.today.cancelled}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">No Show</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.today.noShow}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search by name, phone, or table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="NO_SHOW">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      <div className="grid gap-4">
        {filteredReservations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No reservations found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredReservations.map((reservation) => (
            <Card key={reservation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-4">
                      <Badge className={`${STATUS_COLORS[reservation.status]} text-white`}>
                        {STATUS_LABELS[reservation.status]}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Table {reservation.table?.number}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {format(parseISO(reservation.reservationTime), 'PPP')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {format(parseISO(reservation.reservationTime), 'p')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{reservation.partySize} guests</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{reservation.guestName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{reservation.guestPhone}</span>
                      </div>
                    </div>

                    {reservation.notes && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Notes:</span> {reservation.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline" onClick={() => viewDetails(reservation)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {reservation.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(reservation.id)}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                    )}
                    {reservation.status === 'CONFIRMED' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleComplete(reservation.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleNoShow(reservation.id)}
                        >
                          No Show
                        </Button>
                      </>
                    )}
                    {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel(reservation.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reservation Details</DialogTitle>
            <DialogDescription>
              Complete information about this reservation
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge className={`${STATUS_COLORS[selectedReservation.status]} text-white`}>
                      {STATUS_LABELS[selectedReservation.status]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Table</label>
                  <p className="mt-1 font-medium">Table {selectedReservation.table?.number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p className="mt-1">{format(parseISO(selectedReservation.reservationTime), 'PPP')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Time</label>
                  <p className="mt-1">{format(parseISO(selectedReservation.reservationTime), 'p')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Guest Name</label>
                  <p className="mt-1">{selectedReservation.guestName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="mt-1">{selectedReservation.guestPhone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Party Size</label>
                  <p className="mt-1">{selectedReservation.partySize} guests</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Table Capacity</label>
                  <p className="mt-1">{selectedReservation.table?.capacity} seats</p>
                </div>
              </div>
              {selectedReservation.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedReservation.notes}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                  <p className="mt-1 text-sm">{format(parseISO(selectedReservation.createdAt), 'PPp')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                  <p className="mt-1 text-sm">{format(parseISO(selectedReservation.updatedAt), 'PPp')}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
