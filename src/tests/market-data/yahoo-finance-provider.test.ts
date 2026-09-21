import { describe, it, expect } from 'vitest';
import { YahooFinanceProvider } from '../../../src/market-data/providers/yahoo-finance-provider';
import { UnsupportedSymbolError } from '../../../src/market-data/errors';

describe('YahooFinanceProvider (Live)', () => {
  const provider = new YahooFinanceProvider();

  it('should fetch historical data for a valid symbol', async () => {
    // This is a live network test
    const response = await provider.getHistoricalData({
      symbol: 'RELIANCE',
      period: '1mo',
      interval: '1d'
    });

    expect(response.symbol).toBe('RELIANCE');
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0].date).toBeDefined();
    expect(response.data[0].open).toBeGreaterThan(0);
  });

  it('should throw UnsupportedSymbolError for invalid symbol', async () => {
    // We expect this to fail gracefully
    await expect(provider.getHistoricalData({
      symbol: 'INVALID_SYMBOL_THAT_DOES_NOT_EXIST',
      period: '1mo',
      interval: '1d'
    })).rejects.toThrow(UnsupportedSymbolError);
  });
});
