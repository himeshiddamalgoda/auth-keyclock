import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import { requireAuth, type AuthenticatedRequest } from './auth.js';
import { config } from './config.js';
import { profileStore } from './profile-store.js';
import { updateProfileSchema } from './profile-validation.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: config.WEB_ORIGIN, methods: ['GET', 'PUT'], allowedHeaders: ['Authorization', 'Content-Type'] }));
app.use(express.json({ limit: '16kb' }));

app.get('/health', (_request, response) => response.json({ status: 'ok' }));

app.get('/api/profile', requireAuth, async (request, response, next) => {
  try {
    const { sub, email, name } = (request as AuthenticatedRequest).auth;
    const profile = await profileStore.getOrCreate(sub, email, name);
    response.json({ profile });
  } catch (error) {
    next(error);
  }
});

app.put('/api/profile', requireAuth, async (request, response, next) => {
  const parsed = updateProfileSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: 'displayName must be between 1 and 80 characters.' });
    return;
  }

  try {
    const { sub } = (request as AuthenticatedRequest).auth;
    const profile = await profileStore.updateDisplayName(sub, parsed.data.displayName);
    if (!profile) {
      response.status(404).json({ error: 'Profile not found. Fetch the profile before updating it.' });
      return;
    }
    response.json({ profile });
  } catch (error) {
    next(error);
  }
});

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error('Unhandled API error:', error);
  response.status(500).json({ error: 'An unexpected server error occurred.' });
};
app.use(errorHandler);

app.listen(config.PORT, () => {
  console.info(`Auth demo API listening on http://localhost:${config.PORT}`);
});
