'use agent';
import { useModel, useTool, setProvider } from '@flue/runtime';
import { addNumbers } from '../tools/add-numbers.ts';
import { ollamaProvider } from '../providers/ollama';

setProvider(ollamaProvider);

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
  useModel('ollama/qwen3.5:9b');
  useTool(addNumbers);
  return 'You are a calculator assistant. YOU MUST USE the add_numbers tool to add numbers when asked. DO NOT calculate the answer yourself.';
}
