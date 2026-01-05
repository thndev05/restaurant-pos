import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DollarSign,
  CreditCard,
  Building2,
  Banknote,
  Printer,
  Loader2,
  QrCode,
  CheckCircle2,
  Copy,
  AlertCircle,
} from 'lucide-react';
import {
  paymentsService,
  type PaymentMethod,
  type CreatePaymentData,
} from '@/lib/api/services/payments.service';
import { authService } from '@/lib/api/services/auth.service';
import { API_CONFIG } from '@/config/api.config';
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
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{
    paymentId: string;
    transactionId: string;
    amount: number;
    status: string;
    accountNumber: string;
    bankName: string;
    accountHolder: string;
    content: string;
    qrCodeUrl: string;
  } | null>(null);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [isWaitingPayment, setIsWaitingPayment] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

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
    } else {
      // Cleanup socket when dialog closes
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsWaitingPayment(false);
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

  const handlePaymentSuccess = useCallback(
    (amount: number) => {
      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsWaitingPayment(false);

      // Show success notification
      toast({
        title: '✅ Payment Successful!',
        description: `Payment of ${formatCurrency(amount)} has been confirmed`,
        duration: 5000,
      });

      // Play success sound if available
      try {
        const audio = new Audio('/sounds/success.mp3');
        audio.play().catch(() => {
          // Ignore if sound fails to play
        });
      } catch (error) {
        // Ignore sound errors
      }

      // Close dialog and trigger refresh
      setTimeout(() => {
        setShowQrCode(false);
        setQrCodeData(null);
        onPaymentCreated?.();
        onOpenChange(false);
      }, 2000);
    },
    [toast, onPaymentCreated, onOpenChange]
  );

  const connectPaymentSocket = useCallback(
    (paymentId: string) => {
      setIsWaitingPayment(true);

      const token = authService.getAccessToken();
      if (!token) {
        console.error('No auth token available for socket connection');
        return;
      }

      // Connect to notifications socket
      const socket = io(`${API_CONFIG.BASE_URL}/notifications`, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('✅ Payment WebSocket connected');
      });

      socket.on('disconnect', () => {
        console.log('❌ Payment WebSocket disconnected');
      });

      // Listen for payment status updates
      socket.on(
        'paymentStatus',
        (data: { paymentId: string; status: string; amount: number; transactionId?: string }) => {
          console.log('💰 Payment status update:', data);

          // Only handle updates for our payment
          if (data.paymentId === paymentId) {
            if (data.status === 'SUCCESS') {
              // Update QR code data status
              setQrCodeData((prev) => (prev ? { ...prev, status: 'SUCCESS' as any } : null));
              handlePaymentSuccess(data.amount);
            } else if (data.status === 'FAILED') {
              setIsWaitingPayment(false);
              if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
              }

              toast({
                title: 'Payment Failed',
                description: 'The payment was not successful. Please try again.',
                variant: 'destructive',
              });
            }
          }
        }
      );

      socket.on('connect_error', (error) => {
        console.error('Payment WebSocket connection error:', error);
      });
    },
    [handlePaymentSuccess, toast]
  );

  const handleCreateAndProcessPayment = async () => {
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

      // Step 2: Handle different payment methods
      if (paymentMethod === 'BANKING') {
        // For bank transfer, show QR code and wait for webhook
        if (createResponse.data.id && !createResponse.data.id.startsWith('mock-')) {
          setIsLoadingQr(true);
          try {
            const qrResponse = await paymentsService.getPaymentQrCode(createResponse.data.id);
            setQrCodeData(qrResponse.data);
            setShowQrCode(true);
            setIsProcessing(false);
            setIsLoadingQr(false);

            // Connect to WebSocket for real-time payment status
            connectPaymentSocket(createResponse.data.id);

            toast({
              title: 'Payment Created',
              description: 'Please scan the QR code to complete payment',
            });
          } catch (error) {
            console.error('Failed to load QR code:', error);
            toast({
              title: 'Error',
              description: 'Failed to generate QR code',
              variant: 'destructive',
            });
            setIsProcessing(false);
            setIsLoadingQr(false);
          }
        }
      } else if (paymentMethod === 'CASH') {
        // For CASH, process payment immediately
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
        setIsProcessing(false);
      } else {
        // CARD and other methods
        toast({
          title: 'Coming Soon',
          description: `${PAYMENT_METHOD_CONFIG[paymentMethod].label} payment method is coming soon!`,
          variant: 'default',
        });
        setIsProcessing(false);
      }
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

        {/* QR Code Display for Bank Transfer */}
        {showQrCode && qrCodeData ? (
          <div className="space-y-6 p-2">
            {isLoadingQr ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12">
                <Loader2 className="text-primary h-12 w-12 animate-spin" />
                <p className="text-muted-foreground">Generating QR Code...</p>
              </div>
            ) : (
              <>
                {/* Header with Icon */}
                <div className="flex items-center justify-center gap-3">
                  <div className="bg-primary/10 rounded-full p-3">
                    <QrCode className="text-primary h-8 w-8" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold">Scan to Pay</h3>
                    <p className="text-muted-foreground text-sm">
                      Use your banking app to complete payment
                    </p>
                  </div>
                </div>

                {/* QR Code Card */}
                <Card className="border-primary/20 border-2">
                  <CardContent className="flex justify-center p-8">
                    <div className="relative">
                      <img
                        src={qrCodeData.qrCodeUrl}
                        alt="Payment QR Code"
                        className={`h-72 w-72 rounded-lg shadow-lg ${qrCodeData.status === 'SUCCESS' ? 'opacity-50' : ''}`}
                      />
                      {qrCodeData.status === 'SUCCESS' ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="rounded-full bg-green-500 p-4 shadow-2xl">
                            <CheckCircle2 className="h-16 w-16 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-primary absolute -top-2 -right-2 rounded-full p-2 shadow-lg">
                          <QrCode className="text-primary-foreground h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Amount Highlight */}
                <Card
                  className={`border-2 ${qrCodeData.status === 'SUCCESS' ? 'border-green-200 bg-green-50/50' : 'border-green-200 bg-green-50/50'}`}
                >
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground mb-2 text-sm font-medium">
                      {qrCodeData.status === 'SUCCESS' ? 'Payment Received' : 'Payment Amount'}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-4xl font-bold text-green-600">
                        {formatCurrency(qrCodeData.amount)}
                      </p>
                      {qrCodeData.status === 'SUCCESS' && (
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Bank Transfer Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Building2 className="h-5 w-5" />
                      Transfer Details
                    </CardTitle>
                    <CardDescription>Bank account information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-3">
                      <div className="bg-muted flex items-center justify-between rounded-lg p-3">
                        <span className="text-muted-foreground text-sm font-medium">Bank</span>
                        <span className="font-semibold">{qrCodeData.bankName}</span>
                      </div>

                      <div className="bg-muted flex items-center justify-between rounded-lg p-3">
                        <span className="text-muted-foreground text-sm font-medium">
                          Account Number
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold">
                            {qrCodeData.accountNumber}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() =>
                              copyToClipboard(qrCodeData.accountNumber, 'Account number')
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="bg-muted flex items-center justify-between rounded-lg p-3">
                        <span className="text-muted-foreground text-sm font-medium">
                          Account Holder
                        </span>
                        <span className="font-semibold">{qrCodeData.accountHolder}</span>
                      </div>

                      <div className="bg-muted flex items-center justify-between rounded-lg p-3">
                        <span className="text-muted-foreground text-sm font-medium">
                          Transfer Content
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold">
                            {qrCodeData.content}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(qrCodeData.content, 'Transfer content')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
                        <span className="text-muted-foreground text-xs font-medium">
                          Transaction ID
                        </span>
                        <span className="text-muted-foreground font-mono text-xs">
                          {qrCodeData.transactionId}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Instructions Alert */}
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <AlertDescription>
                    <p className="mb-3 font-semibold text-blue-900">How to pay:</p>
                    <ol className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>Open your mobile banking app</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>Scan the QR code or enter transfer details manually</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>Verify the amount and transfer content match exactly</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>Complete the transfer - payment will be confirmed automatically</span>
                      </li>
                    </ol>
                  </AlertDescription>
                </Alert>

                {/* Waiting/Success Status */}
                {isWaitingPayment ? (
                  <Alert className="border-amber-200 bg-amber-50">
                    <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                    <AlertDescription>
                      <p className="font-semibold text-amber-900">
                        Waiting for payment confirmation...
                      </p>
                      <p className="mt-1 text-sm text-amber-700">
                        This window will update automatically when payment is received. Please do
                        not close this dialog.
                      </p>
                    </AlertDescription>
                  </Alert>
                ) : qrCodeData?.status === 'SUCCESS' ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <AlertDescription>
                      <p className="font-semibold text-green-900">
                        Payment Confirmed Successfully! 🎉
                      </p>
                      <p className="mt-1 text-sm text-green-700">
                        Payment of {formatCurrency(qrCodeData.amount)} has been received and
                        confirmed.
                      </p>
                    </AlertDescription>
                  </Alert>
                ) : null}
              </>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Disconnect socket when closing
                  if (socketRef.current) {
                    socketRef.current.disconnect();
                    socketRef.current = null;
                  }
                  setIsWaitingPayment(false);
                  setShowQrCode(false);
                  setQrCodeData(null);
                  onPaymentCreated?.();
                  onOpenChange(false);
                }}
              >
                Close & Continue Later
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print QR Code
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Left Column - Bill Details */}
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
                  <div className="text-muted-foreground py-8 text-center">
                    No bill data available
                  </div>
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
                      <span className="text-muted-foreground">
                        Discount ({discount.toFixed(1)}%):
                      </span>
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
              <Button onClick={handleCreateAndProcessPayment} disabled={isProcessing}>
                {isProcessing
                  ? 'Processing...'
                  : `Process Payment - ${formatCurrency(totalAmount)}`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
