import { IndicatorResult } from '../indicators/types';
import { SignalAnalysisResult, SignalStrength } from '../signals/types';
import { RecommendationCategory, RecommendationResult } from './types';

// Deterministic Confidence Weights (Total = 100)
// As specified in the Phase 5 approved plan (30/25/20/15/10)
const CONFIDENCE_WEIGHTS = {
  DAILY_RETURN: 30,
  SMA20: 25,
  SMA50: 20,
  MOMENTUM: 15,
  VOLATILITY: 10,
};

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

  // 3. Calculate Deterministic Confidence Score (0-100) based on data completeness
  let confidence = 0;
  if (indicators.dailyReturn !== null) confidence += CONFIDENCE_WEIGHTS.DAILY_RETURN;
  if (indicators.movingAverages.sma20 !== null) confidence += CONFIDENCE_WEIGHTS.SMA20;
  if (indicators.movingAverages.sma50 !== null) confidence += CONFIDENCE_WEIGHTS.SMA50;
  if (indicators.momentum !== 'Insufficient Data') confidence += CONFIDENCE_WEIGHTS.MOMENTUM;
  if (indicators.volatility && indicators.volatility.proxyValue !== null) confidence += CONFIDENCE_WEIGHTS.VOLATILITY;

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
