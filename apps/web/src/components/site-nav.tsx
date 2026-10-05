'use client';

import Link from 'next/link';
import { useAuth } from '@/auth/auth-provider';

export function SiteNav() {
  const { isLoading, isAuthenticated, login, logout } = useAuth();
  return (
    <nav className="site-nav" aria-label="Main navigation">
      <Link href="/#how-it-works">How it works</Link>
      {isAuthenticated && <Link href="/dashboard">Dashboard</Link>}
      {!isLoading && (isAuthenticated
        ? <button className="nav-button" onClick={() => void logout()}>Sign out</button>
        : <button className="nav-button" onClick={() => void login()}>Sign in</button>)}
    </nav>
  );
}
