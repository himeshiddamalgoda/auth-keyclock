# Keycloak authentication demo

A TypeScript monorepo with a Next.js frontend and Express API. Keycloak handles identity, registration, login, logout, and refresh tokens. The API persists only demo profile records in a JSON file; it never stores passwords or tokens.

## Prerequisites

- Node.js 20.9 or newer and npm
- Docker with the Compose plugin

## Start locally

1. Start the local identity provider: `docker compose up -d`.
2. Install workspace dependencies: `npm install`.
3. Copy `apps/web/.env.example` to `apps/web/.env.local` and `apps/api/.env.example` to `apps/api/.env`. The defaults work for local development.
4. Start both projects: `npm run dev`.
5. Open `http://localhost:3000`. The Keycloak admin console is at `http://localhost:8080/admin` (`admin` / `admin`).

Wait for Keycloak to finish starting before using login. The demo realm is imported automatically from `infra/keycloak/realm-demo.json`. Registration is enabled; choose **Create account** on the Keycloak sign-in screen.

Authentication initialization is shared across React development effect replays. Silent SSO does not fall back to full-page redirects when browsers block third-party cookies; use **Sign in** explicitly if your existing Keycloak session cannot be detected silently. After changing frontend environment variables, restart Next.js and reload the page.

## Projects

- `apps/web` — Next.js App Router UI. A Keycloak public client uses Authorization Code + PKCE. `keycloak-js` keeps tokens in memory, refreshes them before API calls and periodically, and clears the session on refresh failure. The dashboard is protected by a client-side guard; this protects the rendered experience, not server-rendered secrets. Keep sensitive data behind the API's JWT verification.
- `apps/api` — Express API validates bearer access tokens using Keycloak's JWKS, issuer, expiration, and `auth-api` audience. `GET /api/profile` and `PUT /api/profile` require authentication.
- `apps/api/data/profiles.json` — JSON demo persistence keyed by Keycloak subject. Writes are serialized and committed with atomic rename. This is for a single-process demo, not concurrent or multi-instance production use.

## Configuration

The frontend and API issuer must match the browser-reachable Keycloak URL. For local use it is `http://localhost:8080/realms/demo`; containers or remote hosts require coordinated issuer, redirect URI, CORS, and realm-client changes. The frontend uses client ID `web-client`; the API accepts audience `auth-api`. The realm config adds that audience to web-client access tokens.

Never expose a confidential client secret in the frontend. For production, use HTTPS, a hardened Keycloak deployment, strict origin/redirect settings, persistent database-backed storage, and consider a server-side/BFF session design rather than browser-held bearer tokens.

## Useful commands

- `npm run dev` — run API and frontend in development mode
- `npm run build` — build both projects
- `npm run lint` — lint both projects
- `npm test` — run API validation and frontend authentication initialization tests
- `docker compose down` — stop Keycloak
