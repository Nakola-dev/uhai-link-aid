import { Shield, Users, Heart, Target, Zap, Brain, Radio, MapPin, FileText, TrendingUp, Sparkles, CheckCircle2, Rocket, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';

const About = () => {
  const values = [
    {
      icon: Sparkles,
      title: 'Innovation',
      description: 'Leveraging cutting-edge AI and smart technology to revolutionize emergency response.',
    },
    {
      icon: Shield,
      title: 'Safety',
      description: 'Your security and privacy are paramount in everything we build.',
    },
    {
      icon: Heart,
      title: 'Reliability',
      description: 'Building systems you can trust when every second counts.',
    },
    {
      icon: CheckCircle2,
      title: 'Integrity',
      description: 'Committed to ethical practices and transparent operations.',
    },
    {
      icon: Users,
      title: 'Community Impact',
      description: 'Empowering communities across Africa with life-saving technology.',
    },
    {
      icon: Target,
      title: 'Accessibility',
      description: 'Making emergency assistance available to everyone, everywhere.',
    },
  ];

  const differentiators = [
    {
      icon: Brain,
      title: 'AI-Driven Triage',
      description: 'Automated emergency workflows with intelligent severity assessment',
    },
    {
      icon: Radio,
      title: 'Smart QR Identity',
      description: 'Instant medical ID access via wristbands, cards, and keychains',
    },
    {
      icon: Zap,
      title: 'Multi-Channel Assistance',
      description: 'Voice, chat, and WhatsApp-based emergency support',
    },
    {
      icon: MapPin,
      title: 'Real-Time Location',
      description: 'Automatic location sharing with emergency contacts and responders',
    },
    {
      icon: FileText,
      title: 'Integrated Reports',
      description: 'Seamless data flow between families, hospitals, and first responders',
    },
    {
      icon: TrendingUp,
      title: 'Scalable Partnerships',
      description: 'Built for universities, corporates, and community organizations',
    },
  ];

  const roadmapItems = [
    'Advanced AI agents for predictive emergency alerts',
    'Deep hospital system integrations across Africa',
    'Expanded hardware ecosystem (kiosks, wearables)',
    'Global scaling to underserved regions',
    'Real-time emergency prediction models',
    'Community emergency response networks',
  ];

  return (
    <Layout>
      <div className="py-12 md:py-20">
        <div className="container mx-auto px-4 space-y-20">
          
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="mb-4" variant="outline">
              <Rocket className="h-3 w-3 mr-1" />
              Pioneering AI-Powered Emergency Response
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              About Uhai Assist
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Building Africa's most intelligent emergency response ecosystem—powered by AI, driven by compassion.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  To use technology, AI agents, smart QR systems, and real-time intelligence to improve 
                  emergency response speed and accuracy across Kenya, Africa, and globally. Every second 
                  saved is a life protected.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  To build Africa's most reliable, scalable, and intelligent emergency-support ecosystem—
                  transforming how communities prepare for, respond to, and recover from emergencies.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Our Story */}
          <div className="max-w-4xl mx-auto">
            <Card className="border-primary/20 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary via-primary/60 to-primary" />
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-2">Our Story</CardTitle>
                <CardDescription className="text-base">How it all began</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground text-lg">
                <p>
                  Uhai Assist was born from witnessing the harsh reality of delayed emergency response 
                  across Kenya and Africa. Too many lives were lost because critical information wasn't 
                  available when it mattered most.
                </p>
                <p>
                  We saw ambulances arriving without patient history. We saw hospital staff struggling 
                  with incomplete records. We saw families helpless because responders couldn't identify 
                  allergies or existing conditions.
                </p>
                <p>
                  These weren't just statistics—they were our neighbors, our families, our community. 
                  So we built Uhai Assist: an AI-powered platform that ensures vital medical information 
                  is instantly accessible through a simple scan, supported by intelligent triage and 
                  real-time assistance.
                </p>
                <p className="font-semibold text-foreground">
                  From a local challenge to a continental solution—this is our story.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* What Makes Us Different */}
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Makes Us Different</h2>
              <p className="text-xl text-muted-foreground">
                Technology and compassion working together
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {differentiators.map((item, index) => (
                <Card key={index} className="border-none shadow-card hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{item.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Our Values */}
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
              <p className="text-xl text-muted-foreground">
                The principles that guide everything we do
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

          {/* Why It Matters */}
          <div className="max-w-4xl mx-auto">
            <Card className="border-primary/20 shadow-lg bg-gradient-to-br from-card to-muted/30">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-2">Why It Matters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">60%</div>
                    <p className="text-muted-foreground">Faster emergency response times</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
                    <p className="text-muted-foreground">Lives potentially impacted</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                    <p className="text-muted-foreground">Always available AI assistance</p>
                  </div>
                </div>
                <div className="space-y-4 text-muted-foreground text-center max-w-2xl mx-auto">
                  <p className="text-lg">
                    Every minute counts in an emergency. Our platform bridges the critical gap between 
                    crisis and care, ensuring that help arrives informed, prepared, and ready to save lives.
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    We're not just building technology—we're protecting communities, empowering responders, 
                    and giving families peace of mind.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Section */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Team</h2>
              <p className="text-xl text-muted-foreground">
                Passionate innovators dedicated to saving lives
              </p>
            </div>
            <Card className="border-primary/20 shadow-lg">
              <CardContent className="py-12 text-center">
                <Users className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Meet the Founders</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Our founding team combines expertise in AI, healthcare, emergency response, and 
                  social impact. United by a shared mission to transform emergency care across Africa.
                </p>
                <Badge variant="secondary" className="text-base px-4 py-2">
                  Team profiles coming soon
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Future Roadmap */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Future Roadmap</h2>
              <p className="text-xl text-muted-foreground">
                Where we're heading next
              </p>
            </div>
            <Card className="border-primary/20 shadow-lg">
              <CardContent className="py-8">
                <div className="grid md:grid-cols-2 gap-4">
                  {roadmapItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                      <Rocket className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="max-w-4xl mx-auto">
            <Card className="border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="py-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">Join the Movement</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Be part of Africa's emergency response revolution. Whether you're an organization, 
                  institution, or early adopter—there's a place for you in our mission.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button size="lg" asChild>
                    <Link to="/contact">Partner With Us</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/services">Explore Solutions</Link>
                  </Button>
                </div>
                <div className="pt-8 flex flex-wrap justify-center gap-4">
                  <Badge variant="secondary" className="text-sm px-4 py-2">
                    Universities
                  </Badge>
                  <Badge variant="secondary" className="text-sm px-4 py-2">
                    Corporates
                  </Badge>
                  <Badge variant="secondary" className="text-sm px-4 py-2">
                    Healthcare Providers
                  </Badge>
                  <Badge variant="secondary" className="text-sm px-4 py-2">
                    Community Organizations
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default About;
