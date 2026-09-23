import { defineTool } from '@flue/runtime';
import { marketDataResponseSchema } from '../market-data/schemas';
import { indicatorResultSchema } from '../indicators/schemas';
import { calculate_indicators } from '../indicators/engine';
import * as v from 'valibot';

import { MarketDataService } from '../market-data/service';
import { YahooFinanceProvider } from '../market-data/providers/yahoo-finance-provider';
import { normalizeTicker } from '../utils/ticker-normalization';

const marketDataService = new MarketDataService(new YahooFinanceProvider());

export const calculateIndicatorsTool = defineTool({
  name: 'calculate_indicators',
  description: 'Calculates technical indicators (daily return, moving averages, momentum, volatility) deterministically based on historical market data (OHLCV).',
  input: v.object({
    symbol: v.string(),
  }),
  output: indicatorResultSchema,
  async run({ data }) {
    const fullMarketData = await marketDataService.getHistoricalData({
      symbol: normalizeTicker(data.symbol),
      period: '1y',
      interval: '1d',
    });

    const result = calculate_indicators(fullMarketData);
    return { output: result };
  },
});
