'use agent';
import { useModel, setProvider } from '@flue/runtime';
import { ollamaProvider } from '../providers/ollama';

setProvider(ollamaProvider);

// Every exported capitalized function in a 'use agent' module is an agent,
// and the function's name is its durable identity. The return value is the
// agent's system prompt.
export function Hello() {
	useModel('ollama/qwen3.5:9b');
	return 'You are a helpful assistant. Keep replies short.';
}
