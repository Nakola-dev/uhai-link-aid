import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface AdminQRProductsTabProps {
  onUpdate: () => void;
}

export const AdminQRProductsTab = ({ onUpdate }: AdminQRProductsTabProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from('qr_products').select('*'),
        supabase.from('qr_orders').select('*, profiles(full_name)').order('created_at', { ascending: false })
      ]);

      if (productsRes.error) throw productsRes.error;
      if (ordersRes.error) throw ordersRes.error;

      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (error) {
      console.error('Error fetching QR data:', error);
      toast.error('Failed to load QR products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>QR Products</CardTitle>
          <CardDescription>Manage QR wristbands, cards, and other products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center py-8">
                No products available yet
              </p>
            ) : (
              products.map((product) => (
                <Card key={product.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription>{product.product_type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Price:</span>
                        <span className="font-semibold">KES {product.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Stock:</span>
                        <Badge variant={product.stock_quantity > 10 ? 'default' : 'destructive'}>
                          {product.stock_quantity}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>QR product orders from users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No orders yet</p>
            ) : (
              orders.slice(0, 10).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{order.profiles?.full_name || 'Unknown User'}</p>
                    <p className="text-sm text-muted-foreground">
                      Order #{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">KES {order.total_price}</p>
                      <p className="text-sm text-muted-foreground">Qty: {order.quantity}</p>
                    </div>
                    <Badge
                      variant={
                        order.order_status === 'delivered'
                          ? 'default'
                          : order.order_status === 'cancelled'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {order.order_status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};