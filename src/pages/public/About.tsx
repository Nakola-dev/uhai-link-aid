import { Link } from 'react-router-dom';
import { CheckCircle2, Globe, Heart, Mail, Rocket, Shield, Sparkles, Target, Users } from 'lucide-react';
import { useReveal } from '@/hooks/use-reveal';
import { Button } from '@/components/ui/button';
import SectionHeading from '@/components/common/SectionHeading';
import Layout from '@/components/Layout';

const VALUES = [
  { icon: Shield, title: 'Safety first', text: 'Every design decision starts with the person in the emergency and the person helping them.' },
  { icon: Heart, title: 'Reliability', text: 'We only promise what the product actually does — and we tell you when something fails.' },
  { icon: CheckCircle2, title: 'Integrity', text: 'Your health information is used for emergency response, with your consent.' },
  { icon: Target, title: 'Accessibility', text: 'Clear language, large controls and pages that work on everyday phones and slow networks.' },
  { icon: Users, title: 'Community', text: 'Built in Kenya, with first-aid knowledge that anyone can use.' },
  { icon: Sparkles, title: 'Thoughtful technology', text: 'AI is used to guide, never to diagnose or replace emergency services.' },
];

const ROADMAP = [
  'Physical QR cards, wristbands and keychain tags',
  'Family accounts for children and older relatives',
  'Voice-guided first aid',
  'Directory of nearby hospitals and ambulance services',
  'Partnerships with schools, universities and workplaces',
];

const About = () => {
  const pageRef = useReveal<HTMLDivElement>();

  return (
    <Layout>
      <div ref={pageRef}>
        <section className="border-b bg-muted/40">
          <div className="container py-14 sm:py-20">
            <div className="max-w-3xl space-y-5">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">About UhaiLink</p>
              <h1 className="font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
                Critical information, where it's needed, when it's needed
              </h1>
              <p className="text-lg text-muted-foreground text-pretty">
                "Uhai" means life in Kiswahili. UhaiLink connects the people helping in an emergency with the information
                that helps them act — starting in Kenya.
              </p>
            </div>
          </div>
        </section>

        <section className="container grid gap-6 py-16 sm:py-20 md:grid-cols-2">
          <div className="reveal rounded-2xl border bg-card p-8">
            <Target className="mb-4 h-7 w-7 text-primary" aria-hidden="true" />
            <h2 className="text-2xl font-bold tracking-tight">Our mission</h2>
            <p className="mt-3 text-muted-foreground">
              To improve the speed and accuracy of emergency response by making vital medical information available
              the moment it is needed — through a simple scan, timely alerts to loved ones, and practical first-aid knowledge.
            </p>
          </div>
          <div className="reveal rounded-2xl border bg-card p-8">
            <Globe className="mb-4 h-7 w-7 text-primary" aria-hidden="true" />
            <h2 className="text-2xl font-bold tracking-tight">Our vision</h2>
            <p className="mt-3 text-muted-foreground">
              A reliable emergency-support ecosystem for Africa that helps communities prepare for, respond to and
              recover from emergencies.
            </p>
          </div>
        </section>

        <section aria-labelledby="story-heading" className="border-y bg-card">
          <div className="container grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_1.5fr]">
            <SectionHeading id="story-heading" eyebrow="Our story" title="Why we built UhaiLink" />
            <div className="reveal space-y-4 text-lg text-muted-foreground">
              <p>
                UhaiLink began with a hard truth about emergencies in Kenya: help often arrives without the information
                that matters most. Responders can't always tell whether someone has an allergy, takes a blood thinner or
                lives with a condition that changes how they should be treated.
              </p>
              <p>
                We wanted the people closest to an emergency — a paramedic, a nurse, a neighbour — to know those
                things in seconds, and for families to hear about it straight away.
              </p>
              <p className="font-medium text-foreground">
                So we built a medical ID anyone can scan, an SOS that reaches the people you choose, and first-aid
                guidance for the minutes before help arrives.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="values-heading" className="container py-16 sm:py-20">
          <SectionHeading id="values-heading" title="What guides us" />
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="reveal">
                <Icon className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="roadmap-heading" className="border-t bg-muted/40">
          <div className="container grid gap-10 py-16 sm:py-20 lg:grid-cols-2">
            <SectionHeading
              id="roadmap-heading"
              eyebrow="Roadmap"
              title="Where we're heading"
              description="Plans, not promises — these are not available yet."
            />
            <ul className="reveal space-y-3">
              {ROADMAP.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-xl border bg-card p-4">
                  <Rocket className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="container py-16 sm:py-20">
          <div className="flex flex-col gap-6 rounded-3xl border bg-card p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Work with us</h2>
              <p className="mt-1 text-muted-foreground">Organisations, health workers and early adopters — we'd like to hear from you.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/contact">
                  <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                  Get in touch
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/services">See our services</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
