import { 
  Heart, Shield, BookOpen, CreditCard, Watch, Award, 
  Users, Building2, GraduationCap, ShoppingBag, Sparkles,
  Phone, MapPin, Bell, Brain, Zap, CheckCircle2, Star,
  Download, Video, FileText, Calendar, Activity, Lock
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useNavigate } from 'react-router-dom';

const Services = () => {
  const navigate = useNavigate();

  // Individual Services
  const individualFeatures = [
    { icon: Heart, title: 'Personal Medical Profile', desc: 'Secure cloud storage for your health data' },
    { icon: Brain, title: 'AI First Aid Assistant', desc: 'Chat & voice-guided emergency help' },
    { icon: Activity, title: 'Symptom Analysis', desc: 'Pre-emergency triage and severity scoring' },
    { icon: Phone, title: 'Emergency Contacts', desc: 'Quick access directory for loved ones' },
    { icon: MapPin, title: 'Location Services', desc: 'Auto-locate nearby hospitals and responders' },
    { icon: Bell, title: 'Safety Alerts', desc: 'Automatic notifications to emergency contacts' },
  ];

  const premiumFeatures = [
    'Family safety bundles (up to 5 members)',
    'Priority AI support (faster response)',
    'Offline first aid modules',
    'Emergency location sharing with live tracking',
    'Advanced health analytics dashboard',
    '24/7 telemedicine consultation access',
  ];

  // Products
  const products = [
    { 
      name: 'QR Wristband', 
      price: 'KES 2,500', 
      image: '⌚',
      features: ['Waterproof', 'Adjustable', 'Scannable QR', '24/7 Access'],
      popular: true
    },
    { 
      name: 'QR ID Card', 
      price: 'KES 500', 
      image: '🪪',
      features: ['Wallet-sized', 'Durable plastic', 'Instant profile access', 'Lightweight'],
      popular: false
    },
    { 
      name: 'QR Keychain Tag', 
      price: 'KES 300', 
      image: '🔑',
      features: ['Compact', 'Metal casing', 'Portable', 'Secure'],
      popular: false
    },
  ];

  // Corporate Features
  const corporateFeatures = [
    { icon: Users, title: 'Bulk Employee Onboarding', desc: 'Generate QR medical IDs for entire teams' },
    { icon: Shield, title: 'Workplace Safety Suite', desc: 'Emergency readiness and compliance tools' },
    { icon: Brain, title: 'Corporate AI Assistant', desc: 'Dedicated AI support for your organization' },
    { icon: BookOpen, title: 'Training Packages', desc: 'Safety awareness and first aid programs' },
    { icon: Activity, title: 'Custom Dashboard', desc: 'HR & Safety Manager analytics portal' },
    { icon: Zap, title: 'API Integration', desc: 'Connect with insurance or health systems' },
  ];

  // University Features
  const universityFeatures = [
    'Bulk QR wristbands for students and staff',
    'Full emergency data management dashboard',
    'Campus safety + AI first aid training',
    'Integration with university health centers',
    'On-campus emergency kiosk stations',
    'Student-friendly pricing and payment plans',
  ];

  // AI Features
  const aiFeatures = [
    { icon: Brain, title: 'AI First Aid Guide', desc: 'Step-by-step emergency instructions powered by AI' },
    { icon: Activity, title: 'Emergency Triage', desc: 'AI severity scoring and prioritization' },
    { icon: Phone, title: 'Voice Chatbot', desc: 'Hands-free emergency guidance' },
    { icon: MapPin, title: 'Auto-Location', desc: 'Geofencing for nearby hospitals and responders' },
    { icon: Sparkles, title: 'Personalized Recommendations', desc: 'AI-driven safety insights based on your profile' },
    { icon: Bell, title: 'Smart Alerts', desc: 'Automatic notifications to family and emergency contacts' },
  ];

  // Pricing Plans
  const plans = [
    {
      name: 'Individual Free',
      price: 'KES 0',
      period: '/month',
      features: [
        'Basic medical profile',
        'AI first aid assistant (limited)',
        '3 emergency contacts',
        'Public tutorial access',
        'QR code generation',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Individual Premium',
      price: 'KES 499',
      period: '/month',
      features: [
        'Everything in Free',
        'Unlimited AI assistant usage',
        'Offline first aid modules',
        'Family bundle (up to 5)',
        'Priority support',
        'Advanced analytics',
      ],
      cta: 'Upgrade Now',
      popular: true,
    },
    {
      name: 'Corporate',
      price: 'Custom',
      period: 'pricing',
      features: [
        'Bulk employee onboarding',
        'Custom admin dashboard',
        'API integration',
        'Training packages',
        'Dedicated account manager',
        'Volume discounts available',
      ],
      cta: 'Request Quote',
      popular: false,
    },
    {
      name: 'University',
      price: 'Custom',
      period: 'pricing',
      features: [
        'Bulk student/staff QR IDs',
        'Campus safety dashboard',
        'University clinic integration',
        'On-campus kiosks',
        'Student-friendly pricing',
        'Institutional support',
      ],
      cta: 'Partner With Us',
      popular: false,
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
            <Badge className="mb-4 text-sm font-semibold">Leading AI-Driven Emergency Response in Africa</Badge>
            <h1 className="font-poppins text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Comprehensive Emergency <br />
              <span className="text-primary">Response Solutions</span>
            </h1>
            <p className="font-poppins text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
              From individual safety to corporate emergency readiness — Uhai Assist empowers everyone with AI-powered life-saving tools.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => navigate('/auth')}>
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.scrollTo({ top: document.getElementById('plans')?.offsetTop, behavior: 'smooth' })}>
                View Pricing
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </section>

      {/* Services Tabs Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-poppins text-3xl md:text-5xl font-bold text-foreground mb-4">
              Choose Your Solution
            </h2>
            <p className="font-poppins text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're an individual, a business, or an educational institution — we have the right plan for you.
            </p>
          </div>

          <Tabs defaultValue="individual" className="max-w-7xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-12">
              <TabsTrigger value="individual" className="gap-2">
                <Heart className="w-4 h-4" />
                Individual
              </TabsTrigger>
              <TabsTrigger value="corporate" className="gap-2">
                <Building2 className="w-4 h-4" />
                Corporate
              </TabsTrigger>
              <TabsTrigger value="university" className="gap-2">
                <GraduationCap className="w-4 h-4" />
                University
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-2">
                <ShoppingBag className="w-4 h-4" />
                Products
              </TabsTrigger>
            </TabsList>

            {/* Individual Services */}
            <TabsContent value="individual" className="space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                {individualFeatures.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={idx} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                        <CardDescription>{feature.desc}</CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>

              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-primary" />
                    <Badge>Premium Features</Badge>
                  </div>
                  <CardTitle className="text-2xl">Upgrade to Premium</CardTitle>
                  <CardDescription>Get access to advanced features and priority support</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {premiumFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => navigate('/auth')} className="w-full md:w-auto">
                    Upgrade to Premium
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Corporate Services */}
            <TabsContent value="corporate" className="space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                {corporateFeatures.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={idx} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-secondary" />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                        <CardDescription>{feature.desc}</CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>

              <Card className="bg-gradient-to-br from-secondary/5 to-accent/5">
                <CardHeader>
                  <CardTitle className="text-2xl">Corporate Pricing Tiers</CardTitle>
                  <CardDescription>Scalable solutions for businesses of all sizes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="starter">
                      <AccordionTrigger className="text-lg font-semibold">
                        Starter Plan (10-50 employees)
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        <p className="text-muted-foreground">Perfect for small businesses and startups</p>
                        <ul className="space-y-1 ml-4">
                          <li>• Bulk QR ID generation</li>
                          <li>• Basic admin dashboard</li>
                          <li>• Standard AI assistant access</li>
                          <li>• Monthly safety reports</li>
                        </ul>
                        <Button variant="outline" className="mt-4">Request Quote</Button>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="business">
                      <AccordionTrigger className="text-lg font-semibold">
                        Business Plan (51-200 employees)
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        <p className="text-muted-foreground">Comprehensive solution for growing companies</p>
                        <ul className="space-y-1 ml-4">
                          <li>• Everything in Starter</li>
                          <li>• Advanced analytics dashboard</li>
                          <li>• Priority AI support</li>
                          <li>• Quarterly training sessions</li>
                          <li>• API integration support</li>
                        </ul>
                        <Button variant="outline" className="mt-4">Request Quote</Button>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="enterprise">
                      <AccordionTrigger className="text-lg font-semibold">
                        Enterprise Plan (200+ employees)
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        <p className="text-muted-foreground">Full-scale emergency response infrastructure</p>
                        <ul className="space-y-1 ml-4">
                          <li>• Everything in Business</li>
                          <li>• Dedicated account manager</li>
                          <li>• Custom API integration</li>
                          <li>• White-label options</li>
                          <li>• On-site training programs</li>
                          <li>• 24/7 premium support</li>
                        </ul>
                        <Button variant="outline" className="mt-4">Contact Sales</Button>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            {/* University Services */}
            <TabsContent value="university" className="space-y-8">
              <Card className="bg-gradient-to-br from-accent/5 to-primary/5">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <GraduationCap className="w-8 h-8 text-accent" />
                    <Badge variant="secondary">Institutional Partnership</Badge>
                  </div>
                  <CardTitle className="text-3xl">Campus-Wide Safety Solutions</CardTitle>
                  <CardDescription className="text-base">
                    Protect your entire academic community with scalable emergency response infrastructure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {universityFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border">
                        <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-background rounded-lg p-6 space-y-4">
                    <h4 className="font-semibold text-lg">What's Included:</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Shield className="w-6 h-6 text-accent" />
                        <h5 className="font-medium">Safety Infrastructure</h5>
                        <p className="text-sm text-muted-foreground">QR tags, kiosks, emergency alerts</p>
                      </div>
                      <div className="space-y-2">
                        <Activity className="w-6 h-6 text-accent" />
                        <h5 className="font-medium">Health Integration</h5>
                        <p className="text-sm text-muted-foreground">Sync with campus clinics and nurses</p>
                      </div>
                      <div className="space-y-2">
                        <BookOpen className="w-6 h-6 text-accent" />
                        <h5 className="font-medium">Training Programs</h5>
                        <p className="text-sm text-muted-foreground">First aid workshops and certifications</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-3">
                  <Button size="lg">Schedule Campus Demo</Button>
                  <Button size="lg" variant="outline">Download Partnership Brochure</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Products Shop */}
            <TabsContent value="products" className="space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                {products.map((product, idx) => (
                  <Card key={idx} className={`hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${product.popular ? 'border-primary border-2' : ''}`}>
                    {product.popular && (
                      <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-semibold">
                        Most Popular
                      </div>
                    )}
                    <CardHeader>
                      <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center text-7xl mb-4">
                        {product.image}
                      </div>
                      <CardTitle className="text-2xl">{product.name}</CardTitle>
                      <CardDescription className="text-2xl font-bold text-primary">{product.price}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {product.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                      <Button className="w-full" onClick={() => navigate('/dashboard/user/buy-qr')}>
                        Buy Now
                      </Button>
                      <Button variant="outline" className="w-full">
                        Request Bulk Order
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle>Bulk Orders & Custom Solutions</CardTitle>
                  <CardDescription>Need 50+ units? Get volume discounts and customization options</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4">
                    <p className="text-3xl font-bold text-primary">10%</p>
                    <p className="text-sm text-muted-foreground">50-200 units</p>
                  </div>
                  <div className="text-center p-4">
                    <p className="text-3xl font-bold text-primary">20%</p>
                    <p className="text-sm text-muted-foreground">201-500 units</p>
                  </div>
                  <div className="text-center p-4">
                    <p className="text-3xl font-bold text-primary">Custom</p>
                    <p className="text-sm text-muted-foreground">500+ units</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">Contact Bulk Sales Team</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Revolutionary AI Features */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4">Core Differentiators</Badge>
            <h2 className="font-poppins text-3xl md:text-5xl font-bold text-foreground mb-4">
              Revolutionary AI Features
            </h2>
            <p className="font-poppins text-lg text-muted-foreground max-w-3xl mx-auto">
              Powered by advanced AI models, our platform continuously learns and improves from local cases to provide the most relevant emergency guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {aiFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.desc}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" onClick={() => navigate('/dashboard/user/assistant')}>
              <Sparkles className="w-5 h-5 mr-2" />
              Try AI Assistant
            </Button>
          </div>
        </div>
      </section>

      {/* Safety Education Services */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-poppins text-3xl md:text-5xl font-bold text-foreground mb-4">
              Safety Education & Community
            </h2>
            <p className="font-poppins text-lg text-muted-foreground max-w-2xl mx-auto">
              Learn life-saving skills through our comprehensive training programs
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader className="text-center">
                <Video className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Video Tutorials</CardTitle>
                <CardDescription>Step-by-step first aid guides</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader className="text-center">
                <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Health Articles</CardTitle>
                <CardDescription>Expert-written safety content</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader className="text-center">
                <Download className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Downloadable Guides</CardTitle>
                <CardDescription>Printable emergency checklists</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader className="text-center">
                <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Live Webinars</CardTitle>
                <CardDescription>Interactive certification workshops</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Button size="lg" variant="outline" onClick={() => navigate('/learn')}>
              Explore Learning Hub
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section id="plans" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-poppins text-3xl md:text-5xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h2>
            <p className="font-poppins text-lg text-muted-foreground max-w-2xl mx-auto">
              Flexible pricing for individuals, businesses, and institutions
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan, idx) => (
              <Card key={idx} className={`hover:shadow-xl transition-all duration-300 ${plan.popular ? 'border-primary border-2 scale-105' : 'hover:-translate-y-2'}`}>
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => navigate('/auth')}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <Badge className="mb-4">Join Thousands of Lifesavers</Badge>
            <h2 className="font-poppins text-3xl md:text-5xl font-bold text-foreground">
              Ready to Transform Emergency Response?
            </h2>
            <p className="font-poppins text-lg text-muted-foreground">
              Whether you're protecting yourself, your team, or your campus — Uhai Assist has the solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => navigate('/auth')}>
                <Lock className="w-5 h-5 mr-2" />
                Create Free Account
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
                Talk to Sales
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
