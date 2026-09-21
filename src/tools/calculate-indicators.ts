import { defineTool } from '@flue/runtime';
import { marketDataResponseSchema } from '../market-data/schemas';
import { indicatorResultSchema } from '../indicators/schemas';
import { calculate_indicators } from '../indicators/engine';
import * as v from 'valibot';

export const calculateIndicators = defineTool({
  name: 'calculate_indicators',
  description: 'Calculates technical indicators (daily return, moving averages, momentum, volatility) deterministically based on historical market data (OHLCV).',
  input: v.object({
    marketData: marketDataResponseSchema,
  }),
  output: indicatorResultSchema,
  async run({ data }) {
    const result = calculate_indicators(data.marketData as any);
    return { output: result };
  },
});
