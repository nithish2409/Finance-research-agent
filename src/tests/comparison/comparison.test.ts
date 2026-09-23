import { describe, test, expect, vi } from 'vitest';
import * as v from 'valibot';
import { generateComparison } from '../../comparison/engine';
import { StockComparisonSnapshot, ComparisonResult } from '../../comparison/types';
import { comparisonInputSchema, comparisonResultSchema } from '../../comparison/schemas';
import { compareStocksTool } from '../../tools/compare-stocks';
import { MarketDataService } from '../../market-data/service';
import * as indicatorsEngine from '../../indicators/engine';
import * as signalsEngine from '../../signals/engine';
import * as recommendationEngine from '../../recommendation/engine';

describe('Comparison Engine', () => {
  const baseSnapshot: StockComparisonSnapshot = {
    symbol: 'AAPL',
    currentPrice: 150,
    recommendation: 'HOLD',
    score: 50,
    confidence: 60,
    bullishSignalCount: 2,
    riskSignalCount: 1,
    sma20: 145,
    sma50: 140,
    priceVsSma20: 5,
    priceVsSma50: 10,
  };

  test('Stronger profile logic - higher score wins', () => {
    const snapA = { ...baseSnapshot, symbol: 'AAPL', score: 80 };
    const snapB = { ...baseSnapshot, symbol: 'MSFT', score: 60 };

    const result = generateComparison(snapA, snapB);
    expect(result.strongerProfile).toBe('AAPL');
  });

  test('Stronger profile logic - lower score loses', () => {
    const snapA = { ...baseSnapshot, symbol: 'AAPL', score: 40 };
    const snapB = { ...baseSnapshot, symbol: 'MSFT', score: 90 };

    const result = generateComparison(snapA, snapB);
    expect(result.strongerProfile).toBe('MSFT');
  });

  test('Confidence tie-breaker - equal score + higher confidence wins', () => {
    const snapA = { ...baseSnapshot, symbol: 'AAPL', score: 70, confidence: 80 };
    const snapB = { ...baseSnapshot, symbol: 'MSFT', score: 70, confidence: 50 };

    const result = generateComparison(snapA, snapB);
    expect(result.strongerProfile).toBe('AAPL');

    const result2 = generateComparison(snapB, snapA);
    expect(result2.strongerProfile).toBe('AAPL');
  });

  test('Exact tie - equal score and confidence', () => {
    const snapA = { ...baseSnapshot, symbol: 'AAPL', score: 60, confidence: 70 };
    const snapB = { ...baseSnapshot, symbol: 'MSFT', score: 60, confidence: 70 };

    const result = generateComparison(snapA, snapB);
    expect(result.strongerProfile).toBeNull();
  });

  test('Missing indicators are preserved', () => {
    const snapA = { ...baseSnapshot, symbol: 'AAPL', currentPrice: null, sma20: null, sma50: null, priceVsSma20: null, priceVsSma50: null };
    const snapB = { ...baseSnapshot, symbol: 'MSFT' };

    const result = generateComparison(snapA, snapB);
    expect(result.stockA.currentPrice).toBeNull();
    expect(result.stockA.sma20).toBeNull();
    expect(result.stockA.sma50).toBeNull();
    expect(result.stockA.priceVsSma20).toBeNull();
    expect(result.stockA.priceVsSma50).toBeNull();
  });

  test('Recommendation preservation', () => {
    const snapA = { ...baseSnapshot, symbol: 'AAPL', recommendation: 'BUY' as const, score: 85, confidence: 90 };
    const snapB = { ...baseSnapshot, symbol: 'MSFT', recommendation: 'AVOID' as const, score: 10, confidence: 80 };

    const result = generateComparison(snapA, snapB);
    expect(result.stockA.recommendation).toBe('BUY');
    expect(result.stockA.score).toBe(85);
    expect(result.stockA.confidence).toBe(90);
    expect(result.stockB.recommendation).toBe('AVOID');
    expect(result.stockB.score).toBe(10);
    expect(result.stockB.confidence).toBe(80);
  });
});

describe('Comparison Schemas', () => {
  test('Duplicate symbols are valid at schema level (tool logic handles it), but empty symbols are rejected', () => {
    expect(() => v.parse(comparisonInputSchema, { symbolA: 'AAPL', symbolB: 'MSFT' })).not.toThrow();
    expect(() => v.parse(comparisonInputSchema, { symbolA: '', symbolB: 'MSFT' })).toThrow();
    expect(() => v.parse(comparisonInputSchema, { symbolA: 'AAPL', symbolB: '' })).toThrow();
  });

  test('Invalid ComparisonResult structures are rejected', () => {
    const invalidResult = {
      symbolA: 'AAPL',
      // missing symbolB
      stockA: {},
      stockB: {},
      strongerProfile: 'AAPL',
      reasoning: 'Because.',
    };
    expect(() => v.parse(comparisonResultSchema, invalidResult)).toThrow();
  });
});

describe('Compare Stocks Tool', () => {
  test('Duplicate symbols are rejected by tool', async () => {
    const result = await compareStocksTool.run({ data: { symbolA: 'AAPL', symbolB: 'AAPL' } } as any);
    expect(result.output.success).toBe(false);
    if (!result.output.success) {
      expect(result.output.error).toBe('INVALID_COMPARISON');
      expect(result.output.message).toContain('must be different stocks');
    }
  });

  test('Orchestrates correctly and derives signal counts from Phase 4 outputs', async () => {
    // Mock the dependencies used by the tool
    const marketDataSpy = vi.spyOn(MarketDataService.prototype, 'getHistoricalData').mockResolvedValue({} as any);
    const indicatorsSpy = vi.spyOn(indicatorsEngine, 'calculate_indicators').mockReturnValue({
      currentPrice: 150,
      movingAverages: { sma20: 145, sma50: 140 },
    } as any);
    
    // We will supply exactly 3 bullish signals and 1 risk signal
    const bullishSpy = vi.spyOn(signalsEngine, 'analyzeBullishFactors').mockReturnValue({
      signals: [{ type: 'bullish' }, { type: 'bullish' }, { type: 'bullish' }] as any,
    } as any);
    const riskSpy = vi.spyOn(signalsEngine, 'analyzeRiskFactors').mockReturnValue({
      signals: [{ type: 'risk' }] as any,
    } as any);
    const recommendationSpy = vi.spyOn(recommendationEngine, 'generateRecommendation').mockReturnValue({
      recommendation: 'BUY',
      score: 80,
      confidence: 90,
    } as any);

    const result = await compareStocksTool.run({ data: { symbolA: 'AAPL', symbolB: 'MSFT' } } as any);

    expect(result.output.success).toBe(true);
    
    if (result.output.success) {
      const output = result.output.output as ComparisonResult;
      expect(output.stockA.bullishSignalCount).toBe(3);
      expect(output.stockA.riskSignalCount).toBe(1);
      expect(output.stockB.bullishSignalCount).toBe(3);
      expect(output.stockB.riskSignalCount).toBe(1);
    }

    // Restore mocks
    marketDataSpy.mockRestore();
    indicatorsSpy.mockRestore();
    bullishSpy.mockRestore();
    riskSpy.mockRestore();
    recommendationSpy.mockRestore();
  });
});
