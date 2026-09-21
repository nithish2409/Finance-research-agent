import { describe, it, expect, vi } from 'vitest';
import { fetchMarketData } from '../../../src/tools/fetch-market-data';

// Mock the dependencies correctly before importing the tool
vi.mock('../../../src/market-data/providers/yahoo-finance-provider', () => {
  return {
    YahooFinanceProvider: class {
      async getHistoricalData() {
        return {
          symbol: 'RELIANCE',
          period: '1mo',
          interval: '1d',
          data: [{ date: '2023-01-01', open: 100, high: 110, low: 90, close: 105, volume: 1000 }],
          metadata: { provider: 'mock' }
        };
      }
    }
  };
});

describe('fetch_market_data tool', () => {
  it('should execute successfully with valid input', async () => {
    // The tool input is normally the unwrapped data, Flue `run({ data })`
    const result = await fetchMarketData.run({ data: { symbol: 'RELIANCE', period: '1mo', interval: '1d' } } as any);
    
    expect(result.output).toBeDefined();
    expect((result.output as any).symbol).toBe('RELIANCE');
    expect((result.output as any).data.length).toBe(1);
  });
});
