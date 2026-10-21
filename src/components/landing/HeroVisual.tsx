import { QRCodeSVG } from 'qrcode.react';
import { AlertTriangle, Droplet, Heart, Phone, ShieldCheck } from 'lucide-react';

/**
 * Product illustration for the landing hero: a phone showing the responder view
 * and a printed medical ID card. All data is fictional (see lib/demo-profile.ts);
 * the card's QR code opens the public demo, never a real profile.
 */
const HeroVisual = () => {
  const demoUrl = `${window.location.origin}/demo/responder`;

  return (
    <div
      role="img"
      aria-label="Illustration: a phone showing a UhaiLink emergency profile for a fictional person, beside a printed medical ID card with a QR code."
      className="relative mx-auto h-[500px] w-full max-w-[440px] sm:h-[540px]"
    >
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

        {/* Phone */}
        <div className="absolute inset-x-0 top-0 mx-auto w-[255px] sm:inset-x-auto sm:right-4 sm:mx-0 sm:w-[270px]">
        <div className="animate-fade-in rounded-[2.4rem] border-[7px] border-foreground/90 bg-card shadow-elevation-3">
          <div className="mx-auto mt-2 h-1.5 w-16 rounded-full bg-foreground/15" />
          <div className="flex items-center justify-between px-4 pb-3 pt-3">
            <span className="flex items-center gap-1.5 text-xs font-bold">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Heart className="h-3 w-3" fill="currentColor" strokeWidth={0} />
              </span>
              Uhai<span className="-ml-1.5 text-primary">Link</span>
            </span>
            <span className="flex items-center gap-1 rounded-md bg-destructive px-2 py-1 text-[10px] font-semibold text-destructive-foreground">
              <Phone className="h-3 w-3" /> Call 999
            </span>
          </div>
          <div className="space-y-2.5 border-t px-4 py-4">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-destructive">Emergency medical information</p>
            <p className="font-display text-lg font-bold leading-tight">Amani Wanjiru</p>
            <div className="rounded-lg border-2 border-destructive p-2.5">
              <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-destructive">
                <AlertTriangle className="h-3 w-3" /> Allergies
              </p>
              <p className="text-sm font-semibold">Penicillin · Peanuts</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-2.5">
              <span className="flex items-center gap-1 text-[11px] font-semibold"><Droplet className="h-3 w-3" /> Blood type</span>
              <span className="text-xl font-bold">O+</span>
            </div>
            <div className="rounded-lg border p-2.5">
              <p className="mb-1 text-[11px] font-semibold">Medications · Conditions</p>
              <p className="text-xs">Salbutamol inhaler · Asthma</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-2.5">
              <div>
                <p className="text-xs font-semibold">Wanjiru Kamau</p>
                <p className="text-[10px] text-muted-foreground">Mother</p>
              </div>
              <span className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground">
                <Phone className="h-3 w-3" /> Call
              </span>
            </div>
          </div>
        </div>
        </div>

        {/* Printed ID card (hidden on small phones, where it would cover the screen content) */}
        <div className="absolute bottom-0 left-0 hidden w-[188px] -rotate-6 sm:-left-4 sm:block">
        <div className="animate-fade-in rounded-2xl border bg-white p-4 text-slate-900 shadow-elevation-3" style={{ animationDelay: '150ms' }}>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">UhaiLink Medical ID</p>
          <p className="mb-3 text-sm font-bold">Amani Wanjiru</p>
          <QRCodeSVG value={demoUrl} size={120} level="M" marginSize={2} bgColor="#FFFFFF" fgColor="#0F172A" className="mx-auto" />
          <p className="mt-3 text-center text-[10px] font-medium text-slate-600">Scan in an emergency — no app needed</p>
        </div>
        </div>

        {/* Fact chip */}
        <div
          className="animate-fade-in absolute bottom-10 right-0 flex items-center gap-2 rounded-full border bg-card px-3 py-2 text-xs font-medium shadow-elevation-2 sm:bottom-16"
          style={{ animationDelay: '300ms' }}
        >
          <ShieldCheck className="h-4 w-4 text-teal" />
          Every scan is logged
        </div>
      </div>
    </div>
  );
};

export default HeroVisual;
