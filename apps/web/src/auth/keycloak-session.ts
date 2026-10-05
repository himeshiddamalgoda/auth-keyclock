import Keycloak, { type KeycloakInstance } from 'keycloak-js';

// Share both the client and its initialization promise across effect replays.
// Creating the session is lazy so server rendering never accesses window.
export function createSessionGetter<T extends Pick<KeycloakInstance, 'init'>>(
  createClient: () => T,
  getOrigin: () => string,
) {
  let session: { keycloak: T; initialized: Promise<boolean> } | undefined;

  return () => {
    if (!session) {
      const keycloak = createClient();
      session = {
        keycloak,
        initialized: keycloak.init({
          onLoad: 'check-sso',
          pkceMethod: 'S256',
          checkLoginIframe: false,
          silentCheckSsoRedirectUri: `${getOrigin()}/silent-check-sso.html`,
          // Browsers blocking third-party cookies must not trigger page redirects
          // just to check whether the visitor is signed in.
          silentCheckSsoFallback: false,
        }),
      };
    }
    return session;
  };
}

export const getKeycloakSession = createSessionGetter(
  () => new Keycloak({
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? 'http://localhost:8080',
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? 'demo',
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? 'web-client',
  }),
  () => window.location.origin,
);
