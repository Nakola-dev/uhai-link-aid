import { useEffect, useState } from 'react';
import { BookOpen, Calendar, Download, Video } from 'lucide-react';
import { toast } from 'sonner';
import AdminTabSkeleton from '@/components/admin/AdminTabSkeleton';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdminContentTabProps {
  onUpdate: () => void;
}

interface ContentLists {
  tutorials: Tables<'tutorials'>[];
  articles: Tables<'articles'>[];
  webinars: Tables<'webinars'>[];
  materials: Tables<'downloadable_materials'>[];
}

const Row = ({ title, description, children }: { title: string; description?: string | null; children?: React.ReactNode }) => (
  <li className="rounded-lg border p-4">
    <p className="font-semibold">{title}</p>
    {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    {children && <div className="mt-2 flex flex-wrap items-center gap-2">{children}</div>}
  </li>
);

const Empty = ({ text }: { text: string }) => <p className="py-8 text-center text-muted-foreground">{text}</p>;

/** Read-only overview of published learning content (there is no in-app editor yet). */
export const AdminContentTab = (_props: AdminContentTabProps) => {
  const [content, setContent] = useState<ContentLists | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [tutorials, articles, webinars, materials] = await Promise.all([
          supabase.from('tutorials').select('*').order('created_at', { ascending: false }),
          supabase.from('articles').select('*').order('created_at', { ascending: false }),
          supabase.from('webinars').select('*').order('date_time', { ascending: false }),
          supabase.from('downloadable_materials').select('*').order('created_at', { ascending: false }),
        ]);
        const failed = [tutorials, articles, webinars, materials].find((r) => r.error);
        if (failed?.error) throw failed.error;
        setContent({
          tutorials: tutorials.data ?? [],
          articles: articles.data ?? [],
          webinars: webinars.data ?? [],
          materials: materials.data ?? [],
        });
      } catch {
        toast.error('Content could not be loaded');
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) return <AdminTabSkeleton rows={4} />;
  if (!content) return <Empty text="Content could not be loaded." />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning content</CardTitle>
        <CardDescription>
          What is currently published on the Learn pages. Content is read-only here; edit it in the Supabase dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tutorials" className="space-y-4">
          <TabsList className="flex h-auto flex-wrap justify-start">
            <TabsTrigger value="tutorials"><Video className="mr-2 h-4 w-4" aria-hidden="true" />Tutorials ({content.tutorials.length})</TabsTrigger>
            <TabsTrigger value="articles"><BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />Articles ({content.articles.length})</TabsTrigger>
            <TabsTrigger value="webinars"><Calendar className="mr-2 h-4 w-4" aria-hidden="true" />Webinars ({content.webinars.length})</TabsTrigger>
            <TabsTrigger value="materials"><Download className="mr-2 h-4 w-4" aria-hidden="true" />Downloads ({content.materials.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="tutorials">
            {content.tutorials.length === 0 ? <Empty text="No tutorials published." /> : (
              <ul className="space-y-3">
                {content.tutorials.map((t) => (
                  <Row key={t.id} title={t.title} description={t.description}>
                    <Badge variant={t.video_url ? 'secondary' : 'outline'}>{t.video_url ? 'Has video' : 'No video link'}</Badge>
                  </Row>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="articles">
            {content.articles.length === 0 ? <Empty text="No articles published." /> : (
              <ul className="space-y-3">
                {content.articles.map((a) => (
                  <Row key={a.id} title={a.title} description={a.summary}>
                    <Badge variant="outline">{a.category}</Badge>
                    {a.is_featured && <Badge>Featured on Learn</Badge>}
                    {!a.content && <Badge variant="outline">No body text</Badge>}
                  </Row>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="webinars">
            {content.webinars.length === 0 ? <Empty text="No webinars scheduled." /> : (
              <ul className="space-y-3">
                {content.webinars.map((w) => (
                  <Row key={w.id} title={w.title} description={w.description}>
                    <Badge variant="outline">{new Date(w.date_time).toLocaleString()}</Badge>
                    <Badge variant="secondary">{w.is_paid ? `KSh ${w.price}` : 'Free'}</Badge>
                    {!w.url && <Badge variant="outline">No registration link</Badge>}
                  </Row>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="materials">
            {content.materials.length === 0 ? <Empty text="No downloads published." /> : (
              <ul className="space-y-3">
                {content.materials.map((m) => (
                  <Row key={m.id} title={m.title} description={m.description}>
                    <Badge variant="outline">{m.file_type}</Badge>
                    {m.category && <Badge variant="outline">{m.category}</Badge>}
                  </Row>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
