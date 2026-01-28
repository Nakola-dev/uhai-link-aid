import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, QrCode, Clock, Heart, CheckCircle2, ArrowRight, Activity, Award, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/shared/Layout';

const Index = () => {
  const [livesAssisted, setLivesAssisted] = useState(0);
  const [trainingSessions, setTrainingSessions] = useState(0);
  const [emergencyCalls, setEmergencyCalls] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCounter(setLivesAssisted, 15420, 2000);
          animateCounter(setTrainingSessions, 8750, 2000);
          animateCounter(setEmergencyCalls, 23680, 2000);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateCounter = (setter: (val: number) => void, target: number, duration: number) => {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setter(target);
        clearInterval(timer);
      } else {
        setter(Math.floor(current));
      }
    }, 16);
  };

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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-2 h-2 bg-primary/20 rounded-full animate-pulse" />
          <div className="absolute top-40 right-20 w-3 h-3 bg-secondary/20 rounded-full animate-pulse delay-300" />
          <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-accent/20 rounded-full animate-pulse delay-700" />
          <div className="absolute bottom-20 right-1/3 w-3 h-3 bg-primary/20 rounded-full animate-pulse delay-500" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full animate-fade-in">
              <Heart className="h-4 w-4 text-primary animate-heartbeat" />
              <span className="text-sm font-medium text-primary">Emergency Medical Information</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight animate-slide-in-left">
              Empowering You to Act
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                When Every Second Counts
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl animate-slide-in-right">
              UhaiLink provides instant access to your critical medical information when you need it most. 
              Be prepared. Be safe. Save lives.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
              <Button size="lg" asChild className="group hover:scale-105 transition-all shadow-lg hover:shadow-xl">
                <Link to="/auth">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="hover:scale-105 transition-all">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section ref={statsRef} className="py-16 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-3 group cursor-pointer">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2 group-hover:scale-110 transition-transform">
                <Activity className="h-8 w-8 text-primary group-hover:animate-pulse" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-primary">
                {livesAssisted.toLocaleString()}+
              </div>
              <div className="text-lg text-muted-foreground">Lives Assisted</div>
            </div>
            
            <div className="text-center space-y-3 group cursor-pointer">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-2 group-hover:scale-110 transition-transform">
                <Award className="h-8 w-8 text-secondary group-hover:animate-pulse" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-secondary">
                {trainingSessions.toLocaleString()}+
              </div>
              <div className="text-lg text-muted-foreground">Training Sessions</div>
            </div>
            
            <div className="text-center space-y-3 group cursor-pointer">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-2 group-hover:scale-110 transition-transform">
                <Phone className="h-8 w-8 text-accent group-hover:animate-pulse" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-accent">
                {emergencyCalls.toLocaleString()}+
              </div>
              <div className="text-lg text-muted-foreground">Emergency Calls Guided</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose UhaiLink?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple, secure solution for medical emergencies
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-none shadow-card hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{feature.title}</CardTitle>
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
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative animate-fade-in" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="text-center space-y-4 group cursor-pointer">
                  <div className="relative inline-flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                    <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                      <span className="text-2xl font-bold text-white">{step.number}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-secondary to-primary relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full animate-pulse" />
          <div className="absolute bottom-10 right-10 w-32 h-32 border-2 border-white rounded-full animate-pulse delay-500" />
          <div className="absolute top-1/2 left-1/2 w-40 h-40 border-2 border-white rounded-full animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center text-white space-y-6 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Secure Your Medical Information?
            </h2>
            <p className="text-lg opacity-90">
              Join thousands of users who trust UhaiLink to keep their medical information accessible in emergencies.
            </p>
            <Button size="lg" variant="secondary" asChild className="bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all group shadow-xl">
              <Link to="/auth">
                Create Your Free Account
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6 animate-slide-in-left">
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
                  <li key={index} className="flex items-start space-x-3 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative animate-slide-in-right">
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
              <Card className="relative border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
                <CardHeader className="text-center">
                  <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <QrCode className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Sample QR Code</CardTitle>
                  <CardDescription>Instant access to medical info</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-8">
                  <div className="h-48 w-48 bg-muted rounded-lg flex items-center justify-center hover:scale-105 transition-transform">
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
