import { useState, useEffect } from 'react';
import { BookOpen, Video, Download, Heart, Phone, Shield, AlertCircle, Activity, Droplet, Calendar, CreditCard, Clock, User, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/shared/Layout';
import { format } from 'date-fns';

interface Article {
  id: string;
  title: string;
  summary: string;
  image_url: string | null;
  category: string;
  read_time: number | null;
  is_featured: boolean;
}

interface Webinar {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  speaker: string;
  date_time: string;
  price: number;
  is_paid: boolean;
  url: string | null;
  category: string | null;
}

const Learn = () => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [articlesRes, webinarsRes] = await Promise.all([
        supabase
          .from('articles')
          .select('*')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('webinars')
          .select('*')
          .gte('date_time', new Date().toISOString())
          .order('date_time', { ascending: true })
          .limit(6)
      ]);

      if (articlesRes.data) setArticles(articlesRes.data);
      if (webinarsRes.data) setWebinars(webinarsRes.data);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const generalSteps = [
    {
      icon: AlertCircle,
      title: 'Assess the Scene',
      description: 'Ensure the area is safe before approaching the victim.',
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: Phone,
      title: 'Call for Help',
      description: 'Dial emergency services (999 or 1199) immediately.',
      color: 'bg-destructive/10 text-destructive',
    },
    {
      icon: Heart,
      title: 'Check Responsiveness',
      description: 'Gently tap and shout to check if the person responds.',
      color: 'bg-secondary/10 text-secondary',
    },
    {
      icon: Activity,
      title: 'Check Breathing',
      description: 'Look, listen, and feel for normal breathing.',
      color: 'bg-success/10 text-success',
    },
    {
      icon: Shield,
      title: 'Start CPR if Needed',
      description: '30 chest compressions, 2 rescue breaths. Repeat.',
      color: 'bg-accent/10 text-accent',
    },
    {
      icon: Droplet,
      title: 'Control Bleeding',
      description: 'Apply direct pressure with clean cloth or bandage.',
      color: 'bg-primary/10 text-primary',
    },
  ];

  const tutorials = [
    {
      title: 'CPR Basics - Save a Life',
      description: 'Learn the fundamentals of cardiopulmonary resuscitation',
      videoId: 'I_oNGpGW7I8',
      duration: '5:32',
    },
    {
      title: 'How to Use an AED',
      description: 'Automated External Defibrillator step-by-step guide',
      videoId: 'WMx_nJzKnng',
      duration: '3:45',
    },
    {
      title: 'Choking Emergency Response',
      description: 'Heimlich maneuver and back blows technique',
      videoId: 'j98SDe99Mas',
      duration: '4:12',
    },
    {
      title: 'Treating Severe Bleeding',
      description: 'How to control bleeding and apply pressure',
      videoId: '4PYeOAsI0-Q',
      duration: '6:18',
    },
  ];

  const downloads = [
    {
      title: 'First Aid Quick Reference Guide',
      description: 'Essential first aid steps for common emergencies',
      format: 'PDF',
      size: '2.3 MB',
      icon: BookOpen,
    },
    {
      title: 'CPR & AED Handbook',
      description: 'Comprehensive guide to cardiac emergencies',
      format: 'PDF',
      size: '4.1 MB',
      icon: Heart,
    },
    {
      title: 'Emergency Contact Card Template',
      description: 'Printable wallet card for emergency information',
      format: 'PDF',
      size: '0.8 MB',
      icon: Phone,
    },
    {
      title: 'Pediatric First Aid Guide',
      description: 'First aid specifically for infants and children',
      format: 'PDF',
      size: '3.5 MB',
      icon: Shield,
    },
  ];

  const handleDownload = (title: string) => {
    setDownloading(title);
    setTimeout(() => {
      toast.success(`${title} downloaded successfully!`);
      setDownloading(null);
    }, 1500);
  };

  return (
    <Layout>
      <div className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-16 space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Empowering Africa with Life-Saving Knowledge
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Learn with Uhai Assist
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Master essential first aid techniques with our comprehensive guides, expert-led webinars, 
              video tutorials, and downloadable resources. Your journey to saving lives starts here.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button size="lg" onClick={() => navigate('/auth')} className="group">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => {
                document.getElementById('webinars')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Browse Webinars
              </Button>
            </div>
          </div>

          {/* Featured Articles Section */}
          {articles.length > 0 && (
            <section className="mb-20">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Featured Articles</h2>
                  <p className="text-muted-foreground">Expert insights and practical guides</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
                    <div className="aspect-video relative overflow-hidden bg-muted">
                      {article.image_url ? (
                        <img 
                          src={article.image_url} 
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-muted-foreground/50" />
                        </div>
                      )}
                      <Badge className="absolute top-3 right-3 bg-primary">
                        {article.category}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {article.summary}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {article.read_time || 5} min read
                      </div>
                      <Button variant="ghost" size="sm" className="group-hover:text-primary">
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Webinars Showcase Section */}
          <section id="webinars" className="mb-20 scroll-mt-20">
            <div className="text-center mb-12">
              <div className="inline-block p-3 rounded-full bg-accent/10 mb-4">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <h2 className="text-3xl font-bold mb-3">Upcoming Webinars</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join expert-led sessions and interactive workshops. Learn from professionals and ask questions in real-time.
              </p>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : webinars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {webinars.map((webinar) => (
                  <Card key={webinar.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                    <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                      {webinar.image_url ? (
                        <img 
                          src={webinar.image_url} 
                          alt={webinar.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-16 w-16 text-primary/50" />
                        </div>
                      )}
                      <Badge className={`absolute top-3 right-3 ${webinar.is_paid ? 'bg-amber-500' : 'bg-green-500'}`}>
                        {webinar.is_paid ? `Ksh ${webinar.price}` : 'Free'}
                      </Badge>
                    </div>
                    <CardHeader>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(webinar.date_time), 'MMM dd, yyyy · h:mm a')}
                      </div>
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                        {webinar.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {webinar.description || 'Join this expert-led session to enhance your emergency response skills.'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">{webinar.speaker}</span>
                      </div>
                      <Button 
                        className="w-full group-hover:shadow-md transition-shadow" 
                        onClick={() => {
                          if (webinar.is_paid) {
                            toast.info('Please log in to register for paid webinars');
                            navigate('/auth');
                          } else {
                            toast.success('Redirecting to webinar registration...');
                          }
                        }}
                      >
                        {webinar.is_paid ? (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Register Now
                          </>
                        ) : (
                          <>
                            Join Free
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Upcoming Webinars</h3>
                <p className="text-muted-foreground">Check back soon for new sessions</p>
              </Card>
            )}
          </section>

          {/* General Steps Section */}
          <section className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">General First Aid Steps</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Follow these essential steps in any emergency situation
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {generalSteps.map((step, index) => (
                <Card 
                  key={index} 
                  className="border-none shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                >
                  <CardHeader>
                    <div className={`h-14 w-14 rounded-xl ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="h-7 w-7" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-primary/20">{index + 1}</span>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Watch & Learn Section */}
          <div className="mb-20">
            <div className="text-center mb-10">
              <div className="inline-block p-3 rounded-full bg-destructive/10 mb-4">
                <Video className="h-6 w-6 text-destructive" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Watch & Learn</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Visual guides to master essential first aid techniques
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {tutorials.map((tutorial, index) => (
                <Card 
                  key={index} 
                  className="overflow-hidden border-none shadow-card hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${tutorial.videoId}`}
                      title={tutorial.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                      {tutorial.duration}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {tutorial.title}
                    </CardTitle>
                    <CardDescription>{tutorial.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Download Center */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-block p-3 rounded-full bg-accent/10 mb-4">
                <Download className="h-6 w-6 text-accent" />
              </div>
              <h2 className="text-3xl font-bold mb-3">Download Center</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Take our resources with you wherever you go
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {downloads.map((item, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow group">
                  <CardHeader>
                    <div className="p-4 rounded-lg bg-primary/10 w-fit mb-3 group-hover:bg-primary/20 transition-colors">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {item.title}
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{item.format}</span>
                      <span>{item.size}</span>
                    </div>
                    <Button 
                      onClick={() => handleDownload(item.title)}
                      variant={downloading === item.title ? "secondary" : "default"}
                      disabled={downloading === item.title}
                      className="w-full"
                    >
                      {downloading === item.title ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Call to Action */}
          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-primary to-secondary text-primary-foreground border-none shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl mb-2">Ready to Save Lives?</CardTitle>
              <CardDescription className="text-primary-foreground/90 text-base">
                Join UhaiLink today and keep your medical information accessible in emergencies
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 rounded-full shadow-lg"
                onClick={() => window.location.href = '/auth'}
              >
                Get Started Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Learn;
