import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/auth/auth-provider';
import { SiteNav } from '@/components/site-nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Keycloak Auth Lab',
  description: 'A secure authentication integration demo with Next.js, Node.js, and Keycloak.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="site-shell">
            <header className="site-header">
              <Link className="brand" href="/" aria-label="Auth Lab home">
                <span className="brand-mark">A</span>
                <span>auth<span className="brand-muted">lab</span></span>
              </Link>
              <SiteNav />
            </header>
            <main>{children}</main>
            <footer className="site-footer">A hands-on identity demo · Keycloak + TypeScript</footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
