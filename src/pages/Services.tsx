import { Heart, Shield, BookOpen, CreditCard, Watch, Award } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: Heart,
      title: 'AI First Aid Guidance',
      description: 'Instant, step-by-step emergency instructions powered by AI to guide you through critical situations with confidence.',
      cta: 'See How It Works',
    },
    {
      icon: Shield,
      title: 'Emergency Response Integration',
      description: 'Seamlessly connect with emergency services and responders. Your medical profile is instantly accessible when it matters most.',
      cta: 'Learn More',
    },
    {
      icon: BookOpen,
      title: 'Training & Education Programs',
      description: 'Comprehensive first aid courses and certifications. Build your skills to become a confident first responder.',
      cta: 'Join Our Lifesavers Program',
    },
  ];

  const products = [
    {
      name: 'Smart ID Card',
      description: 'Medical QR card with instant profile access',
      price: 'KES 500',
      image: '🪪',
    },
    {
      name: 'AI Wristband',
      description: 'Wearable emergency alert device',
      price: 'KES 2,500',
      image: '⌚',
    },
    {
      name: 'Achievement Prizes',
      description: 'Earn rewards for training completion',
      price: 'Free with course',
      image: '🏆',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-accent/10 via-background to-background py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
            <h1 className="font-poppins text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Our Services
            </h1>
            <p className="font-poppins text-xl md:text-2xl text-muted-foreground font-light">
              Empowering You to Act When Every Second Counts
            </p>
          </div>
        </div>
        
        {/* Decorative gradient orbs */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </section>

      {/* Core Services Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card 
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-border bg-card/50 backdrop-blur"
                >
                  <CardHeader>
                    <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 w-fit group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="font-poppins text-2xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="font-poppins text-base leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full font-poppins group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      {service.cta}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Custom Safety Gear Section */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-4">
            <h2 className="font-poppins text-3xl md:text-5xl font-bold text-foreground">
              Custom Safety Gear for You
            </h2>
            <p className="font-poppins text-lg text-muted-foreground max-w-2xl mx-auto">
              Personalized emergency tools designed to keep you safe and prepared
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {products.map((product, index) => (
              <Card 
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center text-8xl group-hover:scale-110 transition-transform duration-300">
                  {product.image}
                </div>
                <CardHeader>
                  <CardTitle className="font-poppins text-xl">{product.name}</CardTitle>
                  <CardDescription className="font-poppins">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-poppins text-2xl font-semibold text-primary">
                    {product.price}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full font-poppins"
                    onClick={() => navigate('/dashboard/user/profile')}
                  >
                    Get Yours
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="font-poppins text-3xl md:text-4xl font-bold text-foreground">
              Ready to Get Started?
            </h2>
            <p className="font-poppins text-lg text-muted-foreground">
              Join thousands of people who trust UhaiLink for their emergency preparedness
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="font-poppins text-lg"
                onClick={() => navigate('/auth')}
              >
                Create Your Profile
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="font-poppins text-lg"
                onClick={() => navigate('/about')}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
