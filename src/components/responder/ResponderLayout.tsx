import { ReactNode } from 'react';
import { Phone } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { EMERGENCY_NUMBERS, PRIMARY_EMERGENCY_NUMBER, telHref } from '@/lib/emergency-numbers';

/**
 * Minimal chrome for people reading a patient's information under stress:
 * no site navigation, no animation, one always-visible call action.
 */
const ResponderLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-40 border-b bg-card">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
        <BrandLogo compact />
        <a
          href={telHref(PRIMARY_EMERGENCY_NUMBER.number)}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-destructive px-4 text-sm font-semibold text-destructive-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          Call {PRIMARY_EMERGENCY_NUMBER.number}
        </a>
      </div>
    </header>
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      {children}
    </main>
    <footer className="mx-auto max-w-3xl px-4 pb-10 text-sm text-muted-foreground no-print">
      <p className="mb-2 font-medium text-foreground">Kenya emergency lines</p>
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {EMERGENCY_NUMBERS.map((line) => (
          <li key={line.number}>
            <a href={telHref(line.number)} className="font-semibold text-primary underline-offset-2 hover:underline">
              {line.number}
            </a>{' '}
            {line.label === 'Emergency' ? line.description : line.label}
          </li>
        ))}
      </ul>
    </footer>
  </div>
);

export default ResponderLayout;
