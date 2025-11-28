import { useState } from 'react';
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
import { DollarSign, CreditCard, Building2, Banknote } from 'lucide-react';
import {
  paymentsService,
  type PaymentMethod,
  type CreatePaymentData,
} from '@/lib/api/services/payments.service';
import { useToast } from '@/hooks/use-toast';

interface CreatePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId?: string;
  orderId?: string;
  orderTotal: number;
  onPaymentCreated?: () => void;
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
}: CreatePaymentDialogProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const subTotal = orderTotal;
  const taxAmount = (subTotal * tax) / 100;
  const discountAmount = (subTotal * discount) / 100;
  const totalAmount = subTotal + taxAmount - discountAmount;

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
          transactionId: transactionId || undefined,
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
      setTransactionId('');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Process Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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

          {/* Transaction ID (for non-cash payments) */}
          {paymentMethod !== 'CASH' && (
            <div className="space-y-2">
              <Label htmlFor="transaction-id">Transaction ID (Optional)</Label>
              <Input
                id="transaction-id"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter transaction ID"
              />
            </div>
          )}

          <Separator />

          {/* Amount Breakdown */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
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
                value={tax}
                onChange={(e) => setTax(Number(e.target.value))}
              />
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div className="bg-muted space-y-2 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>{formatCurrency(subTotal)}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({tax}%):</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount ({discount}%):</span>
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
