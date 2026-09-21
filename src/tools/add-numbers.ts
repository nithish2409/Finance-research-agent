import { defineTool } from '@flue/runtime';
import * as v from 'valibot';

/**
 * Phase 0 — minimal deterministic tool for framework verification.
 * Adds two numbers. No LLM involvement; pure input → output.
 */
export const addNumbers = defineTool({
  name: 'add_numbers',
  description: 'Add two numbers and return their sum.',
  input: v.object({
    a: v.number(),
    b: v.number(),
  }),
  output: v.object({
    sum: v.number(),
  }),
  async run({ data }) {
    return { output: { sum: data.a + data.b } };
  },
});
