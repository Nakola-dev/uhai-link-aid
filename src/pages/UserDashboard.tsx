import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, QrCode, Phone, Users, BookOpen, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';

const UserDashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setProfile(profileData);

      // Fetch emergency organizations
      const { data: orgsData } = await supabase
        .from('emergency_organizations')
        .select('*')
        .limit(5);

      setOrganizations(orgsData || []);

      // Fetch tutorials
      const { data: tutorialsData } = await supabase
        .from('tutorials')
        .select('*')
        .limit(4);

      setTutorials(tutorialsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl md:text-4xl font-bold">
                Welcome back, {profile?.full_name || 'User'}!
              </h1>
              <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
                {profile?.role || 'user'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Manage your medical profile and emergency information
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/dashboard/user/profile')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Edit Profile</CardTitle>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Update Info</div>
                <p className="text-xs text-muted-foreground">
                  Keep your medical information current
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/dashboard/user/qr')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My QR Code</CardTitle>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">View QR</div>
                <p className="text-xs text-muted-foreground">
                  Access your emergency QR code
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emergency Contact</CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile?.emergency_contact_name || 'Not set'}</div>
                <p className="text-xs text-muted-foreground">
                  {profile?.emergency_contact_phone || 'Add emergency contact'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Emergency Organizations */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle>Emergency Organizations</CardTitle>
                </div>
                <CardDescription>Quick access to emergency services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {organizations.map((org) => (
                  <div key={org.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-sm text-muted-foreground">{org.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{org.phone}</p>
                      {org.email && (
                        <p className="text-xs text-muted-foreground">{org.email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tutorials */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle>Helpful Tutorials</CardTitle>
                </div>
                <CardDescription>Learn how to use UhaiLink</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tutorials.map((tutorial) => (
                  <div key={tutorial.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <p className="font-medium mb-1">{tutorial.title}</p>
                    <p className="text-sm text-muted-foreground mb-2">{tutorial.description}</p>
                    <Button variant="link" className="p-0 h-auto text-primary" asChild>
                      <a href={tutorial.video_url} target="_blank" rel="noopener noreferrer">
                        Watch Tutorial →
                      </a>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;
