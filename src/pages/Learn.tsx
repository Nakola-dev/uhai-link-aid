import { useState } from 'react';
import { BookOpen, Video, Download, Heart, Phone, Shield, AlertCircle, Activity, Droplet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

const Learn = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

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
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4 animate-fade-in">
            <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Learn First Aid
            </h1>
            <p className="text-xl text-muted-foreground">
              Master life-saving skills with our comprehensive learning resources
            </p>
          </div>

          {/* General Steps Section */}
          <div className="mb-20">
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
          </div>

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
          <div className="mb-12">
            <div className="text-center mb-10">
              <div className="inline-block p-3 rounded-full bg-secondary/10 mb-4">
                <Download className="h-6 w-6 text-secondary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Download Center</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Free first aid guides and resources for offline learning
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {downloads.map((download, index) => (
                <Card 
                  key={index} 
                  className="border-none shadow-card hover:shadow-lg transition-all duration-300 hover:border-primary/20"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <download.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg mb-1">{download.title}</CardTitle>
                          <CardDescription>{download.description}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div className="flex gap-3 text-sm text-muted-foreground">
                      <span className="px-2 py-1 rounded bg-muted font-medium">{download.format}</span>
                      <span className="px-2 py-1 rounded bg-muted">{download.size}</span>
                    </div>
                    <Button
                      onClick={() => handleDownload(download.title)}
                      disabled={downloading === download.title}
                      className="rounded-full"
                    >
                      {downloading === download.title ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Downloading...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </span>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

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
