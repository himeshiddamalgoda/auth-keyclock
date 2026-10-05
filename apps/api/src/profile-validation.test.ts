import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { updateProfileSchema } from './profile-validation.js';

describe('updateProfileSchema', () => {
  it('trims and accepts a display name within the limit', () => {
    assert.deepEqual(updateProfileSchema.parse({ displayName: '  Alex  ' }), { displayName: 'Alex' });
  });

  it('rejects blank or oversized names', () => {
    assert.equal(updateProfileSchema.safeParse({ displayName: '   ' }).success, false);
    assert.equal(updateProfileSchema.safeParse({ displayName: 'a'.repeat(81) }).success, false);
  });

  it('rejects unrecognized fields', () => {
    assert.equal(updateProfileSchema.safeParse({ displayName: 'Alex', isAdmin: true }).success, false);
  });
});
