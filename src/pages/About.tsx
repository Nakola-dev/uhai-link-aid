import { Shield, Users, Heart, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Life-Saving Mission',
      description: 'Every second counts in an emergency. We provide instant access to critical medical information.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your medical data is encrypted and only accessible through your unique QR code.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Built for everyone, from individuals to healthcare providers and emergency responders.',
    },
    {
      icon: Target,
      title: 'Simple & Effective',
      description: 'No complicated setup. Just scan, view, and save lives.',
    },
  ];

  return (
    <Layout>
      <div className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">About UhaiLink</h1>
            <p className="text-xl text-muted-foreground">
              Empowering emergency responders with instant access to life-saving medical information
            </p>
          </div>

          {/* Mission Statement */}
          <Card className="mb-16 border-primary/20 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl md:text-3xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center text-lg text-muted-foreground max-w-3xl mx-auto">
              <p>
                UhaiLink was created to bridge the critical gap between medical emergencies and 
                the information needed to provide proper care. In Kenya and around the world, 
                seconds matter during medical emergencies.
              </p>
              <p>
                Our platform ensures that emergency responders, healthcare providers, and first 
                responders have immediate access to vital medical information through a simple QR code scan.
              </p>
            </CardContent>
          </Card>

          {/* Values Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="border-none shadow-card">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{value.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* How We Help */}
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-center">How We Help</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>For Individuals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>Store your medical history, allergies, medications, and emergency contacts securely.</p>
                <p>Generate a QR code that can be printed, worn, or kept on your phone.</p>
                <p>Update your information anytime, anywhere.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>For Emergency Responders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>Quick access to patient medical history without delays.</p>
                <p>View allergies and medications to avoid dangerous interactions.</p>
                <p>Contact family members instantly.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>For Healthcare Providers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>Comprehensive patient information at admission.</p>
                <p>Reduced paperwork and faster treatment.</p>
                <p>Better continuity of care.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
