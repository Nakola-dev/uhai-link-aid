import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import { EMERGENCY_NUMBERS, telHref } from '@/lib/emergency-numbers';
import BrandLogo from '@/components/BrandLogo';

const SUPPORT_EMAIL = 'support@uhailink.com';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { to: '/demo/responder', label: 'What responders see' },
      { to: '/services', label: 'Services' },
      { to: '/learn', label: 'Learn first aid' },
      { to: '/auth?tab=signup', label: 'Create my medical ID' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/privacy-policy', label: 'Privacy Policy' },
      { to: '/terms-of-service', label: 'Terms of Service' },
      { to: '/medical-disclaimer', label: 'Medical disclaimer' },
    ],
  },
];

const Footer = () => (
  <footer className="border-t bg-card" role="contentinfo">
    <div className="container py-12">
      <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)_1.2fr]">
        <div className="space-y-3">
          <BrandLogo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Your emergency medical information, ready for whoever helps you first. Built in Kenya.
          </p>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <Mail className="h-4 w-4" aria-hidden="true" />
            {SUPPORT_EMAIL}
          </a>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="mb-3 font-sans text-sm font-semibold">{column.title}</h2>
            <ul className="space-y-2.5 text-sm">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className="mb-3 font-sans text-sm font-semibold">Emergency lines (Kenya)</h2>
          <ul className="space-y-2.5 text-sm">
            {EMERGENCY_NUMBERS.map((line) => (
              <li key={line.number}>
                <a href={telHref(line.number)} className="inline-flex items-center gap-2 hover:underline underline-offset-4">
                  <Phone className="h-4 w-4 text-destructive" aria-hidden="true" />
                  <span className="font-semibold tabular-nums">{line.number}</span>
                  <span className="text-muted-foreground">{line.label === 'Emergency' ? line.description : line.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} UhaiLink. All rights reserved.</p>
        <p>UhaiLink is not an emergency service. In an emergency, call 999 or 112.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
