'use agent';

import { useModel, useTool } from '@flue/runtime';
import { fetchMarketData } from '../tools/fetch-market-data';

export function Researcher() {
  // Use a verified model that will pick up ANTHROPIC_API_KEY from environment
  useModel('anthropic/claude-haiku-4-5');
  useTool(fetchMarketData);
  
  return `
    You are the Finance Research Agent.
    
    You help analyze financial research requests.
    
    You can fetch historical market data for Indian stock symbols using the fetch_market_data tool.
  `;
}
