import { IndicatorResult } from '../indicators/types';
import { SignalAnalysisResult, SignalStrength } from '../signals/types';
import { RecommendationCategory, RecommendationResult } from './types';


// Deterministic Signal Score Weights
function getSignalWeight(strength: SignalStrength): number {
  switch (strength) {
    case 'strong': return 3;
    case 'moderate': return 2;
    case 'weak': return 1;
    default: return 0;
  }
}

export function generateRecommendation(
  indicators: IndicatorResult,
  bullishFactors: SignalAnalysisResult,
  riskFactors: SignalAnalysisResult
): RecommendationResult {
  // 1. Calculate Deterministic Recommendation Score
  let score = 0;

  for (const signal of bullishFactors.signals) {
    score += getSignalWeight(signal.strength);
  }

  for (const signal of riskFactors.signals) {
    score -= getSignalWeight(signal.strength);
  }

  // 2. Map Score to Classification (BUY, WATCHLIST, HOLD, AVOID)
  // Deterministic mapping:
  // Score >= 4 : BUY
  // Score >= 1 and Score <= 3 : WATCHLIST
  // Score >= -1 and Score <= 0 : HOLD
  // Score <= -2 : AVOID
  let recommendation: RecommendationCategory;
  if (score >= 4) {
    recommendation = 'BUY';
  } else if (score >= 1) {
    recommendation = 'WATCHLIST';
  } else if (score >= -1) {
    recommendation = 'HOLD';
  } else {
    recommendation = 'AVOID';
  }

  // 3. Calculate Deterministic Confidence Score (0-100)
  // Component A: Data Completeness (Max 40)
  let completeness = 0;
  if (indicators.dailyReturn !== null) completeness += 10;
  if (indicators.movingAverages.sma20 !== null) completeness += 10;
  if (indicators.movingAverages.sma50 !== null) completeness += 10;
  if (indicators.momentum !== 'Insufficient Data') completeness += 5;
  if (indicators.volatility && indicators.volatility.proxyValue !== null) completeness += 5;

  // Component B & C: Signal Consistency (Max 40) & Evidence Volume (Max 20)
  let bullWeight = 0;
  for (const signal of bullishFactors.signals) {
    bullWeight += getSignalWeight(signal.strength);
  }

  let riskWeight = 0;
  for (const signal of riskFactors.signals) {
    riskWeight += getSignalWeight(signal.strength);
  }

  const totalWeight = bullWeight + riskWeight;

  let consistency = 0;
  if (totalWeight === 0) {
    consistency = 20; // Neutral baseline for lack of evidence
  } else {
    consistency = 40 * (Math.abs(bullWeight - riskWeight) / totalWeight);
  }

  const volume = Math.min(20, (totalWeight / 8) * 20);

  let confidence = Math.max(0, Math.min(100, Math.round(completeness + consistency + volume)));

  // 4. Generate Reasoning
  const reasoning: string[] = [];

  if (bullishFactors.signals.length > 0) {
    reasoning.push(`Identified ${bullishFactors.signals.length} bullish signal(s): ${bullishFactors.signals.map(s => s.factor).join(', ')}.`);
  } else {
    reasoning.push('No significant bullish signals identified.');
  }

  if (riskFactors.signals.length > 0) {
    reasoning.push(`Identified ${riskFactors.signals.length} risk signal(s): ${riskFactors.signals.map(s => s.factor).join(', ')}.`);
  } else {
    reasoning.push('No significant risk signals identified.');
  }

  reasoning.push(`Net recommendation score is ${score}.`);

  if (confidence < 100) {
    reasoning.push(`Confidence is reduced to ${confidence}% due to incomplete historical market data for some indicators.`);
  } else {
    reasoning.push(`Confidence is 100% based on full availability of required data points.`);
  }

  return {
    symbol: indicators.symbol,
    recommendation,
    score,
    confidence,
    reasoning,
  };
}
