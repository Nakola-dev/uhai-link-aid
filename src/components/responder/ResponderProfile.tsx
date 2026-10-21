import { ReactNode, useId } from 'react';
import { Activity, AlertTriangle, Building2, Droplet, Info, Phone, Pill, User } from 'lucide-react';
import { telHref } from '@/lib/emergency-numbers';
import { cn } from '@/lib/utils';
import { ResponderProfileData, responderContacts } from '@/lib/responder';

const GENDER_LABELS: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
};

function Section({ icon: Icon, title, critical = false, children }: {
  icon: typeof User;
  title: string;
  critical?: boolean;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={cn('rounded-xl border bg-card p-4 sm:p-5', critical && 'border-2 border-destructive')}
    >
      <h2 id={headingId} className={cn('mb-3 flex items-center gap-2 text-base font-semibold', critical && 'text-destructive')}>
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function ItemList({ items, emptyText }: { items: string[] | null; emptyText: string }) {
  if (!items || items.length === 0) {
    return <p className="text-muted-foreground">{emptyText}</p>;
  }
  return (
    <ul className="space-y-1.5">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-2 text-lg font-medium leading-snug">
          <span aria-hidden="true" className="text-muted-foreground">•</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

interface ResponderProfileProps {
  profile: ResponderProfileData;
  /** Disables phone links in demonstrations that use fictional data. */
  demo?: boolean;
}

/**
 * The view a first responder sees after scanning a QR code. Ordered by clinical
 * priority; absent information is stated as "not recorded", never as "none".
 */
const ResponderProfile = ({ profile, demo = false }: ResponderProfileProps) => {
  const contacts = responderContacts(profile);
  const hasAllergies = (profile.allergies?.length ?? 0) > 0;
  const updated = profile.updated_at
    ? new Date(profile.updated_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const phoneLink = (phone: string, label: string) =>
    demo ? (
      <span className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 font-semibold tabular-nums">
        <Phone className="h-4 w-4" aria-hidden="true" />
        {phone}
      </span>
    ) : (
      <a
        href={telHref(phone)}
        aria-label={`Call ${label}, ${phone}`}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 font-semibold text-primary-foreground tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Phone className="h-4 w-4" aria-hidden="true" />
        {phone}
      </a>
    );

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-wider text-destructive">Emergency medical information</p>
        <h1 className="text-3xl font-bold tracking-tight">{profile.full_name || 'Name not recorded'}</h1>
        {profile.gender && GENDER_LABELS[profile.gender] && (
          <p className="text-muted-foreground">{GENDER_LABELS[profile.gender]}</p>
        )}
      </div>

      <div className="flex gap-3 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
        <Info className="h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
        <p>
          Provided by the patient{updated ? `, last updated ${updated}` : ''}. It may be incomplete and has not
          been verified by UhaiLink. Absence of information does not mean absence of a condition.
        </p>
      </div>

      <Section icon={AlertTriangle} title="Allergies" critical={hasAllergies}>
        <ItemList items={profile.allergies} emptyText="No allergies recorded." />
      </Section>

      <Section icon={Droplet} title="Blood type">
        {profile.blood_type && profile.blood_type !== 'Unknown' ? (
          <p className="flex items-baseline gap-3">
            <span className="text-4xl font-bold tabular-nums">{profile.blood_type}</span>
            <span className="text-sm text-muted-foreground">Self-reported — confirm before transfusion</span>
          </p>
        ) : (
          <p className="text-muted-foreground">Blood type not recorded.</p>
        )}
      </Section>

      <Section icon={Pill} title="Current medications">
        <ItemList items={profile.medications} emptyText="No medications recorded." />
      </Section>

      <Section icon={Activity} title="Medical conditions">
        <ItemList items={profile.chronic_conditions} emptyText="No conditions recorded." />
      </Section>

      <Section icon={Phone} title="Emergency contacts">
        {contacts.length > 0 ? (
          <ul className="space-y-3">
            {contacts.map((contact, index) => (
              <li key={`${contact.phone}-${index}`} className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{contact.name}</p>
                  {contact.relationship && <p className="text-sm text-muted-foreground">{contact.relationship}</p>}
                </div>
                {phoneLink(contact.phone, contact.name)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No emergency contact recorded.</p>
        )}
      </Section>

      <Section icon={Building2} title="Primary hospital">
        <p className={cn(profile.primary_hospital ? 'text-lg font-medium' : 'text-muted-foreground')}>
          {profile.primary_hospital || 'Not recorded.'}
        </p>
      </Section>

      {profile.phone && (
        <Section icon={User} title="Patient's phone">
          {phoneLink(profile.phone, profile.full_name ? `${profile.full_name}'s phone` : "the patient's phone")}
        </Section>
      )}
    </div>
  );
};

export default ResponderProfile;
