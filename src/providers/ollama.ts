import { createProvider, type Model } from '@earendil-works/pi-ai';
import { openAICompletionsApi } from '@earendil-works/pi-ai/api/openai-completions.lazy';

const qwenModel: Model<'openai-completions'> = {
  id: 'qwen3.5:9b',
  name: 'Qwen 3.5 9B (Ollama)',
  api: 'openai-completions',
  provider: 'ollama',
  baseUrl: 'http://localhost:11434/v1',
  reasoning: false,
  input: ['text'],
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  contextWindow: 128000,
  maxTokens: 32000
};

export const ollamaProvider = createProvider({
  id: 'ollama',
  name: 'Ollama',
  baseUrl: 'http://localhost:11434/v1',
  // Local keyless auth resolution
  auth: { apiKey: { name: 'Ollama', resolve: async () => ({ auth: { apiKey: 'dummy' } }) } },
  models: [qwenModel],
  api: openAICompletionsApi(),
});
