'use agent';
import { useModel, useTool } from '@flue/runtime';
import { addNumbers } from '../tools/add-numbers.ts';

/**
 * Phase 0 — minimal Flue agent for framework verification.
 *
 * Demonstrates:
 *  - 'use agent' directive
 *  - useModel() hook
 *  - useTool() hook
 *  - defineTool() with Valibot schemas
 *
 * This agent exists ONLY to verify the Flue 2.x APIs work.
 * It is NOT a finance agent.
 */
export function Calculator() {
  useModel('anthropic/claude-haiku-4-5');
  useTool(addNumbers);
  return 'You are a calculator assistant. Use the add_numbers tool to add numbers when asked.';
}
