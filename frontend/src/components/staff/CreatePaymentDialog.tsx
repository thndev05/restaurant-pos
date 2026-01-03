import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { DollarSign, CreditCard, Building2, Banknote, Printer, Loader2 } from 'lucide-react';
import {
  paymentsService,
  type PaymentMethod,
  type CreatePaymentData,
} from '@/lib/api/services/payments.service';
import {
  ordersService,
  type OrderBill,
  type OrderBillItem,
} from '@/lib/api/services/orders.service';
import { useToast } from '@/hooks/use-toast';

interface SessionOrder {
  id: string;
  status: string;
  orderItems: Array<{
    id: string;
    itemNameAtOrder: string;
    quantity: number;
    priceAtOrder: number;
    status: string;
  }>;
}

interface CreatePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId?: string;
  orderId?: string;
  orderTotal?: number;
  onPaymentCreated?: () => void;
  sessionOrders?: SessionOrder[];
  tableNumber?: number;
}

const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { label: string; icon: typeof Banknote }> = {
  CASH: {
    label: 'Cash',
    icon: Banknote,
  },
  BANKING: {
    label: 'Bank Transfer',
    icon: Building2,
  },
  CARD: {
    label: 'Credit/Debit Card',
    icon: CreditCard,
  },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export function CreatePaymentDialog({
  open,
  onOpenChange,
  sessionId,
  orderId,
  orderTotal,
  onPaymentCreated,
  sessionOrders,
  tableNumber,
}: CreatePaymentDialogProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(10); // Default 10% tax
  const [notes, setNotes] = useState('');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [tipAmount, setTipAmount] = useState<string>('');
  const [billData, setBillData] = useState<OrderBill | null>(null);
  const [isLoadingBill, setIsLoadingBill] = useState(false);

  const loadBillDetails = useCallback(async () => {
    if (orderId) {
      // Load bill from single order
      setIsLoadingBill(true);
      try {
        const bill = await ordersService.getOrderBill(orderId);
        setBillData(bill);
        // Set tax from bill if available
        if (bill.tax > 0) {
          setTax((bill.tax / bill.subTotal) * 100);
        }
        if (bill.discount > 0) {
          setDiscount((bill.discount / bill.subTotal) * 100);
        }
      } catch (error) {
        console.error('Failed to load bill:', error);
      } finally {
        setIsLoadingBill(false);
      }
    } else if (sessionOrders && sessionOrders.length > 0) {
      // Generate bill from session orders
      setIsLoadingBill(true);
      try {
        const items: OrderBillItem[] = [];
        let subTotal = 0;

        sessionOrders.forEach((order) => {
          if (order.status !== 'CANCELLED') {
            order.orderItems.forEach((item) => {
              if (item.status !== 'CANCELLED') {
                const itemTotal = item.priceAtOrder * item.quantity;
                subTotal += itemTotal;

                // Merge same items
                const existingItem = items.find(
                  (i) => i.name === item.itemNameAtOrder && i.price === item.priceAtOrder
                );
                if (existingItem) {
                  existingItem.quantity += item.quantity;
                  existingItem.total += itemTotal;
                } else {
                  items.push({
                    name: item.itemNameAtOrder,
                    quantity: item.quantity,
                    price: item.priceAtOrder,
                    total: itemTotal,
                  });
                }
              }
            });
          }
        });

        const taxRate = 0.1;
        const taxAmt = subTotal * taxRate;
        const discountAmt = 0;
        const total = subTotal + taxAmt - discountAmt;

        setBillData({
          orderId: sessionId || '',
          orderNumber: sessionId?.substring(0, 8).toUpperCase() || 'SESSION',
          orderType: 'DINE_IN',
          createdAt: new Date().toISOString(),
          confirmedBy: null,
          items,
          subTotal,
          tax: taxAmt,
          discount: discountAmt,
          total,
          tableNumber: tableNumber,
        });
      } catch (error) {
        console.error('Failed to generate bill from session:', error);
      } finally {
        setIsLoadingBill(false);
      }
    }
  }, [orderId, sessionOrders, sessionId, tableNumber]);

  // Load bill details when dialog opens
  useEffect(() => {
    if (open) {
      loadBillDetails();
    }
  }, [open, loadBillDetails]);

  const subTotal = billData?.subTotal || orderTotal || 0;
  const taxAmount = (subTotal * tax) / 100;
  const discountAmount = (subTotal * discount) / 100;
  const totalAmount = subTotal + taxAmount - discountAmount;

  const calculateChange = () => {
    if (!cashReceived) return 0;
    const tip = parseFloat(tipAmount) || 0;
    const received = parseFloat(cashReceived) || 0;
    return Math.max(0, received - totalAmount - tip);
  };

  const handleCreateAndProcessPayment = async () => {
    // Check if payment method is not CASH
    if (paymentMethod !== 'CASH') {
      toast({
        title: 'Coming Soon',
        description: `${PAYMENT_METHOD_CONFIG[paymentMethod].label} payment method is coming soon!`,
        variant: 'default',
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Step 1: Create payment
      const createPaymentData: CreatePaymentData = {
        ...(sessionId && { sessionId }),
        ...(orderId && { orderId }),
        totalAmount,
        subTotal,
        tax: taxAmount,
        discount: discountAmount,
        paymentMethod,
        notes: notes || undefined,
      };

      const createResponse = await paymentsService.createPayment(createPaymentData);

      // Step 2: Process payment immediately (only for session-based payments)
      // For order-based payments, the backend already marks order as PAID
      if (sessionId && createResponse.data.id) {
        const paymentId = createResponse.data.id;
        await paymentsService.processPayment(paymentId, {
          notes: notes || undefined,
        });
      }

      toast({
        title: 'Success',
        description: 'Payment processed successfully',
      });

      onPaymentCreated?.();
      onOpenChange(false);

      // Reset form
      setPaymentMethod('CASH');
      setDiscount(0);
      setTax(0);
      setNotes('');
    } catch (error) {
      console.error('Failed to process payment:', error);
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast({
        title: 'Error',
        description: message || 'Failed to process payment',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintBill = async () => {
    if (!billData) {
      toast({
        title: 'Error',
        description: 'No bill data available',
        variant: 'destructive',
      });
      return;
    }

    setIsPrinting(true);
    try {
      const printWindow = window.open('', '', 'width=300,height=600');
      if (!printWindow) {
        throw new Error('Failed to open print window');
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Bill #${billData.orderNumber}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                margin: 0;
                padding: 10px;
              }
              .header {
                text-align: center;
                margin-bottom: 10px;
                border-bottom: 1px dashed #000;
                padding-bottom: 10px;
              }
              .header h2 {
                margin: 5px 0;
                font-size: 16px;
              }
              .info {
                margin: 10px 0;
                font-size: 11px;
              }
              .items {
                margin: 10px 0;
                border-top: 1px dashed #000;
                border-bottom: 1px dashed #000;
                padding: 10px 0;
              }
              .item {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
              }
              .totals {
                margin: 10px 0;
              }
              .total-line {
                display: flex;
                justify-content: space-between;
                margin: 3px 0;
              }
              .total-line.grand-total {
                font-weight: bold;
                font-size: 14px;
                border-top: 1px solid #000;
                padding-top: 5px;
                margin-top: 5px;
              }
              .footer {
                text-align: center;
                margin-top: 10px;
                border-top: 1px dashed #000;
                padding-top: 10px;
                font-size: 11px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>RESTAURANT POS</h2>
              <div>Bill Receipt</div>
            </div>
            
            <div class="info">
              <div>Bill #: ${billData.orderNumber}</div>
              <div>Date: ${new Date(billData.createdAt).toLocaleString()}</div>
              ${billData.tableNumber ? `<div>Table: ${billData.tableNumber}</div>` : '<div>Order Type: Take Away</div>'}
              ${billData.confirmedBy ? `<div>Server: ${billData.confirmedBy}</div>` : ''}
            </div>

            <div class="items">
              ${billData.items
                .map(
                  (item) => `
                <div class="item">
                  <span>${item.quantity}x ${item.name}</span>
                  <span>${formatCurrency(item.price * item.quantity)}</span>
                </div>
              `
                )
                .join('')}
            </div>

            <div class="totals">
              <div class="total-line">
                <span>Subtotal:</span>
                <span>${formatCurrency(billData.subTotal)}</span>
              </div>
              <div class="total-line">
                <span>Tax (${tax.toFixed(1)}%):</span>
                <span>${formatCurrency(taxAmount)}</span>
              </div>
              ${
                discount > 0
                  ? `
                <div class="total-line">
                  <span>Discount (${discount.toFixed(1)}%):</span>
                  <span>-${formatCurrency(discountAmount)}</span>
                </div>
              `
                  : ''
              }
              <div class="total-line grand-total">
                <span>TOTAL:</span>
                <span>${formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div class="footer">
              <div>Thank you for dining with us!</div>
              <div>Please come again</div>
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);

      toast({
        title: 'Success',
        description: 'Bill printed successfully',
      });
    } catch (error) {
      console.error('Failed to print bill:', error);
      toast({
        title: 'Error',
        description: 'Failed to print bill',
        variant: 'destructive',
      });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Process Payment {billData && `- Bill #${billData.orderNumber}`}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left Column - Bill Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Bill Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintBill}
                disabled={isPrinting || !billData}
              >
                <Printer className="mr-2 h-4 w-4" />
                {isPrinting ? 'Printing...' : 'Print Bill'}
              </Button>
            </div>

            {isLoadingBill ? (
              <div className="flex justify-center py-8">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
              </div>
            ) : billData ? (
              <div className="space-y-4">
                {/* Bill Info */}
                <div className="bg-muted space-y-2 rounded-lg p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bill Number:</span>
                    <span className="font-medium">{billData.orderNumber}</span>
                  </div>
                  {billData.tableNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Table:</span>
                      <span className="font-medium">{billData.tableNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">
                      {billData.tableNumber ? 'Dine In' : 'Take Away'}
                    </span>
                  </div>
                  {billData.confirmedBy && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Server:</span>
                      <span className="font-medium">{billData.confirmedBy}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {new Date(billData.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="rounded-lg border">
                  <div className="bg-muted px-4 py-2 font-semibold">Order Items</div>
                  <div className="divide-y">
                    {billData.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-muted-foreground text-sm">
                            {formatCurrency(item.price)} × {item.quantity}
                          </div>
                        </div>
                        <div className="font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground py-8 text-center">No bill data available</div>
            )}
          </div>

          {/* Right Column - Payment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Details</h3>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              >
                <SelectTrigger id="payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_METHOD_CONFIG).map(([method, config]) => {
                    const Icon = config.icon;
                    return (
                      <SelectItem key={method} value={method}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Discount and Tax Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax">Tax/Service (%)</Label>
                <Input
                  id="tax"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Cash Payment Fields */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cash-received">Cash Received</Label>
                  <Input
                    id="cash-received"
                    type="number"
                    min="0"
                    step="0.01"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder="Enter amount received"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tip">Tip (Optional)</Label>
                  <Input
                    id="tip"
                    type="number"
                    min="0"
                    step="0.01"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    placeholder="Enter tip amount"
                  />
                </div>

                {cashReceived && parseFloat(cashReceived) > 0 && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-900">Change to Return:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(calculateChange())}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Summary */}
            <div className="bg-muted space-y-2 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(subTotal)}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax ({tax.toFixed(1)}%):</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount ({discount.toFixed(1)}%):</span>
                  <span className="text-red-600">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add payment notes..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateAndProcessPayment}
            disabled={isProcessing}
            className={paymentMethod !== 'CASH' ? 'bg-gray-500 hover:bg-gray-600' : ''}
          >
            {isProcessing
              ? 'Processing...'
              : paymentMethod !== 'CASH'
                ? 'Coming Soon'
                : `Process Payment - ${formatCurrency(totalAmount)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
