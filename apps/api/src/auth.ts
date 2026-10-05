import type { NextFunction, Request, Response } from 'express';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { config } from './config.js';

const issuer = config.KEYCLOAK_ISSUER;
const jwks = createRemoteJWKSet(new URL(`${issuer}/protocol/openid-connect/certs`));

export interface AuthenticatedRequest extends Request {
  auth: JWTPayload & { sub: string; email?: string; name?: string };
}

export async function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const authorization = request.header('authorization');
  const match = authorization?.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    response.status(401).json({ error: 'A bearer access token is required.' });
    return;
  }

  try {
    const { payload } = await jwtVerify(match[1]!, jwks, {
      issuer,
      audience: config.KEYCLOAK_AUDIENCE,
      algorithms: ['RS256'],
    });

    if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
      response.status(401).json({ error: 'The access token has no subject.' });
      return;
    }

    (request as AuthenticatedRequest).auth = payload as AuthenticatedRequest['auth'];
    next();
  } catch {
    response.status(401).json({ error: 'The access token is invalid or expired.' });
  }
}
