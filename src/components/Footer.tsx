import { Heart, Twitter, Facebook, Instagram, Linkedin, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="relative border-t border-border/40 bg-gradient-to-br from-primary/5 via-background to-secondary/5 backdrop-blur">
      <div className="container mx-auto px-4 py-12">
        {/* Mini CTA */}
        <div className="max-w-3xl mx-auto text-center mb-12 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <h3 className="text-2xl font-bold mb-3">Become a Lifesaver — Join Our Community</h3>
          <p className="text-muted-foreground mb-4">
            Help us build a safer world, one QR code at a time
          </p>
          <Button 
            size="lg" 
            className="rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all group"
          >
            <Link to="/auth" className="flex items-center">
              Join Now
              <Heart className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" fill="currentColor" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 group cursor-pointer">
              <Heart className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" fill="currentColor" />
              <span className="text-xl font-bold">UhaiLink</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Emergency medical information when it matters most. Trusted by thousands worldwide.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:scale-110 hover:-translate-y-1 group"
                >
                  <social.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/learn" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  Learn
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Support</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="hover:text-primary transition-colors cursor-pointer hover:translate-x-1 inline-block">Help Center</li>
              <li className="hover:text-primary transition-colors cursor-pointer hover:translate-x-1 inline-block">Privacy Policy</li>
              <li className="hover:text-primary transition-colors cursor-pointer hover:translate-x-1 inline-block">Terms of Service</li>
              <li className="hover:text-primary transition-colors cursor-pointer hover:translate-x-1 inline-block">FAQ</li>
            </ul>
          </div>

          {/* Contact & Emergency */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Emergency Contacts</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-destructive" />
                Kenya Red Cross: 1199
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-destructive" />
                Ambulance: 999
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-destructive" />
                Police: 999
              </li>
              <li className="flex items-center gap-2 mt-4">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:support@uhailink.com" className="hover:text-primary transition-colors">
                  support@uhailink.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} UhaiLink. All rights reserved. Made with <Heart className="inline h-4 w-4 text-destructive" fill="currentColor" /> for saving lives.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
