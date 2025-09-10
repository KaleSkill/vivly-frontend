import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  RefreshCw,
  CreditCard,
  Banknote,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { adminApi } from '@/api/api';
import { toast } from 'sonner';

export const PaymentTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    provider: '',
    search: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, pagination.limit, filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.provider && { provider: filters.provider })
      });

      const response = await adminApi.adminPayments.getAllPaymentTransactions(params);
      
      if (response.data.success) {
        setTransactions(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      success: { variant: 'default', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { variant: 'destructive', className: 'bg-red-100 text-red-800', icon: X },
      pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      cancelled: { variant: 'secondary', className: 'bg-gray-100 text-gray-800', icon: AlertCircle },
      refunded: { variant: 'outline', className: 'bg-blue-100 text-blue-800', icon: RefreshCw }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getProviderBadge = (provider) => {
    const providerConfig = {
      razorpay: { className: 'bg-blue-100 text-blue-800', icon: CreditCard },
      cashfree: { className: 'bg-purple-100 text-purple-800', icon: CreditCard },
      cod: { className: 'bg-green-100 text-green-800', icon: Banknote }
    };

    const config = providerConfig[provider] || providerConfig.cod;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {provider.toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleExport = () => {
    // TODO: Implement CSV export functionality
    toast.info('Export functionality coming soon');
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Transaction Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by transaction ID, order ID..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange('status', value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Provider</label>
              <Select value={filters.provider || "all"} onValueChange={(value) => handleFilterChange('provider', value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All providers</SelectItem>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="cashfree">Cashfree</SelectItem>
                  <SelectItem value="cod">Cash on Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={fetchTransactions} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Showing {transactions.length} of {pagination.total} transactions
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <AlertCircle className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No transactions found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell className="font-mono text-sm">
                          {transaction.transactionId}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {transaction.orderId}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{transaction.user?.name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{transaction.user?.email || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatAmount(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          {getProviderBadge(transaction.provider)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
