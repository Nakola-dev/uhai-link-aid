import { Link } from 'react-router-dom';
import { Clock, CreditCard, KeyRound, Printer, Smartphone, Watch } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';

const PRODUCTS = [
  { icon: CreditCard, name: 'Wallet card', text: 'A durable card the size of your ID, carrying your QR code.' },
  { icon: Watch, name: 'Wristband', text: 'A silicone band with your QR code, for sport, travel or everyday wear.' },
  { icon: KeyRound, name: 'Keychain tag', text: 'A small tag that stays with your keys.' },
];

/**
 * Physical tags are not on sale yet (no payment integration), so this page says so
 * and points to what works today: printing or saving the QR code.
 */
const BuyQRTag = () => {
  const { profile, isAdmin } = useAuth();

  return (
    <DashboardLayout user={profile} isAdmin={isAdmin}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">QR cards and tags</h1>
          <p className="text-muted-foreground">
            Ready-made cards and tags carrying your QR medical ID are on the way. They aren't available to order yet.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-3">
          {PRODUCTS.map(({ icon: Icon, name, text }) => (
            <li key={name} className="flex flex-col rounded-2xl border bg-card p-5">
              <Icon className="mb-3 h-7 w-7 text-primary" aria-hidden="true" />
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-sans text-base font-semibold">{name}</h2>
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  Coming soon
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>

        <section aria-labelledby="today-heading" className="rounded-2xl border-2 border-primary/30 bg-accent/60 p-6">
          <h2 id="today-heading" className="font-sans text-lg font-semibold">You can carry your code today</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your QR medical ID works the same printed on paper or saved on your phone.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex gap-3 rounded-xl border bg-card p-4 text-sm">
              <Printer className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              Print it and keep it in your wallet or ID holder.
            </div>
            <div className="flex gap-3 rounded-xl border bg-card p-4 text-sm">
              <Smartphone className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              Save the image as your lock-screen wallpaper.
            </div>
          </div>
          <Button asChild className="mt-5">
            <Link to="/dashboard/qr">Open my Medical ID</Link>
          </Button>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default BuyQRTag;
