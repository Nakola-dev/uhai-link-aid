import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

const Layout = ({ children, showHeader = true, showFooter = true }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Skip to main content - WCAG 2.4.1 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:z-skip focus:top-3 focus:left-3 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-elevation-2"
      >
        Skip to main content
      </a>
      {showHeader && <Header />}
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
