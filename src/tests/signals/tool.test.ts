import { describe, it, expect } from 'vitest';
import { analyzeBullishFactorsTool } from '../../tools/analyze-bullish-factors';
import { analyzeRiskFactorsTool } from '../../tools/analyze-risk-factors';
import { IndicatorResult } from '../../indicators/types';

describe('Signal Analysis Tools', () => {
  const dummyIndicators: IndicatorResult = {
    symbol: 'HDFCBANK.NS',
    currentPrice: 1600,
    dailyReturn: { value: 15, percentage: 0.94, previousClose: 1585 },
    pricePosition: { currentPrice: 1600, week52High: 1750, week52Low: 1350, distanceFrom52WeekHighPct: -8.57, distanceFrom52WeekLowPct: 18.52 },
    movingAverages: { sma20: 1550, sma50: 1500 },
    momentum: 'Bullish',
    volatility: { proxyValue: 12.0 },
  };

  it('analyzeBullishFactorsTool should return output', async () => {
    const result = await analyzeBullishFactorsTool.run({ data: { indicators: dummyIndicators as any } } as any);
    expect(result.output).toBeDefined();
    expect((result.output as any).symbol).toBe('HDFCBANK.NS');
    expect((result.output as any).signals.length).toBeGreaterThan(0);
    expect((result.output as any).signals[0].type).toBe('bullish');
  });

  it('analyzeRiskFactorsTool should return output', async () => {
    const result = await analyzeRiskFactorsTool.run({ data: { indicators: dummyIndicators as any } } as any);
    expect(result.output).toBeDefined();
    expect((result.output as any).symbol).toBe('HDFCBANK.NS');
    // For this specific dummy data, risk signals should be 0 because it's a strong bullish case and far from 52-week extremes
    expect((result.output as any).signals.length).toBe(0);
  });
});
