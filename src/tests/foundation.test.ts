import { describe, it, expect } from 'vitest';
import { Researcher } from '../agents/researcher.js';
import { ChatMessageSchema } from '../shared/schemas.js';
import * as v from 'valibot';

describe('Phase 1 Foundation', () => {
  it('should import the Researcher agent successfully', () => {
    // We just verify it is exported as a function, as required by Flue 2.x
    expect(typeof Researcher).toBe('function');
  });

  it('should validate data using the Valibot schema', () => {
    const validData = { id: 'msg-1', role: 'user', text: 'Hello' };
    const result = v.safeParse(ChatMessageSchema, validData);
    expect(result.success).toBe(true);

    const invalidData = { id: 'msg-2', role: 'system', text: 'Hello' };
    const invalidResult = v.safeParse(ChatMessageSchema, invalidData);
    expect(invalidResult.success).toBe(false);
  });
});
