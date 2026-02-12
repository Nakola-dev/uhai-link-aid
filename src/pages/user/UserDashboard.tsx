import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Video } from 'lucide-react';
import DashboardSkeleton from '@/components/DashboardSkeleton';

interface Organization {
  id: string;
  name: string;
  type: string | null;
  phone: string | null;
  email: string | null;
}

interface Tutorial {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
}

const UserDashboard = () => {
  const { profile, isAdmin, loading: authLoading } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [orgsRes, tutorialsRes] = await Promise.all([
        supabase.from('emergency_organizations').select('*').limit(5),
        supabase.from('tutorials').select('*').limit(3),
      ]);

      setOrganizations(orgsRes.data || []);
      setTutorials(tutorialsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout user={profile} isAdmin={isAdmin}>
        <DashboardSkeleton cards={3} rows={3} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={profile} isAdmin={isAdmin}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Your personal health and emergency dashboard
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Organizations</CardDescription>
              <CardTitle className="text-3xl">{organizations.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Tutorials</CardDescription>
              <CardTitle className="text-3xl">{tutorials.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Profile Status</CardDescription>
              <CardTitle className="text-lg">
                {profile?.full_name ? (
                  <span className="text-green-600">Complete</span>
                ) : (
                  <span className="text-destructive">Incomplete</span>
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Emergency Organizations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Emergency Organizations</CardTitle>
                <CardDescription>Quick access to emergency services in Kenya</CardDescription>
              </div>
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {organizations.length > 0 ? (
                organizations.map((org) => (
                  <div key={org.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-semibold">{org.name}</p>
                      <p className="text-sm text-muted-foreground">{org.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{org.phone}</p>
                      {org.email && (
                        <p className="text-xs text-muted-foreground">{org.email}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No organizations available at the moment
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Helpful Tutorials */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Helpful Tutorials</CardTitle>
                <CardDescription>Learn essential first aid skills</CardDescription>
              </div>
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tutorials.length > 0 ? (
                tutorials.map((tutorial) => (
                  <Card key={tutorial.id} className="border border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{tutorial.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {tutorial.description || 'Watch this tutorial to learn more'}
                      </p>
                      {tutorial.video_url && (
                        <a
                          href={tutorial.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline inline-flex items-center"
                        >
                          <Video className="h-4 w-4 mr-1" />
                          Watch Video
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground col-span-full text-center py-4">
                  No tutorials available at the moment
                </p>
              )}
            </div>
            <Button className="w-full mt-4" onClick={() => navigate('/dashboard/learn')}>
              View All Tutorials
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
