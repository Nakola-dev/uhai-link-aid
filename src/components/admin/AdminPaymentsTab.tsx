import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, TrendingUp, DollarSign, Receipt } from 'lucide-react';

interface AdminPaymentsTabProps {
  onUpdate: () => void;
}

// Mock data for demonstration - will be replaced when payments table is created
const mockPayments = [
  {
    id: '1',
    transaction_id: 'TXN-001234',
    amount: 500,
    currency: 'KES',
    payment_status: 'completed',
    payment_method: 'M-Pesa',
    description: 'QR Wristband Purchase',
    user_name: 'John Doe',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    transaction_id: 'TXN-001235',
    amount: 2500,
    currency: 'KES',
    payment_status: 'completed',
    payment_method: 'Card',
    description: 'Premium Subscription',
    user_name: 'Jane Smith',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    transaction_id: 'TXN-001236',
    amount: 15000,
    currency: 'KES',
    payment_status: 'pending',
    payment_method: 'Bank Transfer',
    description: 'Corporate Plan - 10 Users',
    user_name: 'Acme Corp',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const AdminPaymentsTab = ({ onUpdate }: AdminPaymentsTabProps) => {
  const [payments] = useState(mockPayments);

  const totalRevenue = payments
    .filter((p) => p.payment_status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">KES {totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{payments.length}</p>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/50 rounded-lg">
                <CreditCard className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {payments.filter((p) => p.payment_status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">+12%</p>
                <p className="text-sm text-muted-foreground">Growth</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Transactions
          </CardTitle>
          <CardDescription>View and manage all payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No payments recorded
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">
                        {payment.transaction_id}
                      </TableCell>
                      <TableCell>{payment.user_name}</TableCell>
                      <TableCell>{payment.description}</TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {payment.currency} {payment.amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.payment_method}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.payment_status === 'completed'
                              ? 'default'
                              : payment.payment_status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {payment.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Payment tracking will be fully functional once the database migration is complete.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
