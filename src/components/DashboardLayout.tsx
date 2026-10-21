import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  BookOpen,
  Bot,
  CreditCard,
  IdCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldAlert,
  ShieldCheck,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import BrandLogo from '@/components/BrandLogo';

interface DashboardLayoutProps {
  children: ReactNode;
  user?: {
    full_name?: string | null;
    profile_photo_url?: string | null;
  } | null;
  isAdmin?: boolean;
}

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
  /** Older URLs that render the same page. */
  aliases?: string[];
}

const SOS_PATH = '/dashboard/emergency';

const mainNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', aliases: ['/dashboard/user'] },
  { icon: IdCard, label: 'My Medical ID', path: '/dashboard/qr', aliases: ['/dashboard/user/qr'] },
  { icon: User, label: 'Medical profile', path: '/dashboard/profile', aliases: ['/dashboard/user/profile'] },
  { icon: Bot, label: 'AI first aid', path: '/dashboard/assistant', aliases: ['/dashboard/user/assistant'] },
  { icon: BookOpen, label: 'Learn', path: '/dashboard/learn', aliases: ['/dashboard/user/learn'] },
  { icon: CreditCard, label: 'Get a QR tag', path: '/dashboard/buy-qr', aliases: ['/dashboard/user/buy-qr'] },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings', aliases: ['/dashboard/user/settings'] },
];

const adminNav: NavItem[] = [
  { icon: ShieldCheck, label: 'Admin dashboard', path: '/admin', aliases: ['/dashboard/admin'] },
  { icon: Activity, label: 'Emergency operations', path: '/admin/emergencies', aliases: ['/dashboard/admin/emergencies'] },
];

const mobileTabs: NavItem[] = [
  mainNav[0],
  { ...mainNav[1], label: 'My ID' },
  { icon: BookOpen, label: 'Learn', path: '/dashboard/learn', aliases: ['/dashboard/user/learn'] },
];

const DashboardLayout = ({ children, user, isAdmin }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (item: NavItem) =>
    location.pathname === item.path || (item.aliases ?? []).includes(location.pathname);
  const onSos = location.pathname === SOS_PATH;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Could not sign out. Please try again.');
      return;
    }
    navigate('/auth');
  };

  const navLinkClass = (item: NavItem) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      isActive(item)
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    );

  const navigation = (onNavigate?: () => void) => (
    <nav className="flex flex-col gap-1" aria-label="Dashboard">
      <Link
        to={SOS_PATH}
        onClick={onNavigate}
        aria-current={onSos ? 'page' : undefined}
        className={cn(
          'mb-3 flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          onSos
            ? 'bg-destructive text-destructive-foreground'
            : 'bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground'
        )}
      >
        <ShieldAlert className="h-5 w-5" aria-hidden="true" />
        Emergency SOS
      </Link>
      {mainNav.map((item) => (
        <Link key={item.path} to={item.path} onClick={onNavigate} className={navLinkClass(item)}
          aria-current={isActive(item) ? 'page' : undefined}>
          <item.icon className="h-5 w-5" aria-hidden="true" />
          {item.label}
        </Link>
      ))}
      {isAdmin && (
        <>
          <p className="mt-5 mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin</p>
          {adminNav.map((item) => (
            <Link key={item.path} to={item.path} onClick={onNavigate} className={navLinkClass(item)}
              aria-current={isActive(item) ? 'page' : undefined}>
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </>
      )}
    </nav>
  );

  const signOutButton = (
    <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={handleLogout}>
      <LogOut className="h-5 w-5 mr-3" aria-hidden="true" />
      Sign out
    </Button>
  );

  return (
    <div className="min-h-screen flex w-full bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:z-[200] focus:top-3 focus:left-3 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r bg-card sticky top-0 h-screen">
        <div className="h-16 flex items-center px-5 border-b">
          <BrandLogo to="/dashboard" />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">{navigation()}</div>
        <div className="p-3 border-t">{signOutButton}</div>
      </aside>

      {/* Mobile menu: Radix dialog handles focus trapping, Escape and focus return. */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SheetTitle className="h-16 flex items-center px-5 border-b">
            <BrandLogo to="/dashboard" />
          </SheetTitle>
          <div className="flex-1 overflow-y-auto px-3 py-5">{navigation(() => setMenuOpen(false))}</div>
          <div className="p-3 border-t">{signOutButton}</div>
        </SheetContent>
      </Sheet>

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <header className="h-16 sticky top-0 z-40 border-b bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75">
          <div className="h-full px-4 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 lg:hidden">
              <BrandLogo to="/dashboard" compact />
            </div>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium leading-tight">{user?.full_name || 'Your account'}</p>
                <p className="text-xs text-muted-foreground">{isAdmin ? 'Administrator' : 'Member'}</p>
              </div>
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.profile_photo_url || undefined} alt="" />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="flex-1 p-4 pb-28 lg:p-8 lg:pb-8 focus:outline-none">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation keeps SOS one tap away on every screen. */}
      <nav
        aria-label="Quick navigation"
        data-sticky-overlay
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 h-16">
          {mobileTabs.slice(0, 2).map((item) => (
            <Link key={item.path} to={item.path} aria-current={isActive(item) ? 'page' : undefined}
              className={cn('flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
                isActive(item) ? 'text-primary' : 'text-muted-foreground')}>
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
          <Link to={SOS_PATH} aria-current={onSos ? 'page' : undefined} aria-label="Emergency SOS"
            className="flex items-center justify-center">
            <span className="-mt-6 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg ring-4 ring-card">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              <span className="text-[10px] font-bold leading-none mt-0.5">SOS</span>
            </span>
          </Link>
          {mobileTabs.slice(2).map((item) => (
            <Link key={item.path} to={item.path} aria-current={isActive(item) ? 'page' : undefined}
              className={cn('flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
                isActive(item) ? 'text-primary' : 'text-muted-foreground')}>
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
          <button type="button" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} aria-haspopup="dialog"
            className="flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-muted-foreground">
            <Menu className="h-5 w-5" aria-hidden="true" />
            Menu
          </button>
        </div>
      </nav>
    </div>
  );
};

export default DashboardLayout;
