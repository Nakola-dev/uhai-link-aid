import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BellRing,
  Bot,
  BookOpen,
  Eye,
  FileLock2,
  IdCard,
  KeyRound,
  ListChecks,
  Phone,
  QrCode,
  RefreshCw,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  UserRoundPen,
  WifiOff,
} from 'lucide-react';
import { useReveal } from '@/hooks/use-reveal';
import { EMERGENCY_NUMBERS, telHref } from '@/lib/emergency-numbers';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SectionHeading from '@/components/common/SectionHeading';
import Layout from '@/components/Layout';

// Decorative and needs the QR library: loaded after the hero text, in a same-size placeholder.
const HeroVisual = lazy(() => import('@/components/landing/HeroVisual'));

const TRUST_FACTS = [
  { icon: Smartphone, text: 'Opens with any phone camera — no app needed' },
  { icon: Eye, text: 'Responders see emergency details only' },
  { icon: RefreshCw, text: 'Replace your code any time' },
  { icon: ListChecks, text: 'Your consent is recorded before health data is stored' },
];

const STEPS = [
  { icon: UserRoundPen, title: 'Create your medical profile', text: 'Add your blood type, allergies, medications, conditions and the people to contact. It takes about three minutes.' },
  { icon: QrCode, title: 'Get your QR medical ID', text: 'UhaiLink generates a private code that links to your emergency information — nothing else.' },
  { icon: IdCard, title: 'Keep it where it can be found', text: 'Print it for your wallet, save it as your lock screen, or put it on a tag or keychain.' },
  { icon: ScanLine, title: 'Responders scan it', text: 'Anyone helping you scans with their camera and sees allergies, medications, conditions and who to call. Scanning shows information — it does not alert anyone.' },
  { icon: BellRing, title: 'Alert your people with SOS', text: 'When you press SOS and confirm, your emergency contacts get an SMS with your location if you allow it. Always call 999 or 112 too.' },
  { icon: BookOpen, title: 'Learn what to do', text: 'Short first-aid guides and an AI assistant help you act in the first minutes, for yourself or someone else.' },
];

const FEATURES = [
  {
    icon: ShieldAlert,
    title: 'One-tap SOS',
    text: 'A confirmed SOS records the emergency and texts your contacts. The app tells you exactly how many messages were sent — and offers direct calls if any fail.',
  },
  {
    icon: Bot,
    title: 'AI first-aid guidance',
    text: 'Describe what is happening and get calm, step-by-step guidance. It never replaces 999 or a clinician, and your name is never sent to the AI.',
  },
  {
    icon: BookOpen,
    title: 'Learning centre',
    text: 'First-aid basics, videos, webinars and printable guides — free for everyone, with progress tracking when you sign in.',
  },
  {
    icon: WifiOff,
    title: 'Works when data runs out',
    text: 'A printed code works even if your phone is lost or flat. Call buttons for 999, 112 and 1199 work without mobile data.',
  },
];

const SECURITY = [
  { icon: FileLock2, title: 'Access is locked down', text: 'Database rules mean only you, and authorised UhaiLink administrators, can open or change your record.' },
  { icon: ScanLine, title: 'Every scan is logged', text: 'Each time your code is opened, the time is recorded and repeated scans are rate-limited.' },
  { icon: KeyRound, title: 'Lost your code? Replace it', text: 'Issue a new code in one tap. The old one stops working immediately.' },
  { icon: ShieldCheck, title: 'Emergency information only', text: 'Responders see what helps in an emergency — not your account, email or full history.' },
];

const FAQS = [
  { q: 'What does a responder see when they scan my code?', a: 'Your name, allergies, blood type, current medications, medical conditions, primary hospital and your emergency contacts with tap-to-call buttons. They never see your email, password or account settings.' },
  { q: 'Does scanning the code call an ambulance?', a: 'No. Scanning only shows your emergency information. To alert your contacts, you (or someone with your phone) presses SOS in the app. Emergency services are always reached by calling 999 or 112.' },
  { q: 'What if I lose my card or someone copies my code?', a: 'Open My Medical ID and issue a new code. The old code stops working straight away; print or save the new one.' },
  { q: 'Do responders need to install anything?', a: 'No. Any phone camera that reads QR codes opens your information in a web browser.' },
  { q: 'Is it free?', a: 'Creating your profile and QR medical ID is free. Physical cards and tags will be offered separately.' },
  { q: 'Does it work without internet?', a: 'Responders need a connection to open your information, and SOS needs a connection to send SMS. Calling 999, 112 or 1199 from the app works without mobile data.' },
];

const Index = () => {
  const pageRef = useReveal<HTMLDivElement>();

  return (
    <Layout>
      <div ref={pageRef}>
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60rem_30rem_at_80%_-10%,hsl(var(--primary)/0.08),transparent)]" />
          <div className="container relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:py-24">
            <div className="space-y-7">
              {/* Hero text is not animated: it is the LCP element and must paint as soon as it renders. */}
              <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden="true" />
                Empowering you to act when every second counts
              </p>
              <h1 className="font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Your medical identity, ready when seconds matter.
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground text-pretty sm:text-xl">
                Give first responders secure access to your critical medical information when you need help most —
                with a QR code anyone can scan.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-6 text-base">
                  <Link to="/auth?tab=signup">
                    Create my medical ID
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                  <Link to="/demo/responder">See what responders see</Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Free to create · Takes about three minutes</p>
            </div>
            <Suspense fallback={<div aria-hidden="true" className="mx-auto h-[500px] w-full max-w-[440px] sm:h-[540px]" />}>
              <HeroVisual />
            </Suspense>
          </div>
        </section>

        {/* Trust facts */}
        <section aria-label="Key facts" className="border-b bg-card">
          <ul className="container grid gap-x-8 gap-y-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_FACTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm font-medium">
                <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section id="how-it-works" aria-labelledby="how-heading" className="container scroll-mt-20 py-20 sm:py-24">
          <SectionHeading id="how-heading" eyebrow="How it works" title="From sign-up to safety net in six steps" />
          <ol className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="reveal relative pl-14" style={{ transitionDelay: `${(index % 3) * 70}ms` }}>
                <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Step {index + 1}</p>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Responder view spotlight */}
        <section aria-labelledby="responder-heading" className="border-y bg-muted/50">
          <div className="container grid items-center gap-12 py-20 sm:py-24 lg:grid-cols-2">
            <div className="reveal space-y-6">
              <SectionHeading
                id="responder-heading"
                eyebrow="Built for the person helping you"
                title="Clear enough to read in a hurry"
                description="The responder screen puts allergies first, says plainly when something isn't recorded, and makes every contact one tap away. No menus, no sign-in, no animations."
              />
              <Button asChild size="lg" variant="outline">
                <Link to="/demo/responder">
                  Open the responder demo
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <ol className="reveal space-y-3">
              {[
                ['Allergies', 'Shown first, highlighted when present'],
                ['Blood type', 'Marked as self-reported'],
                ['Medications & conditions', 'Listed in plain words'],
                ['Emergency contacts', 'Tap to call, in your chosen order'],
                ['Primary hospital', 'So care can be continued'],
              ].map(([title, text], index) => (
                <li key={title} className="flex items-center gap-4 rounded-xl border bg-card p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground tabular-nums">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section aria-labelledby="features-heading" className="container py-20 sm:py-24">
          <SectionHeading id="features-heading" eyebrow="More than a QR code" title="Help for the moments before help arrives" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="reveal rounded-2xl border bg-card p-6 shadow-elevation-1" style={{ transitionDelay: `${(index % 2) * 80}ms` }}>
                <Icon className={`mb-4 h-7 w-7 ${title === 'One-tap SOS' ? 'text-destructive' : 'text-primary'}`} aria-hidden="true" />
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy & security */}
        <section aria-labelledby="security-heading" className="border-y bg-card">
          <div className="container py-20 sm:py-24">
            <SectionHeading
              id="security-heading"
              eyebrow="Privacy & security"
              title="Your information, under your control"
              description="Health information deserves care. Here is how UhaiLink handles yours."
            />
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {SECURITY.map(({ icon: Icon, title, text }) => (
                <div key={title} className="reveal">
                  <Icon className="mb-3 h-6 w-6 text-teal" aria-hidden="true" />
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
            <p className="mt-10 text-sm text-muted-foreground">
              Read the <Link to="/privacy-policy" className="font-medium text-primary underline-offset-4 hover:underline">Privacy Policy</Link>{' '}
              and <Link to="/medical-disclaimer" className="font-medium text-primary underline-offset-4 hover:underline">medical disclaimer</Link>.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="container grid gap-10 py-20 sm:py-24 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading id="faq-heading" eyebrow="Questions" title="Good to know" />
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map(({ q, a }, index) => (
              <AccordionItem key={q} value={`faq-${index}`}>
                <AccordionTrigger className="text-left text-base">{q}</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Final CTA */}
        <section className="container pb-20 sm:pb-24">
          <div className="reveal flex flex-col items-start gap-6 rounded-3xl bg-primary px-6 py-12 text-primary-foreground sm:px-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-bold tracking-tight text-balance">Set up your medical ID today</h2>
              <p className="max-w-xl text-primary-foreground/90">It takes about three minutes, and it could save the people helping you precious time.</p>
            </div>
            <Button asChild size="lg" variant="secondary" className="h-12 px-6 text-base">
              <Link to="/auth?tab=signup">Create my medical ID</Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="flex items-center gap-2 font-semibold">
              <Phone className="h-4 w-4 text-destructive" aria-hidden="true" />
              In an emergency right now?
            </span>
            {EMERGENCY_NUMBERS.map((line) => (
              <a key={line.number} href={telHref(line.number)} className="font-semibold text-destructive underline-offset-4 hover:underline">
                Call {line.number} <span className="font-normal text-muted-foreground">({line.label})</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
