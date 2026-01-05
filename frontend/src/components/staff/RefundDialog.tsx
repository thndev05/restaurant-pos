import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Loader2, RotateCcw } from 'lucide-react';
import { paymentsService, type Payment } from '@/lib/api/services/payments.service';
import { useToast } from '@/hooks/use-toast';

interface RefundDialogProps {
  payment: Payment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RefundDialog({ payment, open, onOpenChange, onSuccess }: RefundDialogProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for the refund',
        variant: 'destructive',
      });
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmRefund = async () => {
    setIsProcessing(true);
    try {
      await paymentsService.refundPayment(payment.id, {
        reason,
        notes: notes || undefined,
      });

      toast({
        title: 'Success',
        description: 'Payment refunded successfully',
      });

      setShowConfirmation(false);
      onOpenChange(false);
      onSuccess();

      // Reset form
      setReason('');
      setNotes('');
    } catch (error) {
      console.error('Failed to refund payment:', error);
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;

      toast({
        title: 'Error',
        description: message || 'Failed to refund payment',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!isProcessing) {
      onOpenChange(open);
      if (!open) {
        setReason('');
        setNotes('');
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-orange-600" />
              Refund Payment
            </DialogTitle>
            <DialogDescription>
              Process a refund for this payment. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Payment Summary */}
            <div className="space-y-2 rounded-lg border bg-gray-50 p-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment ID:</span>
                <span className="font-mono text-sm">{payment.id.substring(0, 8)}...</span>
              </div>
              {payment.transactionId && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-sm font-medium">{payment.transactionId}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t pt-2">
                <span className="font-medium">Refund Amount:</span>
                <span className="text-lg font-bold text-red-600">
                  {formatCurrency(payment.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment Method:</span>
                <Badge variant="outline">{payment.paymentMethod}</Badge>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-orange-600" />
              <div className="flex-1 text-sm">
                <p className="font-medium text-orange-900">Important Notice</p>
                <p className="text-orange-700">
                  Refunding this payment will update the payment status to REFUNDED.
                  {payment.paymentMethod === 'CASH'
                    ? ' Cash refunds must be processed manually at the cashier.'
                    : ' Bank refunds may take 3-5 business days to complete.'}
                </p>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                Refund Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for this refund (required)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
                className="resize-none"
              />
              <p className="text-xs text-gray-500">This will be recorded in the payment history</p>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes or comments"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDialogClose(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={isProcessing || !reason.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Process Refund
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirm Refund
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to refund this payment of{' '}
                <span className="font-bold text-red-600">
                  {formatCurrency(payment.totalAmount)}
                </span>
                ?
              </p>
              <p className="text-sm">
                <span className="font-medium">Reason:</span> {reason}
              </p>
              <p className="font-medium text-red-600">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRefund}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Refund'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
