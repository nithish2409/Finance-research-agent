import { defineTool } from '@flue/runtime';
import { marketDataRequestSchema, marketDataResponseSchema } from '../market-data/schemas';
import { MarketDataService } from '../market-data/service';
import { YahooFinanceProvider } from '../market-data/providers/yahoo-finance-provider';

// Configure the service with the concrete provider
const marketDataProvider = new YahooFinanceProvider();
const marketDataService = new MarketDataService(marketDataProvider);

export const fetchMarketData = defineTool({
  name: 'fetch_market_data',
  description: 'Retrieve historical market data (OHLCV) for an Indian stock symbol.',
  input: marketDataRequestSchema,
  output: marketDataResponseSchema,
  async run({ data }) {
    const result = await marketDataService.getHistoricalData(data);
    return { output: result };
  },
});
