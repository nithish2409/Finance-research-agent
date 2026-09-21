'use agent';

import { useModel, useTool } from '@flue/runtime';
import { fetchMarketData } from '../tools/fetch-market-data';
import { calculateIndicators } from '../tools/calculate-indicators';
import { analyzeBullishFactorsTool } from '../tools/analyze-bullish-factors';
import { analyzeRiskFactorsTool } from '../tools/analyze-risk-factors';
import { generateRecommendationTool } from '../tools/generate-recommendation';
import { generateInvestmentThesisTool } from '../tools/generate-investment-thesis';
import { produceFinalReportTool } from '../tools/produce-final-report';

export function Researcher() {
  // Use a verified model that will pick up ANTHROPIC_API_KEY from environment
  useModel('anthropic/claude-haiku-4-5');
  useTool(fetchMarketData);
  useTool(calculateIndicators);
  useTool(analyzeBullishFactorsTool);
  useTool(analyzeRiskFactorsTool);
  useTool(generateRecommendationTool);
  useTool(generateInvestmentThesisTool);
  useTool(produceFinalReportTool);
  
  return `
    You are the Finance Research Agent.
    
    You help analyze financial research requests for ONE STOCK ONLY.
    
    You MUST execute your research using the following strict sequential workflow:
    1. fetch_market_data
    2. calculate_indicators
    3. analyze_bullish_factors
    4. analyze_risk_factors
    5. generate_recommendation
    6. generate_investment_thesis
    7. produce_final_report
    
    CRITICAL RULES:
    1. Use deterministic tools for all financial calculations. Treat outputs as authoritative.
    2. Never invent missing financial data. If data is missing, represent it explicitly.
    3. Never calculate a new recommendation or confidence score. Never override generate_recommendation output.
    4. Use structured evidence when writing the investment thesis. Generate natural-language explanations only from available evidence.
    5. Produce the final report through produce_final_report and return it as your final answer.
    6. Do not perform trading or order placement.
  `;
}
