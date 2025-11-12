import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Tutorial {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  created_at: string;
}

interface Progress {
  tutorial_id: string;
  progress_percentage: number;
  completed: boolean;
  last_watched_at: string;
}

const UserLearn = () => {
  const [loading, setLoading] = useState(true);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
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

      const [profileRes, adminRes, tutorialsRes, progressRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.rpc('has_role', { _user_id: session.user.id, _role: 'admin' }),
        supabase.from('tutorials').select('*').order('created_at', { ascending: false }),
        supabase.from('user_learning_progress').select('*').eq('user_id', session.user.id)
      ]);

      if (profileRes.data) setUser(profileRes.data);
      if (adminRes.data !== null) setIsAdmin(adminRes.data);
      if (tutorialsRes.data) setTutorials(tutorialsRes.data);
      
      if (progressRes.data) {
        const progressMap: Record<string, Progress> = {};
        progressRes.data.forEach((p: any) => {
          progressMap[p.tutorial_id] = p;
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
        <div>
          <h1 className="text-3xl font-bold mb-2">Learn First Aid</h1>
          <p className="text-muted-foreground">
            Master life-saving skills with our comprehensive video tutorials
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Tutorials</CardDescription>
              <CardTitle className="text-3xl">{tutorials.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {Object.values(progress).filter(p => p.completed).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-3xl text-amber-600">
                {Object.values(progress).filter(p => !p.completed && p.progress_percentage > 0).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Categories */}
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

        {tutorials.length === 0 && (
          <Card className="p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No tutorials available yet</h3>
            <p className="text-muted-foreground">Check back later for new learning content</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserLearn;
