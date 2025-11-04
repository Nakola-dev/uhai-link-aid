import { Link } from 'react-router-dom';
import { Shield, QrCode, Clock, Heart, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';

const Index = () => {
  const features = [
    {
      icon: QrCode,
      title: 'Instant Access',
      description: 'Emergency responders scan your QR code to instantly access critical medical information.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and only accessible through your unique QR code.',
    },
    {
      icon: Clock,
      title: 'Save Lives',
      description: 'In emergencies, every second counts. Provide crucial info when you cannot speak.',
    },
    {
      icon: Heart,
      title: 'Peace of Mind',
      description: 'Know that your medical history is always available to those who need it most.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Your Profile',
      description: 'Sign up and add your medical information, allergies, and emergency contacts.',
    },
    {
      number: '02',
      title: 'Generate QR Code',
      description: 'Get your unique QR code that links to your medical profile.',
    },
    {
      number: '03',
      title: 'Share & Stay Safe',
      description: 'Print it, wear it, or keep it on your phone. Be prepared for emergencies.',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Emergency Medical Information</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Your Life-Saving
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Medical QR Code
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              UhaiLink provides instant access to your critical medical information when you need it most. 
              Be prepared. Be safe. Save lives.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="group">
                <Link to="/auth">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose UhaiLink?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple, secure solution for medical emergencies
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center space-y-4">
                  <div className="relative inline-flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                    <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{step.number}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary to-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Secure Your Medical Information?
            </h2>
            <p className="text-lg opacity-90">
              Join thousands of users who trust UhaiLink to keep their medical information accessible in emergencies.
            </p>
            <Button size="lg" variant="secondary" asChild className="bg-white text-primary hover:bg-white/90">
              <Link to="/auth">Create Your Free Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Essential for Everyone
              </h2>
              <p className="text-lg text-muted-foreground">
                Whether you have chronic conditions, allergies, or just want to be prepared, 
                UhaiLink is your digital medical ID that's always with you.
              </p>
              <ul className="space-y-4">
                {[
                  'Store critical medical information securely',
                  'Add multiple emergency contacts',
                  'Update information anytime',
                  'Access from any smartphone',
                  'No subscription fees',
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
              <Card className="relative border-2 border-primary/20 shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <QrCode className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Sample QR Code</CardTitle>
                  <CardDescription>Instant access to medical info</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-8">
                  <div className="h-48 w-48 bg-muted rounded-lg flex items-center justify-center">
                    <QrCode className="h-32 w-32 text-muted-foreground/30" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
