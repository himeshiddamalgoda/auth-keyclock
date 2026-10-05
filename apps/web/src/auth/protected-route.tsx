'use client';

import type { ReactNode } from 'react';
import { useAuth } from './auth-provider';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, login, error } = useAuth();

  if (isLoading) {
    return <div className="state-card" role="status">Checking your session…</div>;
  }

  if (!isAuthenticated) {
    return (
      <section className="state-card">
        <span className="eyebrow">Protected area</span>
        <h1>Sign in to continue</h1>
        <p>Your session is checked by Keycloak before this page is shown.</p>
        {error && <p className="error-message">{error}</p>}
        <button className="button button-primary" onClick={() => void login()}>Continue to sign in</button>
      </section>
    );
  }

  return children;
}
