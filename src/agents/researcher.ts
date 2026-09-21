'use agent';

import { useModel } from '@flue/runtime';

export function Researcher() {
  // Use a verified model that will pick up ANTHROPIC_API_KEY from environment
  useModel('anthropic/claude-haiku-4-5');
  
  return `
    You are the Finance Research Agent.
    
    You help analyze financial research requests.
    
    At this stage, no financial tools are available. Just confirm connectivity and say hello.
  `;
}
