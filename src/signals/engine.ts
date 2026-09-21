import { IndicatorResult } from '../indicators/types';
import { Signal, SignalAnalysisResult } from './types';

// Deterministic rule constants (units must match Phase 3 indicators)
// distanceFrom52WeekLowPct is in percentage (e.g., 20 = 20% above low)
const SIGNIFICANT_RECOVERY_FROM_LOW_PCT = 20;

// distanceFrom52WeekHighPct is in percentage (typically negative, e.g. -5 = 5% below high)
// We check if price is within 5% of the extreme
const NEAR_EXTREME_PROXIMITY_PCT = 5;

// Volatility proxy is annualized standard deviation in percentage (e.g. 20 = 20%)
const LOW_VOLATILITY_THRESHOLD_PCT = 15; // e.g. below 15% annualized volatility is considered controlled
const HIGH_VOLATILITY_THRESHOLD_PCT = 30; // e.g. above 30% annualized volatility is considered elevated

export function analyzeBullishFactors(indicators: IndicatorResult): SignalAnalysisResult {
  const signals: Signal[] = [];

  // Positive Return
  if (indicators.dailyReturn && indicators.dailyReturn.value > 0) {
    signals.push({
      type: 'bullish',
      factor: 'Positive Daily Return',
      evidence: `Daily return is +${indicators.dailyReturn.percentage.toFixed(2)}%`,
      strength: 'moderate',
    });
  }

  // SMA Positioning
  if (indicators.movingAverages.sma20 !== null && indicators.currentPrice > indicators.movingAverages.sma20) {
    signals.push({
      type: 'bullish',
      factor: 'Price Above SMA20',
      evidence: `Current price (${indicators.currentPrice.toFixed(2)}) is above 20-day SMA (${indicators.movingAverages.sma20.toFixed(2)})`,
      strength: 'moderate',
    });
  }

  // Bullish Moving Average Alignment
  if (
    indicators.movingAverages.sma20 !== null &&
    indicators.movingAverages.sma50 !== null &&
    indicators.movingAverages.sma20 > indicators.movingAverages.sma50
  ) {
    signals.push({
      type: 'bullish',
      factor: 'Bullish SMA Alignment',
      evidence: `20-day SMA (${indicators.movingAverages.sma20.toFixed(2)}) is above 50-day SMA (${indicators.movingAverages.sma50.toFixed(2)})`,
      strength: 'strong',
    });
  }

  // Momentum
  if (indicators.momentum === 'Bullish') {
    signals.push({
      type: 'bullish',
      factor: 'Bullish Momentum',
      evidence: 'Momentum classification is Bullish',
      strength: 'strong',
    });
  }

  // High/Low Proximity (Meaningfully Above 52-Week Low)
  if (indicators.pricePosition && indicators.pricePosition.distanceFrom52WeekLowPct > SIGNIFICANT_RECOVERY_FROM_LOW_PCT) {
    signals.push({
      type: 'bullish',
      factor: 'Meaningfully Above 52-Week Low',
      evidence: `Price is ${indicators.pricePosition.distanceFrom52WeekLowPct.toFixed(2)}% above its 52-week low`,
      strength: 'weak',
    });
  }

  // Volatility
  if (indicators.volatility && indicators.volatility.proxyValue !== null && indicators.volatility.proxyValue < LOW_VOLATILITY_THRESHOLD_PCT) {
    signals.push({
      type: 'bullish',
      factor: 'Controlled Volatility',
      evidence: `Volatility proxy is low at ${indicators.volatility.proxyValue.toFixed(2)}%`,
      strength: 'weak',
    });
  }

  return {
    symbol: indicators.symbol,
    signals,
  };
}

export function analyzeRiskFactors(indicators: IndicatorResult): SignalAnalysisResult {
  const signals: Signal[] = [];

  // Negative Return
  if (indicators.dailyReturn && indicators.dailyReturn.value < 0) {
    signals.push({
      type: 'risk',
      factor: 'Negative Daily Return',
      evidence: `Daily return is ${indicators.dailyReturn.percentage.toFixed(2)}%`,
      strength: 'moderate',
    });
  }

  // SMA Positioning
  if (indicators.movingAverages.sma20 !== null && indicators.currentPrice < indicators.movingAverages.sma20) {
    signals.push({
      type: 'risk',
      factor: 'Price Below SMA20',
      evidence: `Current price (${indicators.currentPrice.toFixed(2)}) is below 20-day SMA (${indicators.movingAverages.sma20.toFixed(2)})`,
      strength: 'moderate',
    });
  }

  // Bearish Moving Average Alignment
  if (
    indicators.movingAverages.sma20 !== null &&
    indicators.movingAverages.sma50 !== null &&
    indicators.movingAverages.sma20 < indicators.movingAverages.sma50
  ) {
    signals.push({
      type: 'risk',
      factor: 'Bearish SMA Alignment',
      evidence: `20-day SMA (${indicators.movingAverages.sma20.toFixed(2)}) is below 50-day SMA (${indicators.movingAverages.sma50.toFixed(2)})`,
      strength: 'strong',
    });
  }

  // Momentum
  if (indicators.momentum === 'Bearish') {
    signals.push({
      type: 'risk',
      factor: 'Bearish Momentum',
      evidence: 'Momentum classification is Bearish',
      strength: 'strong',
    });
  }

  // High Proximity (Near 52-Week High)
  // distanceFrom52WeekHighPct is negative if price is below high. We check if it's within 5% of the high.
  if (indicators.pricePosition && Math.abs(indicators.pricePosition.distanceFrom52WeekHighPct) <= NEAR_EXTREME_PROXIMITY_PCT) {
    signals.push({
      type: 'risk',
      factor: 'Near 52-Week High',
      evidence: `Price is within ${NEAR_EXTREME_PROXIMITY_PCT}% of its 52-week high, possible resistance`,
      strength: 'moderate',
    });
  }
  
  // Low Proximity (Near 52-Week Low)
  // distanceFrom52WeekLowPct is positive if price is above low.
  if (indicators.pricePosition && indicators.pricePosition.distanceFrom52WeekLowPct <= NEAR_EXTREME_PROXIMITY_PCT) {
    signals.push({
      type: 'risk',
      factor: 'Near 52-Week Low',
      evidence: `Price is within ${NEAR_EXTREME_PROXIMITY_PCT}% of its 52-week low, indicating bearish pressure`,
      strength: 'strong',
    });
  }

  // Volatility
  if (indicators.volatility && indicators.volatility.proxyValue !== null && indicators.volatility.proxyValue > HIGH_VOLATILITY_THRESHOLD_PCT) {
    signals.push({
      type: 'risk',
      factor: 'Elevated Volatility',
      evidence: `Volatility proxy is high at ${indicators.volatility.proxyValue.toFixed(2)}%`,
      strength: 'moderate',
    });
  }

  return {
    symbol: indicators.symbol,
    signals,
  };
}
