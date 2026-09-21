'use agent';

import { useModel, useTool } from '@flue/runtime';
import { fetchMarketData } from '../tools/fetch-market-data';
import { calculateIndicators } from '../tools/calculate-indicators';

export function Researcher() {
  // Use a verified model that will pick up ANTHROPIC_API_KEY from environment
  useModel('anthropic/claude-haiku-4-5');
  useTool(fetchMarketData);
  useTool(calculateIndicators);
  
  return `
    You are the Finance Research Agent.
    
    You help analyze financial research requests.
    
    You can fetch historical market data for Indian stock symbols using the fetch_market_data tool.
    You can calculate deterministic technical indicators (like SMA, Momentum, Volatility) from the market data using the calculate_indicators tool.
  `;
}
