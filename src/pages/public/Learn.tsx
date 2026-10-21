import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Download,
  Droplet,
  ExternalLink,
  FileText,
  Heart,
  Phone,
  Shield,
  User,
  Video,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { EMERGENCY_NUMBERS, telHref } from '@/lib/emergency-numbers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/common/EmptyState';
import SectionHeading from '@/components/common/SectionHeading';
import VideoEmbed from '@/components/learn/VideoEmbed';
import Layout from '@/components/Layout';

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  image_url: string | null;
  category: string;
  read_time: number | null;
}

const BASIC_STEPS = [
  { icon: AlertCircle, title: 'Check the scene is safe', description: 'Make sure you are not putting yourself in danger before you approach.' },
  { icon: Phone, title: 'Call for help', description: 'Call 999 or 112, or Kenya Red Cross on 1199. Put the phone on speaker.' },
  { icon: Heart, title: 'Check for a response', description: 'Tap their shoulders and ask loudly, "Are you okay?"' },
  { icon: Activity, title: 'Check breathing', description: 'Look, listen and feel for normal breathing for up to 10 seconds.' },
  { icon: Shield, title: 'Start CPR if they are not breathing', description: 'Push hard and fast in the centre of the chest, about 100–120 times a minute.' },
  { icon: Droplet, title: 'Control heavy bleeding', description: 'Press firmly on the wound with a clean cloth and keep pressing.' },
];

const useLearningContent = () =>
  useQuery({
    queryKey: ['public-learning-content'],
    queryFn: async () => {
      const [tutorials, articles, webinars, materials] = await Promise.all([
        supabase.from('tutorials').select('id, title, description, video_url').order('created_at', { ascending: false }).limit(6),
        supabase.from('articles').select('id, title, summary, content, image_url, category, read_time').eq('is_featured', true).order('created_at', { ascending: false }).limit(6),
        supabase.from('webinars').select('id, title, description, image_url, speaker, date_time, price, is_paid, url').gte('date_time', new Date().toISOString()).order('date_time', { ascending: true }).limit(6),
        supabase.from('downloadable_materials').select('id, title, description, file_url, file_type, file_size').order('created_at', { ascending: false }).limit(8),
      ]);
      const failed = [tutorials, articles, webinars, materials].find((r) => r.error);
      if (failed?.error) throw failed.error;
      return {
        tutorials: tutorials.data ?? [],
        articles: (articles.data ?? []) as Article[],
        webinars: webinars.data ?? [],
        materials: materials.data ?? [],
      };
    },
    staleTime: 10 * 60 * 1000,
  });

const CardGridSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className="h-64 rounded-xl" />
    ))}
  </div>
);

const Learn = () => {
  const content = useLearningContent();
  const [openArticle, setOpenArticle] = useState<Article | null>(null);
  const loadFailed = content.isError;

  const unavailable = (
    <EmptyState
      icon={AlertCircle}
      title="This content couldn't be loaded"
      description="Check your connection and try again."
      action={<Button variant="outline" onClick={() => content.refetch()}>Try again</Button>}
    />
  );

  return (
    <Layout>
      <section className="border-b bg-muted/40">
        <div className="container py-14 sm:py-20">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Learning centre</p>
            <h1 className="font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              First-aid skills you can use today
            </h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Short guides, videos and resources on what to do in the first minutes of an emergency — free for everyone.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <a href="#basics">Start with the basics</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth?tab=signup">Create a free account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container space-y-20 py-16 sm:py-20">
        <section aria-labelledby="basics" className="scroll-mt-24">
          <SectionHeading
            id="basics"
            title="The first steps in any emergency"
            description="These steps are general guidance, not a substitute for training. If in doubt, call for help first."
          />
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BASIC_STEPS.map((step, index) => (
              <li key={step.title} className="rounded-xl border bg-card p-5">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground tabular-nums">
                    {index + 1}
                  </span>
                  <step.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border-2 border-destructive/30 bg-destructive/5 p-4 text-sm">
            <span className="font-semibold">Emergency lines:</span>
            {EMERGENCY_NUMBERS.map((line) => (
              <a key={line.number} href={telHref(line.number)} className="font-semibold text-destructive underline-offset-2 hover:underline">
                {line.number} <span className="font-normal text-muted-foreground">({line.label})</span>
              </a>
            ))}
          </div>
        </section>

        <section aria-labelledby="videos">
          <SectionHeading id="videos" title="Video tutorials" description="Videos load only when you press play, to save mobile data." />
          <div className="mt-10">
            {content.isLoading ? <CardGridSkeleton /> : loadFailed ? unavailable : content.data!.tutorials.length === 0 ? (
              <EmptyState icon={Video} title="Video tutorials are on the way" description="New first-aid videos will appear here as they are published." />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {content.data!.tutorials.map((tutorial) => (
                  <Card key={tutorial.id} className="overflow-hidden">
                    {tutorial.video_url ? (
                      <VideoEmbed url={tutorial.video_url} title={tutorial.title} />
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-muted">
                        <Video className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                      {tutorial.description && <CardDescription>{tutorial.description}</CardDescription>}
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {(content.isLoading || loadFailed || content.data!.articles.length > 0) && (
          <section aria-labelledby="articles">
            <SectionHeading id="articles" title="Guides and articles" />
            <div className="mt-10">
              {content.isLoading ? <CardGridSkeleton /> : loadFailed ? unavailable : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {content.data!.articles.map((article) => (
                    <Card key={article.id} className="flex flex-col overflow-hidden">
                      {article.image_url && (
                        <img src={article.image_url} alt="" width={640} height={360} loading="lazy" decoding="async"
                          className="aspect-video w-full object-cover" />
                      )}
                      <CardHeader className="flex-1">
                        <Badge variant="secondary" className="w-fit">{article.category}</Badge>
                        <CardTitle className="text-lg leading-snug">{article.title}</CardTitle>
                        <CardDescription className="line-clamp-3">{article.summary}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex items-center justify-between">
                        {article.read_time ? (
                          <span className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-4 w-4" aria-hidden="true" />
                            {article.read_time} min read
                          </span>
                        ) : <span />}
                        {article.content && (
                          <Button variant="ghost" size="sm" onClick={() => setOpenArticle(article)}>
                            Read
                            <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">: {article.title}</span>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <section aria-labelledby="webinars" className="scroll-mt-24">
          <SectionHeading id="webinars" title="Upcoming webinars" description="Live sessions with time for questions." />
          <div className="mt-10">
            {content.isLoading ? <CardGridSkeleton /> : loadFailed ? unavailable : content.data!.webinars.length === 0 ? (
              <EmptyState icon={Calendar} title="No upcoming webinars" description="Check back soon for new sessions." />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {content.data!.webinars.map((webinar) => (
                  <Card key={webinar.id} className="flex flex-col">
                    <CardHeader className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" aria-hidden="true" />
                          {format(new Date(webinar.date_time), 'd MMM yyyy · h:mm a')}
                        </span>
                        <Badge variant={webinar.is_paid ? 'outline' : 'secondary'}>
                          {webinar.is_paid ? `KSh ${webinar.price}` : 'Free'}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg leading-snug">{webinar.title}</CardTitle>
                      {webinar.description && <CardDescription className="line-clamp-3">{webinar.description}</CardDescription>}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="flex items-center text-sm">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        {webinar.speaker}
                      </p>
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        <section aria-labelledby="downloads">
          <SectionHeading id="downloads" title="Downloads" description="Printable guides to keep at home, at work or in the car." />
          <div className="mt-10">
            {content.isLoading ? <CardGridSkeleton count={4} /> : loadFailed ? unavailable : content.data!.materials.length === 0 ? (
              <EmptyState icon={FileText} title="Downloadable guides are on the way" description="Printable first-aid resources will appear here once they are published." />
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {content.data!.materials.map((item) => (
                  <li key={item.id} className="flex flex-col rounded-xl border bg-card p-5">
                    <BookOpen className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
                    <p className="font-semibold">{item.title}</p>
                    {item.description && <p className="mt-1 flex-1 text-sm text-muted-foreground">{item.description}</p>}
                    <p className="mt-3 text-xs uppercase text-muted-foreground">
                      {item.file_type}{item.file_size ? ` · ${item.file_size}` : ''}
                    </p>
                    <Button asChild variant="outline" className="mt-4">
                      <a href={item.file_url} target="_blank" rel="noopener noreferrer" download>
                        <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                        Download
                        <span className="sr-only">: {item.title}</span>
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <Dialog open={!!openArticle} onOpenChange={(open) => !open && setOpenArticle(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl leading-snug">{openArticle?.title}</DialogTitle>
            <DialogDescription>{openArticle?.summary}</DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-line leading-relaxed">{openArticle?.content}</div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Learn;
