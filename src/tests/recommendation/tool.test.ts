import { describe, it, expect, vi } from 'vitest';
import { generateRecommendationTool } from '../../tools/generate-recommendation';
import { IndicatorResult } from '../../indicators/types';
import * as v from 'valibot';
import { recommendationResultSchema } from '../../recommendation/schemas';

vi.mock('../../market-data/providers/yahoo-finance-provider', () => {
  return {
    YahooFinanceProvider: class {
      async getHistoricalData() {
        return {
          symbol: 'TCS.NS',
          period: '1y',
          interval: '1d',
          data: [
            { date: '2026-09-20', open: 3400, high: 3500, low: 3300, close: 3450, volume: 1000000 },
            { date: '2026-09-21', open: 3450, high: 3550, low: 3400, close: 3500, volume: 1200000 },
          ]
        };
      }
    }
  };
});

describe('Recommendation Tool', () => {
  it('should return a valid recommendation output', async () => {
    const indicators: IndicatorResult = {
      symbol: 'TCS.NS',
      currentPrice: 3500,
      dailyReturn: { value: 10, percentage: 0.28, previousClose: 3490 },
      pricePosition: { currentPrice: 3500, week52High: 4000, week52Low: 3000, distanceFrom52WeekHighPct: -12.5, distanceFrom52WeekLowPct: 16.6 },
      movingAverages: { sma20: 3450, sma50: 3400 },
      momentum: 'Bullish',
      volatility: { proxyValue: 18 },
    };

    const bullishFactors = {
      symbol: 'TCS.NS',
      signals: [{ type: 'bullish', factor: 'Bullish Momentum', evidence: 'Mom', strength: 'strong' }],
    };

    const riskFactors = {
      symbol: 'TCS.NS',
      signals: [],
    };

    const result = await generateRecommendationTool.run({ data: { symbol: 'TCS.NS' } } as any);

    expect(result.output).toBeDefined();
    expect((result.output as any).symbol).toBe('TCS.NS');
    expect((result.output as any).recommendation).toBe('WATCHLIST');
    expect((result.output as any).confidence).toBe(55);
  });

  it('P. Tool schema validation', () => {


    const validOutput = {
      symbol: 'TCS.NS',
      recommendation: 'BUY',
      score: 5,
      confidence: 85,
      reasoning: ['Looks good']
    };

    expect(() => v.parse(recommendationResultSchema, validOutput)).not.toThrow();

    const invalidConfidenceOutput = {
      ...validOutput,
      confidence: 105 // Should throw
    };

    expect(() => v.parse(recommendationResultSchema, invalidConfidenceOutput)).toThrow();

    const invalidRecommendationOutput = {
      ...validOutput,
      recommendation: 'STRONG_BUY' // Should throw
    };

    expect(() => v.parse(recommendationResultSchema, invalidRecommendationOutput)).toThrow();
  });
});
