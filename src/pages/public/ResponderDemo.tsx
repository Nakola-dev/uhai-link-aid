import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ResponderLayout from '@/components/responder/ResponderLayout';
import ResponderProfile from '@/components/responder/ResponderProfile';
import { DEMO_PROFILE } from '@/lib/demo-profile';

/** Shows exactly what a responder sees after scanning, using fictional data. */
const ResponderDemo = () => (
  <ResponderLayout>
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-primary/30 bg-accent p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex gap-2 text-sm text-accent-foreground">
        <Info className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>
          <strong>Demo with a fictional person.</strong> This is the screen a first responder sees after
          scanning a UhaiLink QR code. Phone numbers here don't dial.
        </span>
      </p>
      <Button asChild size="sm" className="shrink-0">
        <Link to="/auth?tab=signup">Create my medical ID</Link>
      </Button>
    </div>
    <ResponderProfile profile={DEMO_PROFILE} demo />
  </ResponderLayout>
);

export default ResponderDemo;
