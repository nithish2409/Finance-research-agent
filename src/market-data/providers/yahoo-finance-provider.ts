import YahooFinance from 'yahoo-finance2';
import { MarketDataProvider } from './market-data-provider';
import { MarketDataRequest, MarketDataResponse, OHLCV } from '../types';
import { ProviderError, UnsupportedSymbolError } from '../errors';

const yahooFinance = new YahooFinance();

export class YahooFinanceProvider implements MarketDataProvider {
  async getHistoricalData(request: MarketDataRequest): Promise<MarketDataResponse> {
    try {
      let querySymbol = request.symbol;
      if (!querySymbol.includes('.')) {
        querySymbol = `${querySymbol}.NS`; // Default to NSE for Indian stocks
      }

      const period1Date = this.getPeriod1Date(request.period);
      const period1 = period1Date.toISOString().split('T')[0];
      
      const queryOptions = {
        period1,
        interval: '1d' as const,
      };

      const result = await yahooFinance.chart(querySymbol, queryOptions);
      
      if (!result || !result.quotes || result.quotes.length === 0) {
        throw new UnsupportedSymbolError(request.symbol);
      }

      const data: OHLCV[] = result.quotes.map((item: any) => ({
        date: new Date(item.date).toISOString().split('T')[0],
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        adjustedClose: item.adjclose, // check spelling
        volume: item.volume,
      }));

      return {
        symbol: request.symbol,
        period: request.period,
        interval: request.interval,
        data,
        metadata: {
          provider: 'yahoo-finance',
        },
      };
    } catch (error: any) {
      if (error instanceof UnsupportedSymbolError) {
        throw error;
      }
      
      if (
        error.name === 'FailedYahooValidationError' || 
        error.message?.includes('Not Found') ||
        error.message?.includes('No data found') ||
        error.message?.includes('delisted')
      ) {
        throw new UnsupportedSymbolError(request.symbol);
      }
      
      throw new ProviderError(
        error.message || 'Failed to fetch historical data from Yahoo Finance',
        'yahoo-finance',
        error
      );
    }
  }

  private getPeriod1Date(period: string): Date {
    const now = new Date();
    switch (period) {
      case '1mo':
        now.setMonth(now.getMonth() - 1);
        break;
      case '3mo':
        now.setMonth(now.getMonth() - 3);
        break;
      case '6mo':
        now.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        now.setFullYear(now.getFullYear() - 1);
        break;
      default:
        now.setMonth(now.getMonth() - 1);
    }
    return now;
  }
}
