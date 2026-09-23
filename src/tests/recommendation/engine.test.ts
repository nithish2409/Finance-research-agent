import { describe, it, expect } from 'vitest';
import { generateRecommendation } from '../../recommendation/engine';
import { IndicatorResult } from '../../indicators/types';
import { SignalAnalysisResult } from '../../signals/types';

describe('Recommendation Engine', () => {
  const completeIndicators: IndicatorResult = {
    symbol: 'TEST',
    currentPrice: 100,
    dailyReturn: { value: 1, percentage: 1, previousClose: 99 },
    pricePosition: { currentPrice: 100, week52High: 120, week52Low: 80, distanceFrom52WeekHighPct: -16.6, distanceFrom52WeekLowPct: 25 },
    movingAverages: { sma20: 95, sma50: 90 },
    momentum: 'Bullish',
    volatility: { proxyValue: 12 },
  };

  const emptySignals: SignalAnalysisResult = { symbol: 'TEST', signals: [] };

  it('A. Strong bullish -> BUY', () => {
    const bullish: SignalAnalysisResult = {
      symbol: 'TEST',
      signals: [
        { type: 'bullish', factor: 'Positive Return', evidence: '', strength: 'moderate' }, // +2
        { type: 'bullish', factor: 'SMA Alignment', evidence: '', strength: 'strong' }, // +3
      ],
    };

    const result = generateRecommendation(completeIndicators, bullish, emptySignals);
    expect(result.score).toBe(5);
    expect(result.recommendation).toBe('BUY');
  });

  it('B. Strong bearish -> AVOID', () => {
    const risk: SignalAnalysisResult = {
      symbol: 'TEST',
      signals: [
        { type: 'risk', factor: 'Negative Return', evidence: '', strength: 'moderate' }, // -2
        { type: 'risk', factor: 'Bearish Momentum', evidence: '', strength: 'strong' }, // -3
      ],
    };

    const result = generateRecommendation(completeIndicators, emptySignals, risk);
    expect(result.score).toBe(-5);
    expect(result.recommendation).toBe('AVOID');
  });

  it('C. Positive but limited evidence -> WATCHLIST', () => {
    const bullish: SignalAnalysisResult = {
      symbol: 'TEST',
      signals: [{ type: 'bullish', factor: 'Pos', evidence: '', strength: 'weak' }], // +1
    };

    const result = generateRecommendation(completeIndicators, bullish, emptySignals);
    expect(result.score).toBe(1);
    expect(result.recommendation).toBe('WATCHLIST');
  });

  it('D. Mixed bullish/risk evidence -> HOLD', () => {
    const bullish: SignalAnalysisResult = {
      symbol: 'TEST',
      signals: [{ type: 'bullish', factor: 'Pos', evidence: '', strength: 'weak' }], // +1
    };
    const risk: SignalAnalysisResult = {
      symbol: 'TEST',
      signals: [{ type: 'risk', factor: 'Neg', evidence: '', strength: 'moderate' }], // -2
    };

    const result = generateRecommendation(completeIndicators, bullish, risk);
    expect(result.score).toBe(-1);
    expect(result.recommendation).toBe('HOLD');
  });

  it('E. Boundary score -2 -> AVOID', () => {
    const risk: SignalAnalysisResult = {
      symbol: 'TEST',
      signals: [{ type: 'risk', factor: 'Neg', evidence: '', strength: 'moderate' }], // -2
    };
    const result = generateRecommendation(completeIndicators, emptySignals, risk);
    expect(result.score).toBe(-2);
    expect(result.recommendation).toBe('AVOID');
  });

  it('F. Boundary score -1 -> HOLD', () => {
    const risk: SignalAnalysisResult = {
      symbol: 'TEST',
      signals: [{ type: 'risk', factor: 'Neg', evidence: '', strength: 'weak' }], // -1
    };
    const result = generateRecommendation(completeIndicators, emptySignals, risk);
    expect(result.score).toBe(-1);
    expect(result.recommendation).toBe('HOLD');
  });

  it('G. Boundary score 0 -> HOLD', () => {
    const result = generateRecommendation(completeIndicators, emptySignals, emptySignals);
    expect(result.score).toBe(0);
    expect(result.recommendation).toBe('HOLD');
  });

  it('H. Boundary score 1 -> WATCHLIST', () => {
    const bullish: SignalAnalysisResult = {
      symbol: 'TEST',
      signals: [{ type: 'bullish', factor: 'Pos', evidence: '', strength: 'weak' }], // +1
    };
    const result = generateRecommendation(completeIndicators, bullish, emptySignals);
    expect(result.score).toBe(1);
    expect(result.recommendation).toBe('WATCHLIST');
  });

  it('I. Boundary score 3 -> WATCHLIST', () => {
    const bullish: SignalAnalysisResult = {
      symbol: 'TEST',
      signals: [{ type: 'bullish', factor: 'Pos', evidence: '', strength: 'strong' }], // +3
    };
    const result = generateRecommendation(completeIndicators, bullish, emptySignals);
    expect(result.score).toBe(3);
    expect(result.recommendation).toBe('WATCHLIST');
  });

  it('J. Boundary score 4 -> BUY', () => {
    const bullish: SignalAnalysisResult = {
      symbol: 'TEST',
      signals: [
        { type: 'bullish', factor: 'Pos1', evidence: '', strength: 'strong' }, // +3
        { type: 'bullish', factor: 'Pos2', evidence: '', strength: 'weak' }, // +1
      ],
    };
    const result = generateRecommendation(completeIndicators, bullish, emptySignals);
    expect(result.score).toBe(4);
    expect(result.recommendation).toBe('BUY');
  });

  it('K. Full confidence = 100 with strong unified evidence', () => {
    const bullish: SignalAnalysisResult = {
      symbol: 'TEST',
      signals: [
        { type: 'bullish', factor: '1', evidence: '', strength: 'strong' },
        { type: 'bullish', factor: '2', evidence: '', strength: 'strong' },
        { type: 'bullish', factor: '3', evidence: '', strength: 'moderate' },
      ],
    };
    const result = generateRecommendation(completeIndicators, bullish, emptySignals);
    expect(result.confidence).toBe(100);
  });

  it('L. Missing one confidence component (SMA20 missing -> 50 for neutral evidence)', () => {
    const ind: IndicatorResult = { ...completeIndicators, movingAverages: { sma20: null, sma50: 90 } };
    const result = generateRecommendation(ind, emptySignals, emptySignals);
    // Completeness = 30, Consistency = 20 (neutral), Volume = 0 => 50
    expect(result.confidence).toBe(50);
  });

  it('M. Multiple missing confidence components (SMA20, Momentum missing -> 45 for neutral)', () => {
    const ind: IndicatorResult = { ...completeIndicators, movingAverages: { sma20: null, sma50: 90 }, momentum: 'Insufficient Data' };
    const result = generateRecommendation(ind, emptySignals, emptySignals);
    // Completeness = 25, Consistency = 20, Volume = 0 => 45
    expect(result.confidence).toBe(45);
  });

  it('N. Zero confidence (missing all historicals, highly conflicting signals)', () => {
    const ind: IndicatorResult = {
      symbol: 'TEST',
      currentPrice: 100,
      dailyReturn: null,
      pricePosition: null,
      movingAverages: { sma20: null, sma50: null },
      momentum: 'Insufficient Data',
      volatility: { proxyValue: null },
    };
    const bullish: SignalAnalysisResult = {
      symbol: 'TEST',
      signals: [{ type: 'bullish', factor: '1', evidence: '', strength: 'strong' }], // +3
    };
    const risk: SignalAnalysisResult = {
      symbol: 'TEST',
      signals: [{ type: 'risk', factor: '1', evidence: '', strength: 'strong' }], // -3
    };
    const result = generateRecommendation(ind, bullish, risk);
    // Completeness = 0, Consistency = 0, Volume = Min(20, 6/8*20) = 15. Total = 15
    expect(result.confidence).toBe(15);
  });

  it('O. Missing indicators do not create signals (handled by Phase 4, checked here to verify reasoning notes)', () => {
    const ind: IndicatorResult = { ...completeIndicators, dailyReturn: null };
    const result = generateRecommendation(ind, emptySignals, emptySignals);
    expect(result.reasoning.some(r => r.includes('due to incomplete historical market data'))).toBe(true);
  });

  it('Q. Identical inputs produce identical outputs', () => {
    const result1 = generateRecommendation(completeIndicators, emptySignals, emptySignals);
    const result2 = generateRecommendation(completeIndicators, emptySignals, emptySignals);
    expect(result1).toEqual(result2);
  });
});

