import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/staff/StatusBadge';
import type { TableSession } from '@/types/staff';
import { CreditCard, Banknote, DollarSign, Printer, Mail, Clock, Receipt } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface SessionWithBill extends TableSession {
  bill?: {
    sub_total: number;
    vat: number;
    discount: number;
    total: number;
  };
}

export default function CashierPaymentQueuePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<SessionWithBill | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Online'>('Cash');
  const [cashReceived, setCashReceived] = useState('');
  const [tipAmount, setTipAmount] = useState('');

  // Mock data
  const mockSessions: SessionWithBill[] = [
    {
      session_id: 'ses-001',
      table_id: 'tbl-001',
      start_time: new Date(Date.now() - 60 * 60000).toISOString(),
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
      bill: {
        sub_total: 45.0,
        vat: 4.5,
        discount: 0,
        total: 49.5,
      },
      orders: [
        {
          order_id: 'ord-001',
          session_id: 'ses-001',
          status: 'Confirmed',
          order_type: 'DineIn',
          created_at: new Date(Date.now() - 50 * 60000).toISOString(),
          items: [
            {
              order_item_id: 'oi-001',
              order_id: 'ord-001',
              item_id: 'item-001',
              item_name_at_order: 'Beef Steak',
              quantity: 2,
              price_at_order: 19.99,
              status: 'Served',
            },
            {
              order_item_id: 'oi-002',
              order_id: 'ord-001',
              item_id: 'item-002',
              item_name_at_order: 'Cola',
              quantity: 2,
              price_at_order: 2.51,
              status: 'Served',
            },
          ],
        },
      ],
    },
    {
      session_id: 'ses-002',
      table_id: 'tbl-002',
      start_time: new Date(Date.now() - 90 * 60000).toISOString(),
      status: 'Active',
      party_size: 4,
      table: {
        table_id: 'tbl-002',
        table_number: 'B2',
        capacity: 6,
        status: 'Occupied',
        qr_code_key: 'qr2',
      },
      bill: {
        sub_total: 120.0,
        vat: 12.0,
        discount: 10.0,
        total: 122.0,
      },
      orders: [
        {
          order_id: 'ord-002',
          session_id: 'ses-002',
          status: 'Confirmed',
          order_type: 'DineIn',
          created_at: new Date(Date.now() - 80 * 60000).toISOString(),
          items: [
            {
              order_item_id: 'oi-003',
              order_id: 'ord-002',
              item_id: 'item-003',
              item_name_at_order: 'Salmon',
              quantity: 4,
              price_at_order: 30.0,
              status: 'Served',
            },
          ],
        },
      ],
    },
  ];

  const filteredSessions = mockSessions.filter((session) => {
    const matchesSearch =
      session.table?.table_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.guest_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    pending: filteredSessions.length,
    total_amount: filteredSessions.reduce((sum, s) => sum + (s.bill?.total || 0), 0),
  };

  const handleOpenPayment = (session: TableSession) => {
    setSelectedSession(session);
    setShowPaymentDialog(true);
    setCashReceived('');
    setTipAmount('');
  };

  const calculateChange = () => {
    if (!selectedSession || !cashReceived) return 0;
    const total = selectedSession.bill?.total || 0;
    const tip = parseFloat(tipAmount) || 0;
    const received = parseFloat(cashReceived) || 0;
    return Math.max(0, received - total - tip);
  };

  const handleProcessPayment = () => {
    if (paymentMethod === 'Cash' && !cashReceived) {
      alert('Please enter the amount received');
      return;
    }

    const change = calculateChange();
    alert(
      `Processing ${paymentMethod} payment for session ${selectedSession?.session_id}\n` +
        (paymentMethod === 'Cash' ? `Change: $${change.toFixed(2)}` : '')
    );
    setShowPaymentDialog(false);
  };

  const getSessionDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Cashier - Payment Queue</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Process payments and manage transactions
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="border-success/30 bg-success/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-success text-3xl font-bold">${stats.total_amount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Search by table number or guest name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="grid gap-4 lg:grid-cols-2">
        {filteredSessions.map((session) => (
          <Card key={session.session_id} className="hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Table {session.table?.table_number}</CardTitle>
                  {session.guest_name && (
                    <p className="text-muted-foreground text-sm">{session.guest_name}</p>
                  )}
                </div>
                <StatusBadge status={session.status} />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Session Info */}
              <div className="text-muted-foreground flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{getSessionDuration(session.start_time)}</span>
                </div>
                {session.party_size && (
                  <div>
                    <Badge variant="outline">{session.party_size} guests</Badge>
                  </div>
                )}
              </div>

              {/* Bill Summary */}
              {session.bill && (
                <div className="space-y-2 rounded-lg border bg-slate-50 p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>${session.bill.sub_total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VAT (10%):</span>
                    <span>${session.bill.vat.toFixed(2)}</span>
                  </div>
                  {session.bill.discount > 0 && (
                    <div className="text-success flex justify-between text-sm">
                      <span>Discount:</span>
                      <span>-${session.bill.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Total:</span>
                    <span className="text-lg">${session.bill.total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => handleOpenPayment(session)}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Process Payment
                </Button>
                <Button variant="outline" size="icon">
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-lg font-medium">No pending payments</p>
            <p className="text-muted-foreground text-sm">All sessions have been settled</p>
          </CardContent>
        </Card>
      )}

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Table {selectedSession?.table?.table_number}
              {selectedSession?.guest_name && ` - ${selectedSession.guest_name}`}
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4">
              {/* Bill Summary */}
              <div className="rounded-lg border bg-slate-50 p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>${(selectedSession.bill?.sub_total || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VAT:</span>
                    <span>${(selectedSession.bill?.vat || 0).toFixed(2)}</span>
                  </div>
                  {(selectedSession.bill?.discount || 0) > 0 && (
                    <div className="text-success flex justify-between text-sm">
                      <span>Discount:</span>
                      <span>-${(selectedSession.bill?.discount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2 text-lg font-bold">
                    <span>Total:</span>
                    <span>${(selectedSession.bill?.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={paymentMethod === 'Cash' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('Cash')}
                    className="w-full"
                  >
                    <Banknote className="mr-2 h-4 w-4" />
                    Cash
                  </Button>
                  <Button
                    variant={paymentMethod === 'Online' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('Online')}
                    className="w-full"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Online
                  </Button>
                </div>
              </div>

              {/* Cash Payment Fields */}
              {paymentMethod === 'Cash' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="cash-received">Cash Received *</Label>
                    <Input
                      id="cash-received"
                      type="number"
                      placeholder="0.00"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tip">Tip (Optional)</Label>
                    <Input
                      id="tip"
                      type="number"
                      placeholder="0.00"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  {cashReceived && (
                    <div className="border-success bg-success/10 rounded-lg border-2 p-4">
                      <div className="text-success flex justify-between text-lg font-bold">
                        <span>Change:</span>
                        <span>${calculateChange().toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Online Payment */}
              {paymentMethod === 'Online' && (
                <div className="rounded-lg border bg-blue-50 p-4 text-sm text-blue-900">
                  <p className="font-medium">Online Payment</p>
                  <p className="mt-1 text-xs">
                    A payment link will be sent to the customer or you can scan the QR code
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleProcessPayment} className="w-full sm:flex-1">
              <Receipt className="mr-2 h-4 w-4" />
              Complete Payment
            </Button>
            <Button variant="outline" size="icon">
              <Mail className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
