'use client';

import Link from 'next/link';
import { useAuth } from '@/auth/auth-provider';

const features = [
  { number: '01', title: 'Identity, not passwords', text: 'Keycloak owns sign-up, credentials, sessions, and account recovery.' },
  { number: '02', title: 'Short-lived access', text: 'PKCE sign-in keeps browser tokens in memory and renews them before API calls.' },
  { number: '03', title: 'Every request verified', text: 'The Node API verifies signatures, issuer, expiry, and audience with Keycloak JWKS.' },
];

export default function HomePage() {
  const { isAuthenticated, isLoading, login, register, error } = useAuth();

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="status-pill"><span className="status-dot" /> Identity playground</div>
          <h1>Authentication,<br /><span>done right.</span></h1>
          <p className="hero-description">A practical, end-to-end demo of modern authentication. Next.js, Node.js, and Keycloak working together—with no database required.</p>
          <div className="hero-actions">
            {isAuthenticated
              ? <Link className="button button-primary" href="/dashboard">Open your dashboard <span aria-hidden="true">↗</span></Link>
              : <>
                <button className="button button-primary" disabled={isLoading} onClick={() => void login()}>Sign in <span aria-hidden="true">↗</span></button>
                <button className="button button-secondary" disabled={isLoading} onClick={() => void register()}>Create account</button>
              </>}
          </div>
          {error && <p className="error-message">{error}</p>}
          <p className="hero-note">Secure sign-in powered by Keycloak</p>
        </div>
        <div className="hero-visual" aria-label="Authentication flow illustration">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="auth-card">
            <div className="auth-card-top"><span className="tiny-lock">⌑</span><span>SECURE SESSION</span><span className="live-dot" /></div>
            <div className="avatar">K</div>
            <div className="mock-line mock-line-wide" /><div className="mock-line mock-line-short" />
            <div className="token-row"><span>ACCESS TOKEN</span><span className="token-active">● VALID</span></div>
            <div className="token-track"><span /></div>
            <div className="claims"><span>PKCE</span><span>JWT</span><span>JWKS</span></div>
          </div>
          <div className="floating-tag tag-keycloak"><span>✳</span> Keycloak</div>
          <div className="floating-tag tag-api"><span>⌘</span> Protected API</div>
        </div>
      </section>

      <section className="features-section" id="how-it-works">
        <div className="section-heading"><span className="eyebrow">THE FLOW</span><h2>Security at every step.</h2></div>
        <div className="feature-grid">
          {features.map((feature) => <article className="feature-card" key={feature.number}>
            <span className="feature-number">{feature.number}</span><h3>{feature.title}</h3><p>{feature.text}</p>
          </article>)}
        </div>
      </section>
      <section className="bottom-cta"><div><span className="eyebrow">READY TO EXPLORE?</span><h2>Your protected space awaits.</h2></div><Link className="button button-primary" href={isAuthenticated ? '/dashboard' : '#'} onClick={!isAuthenticated ? (event) => { event.preventDefault(); void login(); } : undefined}>Go to dashboard <span aria-hidden="true">↗</span></Link></section>
    </>
  );
}
