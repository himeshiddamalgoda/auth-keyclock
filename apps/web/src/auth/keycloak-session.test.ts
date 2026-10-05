import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { KeycloakInitOptions } from 'keycloak-js';
import { createSessionGetter } from './keycloak-session';

describe('Keycloak session initialization', () => {
  it('shares pending initialization across development effect replays', async () => {
    let creations = 0;
    let initializations = 0;
    let complete!: (authenticated: boolean) => void;
    const pending = new Promise<boolean>((resolve) => { complete = resolve; });
    const getSession = createSessionGetter(() => {
      creations += 1;
      return { init: async () => { initializations += 1; return pending; } };
    }, () => 'http://localhost:3000');

    assert.equal(creations, 0, 'constructing the getter must be safe during SSR');
    const first = getSession();
    const replay = getSession();
    assert.equal(first, replay);
    assert.equal(creations, 1);
    assert.equal(initializations, 1);
    complete(true);
    assert.equal(await replay.initialized, true);
    assert.equal(getSession(), first, 'completed initialization must also be reused');
  });

  it('disables full-page SSO fallback while keeping PKCE and silent SSO', async () => {
    let options: KeycloakInitOptions | undefined;
    const getSession = createSessionGetter(() => ({
      init: async (input?: KeycloakInitOptions) => { options = input; return false; },
    }), () => 'http://localhost:3000');

    assert.equal(await getSession().initialized, false);
    assert.deepEqual(options, {
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false,
      silentCheckSsoRedirectUri: 'http://localhost:3000/silent-check-sso.html',
      silentCheckSsoFallback: false,
    });
  });

  it('does not restart initialization after a connection failure', async () => {
    let initializations = 0;
    const getSession = createSessionGetter(() => ({
      init: async () => { initializations += 1; throw new Error('Keycloak unavailable'); },
    }), () => 'http://localhost:3000');

    await assert.rejects(getSession().initialized, /Keycloak unavailable/);
    await assert.rejects(getSession().initialized, /Keycloak unavailable/);
    assert.equal(initializations, 1);
  });
});
