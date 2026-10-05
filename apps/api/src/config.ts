import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
  KEYCLOAK_ISSUER: z.string().url().default('http://localhost:8080/realms/demo'),
  KEYCLOAK_AUDIENCE: z.string().min(1).default('auth-api'),
  PROFILE_STORE_PATH: z.string().min(1).default('./data/profiles.json'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const config = parsed.data;
