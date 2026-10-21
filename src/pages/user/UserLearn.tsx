import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { AlertCircle, ArrowRight, Bot, Calendar, CheckCircle2, Circle, Download, ExternalLink, FileText, Loader2, PlayCircle, User, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmptyState from '@/components/common/EmptyState';
import VideoEmbed from '@/components/learn/VideoEmbed';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardSkeleton from '@/components/DashboardSkeleton';

const learningKey = (userId: string | undefined) => ['user-learning', userId] as const;

async function fetchLearning(userId: string) {
  const [tutorials, progress, materials, webinars] = await Promise.all([
    supabase.from('tutorials').select('id, title, description, video_url').order('created_at', { ascending: false }),
    supabase.from('user_learning_progress').select('tutorial_id, completed').eq('user_id', userId),
    supabase.from('downloadable_materials').select('id, title, description, file_url, file_type, file_size').order('created_at', { ascending: false }),
    supabase.from('webinars').select('id, title, description, speaker, date_time, price, is_paid, url').gte('date_time', new Date().toISOString()).order('date_time', { ascending: true }),
  ]);
  const failed = [tutorials, progress, materials, webinars].find((r) => r.error);
  if (failed?.error) throw failed.error;
  return {
    tutorials: tutorials.data ?? [],
    completed: new Set((progress.data ?? []).filter((p) => p.completed).map((p) => p.tutorial_id)),
    materials: materials.data ?? [],
    webinars: webinars.data ?? [],
  };
}

const UserLearn = () => {
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const learning = useQuery({
    queryKey: learningKey(user?.id),
    queryFn: () => fetchLearning(user!.id),
    enabled: !!user?.id,
  });

  // Completion is self-reported ("I've watched this"); there is no video-progress tracking.
  const toggleComplete = useMutation({
    mutationFn: async ({ tutorialId, completed }: { tutorialId: string; completed: boolean }) => {
      const { error } = await supabase.from('user_learning_progress').upsert(
        {
          user_id: user!.id,
          tutorial_id: tutorialId,
          completed,
          progress_percentage: completed ? 100 : 0,
          last_watched_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,tutorial_id' }
      );
      if (error) throw error;
    },
    onSuccess: (_data, { completed }) => {
      queryClient.invalidateQueries({ queryKey: learningKey(user?.id) });
      if (completed) toast.success('Marked as complete');
    },
    onError: () => toast.error("Your progress wasn't saved. Please try again."),
  });

  if (authLoading || learning.isLoading) {
    return (
      <DashboardLayout user={profile} isAdmin={isAdmin}>
        <DashboardSkeleton cards={3} rows={5} />
      </DashboardLayout>
    );
  }

  const data = learning.data;
  const total = data?.tutorials.length ?? 0;
  const done = data ? data.tutorials.filter((t) => data.completed.has(t.id)).length : 0;

  return (
    <DashboardLayout user={profile} isAdmin={isAdmin}>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Learn first aid</h1>
            <p className="text-muted-foreground">Videos, guides and live sessions to help you act with confidence.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/dashboard/assistant">
              <Bot className="mr-2 h-4 w-4" aria-hidden="true" />
              Ask Uhai Assist
            </Link>
          </Button>
        </div>

        {learning.isError || !data ? (
          <EmptyState
            icon={AlertCircle}
            title="Learning content couldn't be loaded"
            description="Check your connection and try again."
            action={<Button variant="outline" onClick={() => learning.refetch()}>Try again</Button>}
          />
        ) : (
          <>
            {total > 0 && (
              <section aria-label="Your progress" className="rounded-2xl border bg-card p-5">
                <div className="mb-3 flex items-baseline justify-between gap-4">
                  <p className="font-semibold">Your progress</p>
                  <p className="text-sm text-muted-foreground tabular-nums">{done} of {total} tutorials completed</p>
                </div>
                <Progress value={(done / total) * 100} aria-label={`${done} of ${total} tutorials completed`} />
              </section>
            )}

            <Tabs defaultValue="tutorials">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="tutorials">Videos</TabsTrigger>
                <TabsTrigger value="materials">Downloads</TabsTrigger>
                <TabsTrigger value="webinars">Webinars</TabsTrigger>
              </TabsList>

              <TabsContent value="tutorials" className="mt-6">
                {total === 0 ? (
                  <EmptyState icon={Video} title="No video tutorials yet" description="New first-aid videos will appear here as they are published." />
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {data.tutorials.map((tutorial) => {
                      const completed = data.completed.has(tutorial.id);
                      const pending = toggleComplete.isPending && toggleComplete.variables?.tutorialId === tutorial.id;
                      return (
                        <article key={tutorial.id} className="flex flex-col overflow-hidden rounded-2xl border bg-card">
                          {tutorial.video_url ? (
                            <VideoEmbed url={tutorial.video_url} title={tutorial.title} />
                          ) : (
                            <div className="flex aspect-video items-center justify-center bg-muted">
                              <PlayCircle className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                            </div>
                          )}
                          <div className="flex flex-1 flex-col gap-3 p-5">
                            <div className="flex items-start justify-between gap-2">
                              <h2 className="font-sans text-base font-semibold leading-snug">{tutorial.title}</h2>
                              {completed && (
                                <Badge className="shrink-0 gap-1 bg-success text-success-foreground hover:bg-success">
                                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Done
                                </Badge>
                              )}
                            </div>
                            {tutorial.description && <p className="flex-1 text-sm text-muted-foreground">{tutorial.description}</p>}
                            <Button
                              variant={completed ? 'ghost' : 'outline'}
                              size="sm"
                              disabled={pending}
                              aria-pressed={completed}
                              onClick={() => toggleComplete.mutate({ tutorialId: tutorial.id, completed: !completed })}
                            >
                              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                : completed ? <CheckCircle2 className="mr-2 h-4 w-4 text-success" aria-hidden="true" />
                                  : <Circle className="mr-2 h-4 w-4" aria-hidden="true" />}
                              {completed ? 'Completed — undo' : 'Mark as complete'}
                            </Button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="materials" className="mt-6">
                {data.materials.length === 0 ? (
                  <EmptyState icon={FileText} title="No downloads yet" description="Printable first-aid guides will appear here once they are published." />
                ) : (
                  <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {data.materials.map((material) => (
                      <li key={material.id} className="flex flex-col rounded-2xl border bg-card p-5">
                        <FileText className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
                        <h2 className="font-sans text-base font-semibold">{material.title}</h2>
                        {material.description && <p className="mt-1 flex-1 text-sm text-muted-foreground">{material.description}</p>}
                        <p className="mt-3 text-xs uppercase text-muted-foreground">
                          {material.file_type}{material.file_size ? ` · ${material.file_size}` : ''}
                        </p>
                        <Button asChild variant="outline" className="mt-4">
                          <a href={material.file_url} target="_blank" rel="noopener noreferrer" download>
                            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                            Download<span className="sr-only">: {material.title}</span>
                          </a>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>

              <TabsContent value="webinars" className="mt-6">
                {data.webinars.length === 0 ? (
                  <EmptyState icon={Calendar} title="No upcoming webinars" description="Check back soon for live sessions." />
                ) : (
                  <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {data.webinars.map((webinar) => (
                      <li key={webinar.id} className="flex flex-col rounded-2xl border bg-card p-5">
                        <div className="mb-2 flex items-center justify-between gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" aria-hidden="true" />
                            {format(new Date(webinar.date_time), 'd MMM yyyy · h:mm a')}
                          </span>
                          <Badge variant={webinar.is_paid ? 'outline' : 'secondary'}>
                            {webinar.is_paid ? `KSh ${webinar.price}` : 'Free'}
                          </Badge>
                        </div>
                        <h2 className="font-sans text-base font-semibold leading-snug">{webinar.title}</h2>
                        {webinar.description && <p className="mt-1 flex-1 text-sm text-muted-foreground line-clamp-3">{webinar.description}</p>}
                        <p className="mt-3 flex items-center text-sm">
                          <User className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          {webinar.speaker}
                        </p>
                        <div className="mt-4">
                          {webinar.is_paid ? (
                            <p className="text-sm text-muted-foreground">Paid registration isn't available online yet.</p>
                          ) : webinar.url ? (
                            <Button asChild className="w-full">
                              <a href={webinar.url} target="_blank" rel="noopener noreferrer">
                                Register
                                <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                                <span className="sr-only">(opens in a new tab)</span>
                              </a>
                            </Button>
                          ) : (
                            <p className="text-sm text-muted-foreground">Registration link coming soon.</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            </Tabs>

            <p className="text-sm text-muted-foreground">
              Looking for the basics? <Link to="/learn#basics" className="font-medium text-primary underline-offset-4 hover:underline">
                Read the first steps in any emergency <ArrowRight className="inline h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </p>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserLearn;
