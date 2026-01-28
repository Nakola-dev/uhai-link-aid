import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Phone, AlertCircle, Activity, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AIAssistant = () => {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

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

  const features = [
    {
      icon: Activity,
      title: 'Real-time Guidance',
      description: 'Get instant step-by-step instructions for any emergency'
    },
    {
      icon: Zap,
      title: 'Quick Response',
      description: 'AI-powered responses in seconds when every moment counts'
    },
    {
      icon: AlertCircle,
      title: 'Emergency Recognition',
      description: 'Automatically identifies the type of emergency and provides relevant help'
    }
  ];

  return (
    <DashboardLayout user={user} isAdmin={isAdmin}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Bot className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">AI First Aid Assistant</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get instant, AI-powered guidance for any medical emergency. Our assistant provides step-by-step instructions to help you act confidently when every second counts.
          </p>
        </div>

        {/* Main CTA */}
        <Card className="border-primary/50 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Need Help Right Now?</CardTitle>
            <CardDescription className="text-base">
              Describe your emergency and get immediate assistance
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <Button 
              size="lg" 
              className="w-full max-w-md h-14 text-lg"
              onClick={() => navigate('/assistant')}
            >
              <Bot className="h-5 w-5 mr-2" />
              Start AI Assistant
            </Button>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                AI Available 24/7
              </div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-1 text-amber-500" />
                Instant Response
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Emergency Notice */}
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">In a Life-Threatening Emergency</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If someone is unconscious, not breathing, or in immediate danger, call emergency services immediately:
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="destructive" size="lg">
                <Phone className="h-4 w-4 mr-2" />
                Call 999 (Emergency)
              </Button>
              <Button variant="outline" size="lg">
                <Phone className="h-4 w-4 mr-2" />
                Call 911 (Ambulance)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Describe the Situation</h4>
                <p className="text-muted-foreground">Tell the AI what's happening in simple terms</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Get Instructions</h4>
                <p className="text-muted-foreground">Receive clear, step-by-step guidance immediately</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Take Action</h4>
                <p className="text-muted-foreground">Follow the instructions while help is on the way</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistant;
