import { MarketDataResponse } from '../market-data/types';
import { IndicatorResult } from '../indicators/types';
import { SignalAnalysisResult } from '../signals/types';
import { RecommendationResult } from '../recommendation/types';
import { InvestmentThesis, FinalResearchReport } from './types';

export function produceFinalReport(
  marketData: MarketDataResponse,
  indicators: IndicatorResult,
  bullishFactors: SignalAnalysisResult,
  riskFactors: SignalAnalysisResult,
  recommendation: RecommendationResult,
  thesis: InvestmentThesis
): FinalResearchReport {
  let volume: number | null = null;
  if (marketData.data && marketData.data.length > 0) {
    // Assuming data is chronological, last entry is the most recent
    volume = marketData.data[marketData.data.length - 1].volume;
  }

  return {
    symbol: marketData.symbol,
    currentPrice: indicators.currentPrice,
    dailyChange: indicators.dailyReturn ? indicators.dailyReturn.value : null,
    week52High: indicators.pricePosition ? indicators.pricePosition.week52High : null,
    week52Low: indicators.pricePosition ? indicators.pricePosition.week52Low : null,
    volume,
    bullishFactors: bullishFactors.signals.map(s => s.factor),
    riskFactors: riskFactors.signals.map(s => s.factor),
    technicalView: thesis.technicalInterpretation,
    recommendation: recommendation.recommendation,
    confidence: recommendation.confidence,
    thesisSummary: thesis.summary,
    disclaimer: 'This is only an educational mock analysis and not financial advice.',
  };
}
