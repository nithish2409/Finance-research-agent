export type RecommendationCategory = 'BUY' | 'HOLD' | 'WATCHLIST' | 'AVOID';

export interface RecommendationResult {
  symbol: string;
  recommendation: RecommendationCategory;
  score: number;
  confidence: number;
  reasoning: string[];
}
