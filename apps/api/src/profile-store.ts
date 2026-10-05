import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';
import { config } from './config.js';

const profileSchema = z.object({
  subject: z.string().min(1),
  email: z.string().max(320).optional(),
  displayName: z.string().min(1).max(80),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
const storeSchema = z.record(z.string(), profileSchema);
export type Profile = z.infer<typeof profileSchema>;

const filePath = resolve(process.cwd(), config.PROFILE_STORE_PATH);
let writeQueue: Promise<void> = Promise.resolve();

async function readStore(): Promise<Record<string, Profile>> {
  try {
    const content = await readFile(filePath, 'utf8');
    return storeSchema.parse(JSON.parse(content));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw error;
  }
}

async function writeStore(store: Record<string, Profile>): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${randomUUID()}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(store, null, 2)}\n`, { mode: 0o600 });
  await rename(tempPath, filePath);
}

function serialize<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(operation);
  writeQueue = result.then(() => undefined, () => undefined);
  return result;
}

export const profileStore = {
  async getOrCreate(subject: string, email?: string, name?: string): Promise<Profile> {
    return serialize(async () => {
      const store = await readStore();
      const existing = store[subject];
      const now = new Date().toISOString();
      const profile: Profile = {
        subject,
        ...(email ? { email } : existing?.email ? { email: existing.email } : {}),
        displayName: existing?.displayName ?? (name?.trim() || email || 'New member'),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      store[subject] = profile;
      await writeStore(store);
      return profile;
    });
  },

  async updateDisplayName(subject: string, displayName: string): Promise<Profile | undefined> {
    return serialize(async () => {
      const store = await readStore();
      const existing = store[subject];
      if (!existing) return undefined;
      const profile = { ...existing, displayName, updatedAt: new Date().toISOString() };
      store[subject] = profile;
      await writeStore(store);
      return profile;
    });
  },
};
