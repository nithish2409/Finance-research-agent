import { MarketDataRequest, MarketDataResponse } from '../types';

export interface MarketDataProvider {
  getHistoricalData(request: MarketDataRequest): Promise<MarketDataResponse>;
}
