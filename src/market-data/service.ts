import { MarketDataProvider } from './providers/market-data-provider';
import { MarketDataRequest, MarketDataResponse, OHLCV } from './types';
import { InvalidMarketDataError } from './errors';
import * as v from 'valibot';
import { marketDataRequestSchema } from './schemas';

export class MarketDataService {
  constructor(private readonly provider: MarketDataProvider) {}

  async getHistoricalData(request: unknown): Promise<MarketDataResponse> {
    // 1. Validate request
    const validatedRequest = v.parse(marketDataRequestSchema, request);

    // 2. Fetch data from provider
    const response = await this.provider.getHistoricalData(validatedRequest as MarketDataRequest);

    // 3. Normalize & validate responses
    this.validateDataInvariants(response.data);
    this.ensureChronologicalOrdering(response.data);

    return response;
  }

  private validateDataInvariants(data: OHLCV[]): void {
    if (!data || data.length === 0) {
      throw new InvalidMarketDataError('Market data is empty');
    }

    for (const record of data) {
      // Basic OHLCV invariant checks
      if (
        !Number.isFinite(record.open) ||
        !Number.isFinite(record.high) ||
        !Number.isFinite(record.low) ||
        !Number.isFinite(record.close) ||
        !Number.isFinite(record.volume)
      ) {
        throw new InvalidMarketDataError(`Invalid numeric values found in record for date ${record.date}`);
      }

      if (record.high < Math.max(record.open, record.close, record.low)) {
        throw new InvalidMarketDataError(`High price is lower than open/close/low for date ${record.date}`);
      }

      if (record.low > Math.min(record.open, record.close, record.high)) {
        throw new InvalidMarketDataError(`Low price is higher than open/close/high for date ${record.date}`);
      }

      if (record.volume < 0) {
        throw new InvalidMarketDataError(`Volume cannot be negative for date ${record.date}`);
      }
    }
  }

  private ensureChronologicalOrdering(data: OHLCV[]): void {
    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}
