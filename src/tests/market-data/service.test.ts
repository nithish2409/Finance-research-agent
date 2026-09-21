import { describe, it, expect, vi } from 'vitest';
import { MarketDataService } from '../../../src/market-data/service';
import { MarketDataProvider } from '../../../src/market-data/providers/market-data-provider';
import { InvalidMarketDataError } from '../../../src/market-data/errors';
import { OHLCV } from '../../../src/market-data/types';

describe('MarketDataService', () => {
  const mockProvider: MarketDataProvider = {
    getHistoricalData: vi.fn(),
  };
  const service = new MarketDataService(mockProvider);

  it('should validate request and return normalized response', async () => {
    const mockData: OHLCV[] = [
      { date: '2023-01-02', open: 100, high: 110, low: 90, close: 105, volume: 1000 },
      { date: '2023-01-01', open: 95, high: 105, low: 85, close: 100, volume: 1000 }, // Intentionally out of order
    ];

    vi.mocked(mockProvider.getHistoricalData).mockResolvedValue({
      symbol: 'RELIANCE',
      period: '1mo',
      interval: '1d',
      data: mockData,
    });

    const response = await service.getHistoricalData({ symbol: 'RELIANCE', period: '1mo', interval: '1d' });
    
    expect(response.symbol).toBe('RELIANCE');
    expect(response.data).toHaveLength(2);
    // Ensure chronological order
    expect(response.data[0].date).toBe('2023-01-01');
    expect(response.data[1].date).toBe('2023-01-02');
  });

  it('should throw error for invalid OHLC invariants', async () => {
    const mockData: OHLCV[] = [
      { date: '2023-01-01', open: 100, high: 90, low: 80, close: 95, volume: 1000 }, // High is lower than open
    ];

    vi.mocked(mockProvider.getHistoricalData).mockResolvedValue({
      symbol: 'RELIANCE',
      period: '1mo',
      interval: '1d',
      data: mockData,
    });

    await expect(service.getHistoricalData({ symbol: 'RELIANCE', period: '1mo', interval: '1d' })).rejects.toThrow(InvalidMarketDataError);
  });

  it('should throw error for empty market data', async () => {
    vi.mocked(mockProvider.getHistoricalData).mockResolvedValue({
      symbol: 'RELIANCE',
      period: '1mo',
      interval: '1d',
      data: [],
    });

    await expect(service.getHistoricalData({ symbol: 'RELIANCE', period: '1mo', interval: '1d' })).rejects.toThrow(InvalidMarketDataError);
  });
});
