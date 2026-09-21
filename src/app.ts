import { createAgentRouter } from '@flue/runtime/routing';
import { Hono } from 'hono';
import { Researcher } from './agents/researcher.js';

const app = new Hono();

// Mount the researcher agent router under /api/agents/researcher
app.route('/api/agents/researcher', createAgentRouter(Researcher) as any);

export default app;
