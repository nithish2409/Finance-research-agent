import { describe, it, expect } from 'vitest';
import { calculate_indicators } from '../../../src/indicators/engine';
import { MarketDataResponse, OHLCV } from '../../../src/market-data/types';

describe('Indicator Engine', () => {
  const createMockData = (closes: number[], overrides?: Partial<MarketDataResponse>): MarketDataResponse => {
    const data: OHLCV[] = closes.map((c, i) => ({
      date: `2023-01-${String(i + 1).padStart(2, '0')}`,
      open: c - 1,
      high: c + 2,
      low: c - 2,
      close: c,
      volume: 1000,
    }));
    return { symbol: 'TEST', period: '1mo', interval: '1d', data, ...overrides };
  };

  it('throws error for empty data', () => {
    expect(() => calculate_indicators({ symbol: 'TEST', period: '1mo', interval: '1d', data: [] })).toThrowError(/Insufficient market data/);
  });

  it('calculates daily return correctly', () => {
    const data = createMockData([100, 105]); // 5% gain
    const result = calculate_indicators(data);
    expect(result.dailyReturn).not.toBeNull();
    expect(result.dailyReturn?.value).toBe(5);
    expect(result.dailyReturn?.percentage).toBe(5);
    expect(result.dailyReturn?.previousClose).toBe(100);
  });

  it('calculates 52-week high and low distances using normalized Phase 2 fields', () => {
    // History max high is 122, min low is 78.
    // Normalized 52-week fields are explicitly 200 and 50.
    const data = createMockData([100, 120, 80, 100], {
      currentPrice: 100,
      fiftyTwoWeekHigh: 200,
      fiftyTwoWeekLow: 50
    });
    
    const result = calculate_indicators(data);
    
    // Proves that we used the normalized fields and not the max/min of the history array
    expect(result.pricePosition?.week52High).toBe(200);
    expect(result.pricePosition?.week52Low).toBe(50);
    
    // distanceFrom52WeekHighPct = ((100 - 200) / 200) * 100 = -50
    expect(result.pricePosition?.distanceFrom52WeekHighPct).toBe(-50);
    
    // distanceFrom52WeekLowPct = ((100 - 50) / 50) * 100 = 100
    expect(result.pricePosition?.distanceFrom52WeekLowPct).toBe(100);
  });

  it('calculates SMA20 only when sufficient data is present', () => {
    const data19 = createMockData(Array(19).fill(100));
    const result19 = calculate_indicators(data19);
    expect(result19.movingAverages.sma20).toBeNull();
    
    const data20 = createMockData(Array(20).fill(100));
    const result20 = calculate_indicators(data20);
    expect(result20.movingAverages.sma20).toBe(100);
  });

  it('calculates SMA50 only when sufficient data is present', () => {
    const data49 = createMockData(Array(49).fill(100));
    const result49 = calculate_indicators(data49);
    expect(result49.movingAverages.sma50).toBeNull();
    
    const data50 = createMockData(Array(50).fill(100));
    const result50 = calculate_indicators(data50);
    expect(result50.movingAverages.sma50).toBe(100);
  });

  it('calculates momentum correctly', () => {
    // Bullish: current > sma20 > sma50
    // Bearish: current < sma20 < sma50
    
    const closesBullish = Array(50).fill(100);
    // Let's make a clear trend
    for (let i = 0; i < 50; i++) {
      closesBullish[i] = 100 + i; // strictly increasing
    }
    const resultBullish = calculate_indicators(createMockData(closesBullish));
    expect(resultBullish.momentum).toBe('Bullish');
    
    const closesBearish = Array(50).fill(100);
    for (let i = 0; i < 50; i++) {
      closesBearish[i] = 100 - i; // strictly decreasing
    }
    const resultBearish = calculate_indicators(createMockData(closesBearish));
    expect(resultBearish.momentum).toBe('Bearish');
  });

  it('calculates volatility correctly', () => {
    // Need at least 21 days for 20 returns
    const data20 = createMockData(Array(20).fill(100));
    expect(calculate_indicators(data20).volatility.proxyValue).toBeNull();
    
    const data21 = createMockData(Array(21).fill(100)); // returns are all 0
    const result21 = calculate_indicators(data21);
    expect(result21.volatility.proxyValue).toBe(0); // 0 variance
  });
});
