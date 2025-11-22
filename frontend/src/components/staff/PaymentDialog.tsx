import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Banknote, Building2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PaymentMethod } from '@/lib/api/services';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  totalAmount: number;
  subTotal: number;
  tax?: number;
  discount?: number;
  onPaymentSuccess?: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const PAYMENT_METHODS: Array<{
  value: PaymentMethod;
  label: string;
  icon: typeof Banknote;
  available: boolean;
}> = [
  {
    value: 'CASH',
    label: 'Cash',
    icon: Banknote,
    available: true,
  },
  {
    value: 'CARD',
    label: 'Card',
    icon: CreditCard,
    available: false,
  },
  {
    value: 'BANKING',
    label: 'Banking',
    icon: Building2,
    available: false,
  },
];

export function PaymentDialog({
  open,
  onOpenChange,
  sessionId,
  totalAmount,
  subTotal,
  tax = 0,
  discount = 0,
  onPaymentSuccess,
}: PaymentDialogProps) {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setPaymentMethod('CASH');
      setCashReceived('');
      setNotes('');
      setPaymentId(null);
    }
  }, [open]);

  const selectedMethod = PAYMENT_METHODS.find((m) => m.value === paymentMethod);
  const cashReceivedAmount = parseFloat(cashReceived) || 0;
  const changeAmount = cashReceivedAmount - totalAmount;

  const handleCreatePayment = async () => {
    // Validate cash payment
    if (paymentMethod === 'CASH') {
      if (!cashReceived || cashReceivedAmount < totalAmount) {
        toast({
          title: 'Invalid Amount',
          description: 'Cash received must be greater than or equal to the total amount',
          variant: 'destructive',
        });
        return;
      }
    }

    // Check if non-cash payment methods are selected
    if (paymentMethod !== 'CASH' && !selectedMethod?.available) {
      toast({
        title: 'Coming Soon',
        description: `${selectedMethod?.label} payment method is not available yet. Please use Cash payment.`,
        variant: 'default',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { paymentsService } = await import('@/lib/api/services');

      // Step 1: Create payment record
      const createResponse = await paymentsService.createPayment({
        sessionId,
        totalAmount,
        subTotal,
        tax,
        discount,
        paymentMethod,
        notes: notes || undefined,
      });

      const createdPaymentId = createResponse.data.id;
      setPaymentId(createdPaymentId);

      // Step 2: Process the payment (only for CASH, others would need additional processing)
      if (paymentMethod === 'CASH') {
        await paymentsService.processPayment(createdPaymentId, {
          notes: notes || undefined,
        });

        toast({
          title: 'Payment Successful',
          description: `Payment of ${formatCurrency(totalAmount)} has been processed successfully.`,
        });

        // Call success callback and close dialog
        onPaymentSuccess?.();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to process payment:', error);
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast({
        title: 'Payment Failed',
        description: message || 'Failed to process payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Process Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Summary */}
          <div className="rounded-lg bg-slate-50 p-4">
            <h3 className="mb-3 font-semibold text-slate-700">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subTotal)}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax:</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span className="font-medium">-{formatCurrency(discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-semibold text-slate-700">Total:</span>
                <span className="font-bold text-slate-900">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            >
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{method.label}</span>
                        {!method.available && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedMethod && !selectedMethod.available && (
              <div className="mt-2 flex items-start gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-800">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p>This payment method is coming soon. Please use Cash payment for now.</p>
              </div>
            )}
          </div>

          {/* Cash Payment Fields */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-4 rounded-lg border border-slate-200 p-4">
              <div className="space-y-2">
                <Label htmlFor="cashReceived">Cash Received *</Label>
                <Input
                  id="cashReceived"
                  type="number"
                  min="0"
                  step="1000"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="Enter cash amount received"
                />
              </div>

              {cashReceived && cashReceivedAmount >= totalAmount && (
                <div className="rounded-md bg-emerald-50 p-3">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Change to Return:</span>
                  </div>
                  <p className="mt-1 text-xl font-bold text-emerald-900">
                    {formatCurrency(changeAmount)}
                  </p>
                </div>
              )}

              {cashReceived && cashReceivedAmount < totalAmount && (
                <div className="rounded-md bg-red-50 p-3">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Insufficient Amount</span>
                  </div>
                  <p className="mt-1 text-sm text-red-600">
                    Need {formatCurrency(totalAmount - cashReceivedAmount)} more
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this payment..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleCreatePayment}
            disabled={
              isProcessing ||
              (paymentMethod === 'CASH' && (!cashReceived || cashReceivedAmount < totalAmount))
            }
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isProcessing ? 'Processing...' : 'Process Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
