import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayCircle, CheckCircle2, Clock, BookOpen, Download, Calendar, User, CreditCard, Sparkles, FileText, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/shared/use-toast';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface Tutorial {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  created_at: string;
}

interface ProgressData {
  tutorial_id: string;
  progress_percentage: number;
  completed: boolean;
  last_watched_at: string;
}

interface DownloadableMaterial {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: string | null;
  category: string | null;
  is_premium: boolean;
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

const UserLearn = () => {
  const [loading, setLoading] = useState(true);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [progress, setProgress] = useState<Record<string, ProgressData>>({});
  const [materials, setMaterials] = useState<DownloadableMaterial[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const [profileRes, adminRes, tutorialsRes, progressRes, materialsRes, webinarsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.rpc('has_role', { _user_id: session.user.id, _role: 'admin' }),
        supabase.from('tutorials').select('*').order('created_at', { ascending: false }),
        supabase.from('user_learning_progress').select('*').eq('user_id', session.user.id),
        supabase.from('downloadable_materials').select('*').order('created_at', { ascending: false }),
        supabase.from('webinars').select('*').gte('date_time', new Date().toISOString()).order('date_time', { ascending: true })
      ]);

      if (profileRes.data) setUser(profileRes.data);
      if (adminRes.data !== null) setIsAdmin(adminRes.data);
      if (tutorialsRes.data) setTutorials(tutorialsRes.data);
      if (materialsRes.data) setMaterials(materialsRes.data);
      if (webinarsRes.data) setWebinars(webinarsRes.data);
      
      if (progressRes.data) {
        const progressMap: Record<string, ProgressData> = {};
        progressRes.data.forEach((p: Record<string, unknown>) => {
          const tutorialId = p.tutorial_id as string;
          progressMap[tutorialId] = p as unknown as ProgressData;
        });
        setProgress(progressMap);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load tutorials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (tutorialId: string, percentage: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const completed = percentage >= 100;

      const { error } = await supabase
        .from('user_learning_progress')
        .upsert({
          user_id: session.user.id,
          tutorial_id: tutorialId,
          progress_percentage: percentage,
          completed,
          last_watched_at: new Date().toISOString(),
        });

      if (error) throw error;

      setProgress(prev => ({
        ...prev,
        [tutorialId]: {
          tutorial_id: tutorialId,
          progress_percentage: percentage,
          completed,
          last_watched_at: new Date().toISOString(),
        }
      }));

      if (completed) {
        toast({
          title: "Congratulations!",
          description: "You've completed this tutorial!",
        });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleDownload = async (materialId: string, title: string) => {
    setDownloading(materialId);
    setTimeout(() => {
      toast({
        title: "Download Started",
        description: `${title} is being downloaded`,
      });
      setDownloading(null);
    }, 1000);
  };

  const handleJoinWebinar = (webinar: Webinar) => {
    if (webinar.is_paid) {
      toast({
        title: "Registration Required",
        description: `This webinar costs Ksh ${webinar.price}. Payment integration coming soon!`,
      });
    } else {
      if (webinar.url) {
        window.open(webinar.url, '_blank');
      } else {
        toast({
          title: "Webinar Link",
          description: "Webinar link will be shared closer to the event date",
        });
      }
    }
  };

  const categories = [
    { name: 'CPR', tutorials: tutorials.filter(t => t.title.toLowerCase().includes('cpr')) },
    { name: 'Burns', tutorials: tutorials.filter(t => t.title.toLowerCase().includes('burn')) },
    { name: 'Bleeding', tutorials: tutorials.filter(t => t.title.toLowerCase().includes('bleed')) },
    { name: 'Other', tutorials: tutorials.filter(t => 
      !t.title.toLowerCase().includes('cpr') && 
      !t.title.toLowerCase().includes('burn') && 
      !t.title.toLowerCase().includes('bleed')
    )},
  ];

  const totalCompleted = Object.values(progress).filter(p => p.completed).length;
  const totalInProgress = Object.values(progress).filter(p => !p.completed && p.progress_percentage > 0).length;

  if (loading) {
    return (
      <DashboardLayout user={user} isAdmin={isAdmin}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} isAdmin={isAdmin}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Learn First Aid</h1>
            <p className="text-muted-foreground">
              Master life-saving skills with our comprehensive learning resources
            </p>
          </div>
          <Button 
            onClick={() => navigate('/dashboard/assistant')}
            className="group"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Ask the AI Trainer
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="pb-3">
              <CardDescription>Total Resources</CardDescription>
              <CardTitle className="text-3xl">{tutorials.length + materials.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {totalCompleted}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
            <CardHeader className="pb-3">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-3xl text-amber-600">
                {totalInProgress}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
            <CardHeader className="pb-3">
              <CardDescription>Upcoming Webinars</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {webinars.length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs for different content types */}
        <Tabs defaultValue="tutorials" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="tutorials">
              <PlayCircle className="h-4 w-4 mr-2" />
              Video Tutorials
            </TabsTrigger>
            <TabsTrigger value="materials">
              <Download className="h-4 w-4 mr-2" />
              Downloads
            </TabsTrigger>
            <TabsTrigger value="webinars">
              <Calendar className="h-4 w-4 mr-2" />
              Webinars
            </TabsTrigger>
          </TabsList>

          {/* Video Tutorials Tab */}
          <TabsContent value="tutorials" className="space-y-8 mt-8">
            {categories.map(category => {
          if (category.tutorials.length === 0) return null;
          
          return (
            <div key={category.name} className="space-y-4">
              <h2 className="text-2xl font-semibold">{category.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.tutorials.map(tutorial => {
                  const tutorialProgress = progress[tutorial.id];
                  const isCompleted = tutorialProgress?.completed || false;
                  const progressPercent = tutorialProgress?.progress_percentage || 0;

                  return (
                    <Card key={tutorial.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                          {isCompleted ? (
                            <Badge className="bg-green-600 hover:bg-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Done
                            </Badge>
                          ) : progressPercent > 0 ? (
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              {progressPercent}%
                            </Badge>
                          ) : null}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {tutorial.description || 'Learn essential first aid techniques'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {tutorial.video_url && (
                          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                            <iframe
                              src={tutorial.video_url}
                              className="w-full h-full"
                              allowFullScreen
                              title={tutorial.title}
                            />
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{progressPercent}%</span>
                          </div>
                          <Progress value={progressPercent} />
                        </div>

                        <button
                          onClick={() => updateProgress(tutorial.id, Math.min(progressPercent + 25, 100))}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          <PlayCircle className="h-4 w-4" />
                          <span>{progressPercent === 0 ? 'Start Learning' : 'Continue'}</span>
                        </button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
              );
            })}
          </TabsContent>

          {/* Downloadable Materials Tab */}
          <TabsContent value="materials" className="space-y-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((material) => (
                <Card key={material.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      {material.is_premium && (
                        <Badge variant="secondary">Premium</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{material.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {material.description || 'Downloadable resource for emergency preparedness'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {material.file_type.toUpperCase()}
                      </span>
                      {material.file_size && (
                        <span>{material.file_size}</span>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      variant={downloading === material.id ? "secondary" : "default"}
                      disabled={downloading === material.id}
                      onClick={() => handleDownload(material.id, material.title)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {downloading === material.id ? 'Downloading...' : 'Download'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {materials.length === 0 && (
              <Card className="p-12 text-center">
                <Download className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No materials available yet</h3>
                <p className="text-muted-foreground">Check back later for downloadable resources</p>
              </Card>
            )}
          </TabsContent>

          {/* Webinars Tab */}
          <TabsContent value="webinars" className="space-y-6 mt-8">
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
                        <Calendar className="h-16 w-16 text-primary/50" />
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
                      onClick={() => handleJoinWebinar(webinar)}
                    >
                      {webinar.is_paid ? (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Register - Ksh {webinar.price}
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

            {webinars.length === 0 && (
              <Card className="p-12 text-center">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No upcoming webinars</h3>
                <p className="text-muted-foreground">Check back soon for expert-led sessions</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {tutorials.length === 0 && materials.length === 0 && (
          <Card className="p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No content available yet</h3>
            <p className="text-muted-foreground">Check back later for new learning content</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserLearn;
