import { defineTool } from '@flue/runtime';
import * as v from 'valibot';
import { marketDataRequestSchema, marketDataResponseSchema } from '../market-data/schemas';
import { MarketDataService } from '../market-data/service';
import { YahooFinanceProvider } from '../market-data/providers/yahoo-finance-provider';
import { normalizeTicker } from '../utils/ticker-normalization';

// Configure the service with the concrete provider
const marketDataProvider = new YahooFinanceProvider();
const marketDataService = new MarketDataService(marketDataProvider);

export const fetchMarketDataTool = defineTool({
  name: 'fetch_market_data',
  description: 'Retrieve historical market data (OHLCV) for an Indian stock symbol. Pass the symbol (e.g. RELIANCE).',
  input: v.object({
    symbol: v.string(),
  }),
  output: marketDataResponseSchema,
  async run({ data }) {
    const result = await marketDataService.getHistoricalData({
      symbol: normalizeTicker(data.symbol),
      period: '1y',
      interval: '1d',
    });

    // CRITICAL: We truncate the raw historical array before returning it to the LLM.
    const truncatedMarketData = {
      ...result,
      data: result.data.length > 0 ? [result.data[result.data.length - 1]] : []
    };

    return { output: truncatedMarketData };
  },
});
