import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Menu, Phone } from 'lucide-react';
import { useSession } from '@/hooks/use-session';
import { PRIMARY_EMERGENCY_NUMBER, telHref } from '@/lib/emergency-numbers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import BrandLogo from '@/components/BrandLogo';
import ThemeToggle from '@/components/ThemeToggle';

const NAV_LINKS = [
  { to: '/services', label: 'Services' },
  { to: '/learn', label: 'Learn' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { session } = useSession();
  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-header w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between gap-4">
        <BrandLogo />

        <nav className="hidden lg:flex items-center gap-1" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              aria-current={isActive(link.to) ? 'page' : undefined}
              className={cn(
                'relative rounded-md px-3 py-2 text-sm font-medium transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive(link.to) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                'after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:rounded-full after:bg-primary after:transition-transform after:duration-base',
                isActive(link.to) ? 'after:scale-x-100' : 'after:scale-x-0'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <a
            href={telHref(PRIMARY_EMERGENCY_NUMBER.number)}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-destructive hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Emergency? Call {PRIMARY_EMERGENCY_NUMBER.number}
          </a>
          <ThemeToggle />
          {session ? (
            <Button asChild>
              <Link to="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden="true" />
                Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild>
                <Link to="/auth?tab=signup">Create my medical ID</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen} aria-haspopup="dialog">
            <Menu className="h-6 w-6" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="flex w-80 flex-col gap-6">
          <SheetTitle className="text-left">
            <BrandLogo />
          </SheetTitle>
          <nav className="flex flex-col gap-1" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive(link.to) ? 'page' : undefined}
                className={cn(
                  'rounded-lg px-3 py-3 text-base font-medium',
                  isActive(link.to) ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-2">
            {session ? (
              <Button asChild size="lg">
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Go to my dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link to="/auth?tab=signup" onClick={() => setMenuOpen(false)}>Create my medical ID</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/auth" onClick={() => setMenuOpen(false)}>Sign in</Link>
                </Button>
              </>
            )}
            <Button asChild size="lg" variant="destructive">
              <a href={telHref(PRIMARY_EMERGENCY_NUMBER.number)}>
                <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
                Emergency? Call {PRIMARY_EMERGENCY_NUMBER.number}
              </a>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
