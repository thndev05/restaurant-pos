import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RefreshCw,
  Search,
  Eye,
  DollarSign,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Banknote,
  Download,
  RotateCcw,
} from 'lucide-react';
import {
  paymentsService,
  type Payment,
  type PaymentStatus,
  type PaymentMethod,
} from '@/lib/api/services/payments.service';
import { useToast } from '@/hooks/use-toast';
import { PaymentDetailDialog } from '@/components/staff/PaymentDetailDialog';
import { RefundDialog } from '@/components/staff/RefundDialog';
import type { LucideIcon } from 'lucide-react';

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

const PAYMENT_METHOD_CONFIG: Record<
  PaymentMethod,
  { label: string; icon: LucideIcon; color: string }
> = {
  CASH: {
    label: 'Cash',
    icon: Banknote,
    color: 'text-green-600',
  },
  BANKING: {
    label: 'Bank Transfer',
    icon: CreditCard,
    color: 'text-blue-600',
  },
  CARD: {
    label: 'Card',
    icon: CreditCard,
    color: 'text-purple-600',
  },
};

export default function PaymentManagementPage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<PaymentStatus | 'ALL'>('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [paymentToRefund, setPaymentToRefund] = useState<Payment | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await paymentsService.getAllPayments(page, 20);
      setPayments(result.data);
      setTotalPages(result.meta.totalPages);
    } catch (error) {
      console.error('Failed to load payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payments',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailDialog(true);
  };

  const handleRefundClick = (payment: Payment) => {
    setPaymentToRefund(payment);
    setShowRefundDialog(true);
  };

  const handleRefundSuccess = () => {
    setShowRefundDialog(false);
    setPaymentToRefund(null);
    loadPayments();
  };

  const handleUpdateStatus = async (paymentId: string, newStatus: PaymentStatus) => {
    setIsUpdatingStatus(true);
    try {
      await paymentsService.updatePaymentStatus(paymentId, newStatus);
      toast({
        title: 'Success',
        description: `Payment status updated to ${newStatus}`,
      });
      loadPayments();
    } catch (error) {
      console.error('Failed to update payment status:', error);
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast({
        title: 'Error',
        description: message || 'Failed to update payment status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleExportCSV = () => {
    const csvData = filteredPayments.map((payment) => ({
      'Transaction ID': payment.transactionId || 'N/A',
      Date: new Date(payment.createdAt).toLocaleString(),
      Amount: formatCurrency(payment.totalAmount),
      Status: payment.status,
      Method: payment.paymentMethod,
      'Table/Customer': payment.session
        ? `Table ${payment.session.table.number}`
        : payment.order?.customerName || 'N/A',
      Notes: payment.notes || '',
    }));

    const headers = Object.keys(csvData[0] || {});
    const csv = [
      headers.join(','),
      ...csvData.map((row) =>
        headers.map((header) => `"${row[header as keyof typeof row]}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Payments exported to CSV',
    });
  };

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.session && payment.session.table.number.toString().includes(searchQuery)) ||
      payment.order?.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.order?.customerPhone?.includes(searchQuery) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = activeTab === 'ALL' || payment.status === activeTab;

    // Payment method filter
    const matchesMethod =
      paymentMethodFilter === 'ALL' || payment.paymentMethod === paymentMethodFilter;

    // Date filter
    const paymentDate = new Date(payment.createdAt);
    const matchesStartDate = !startDate || paymentDate >= new Date(startDate);
    const matchesEndDate = !endDate || paymentDate <= new Date(endDate);

    return matchesSearch && matchesStatus && matchesMethod && matchesStartDate && matchesEndDate;
  });

  // Calculate stats
  const stats = {
    totalRevenue: payments
      .filter((p) => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + (parseFloat(p.totalAmount?.toString() || '0') || 0), 0),
    totalCount: payments.length,
    pendingCount: payments.filter((p) => p.status === 'PENDING').length,
    successCount: payments.filter((p) => p.status === 'SUCCESS').length,
    failedCount: payments.filter((p) => p.status === 'FAILED').length,
    refundedCount: payments.filter((p) => p.status === 'REFUNDED').length,
    averageTransaction:
      payments.filter((p) => p.status === 'SUCCESS').length > 0
        ? payments
            .filter((p) => p.status === 'SUCCESS')
            .reduce((sum, p) => sum + (parseFloat(p.totalAmount?.toString() || '0') || 0), 0) /
          payments.filter((p) => p.status === 'SUCCESS').length
        : 0,
    successRate:
      payments.length > 0
        ? (payments.filter((p) => p.status === 'SUCCESS').length / payments.length) * 100
        : 0,
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(numAmount || 0);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Payment Management</h1>
          <p className="text-muted-foreground">Monitor and manage all payment transactions</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            disabled={filteredPayments.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={loadPayments} variant="outline" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-muted-foreground text-xs">From successful payments</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCount}</div>
            <p className="text-muted-foreground text-xs">All transactions</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCount}</div>
            <p className="text-muted-foreground text-xs">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageTransaction)}</div>
            <p className="text-muted-foreground text-xs">Per successful payment</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
            <p className="text-muted-foreground text-xs">Payment success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2 p-4 shadow-md">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by transaction ID, table, or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Payment Method Filter */}
            <Select
              value={paymentMethodFilter}
              onValueChange={(value) => setPaymentMethodFilter(value as PaymentMethod | 'ALL')}
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Methods</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="BANKING">Bank Transfer</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setSearchQuery('');
                setPaymentMethodFilter('ALL');
                setActiveTab('ALL');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Status Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as PaymentStatus | 'ALL')}
      >
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="ALL">All ({payments.length})</TabsTrigger>
          <TabsTrigger value="PENDING">Pending ({stats.pendingCount})</TabsTrigger>
          <TabsTrigger value="SUCCESS">Success ({stats.successCount})</TabsTrigger>
          <TabsTrigger value="FAILED">Failed ({stats.failedCount})</TabsTrigger>
          <TabsTrigger value="REFUNDED">Refunded ({stats.refundedCount})</TabsTrigger>
          <TabsTrigger value="PROCESSING">Processing</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CreditCard className="mb-4 h-12 w-12 text-gray-400" />
                <p className="text-lg font-medium">No payments found</p>
                <p className="text-muted-foreground text-sm">
                  Try adjusting your filters or search query
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPayments.map((payment) => {
                const statusConfig = PAYMENT_STATUS_CONFIG[payment.status];
                const methodConfig = PAYMENT_METHOD_CONFIG[payment.paymentMethod];
                const StatusIcon = statusConfig.icon;
                const MethodIcon = methodConfig.icon;

                return (
                  <Card key={payment.id} className="border-2 transition-shadow hover:shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {payment.session
                              ? `Table ${payment.session.table.number}`
                              : payment.order?.customerName || 'Takeaway Order'}
                          </CardTitle>
                          <p className="text-muted-foreground text-sm">
                            {formatDateTime(payment.createdAt)}
                          </p>
                        </div>
                        <Badge className={`${statusConfig.color} border`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Amount */}
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                        <span className="text-sm font-medium">Total Amount:</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(payment.totalAmount)}
                        </span>
                      </div>

                      {/* Payment Method */}
                      <div className="flex items-center gap-2">
                        <MethodIcon className={`h-4 w-4 ${methodConfig.color}`} />
                        <span className="text-sm font-medium">{methodConfig.label}</span>
                      </div>

                      {/* Transaction ID */}
                      {payment.transactionId && (
                        <div className="text-muted-foreground text-xs">
                          <span className="font-medium">TX:</span> {payment.transactionId}
                        </div>
                      )}

                      {/* Customer Info */}
                      {payment.order && (
                        <div className="text-sm">
                          <p className="font-medium">{payment.order.customerName}</p>
                          {payment.order.customerPhone && (
                            <p className="text-muted-foreground text-xs">
                              {payment.order.customerPhone}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Session Info */}
                      {payment.session && payment.session.customerCount && (
                        <div className="text-muted-foreground text-sm">
                          {payment.session.customerCount} guest(s)
                        </div>
                      )}

                      {/* Actions */}
                      <div className="space-y-2 pt-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPayment(payment)}
                            className="flex-1"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          {payment.status === 'SUCCESS' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRefundClick(payment)}
                              className="flex-1"
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Refund
                            </Button>
                          )}
                        </div>
                        {payment.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(payment.id, 'SUCCESS')}
                              disabled={isUpdatingStatus}
                              className="flex-1 border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Confirm
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(payment.id, 'FAILED')}
                              disabled={isUpdatingStatus}
                              className="flex-1 border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && filteredPayments.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      {selectedPayment && (
        <PaymentDetailDialog
          payment={selectedPayment}
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
        />
      )}

      {/* Refund Dialog */}
      {paymentToRefund && (
        <RefundDialog
          payment={paymentToRefund}
          open={showRefundDialog}
          onOpenChange={setShowRefundDialog}
          onSuccess={handleRefundSuccess}
        />
      )}
    </div>
  );
}
