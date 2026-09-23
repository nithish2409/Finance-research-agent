import { defineTool } from '@flue/runtime';
import { recommendationResultSchema } from '../recommendation/schemas';
import { generateRecommendation } from '../recommendation/engine';
import { analyzeBullishFactors, analyzeRiskFactors } from '../signals/engine';
import { calculate_indicators } from '../indicators/engine';
import { MarketDataService } from '../market-data/service';
import { YahooFinanceProvider } from '../market-data/providers/yahoo-finance-provider';
import { normalizeTicker } from '../utils/ticker-normalization';
import * as v from 'valibot';

const marketDataService = new MarketDataService(new YahooFinanceProvider());

export const generateRecommendationTool = defineTool({
  name: 'generate_recommendation',
  description: 'Generates a deterministic financial recommendation (BUY/HOLD/WATCHLIST/AVOID) and confidence score based on indicators and signal analysis.',
  input: v.object({
    symbol: v.string(),
  }),
  output: recommendationResultSchema,
  async run({ data }) {
    const symbol = normalizeTicker(data.symbol);
    const md = await marketDataService.getHistoricalData({ symbol, period: '1y', interval: '1d' });
    const ind = calculate_indicators(md);
    const bullish = analyzeBullishFactors(ind);
    const risk = analyzeRiskFactors(ind);
    const result = generateRecommendation(ind, bullish, risk);
    return { output: result };
  },
});
