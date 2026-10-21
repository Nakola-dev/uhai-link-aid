import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Bot,
  Building2,
  Clock,
  GraduationCap,
  IdCard,
  Mail,
  Phone,
  QrCode,
  ScanLine,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { useReveal } from '@/hooks/use-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SectionHeading from '@/components/common/SectionHeading';
import Layout from '@/components/Layout';

const PARTNERSHIPS_EMAIL = 'support@uhailink.com';

const AVAILABLE = [
  { icon: IdCard, title: 'Medical profile', text: 'Blood type, allergies, medications, conditions, primary hospital and emergency contacts in one place you control.', to: '/auth?tab=signup', cta: 'Create my profile' },
  { icon: QrCode, title: 'QR medical ID', text: 'A private code that opens your emergency information on any phone. Download, print, or replace it whenever you need to.', to: '/auth?tab=signup', cta: 'Get my QR ID' },
  { icon: ScanLine, title: 'Responder view', text: 'A calm, single-screen summary for whoever is helping you, with tap-to-call contacts and no sign-in.', to: '/demo/responder', cta: 'See the demo' },
  { icon: ShieldAlert, title: 'SOS alerts', text: 'Confirm an SOS and UhaiLink records it and texts your emergency contacts, telling you exactly what was sent.', to: '/auth?tab=signup', cta: 'Set up SOS' },
  { icon: Bot, title: 'AI first-aid assistant', text: 'Step-by-step, plain-language first-aid guidance by chat. Not a diagnosis, and never a replacement for 999.', to: '/auth?tab=signup', cta: 'Try the assistant' },
  { icon: BookOpen, title: 'Learning centre', text: 'Free first-aid basics, videos, webinars and printable guides.', to: '/learn', cta: 'Start learning' },
];

const PLANNED = [
  { title: 'Physical QR cards and tags', text: 'Wallet cards, wristbands and keychain tags carrying your code. Pricing will be announced at launch.' },
  { title: 'Family accounts', text: 'Manage medical IDs for children or older relatives from one account.' },
  { title: 'Voice guidance', text: 'Hands-free first-aid guidance when you can\'t type.' },
  { title: 'Nearby facilities', text: 'Find the closest hospitals and ambulance services from your location.' },
];

const ORGANISATIONS = [
  { icon: GraduationCap, title: 'Schools and universities', text: 'Medical IDs for students and staff, and first-aid awareness sessions.' },
  { icon: Building2, title: 'Workplaces', text: 'Help teams set up medical IDs and know what to do in the first minutes.' },
  { icon: Users, title: 'Community groups', text: 'Bring first-aid knowledge and medical IDs to your members.' },
];

const Services = () => {
  const pageRef = useReveal<HTMLDivElement>();

  return (
    <Layout>
      <div ref={pageRef}>
        <section className="border-b bg-muted/40">
          <div className="container py-14 sm:py-20">
            <div className="max-w-3xl space-y-5">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Services</p>
              <h1 className="font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
                Everything you need for the first minutes of an emergency
              </h1>
              <p className="text-lg text-muted-foreground text-pretty">
                Creating your medical profile and QR medical ID is free. Here is what UhaiLink does today, and what is on the way.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="available-heading" className="container py-16 sm:py-20">
          <SectionHeading id="available-heading" title="Available now" description="Free for individuals." />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {AVAILABLE.map(({ icon: Icon, title, text, to, cta }) => (
              <article key={title} className="reveal flex flex-col rounded-2xl border bg-card p-6 shadow-elevation-1">
                <Icon className={`mb-4 h-7 w-7 ${title === 'SOS alerts' ? 'text-destructive' : 'text-primary'}`} aria-hidden="true" />
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 flex-1 text-muted-foreground">{text}</p>
                <Link to={to} className="mt-5 inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline">
                  {cta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="planned-heading" className="border-y bg-card">
          <div className="container py-16 sm:py-20">
            <SectionHeading
              id="planned-heading"
              title="On the way"
              description="These are planned and not available yet. We'll announce them when they are ready."
            />
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {PLANNED.map(({ title, text }) => (
                <li key={title} className="reveal flex gap-4 rounded-xl border p-5">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{title}</h3>
                      <Badge variant="secondary">Planned</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="org-heading" className="container py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div className="space-y-5">
              <SectionHeading
                id="org-heading"
                title="For organisations"
                description="We're working with early partners on group set-up and first-aid awareness. If that sounds useful for your organisation, tell us about it."
              />
              <Button asChild size="lg">
                <a href={`mailto:${PARTNERSHIPS_EMAIL}?subject=${encodeURIComponent('Organisation enquiry')}`}>
                  <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                  Email us
                </a>
              </Button>
            </div>
            <ul className="grid gap-4">
              {ORGANISATIONS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="reveal flex gap-4 rounded-xl border bg-card p-5">
                  <Icon className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="container pb-16 sm:pb-20">
          <div className="flex flex-col gap-6 rounded-3xl bg-primary px-6 py-10 text-primary-foreground sm:px-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight">Start with your free medical ID</h2>
              <p className="mt-1 text-primary-foreground/90">It takes about three minutes.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/auth?tab=signup">Create my medical ID</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <a href="tel:999">
                  <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
                  Emergency: 999
                </a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Services;
