import { createAgentRouter } from '@flue/runtime/routing';
import { Hono } from 'hono';
import { Researcher } from './agents/researcher.js';

// Filter out Flue's internal agent start log to prevent duplication,
// as we will log it explicitly on POST request.
const originalLog = console.log;
console.log = (...args) => {
  if (typeof args[0] === 'string' && args[0].match(/^\[agent\] Researcher@[a-zA-Z0-9-_]+ started$/)) {
    return;
  }
  originalLog(...args);
};

const app = new Hono();

app.post('/api/log', async (c) => {
  try {
    const body = await c.req.json();
    if (body.message) {
      console.log(`\n[ui] ${body.message}`);
    }
  } catch (e) {}
  return c.json({ success: true });
});

app.use('/api/agents/researcher/:id', async (c, next) => {
  if (c.req.method === 'POST') {
    try {
      // Clone request to read body without consuming it for the downstream router
      const body = await c.req.raw.clone().json();
      if (body && body.kind === 'user') {
        console.log(`\n[agent] Researcher started\n`);
        console.log(`[user] ${body.body}\n`);
      }
    } catch (e) {}
  }
  await next();
});

// Mount the researcher agent router under /api/agents/researcher
app.route('/api/agents/researcher', createAgentRouter(Researcher) as any);

export default app;
