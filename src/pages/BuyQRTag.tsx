import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Check, Star, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const BuyQRTag = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const [profileRes, adminRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.rpc('has_role', { _user_id: session.user.id, _role: 'admin' })
      ]);

      if (profileRes.data) setUser(profileRes.data);
      if (adminRes.data !== null) setIsAdmin(adminRes.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleOrderClick = (productName: string) => {
    toast({
      title: "Coming Soon!",
      description: `${productName} ordering will be available soon. We'll notify you when it's ready.`,
    });
  };

  const products = [
    {
      name: 'QR Card',
      price: 'KSh 500',
      description: 'Wallet-sized emergency ID card with your medical profile QR code',
      features: [
        'Durable plastic card',
        'Water-resistant',
        'Fits in any wallet',
        'Lifetime QR code access',
        'Free profile updates'
      ],
      image: '💳',
      popular: false
    },
    {
      name: 'QR Wristband',
      price: 'KSh 800',
      description: 'Comfortable silicone wristband with embedded QR code for instant access',
      features: [
        'Medical-grade silicone',
        'Adjustable size',
        '100% waterproof',
        'Lifetime QR code access',
        'Free profile updates',
        'Multiple color options'
      ],
      image: '⌚',
      popular: true
    },
    {
      name: 'Complete Bundle',
      price: 'KSh 1,200',
      description: 'Get both the card and wristband at a discounted price',
      features: [
        'QR Card included',
        'QR Wristband included',
        'Save KSh 100',
        'Lifetime QR code access',
        'Free profile updates',
        'Priority support'
      ],
      image: '🎁',
      popular: false
    }
  ];

  return (
    <DashboardLayout user={user} isAdmin={isAdmin}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Get Your Emergency QR Tag</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Carry your medical profile everywhere. In an emergency, first responders can scan your QR code to access your vital information instantly.
          </p>
        </div>

        {/* Products */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden ${product.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {product.popular && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="text-6xl mb-4">{product.image}</div>
                <CardTitle className="text-2xl">{product.name}</CardTitle>
                <div className="text-3xl font-bold text-primary my-2">{product.price}</div>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {product.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full"
                  variant={product.popular ? 'default' : 'outline'}
                  onClick={() => handleOrderClick(product.name)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Order Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Why You Need This</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">⚡ Instant Access</h4>
                <p className="text-muted-foreground">
                  Emergency responders can scan your QR code to instantly view your medical history, allergies, and emergency contacts.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">🔒 Secure & Private</h4>
                <p className="text-muted-foreground">
                  Your information is encrypted and only accessible through your unique QR code. You control what information is shared.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">♾️ Always Updated</h4>
                <p className="text-muted-foreground">
                  Update your profile anytime through the app. Your QR code never changes, but the information stays current.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">🌍 Works Anywhere</h4>
                <p className="text-muted-foreground">
                  No app required to scan. Works with any smartphone camera in Kenya and around the world.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle>Payment Options</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We accept the following payment methods for your convenience:
            </p>
            <div className="flex flex-wrap gap-4">
              <Badge variant="outline" className="text-base py-2 px-4">M-PESA</Badge>
              <Badge variant="outline" className="text-base py-2 px-4">Visa/Mastercard</Badge>
              <Badge variant="outline" className="text-base py-2 px-4">Bank Transfer</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Free delivery within Nairobi. Countrywide shipping available.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BuyQRTag;
