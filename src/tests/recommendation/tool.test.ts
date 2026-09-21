import { describe, it, expect } from 'vitest';
import { generateRecommendationTool } from '../../tools/generate-recommendation';
import { IndicatorResult } from '../../indicators/types';
import * as v from 'valibot';
import { recommendationResultSchema } from '../../recommendation/schemas';

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

    const result = await generateRecommendationTool.run({ data: { indicators: indicators as any, bullishFactors: bullishFactors as any, riskFactors: riskFactors as any } } as any);
    
    expect(result.output).toBeDefined();
    expect((result.output as any).symbol).toBe('TCS.NS');
    expect((result.output as any).recommendation).toBe('WATCHLIST'); // score = 3
    expect((result.output as any).confidence).toBe(100);
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
