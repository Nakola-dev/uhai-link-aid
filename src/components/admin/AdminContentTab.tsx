import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Video, Calendar, Download } from 'lucide-react';
import { toast } from 'sonner';

interface AdminContentTabProps {
  onUpdate: () => void;
}

export const AdminContentTab = ({ onUpdate }: AdminContentTabProps) => {
  const [tutorials, setTutorials] = useState<Record<string, unknown>[]>([]);
  const [articles, setArticles] = useState<Record<string, unknown>[]>([]);
  const [webinars, setWebinars] = useState<Record<string, unknown>[]>([]);
  const [materials, setMaterials] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      
      const [tutorialsRes, articlesRes, webinarsRes, materialsRes] = await Promise.all([
        supabase.from('tutorials').select('*').order('created_at', { ascending: false }),
        supabase.from('articles').select('*').order('created_at', { ascending: false }),
        supabase.from('webinars').select('*').order('date_time', { ascending: false }),
        supabase.from('downloadable_materials').select('*').order('created_at', { ascending: false })
      ]);

      if (tutorialsRes.error) throw tutorialsRes.error;
      if (articlesRes.error) throw articlesRes.error;
      if (webinarsRes.error) throw webinarsRes.error;
      if (materialsRes.error) throw materialsRes.error;

      setTutorials(tutorialsRes.data || []);
      setArticles(articlesRes.data || []);
      setWebinars(webinarsRes.data || []);
      setMaterials(materialsRes.data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Management</CardTitle>
        <CardDescription>Manage learning materials, tutorials, and webinars</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tutorials" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tutorials">
              <Video className="h-4 w-4 mr-2" />
              Tutorials ({tutorials.length})
            </TabsTrigger>
            <TabsTrigger value="articles">
              <BookOpen className="h-4 w-4 mr-2" />
              Articles ({articles.length})
            </TabsTrigger>
            <TabsTrigger value="webinars">
              <Calendar className="h-4 w-4 mr-2" />
              Webinars ({webinars.length})
            </TabsTrigger>
            <TabsTrigger value="materials">
              <Download className="h-4 w-4 mr-2" />
              Materials ({materials.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tutorials" className="space-y-4">
            {tutorials.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No tutorials available</p>
            ) : (
              tutorials.map((tutorial) => (
                <div key={tutorial.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{tutorial.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{tutorial.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {tutorial.category && <Badge variant="outline">{tutorial.category}</Badge>}
                        {tutorial.is_premium && <Badge>Premium</Badge>}
                        <span className="text-sm text-muted-foreground">
                          {tutorial.view_count || 0} views
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="articles" className="space-y-4">
            {articles.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No articles available</p>
            ) : (
              articles.map((article) => (
                <div key={article.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{article.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{article.summary}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{article.category}</Badge>
                        {article.is_featured && <Badge>Featured</Badge>}
                        <span className="text-sm text-muted-foreground">
                          {article.view_count || 0} views
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="webinars" className="space-y-4">
            {webinars.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No webinars scheduled</p>
            ) : (
              webinars.map((webinar) => (
                <div key={webinar.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{webinar.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{webinar.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          {new Date(webinar.date_time).toLocaleString()}
                        </Badge>
                        {webinar.is_paid && (
                          <Badge>KES {parseFloat(webinar.price).toFixed(2)}</Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {webinar.current_attendees || 0} attendees
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            {materials.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No materials available</p>
            ) : (
              materials.map((material) => (
                <div key={material.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{material.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{material.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{material.file_type}</Badge>
                        {material.category && <Badge variant="outline">{material.category}</Badge>}
                        {material.is_premium && <Badge>Premium</Badge>}
                        <span className="text-sm text-muted-foreground">
                          {material.download_count || 0} downloads
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};