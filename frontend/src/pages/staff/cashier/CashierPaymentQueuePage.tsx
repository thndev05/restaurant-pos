import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/staff/StatusBadge';
import { DollarSign, Printer, Clock, Receipt, RefreshCw, Loader2, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ordersService, type Order } from '@/lib/api/services/orders.service';
import { CreatePaymentDialog } from '@/components/staff/CreatePaymentDialog';

interface OrderWithBill extends Order {
  bill?: {
    orderId: string;
    orderNumber: string;
    orderType: string;
    createdAt: string;
    confirmedBy: string | null;
    tableNumber?: number;
    items: {
      name: string;
      quantity: number;
      price: number;
      total: number;
    }[];
    subTotal: number;
    tax: number;
    discount: number;
    total: number;
  };
}

export default function CashierPaymentQueuePage() {
  const { toast } = useToast();
  const toastRef = useRef(toast);
  const isLoadingRef = useRef(false);

  // Update toast ref when it changes
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithBill | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  // Load orders ready for payment from API
  const loadOrders = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      // Get orders with SERVED or READY status in parallel (ready for payment)
      const [servedOrders, readyOrders] = await Promise.all([
        ordersService.getOrders({ status: 'SERVED' }),
        ordersService.getOrders({ status: 'READY' }),
      ]);

      // Combine both SERVED and READY orders
      const allReadyOrders = [...servedOrders, ...readyOrders];

      // Filter out orders without items
      const validOrders = allReadyOrders.filter(
        (order) => order.orderItems && order.orderItems.length > 0
      );

      setOrders(validOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toastRef.current({
        title: 'Error',
        description: 'Failed to load payment queue',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.session && order.session.table.number.toString().includes(searchQuery)) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone?.includes(searchQuery) ||
      order.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate stats (will be approximate until bills are loaded)
  const stats = {
    pending: filteredOrders.length,
    // Note: exact total requires loading each bill, showing count for now
    total_amount: 0, // We'll calculate this differently
  };

  const handleOpenPayment = async (order: Order) => {
    try {
      // Validate order ID format
      if (!order.id || order.id.length === 0) {
        throw new Error('Invalid order ID');
      }

      // Load bill details
      const bill = await ordersService.getOrderBill(order.id);
      setSelectedOrder({ ...order, bill });
      setShowPaymentDialog(true);
    } catch (error) {
      console.error('Failed to load bill:', error);
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast({
        title: 'Error',
        description: message || 'Failed to load bill details',
        variant: 'destructive',
      });
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentDialog(false);
    setSelectedOrder(null);
    loadOrders(); // Refresh the list
  };

  const handlePrintBill = async (order: Order) => {
    setIsPrinting(true);
    try {
      // Validate order ID
      if (!order.id || order.id.length === 0) {
        throw new Error('Invalid order ID');
      }

      // Load bill details
      const billData = await ordersService.getOrderBill(order.id);

      // Create a printable bill
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Unable to open print window');
      }

      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(amount);
      };

      const billHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Bill - Table ${billData.tableNumber || 'N/A'}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              max-width: 300px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 {
              text-align: center;
              font-size: 20px;
              margin-bottom: 10px;
            }
            .header {
              text-align: center;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .info {
              margin-bottom: 10px;
              font-size: 12px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
            }
            th, td {
              text-align: left;
              padding: 5px 0;
              font-size: 12px;
            }
            th {
              border-bottom: 1px solid #000;
            }
            .item-row {
              border-bottom: 1px dashed #ccc;
            }
            .totals {
              border-top: 2px solid #000;
              padding-top: 10px;
              margin-top: 10px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
              font-size: 12px;
            }
            .grand-total {
              font-weight: bold;
              font-size: 16px;
              border-top: 2px solid #000;
              padding-top: 5px;
              margin-top: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 10px;
              border-top: 2px dashed #000;
              font-size: 12px;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RESTAURANT POS</h1>
            <div>Tax Invoice</div>
          </div>
          
          <div class="info">
            <div>Date: ${new Date().toLocaleString()}</div>
            <div>Order: ${billData.orderNumber}</div>
            <div>Type: ${billData.orderType === 'DINE_IN' ? 'Dine-In' : 'Takeaway'}</div>
            ${billData.tableNumber ? `<div>Table: ${billData.tableNumber}</div>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center">Qty</th>
                <th style="text-align: right">Price</th>
                <th style="text-align: right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${billData.items
                .map(
                  (item) => `
                <tr class="item-row">
                  <td>${item.name}</td>
                  <td style="text-align: center">${item.quantity}</td>
                  <td style="text-align: right">${formatCurrency(item.price)}</td>
                  <td style="text-align: right">${formatCurrency(item.total)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(billData.subTotal)}</span>
            </div>
            <div class="total-row">
              <span>Tax (10%):</span>
              <span>${formatCurrency(billData.tax)}</span>
            </div>
            ${
              billData.discount > 0
                ? `
            <div class="total-row">
              <span>Discount:</span>
              <span>-${formatCurrency(billData.discount)}</span>
            </div>
            `
                : ''
            }
            <div class="total-row grand-total">
              <span>TOTAL:</span>
              <span>${formatCurrency(billData.total)}</span>
            </div>
          </div>

          <div class="footer">
            <div>Thank you for dining with us!</div>
            <div>Please come again</div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(billHtml);
      printWindow.document.close();
      printWindow.focus();

      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
      }, 250);

      toast({
        title: 'Bill Printed',
        description: 'Bill sent to printer successfully',
      });
    } catch (error) {
      console.error('Failed to print bill:', error);
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast({
        title: 'Error',
        description: message || 'Failed to print bill',
        variant: 'destructive',
      });
    } finally {
      setIsPrinting(false);
    }
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Cashier - Payment Queue</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Process payments and manage transactions
          </p>
        </div>
        <Button onClick={loadOrders} disabled={isLoading} size="sm" variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
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

      {/* Orders List */}
      {isLoading ? (
        <Card className="border-2 p-12">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="text-primary mb-4 h-12 w-12 animate-spin" />
            <p className="text-muted-foreground text-lg font-semibold">Loading orders...</p>
          </div>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-lg font-medium">No pending payments</p>
            <p className="text-muted-foreground text-sm">
              {searchQuery
                ? 'No orders match your search criteria'
                : 'All orders have been settled'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {order.orderType === 'DINE_IN' && order.session ? (
                        <>🍽️ Table {order.session.table.number}</>
                      ) : (
                        <>📦 Takeaway - {order.customerName}</>
                      )}
                    </CardTitle>
                    {order.notes && <p className="text-muted-foreground text-sm">{order.notes}</p>}
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Order Info */}
                <div className="text-muted-foreground flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{getSessionDuration(order.createdAt)}</span>
                  </div>
                  {order.orderType === 'DINE_IN' && order.session?.customerCount && (
                    <div>
                      <Badge variant="outline">{order.session.customerCount} guests</Badge>
                    </div>
                  )}
                  {order.orderType === 'TAKE_AWAY' && order.customerPhone && (
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Phone className="h-3 w-3" />
                      <span>{order.customerPhone}</span>
                    </div>
                  )}
                </div>

                {/* Bill Preview */}
                <div className="space-y-2 rounded-lg border bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Ready for payment</span>
                    <Receipt className="text-muted-foreground h-4 w-4" />
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {order.orderItems.length} item(s) • Click to view bill
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => handleOpenPayment(order)}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Process Payment
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePrintBill(order)}
                    disabled={isPrinting}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Dialog - Using shared CreatePaymentDialog component */}
      <CreatePaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        orderId={selectedOrder?.id}
        orderTotal={selectedOrder?.bill?.total}
        onPaymentCreated={handlePaymentSuccess}
      />
    </div>
  );
}
