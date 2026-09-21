import { RecommendationCategory } from '../recommendation/types';

export interface InvestmentThesis {
  summary: string;
  bullishEvidence: string[];
  keyRisks: string[];
  technicalInterpretation: string;
  recommendationContext: string;
  confidenceContext: string;
}

export interface FinalResearchReport {
  symbol: string;
  currentPrice: number | null;
  dailyChange: number | null;
  week52High: number | null;
  week52Low: number | null;
  volume: number | null;
  bullishFactors: string[];
  riskFactors: string[];
  technicalView: string;
  recommendation: RecommendationCategory;
  confidence: number;
  thesisSummary: string;
  disclaimer: 'This is only an educational mock analysis and not financial advice.';
}
