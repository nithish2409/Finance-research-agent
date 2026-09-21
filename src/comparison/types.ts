import { RecommendationCategory } from '../recommendation/types';

export interface ComparisonInput {
  symbolA: string;
  symbolB: string;
}

export interface StockComparisonSnapshot {
  symbol: string;
  currentPrice: number | null;
  recommendation: RecommendationCategory;
  score: number;
  confidence: number;
  bullishSignalCount: number;
  riskSignalCount: number;
  sma20: number | null;
  sma50: number | null;
}

export interface ComparisonResult {
  symbolA: string;
  symbolB: string;
  stockA: StockComparisonSnapshot;
  stockB: StockComparisonSnapshot;
  strongerProfile: string | null;
  reasoning: string;
}
