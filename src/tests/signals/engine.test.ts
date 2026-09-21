import { describe, it, expect } from 'vitest';
import { analyzeBullishFactors, analyzeRiskFactors } from '../../signals/engine';
import { IndicatorResult } from '../../indicators/types';

describe('Signal Engine', () => {
  it('should identify bullish factors for a strong positive case', () => {
    const indicators: IndicatorResult = {
      symbol: 'RELIANCE.NS',
      currentPrice: 2600,
      dailyReturn: {
        value: 50,
        percentage: 1.96, // 1.96%
        previousClose: 2550,
      },
      pricePosition: {
        currentPrice: 2600,
        week52High: 2800,
        week52Low: 2000,
        distanceFrom52WeekHighPct: -7.14, // (2600 - 2800) / 2800 * 100
        distanceFrom52WeekLowPct: 30.0, // (2600 - 2000) / 2000 * 100 -> > 20%
      },
      movingAverages: {
        sma20: 2500,
        sma50: 2400,
      },
      momentum: 'Bullish',
      volatility: {
        proxyValue: 12.5, // 12.5% annualized (below 15% threshold)
      },
    };

    const bullish = analyzeBullishFactors(indicators);
    expect(bullish.signals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ factor: 'Positive Daily Return' }),
        expect.objectContaining({ factor: 'Price Above SMA20' }),
        expect.objectContaining({ factor: 'Bullish SMA Alignment' }),
        expect.objectContaining({ factor: 'Bullish Momentum' }),
        expect.objectContaining({ factor: 'Meaningfully Above 52-Week Low' }),
        expect.objectContaining({ factor: 'Controlled Volatility' }),
      ])
    );
    expect(bullish.signals.length).toBe(6);

    const risk = analyzeRiskFactors(indicators);
    expect(risk.signals.length).toBe(0); // -7.14% is not within 5% of high, so no 'Near 52-Week High' risk
  });

  it('should identify risk factors for a strong negative case', () => {
    const indicators: IndicatorResult = {
      symbol: 'TCS.NS',
      currentPrice: 3200,
      dailyReturn: {
        value: -100,
        percentage: -3.03, // -3.03%
        previousClose: 3300,
      },
      pricePosition: {
        currentPrice: 3200,
        week52High: 4000,
        week52Low: 3100,
        distanceFrom52WeekHighPct: -20.0,
        distanceFrom52WeekLowPct: 3.22, // 3.22% above low -> < 5% (near low risk)
      },
      movingAverages: {
        sma20: 3400,
        sma50: 3600,
      },
      momentum: 'Bearish',
      volatility: {
        proxyValue: 35.5, // 35.5% annualized (above 30% threshold)
      },
    };

    const bullish = analyzeBullishFactors(indicators);
    expect(bullish.signals.length).toBe(0);

    const risk = analyzeRiskFactors(indicators);
    expect(risk.signals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ factor: 'Negative Daily Return' }),
        expect.objectContaining({ factor: 'Price Below SMA20' }),
        expect.objectContaining({ factor: 'Bearish SMA Alignment' }),
        expect.objectContaining({ factor: 'Bearish Momentum' }),
        expect.objectContaining({ factor: 'Near 52-Week Low' }),
        expect.objectContaining({ factor: 'Elevated Volatility' }),
      ])
    );
    expect(risk.signals.length).toBe(6);
  });

  it('should identify near 52-week high risk correctly', () => {
    const indicators: IndicatorResult = {
      symbol: 'INFY.NS',
      currentPrice: 1780,
      dailyReturn: { value: 10, percentage: 0.5, previousClose: 1770 },
      pricePosition: {
        currentPrice: 1780,
        week52High: 1800,
        week52Low: 1400,
        distanceFrom52WeekHighPct: -1.11, // (1780 - 1800) / 1800 * 100 (within 5%)
        distanceFrom52WeekLowPct: 27.1,
      },
      movingAverages: { sma20: 1750, sma50: 1700 },
      momentum: 'Bullish',
      volatility: { proxyValue: 20 }, // 20% (neutral, between 15% and 30%)
    };

    const risk = analyzeRiskFactors(indicators);
    expect(risk.signals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ factor: 'Near 52-Week High' }),
      ])
    );
    // Volatility is 20%, not elevated (>30%), not controlled (<15%), so no volatility signal
    expect(risk.signals.find(s => s.factor.includes('Volatility'))).toBeUndefined();
    
    const bullish = analyzeBullishFactors(indicators);
    expect(bullish.signals.find(s => s.factor.includes('Volatility'))).toBeUndefined();
  });

  it('should handle incomplete data gracefully', () => {
    const indicators: IndicatorResult = {
      symbol: 'ITC.NS',
      currentPrice: 400,
      dailyReturn: null,
      pricePosition: null,
      movingAverages: {
        sma20: null,
        sma50: null,
      },
      momentum: 'Insufficient Data',
      volatility: {
        proxyValue: null,
      },
    };

    const bullish = analyzeBullishFactors(indicators);
    expect(bullish.signals).toEqual([]);

    const risk = analyzeRiskFactors(indicators);
    expect(risk.signals).toEqual([]);
  });

  it('should handle null volatility without fabricating signals', () => {
    const indicators: IndicatorResult = {
      symbol: 'WIPRO.NS',
      currentPrice: 400,
      dailyReturn: { value: 10, percentage: 2.56, previousClose: 390 },
      pricePosition: { currentPrice: 400, week52High: 500, week52Low: 350, distanceFrom52WeekHighPct: -20, distanceFrom52WeekLowPct: 14 },
      movingAverages: { sma20: 380, sma50: 370 },
      momentum: 'Bullish',
      volatility: { proxyValue: null },
    };

    const bullish = analyzeBullishFactors(indicators);
    const risk = analyzeRiskFactors(indicators);
    
    expect(bullish.signals.find(s => s.factor.includes('Volatility'))).toBeUndefined();
    expect(risk.signals.find(s => s.factor.includes('Volatility'))).toBeUndefined();
  });
});
