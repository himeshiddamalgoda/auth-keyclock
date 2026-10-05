'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ProtectedRoute } from '@/auth/protected-route';
import { useAuth } from '@/auth/auth-provider';
import { apiRequest, type Profile } from '@/lib/api';

function ProfilePanel() {
  const { getAccessToken, userName, logout } = useAuth();
  const [profile, setProfile] = useState<Profile>();
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const result = await apiRequest<{ profile: Profile }>('/api/profile', token);
      setProfile(result.profile);
      setDisplayName(result.profile.displayName);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not load your profile.');
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const token = await getAccessToken();
      const result = await apiRequest<{ profile: Profile }>('/api/profile', token, {
        method: 'PUT',
        body: JSON.stringify({ displayName }),
      });
      setProfile(result.profile);
      setDisplayName(result.profile.displayName);
      setMessage('Profile updated successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="dashboard-content">
      <div className="dashboard-heading"><div><span className="eyebrow">YOUR ACCOUNT</span><h1>Welcome{userName ? `, ${userName}` : ''}.</h1><p>This page and its profile API are protected by your Keycloak session.</p></div><button className="button button-secondary" onClick={() => void logout()}>Sign out</button></div>
      <div className="dashboard-grid">
        <article className="panel profile-panel">
          <div className="panel-heading"><span className="panel-icon">◎</span><div><h2>Your profile</h2><p>Persisted to the demo JSON store</p></div></div>
          {loading ? <p className="muted">Loading your profile…</p> : profile ? <>
            <form onSubmit={(event) => void saveProfile(event)} className="profile-form">
              <label htmlFor="display-name">Display name</label>
              <div className="input-row"><input id="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={80} required /><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></div>
            </form>
            <dl className="profile-details"><div><dt>Email</dt><dd>{profile.email ?? 'Not provided'}</dd></div><div><dt>Keycloak subject</dt><dd className="subject-value">{profile.subject}</dd></div></dl>
          </> : <p className="error-message">{message || 'Profile unavailable.'}</p>}
          {profile && message && <p className={message.includes('successfully') ? 'success-message' : 'error-message'} role="status">{message}</p>}
        </article>
        <aside className="panel session-panel">
          <div className="panel-heading"><span className="panel-icon green-icon">✓</span><div><h2>Session status</h2><p>Authenticated and active</p></div></div>
          <div className="session-badge"><span className="status-dot" /> Access token is refreshed automatically</div>
          <ul className="session-checks"><li><span>✓</span> Signed in with Keycloak</li><li><span>✓</span> JWT signature verified by API</li><li><span>✓</span> Profile scoped to your identity</li></ul>
        </aside>
      </div>
      <div className="api-note"><span>↗</span><p><strong>Try it:</strong> API requests send a short-lived bearer token. The API rejects missing, expired, or incorrectly-audienced tokens.</p></div>
    </section>
  );
}

export default function DashboardPage() {
  return <ProtectedRoute><ProfilePanel /></ProtectedRoute>;
}
