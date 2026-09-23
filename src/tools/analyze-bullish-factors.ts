import { defineTool } from '@flue/runtime';
import { signalAnalysisResultSchema } from '../signals/schemas';
import { analyzeBullishFactors } from '../signals/engine';
import { calculate_indicators } from '../indicators/engine';
import { MarketDataService } from '../market-data/service';
import { YahooFinanceProvider } from '../market-data/providers/yahoo-finance-provider';
import { normalizeTicker } from '../utils/ticker-normalization';
import * as v from 'valibot';

const marketDataService = new MarketDataService(new YahooFinanceProvider());

export const analyzeBullishFactorsTool = defineTool({
  name: 'analyze_bullish_factors',
  description: 'Analyzes structured technical indicator results to deterministically identify positive (bullish) evidence and signals.',
  input: v.object({
    symbol: v.string(),
  }),
  output: signalAnalysisResultSchema,
  async run({ data }) {
    const symbol = normalizeTicker(data.symbol);
    const md = await marketDataService.getHistoricalData({ symbol, period: '1y', interval: '1d' });
    const ind = calculate_indicators(md);
    const result = analyzeBullishFactors(ind);
    return { output: result };
  },
});
