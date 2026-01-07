import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  RefreshCw,
  Banknote,
  CreditCard,
  Calendar,
  Hash,
  User,
  Phone,
  Table as TableIcon,
  Receipt,
  type LucideIcon,
} from 'lucide-react';
import type { Payment, PaymentStatus, PaymentMethod } from '@/lib/api/services/payments.service';

interface PaymentDetailDialogProps {
  payment: Payment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; color: string; icon: LucideIcon }
> = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  PROCESSING: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: RefreshCw,
  },
  SUCCESS: {
    label: 'Success',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  FAILED: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
  REFUNDED: {
    label: 'Refunded',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: RotateCcw,
  },
};

const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { label: string; icon: LucideIcon }> = {
  CASH: {
    label: 'Cash Payment',
    icon: Banknote,
  },
  BANKING: {
    label: 'Bank Transfer',
    icon: CreditCard,
  },
  CARD: {
    label: 'Card Payment',
    icon: CreditCard,
  },
};

export function PaymentDetailDialog({ payment, open, onOpenChange }: PaymentDetailDialogProps) {
  const statusConfig = PAYMENT_STATUS_CONFIG[payment.status];
  const methodConfig = PAYMENT_METHOD_CONFIG[payment.paymentMethod];
  const StatusIcon = statusConfig.icon;
  const MethodIcon = methodConfig.icon;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-2xl">Payment Details</DialogTitle>
            <Badge className={`${statusConfig.color} border`}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusConfig.label}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[600px] pr-4">
          <div className="space-y-6">
            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Information</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg border bg-gray-50 p-3">
                  <Hash className="mt-0.5 h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Payment ID</p>
                    <p className="font-mono text-sm break-all">{payment.id}</p>
                  </div>
                </div>

                {payment.transactionId && (
                  <div className="flex items-start gap-3 rounded-lg border bg-gray-50 p-3">
                    <Receipt className="mt-0.5 h-5 w-5 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Transaction ID</p>
                      <p className="font-mono text-sm font-medium">{payment.transactionId}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 rounded-lg border bg-gray-50 p-3">
                  <MethodIcon className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Payment Method</p>
                    <p className="text-sm font-medium">{methodConfig.label}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border bg-gray-50 p-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Created At</p>
                    <p className="text-sm">{formatDateTime(payment.createdAt)}</p>
                  </div>
                </div>

                {payment.paymentTime && (
                  <div className="flex items-start gap-3 rounded-lg border bg-green-50 p-3 sm:col-span-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Payment Completed At</p>
                      <p className="text-sm font-medium">{formatDateTime(payment.paymentTime)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Table/Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {payment.session ? 'Table & Session Info' : 'Customer Info'}
              </h3>

              {payment.session && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-lg border bg-blue-50 p-3">
                    <TableIcon className="mt-0.5 h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Table Number</p>
                      <p className="text-lg font-bold text-blue-600">
                        Table {payment.session.table.number}
                      </p>
                    </div>
                  </div>

                  {payment.session.customerCount && (
                    <div className="flex items-start gap-3 rounded-lg border bg-gray-50 p-3">
                      <User className="mt-0.5 h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Number of Guests</p>
                        <p className="font-medium">{payment.session.customerCount} guest(s)</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 rounded-lg border bg-gray-50 p-3">
                    <Hash className="mt-0.5 h-5 w-5 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Session ID</p>
                      <p className="font-mono text-sm">{payment.session.id}</p>
                    </div>
                  </div>
                </div>
              )}

              {payment.order && (
                <div className="space-y-3">
                  {payment.order.customerName && (
                    <div className="flex items-start gap-3 rounded-lg border bg-gray-50 p-3">
                      <User className="mt-0.5 h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Customer Name</p>
                        <p className="font-medium">{payment.order.customerName}</p>
                      </div>
                    </div>
                  )}

                  {payment.order.customerPhone && (
                    <div className="flex items-start gap-3 rounded-lg border bg-gray-50 p-3">
                      <Phone className="mt-0.5 h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Phone Number</p>
                        <p className="font-medium">{payment.order.customerPhone}</p>
                      </div>
                    </div>
                  )}

                  {payment.order.orderType && (
                    <div className="flex items-start gap-3 rounded-lg border bg-gray-50 p-3">
                      <Receipt className="mt-0.5 h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Order Type</p>
                        <p className="font-medium">
                          {payment.order.orderType === 'TAKE_AWAY' ? 'Takeaway' : 'Dine-in'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 rounded-lg border bg-gray-50 p-3">
                    <Hash className="mt-0.5 h-5 w-5 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Order ID</p>
                      <p className="font-mono text-sm">{payment.order.id}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Amount Breakdown */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Amount Breakdown</h3>

              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(payment.subTotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (VAT):</span>
                  <span className="font-medium">{formatCurrency(payment.tax)}</span>
                </div>

                {payment.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount:</span>
                    <span className="font-medium">-{formatCurrency(payment.discount)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(payment.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {payment.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Notes</h3>
                  <div className="rounded-lg border bg-gray-50 p-4">
                    <p className="text-sm whitespace-pre-wrap text-gray-700">{payment.notes}</p>
                  </div>
                </div>
              </>
            )}

            {/* Metadata */}
            <Separator />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Metadata</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{formatDateTime(payment.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span>{formatDateTime(payment.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
