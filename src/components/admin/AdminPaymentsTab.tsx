import { CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminPaymentsTabProps {
  onUpdate: () => void;
}

/**
 * There is no payments table or payment-provider integration yet, so this tab
 * states that plainly instead of showing sample transactions.
 */
export const AdminPaymentsTab = (_props: AdminPaymentsTabProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <CreditCard className="h-5 w-5" aria-hidden="true" />
        Payments
      </CardTitle>
      <CardDescription>Orders for QR cards and tags</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="rounded-lg border border-dashed p-10 text-center space-y-2">
        <p className="font-medium">Payments are not connected yet</p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          No payment provider (such as M-Pesa) is integrated and no payments table exists, so there are no
          transactions to show. Ordering in the app currently shows a "coming soon" notice.
        </p>
      </div>
    </CardContent>
  </Card>
);
