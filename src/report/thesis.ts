import { InvestmentThesis } from './types';

export function generateInvestmentThesis(thesis: InvestmentThesis): InvestmentThesis {
  return {
    summary: thesis.summary,
    bullishEvidence: thesis.bullishEvidence || [],
    keyRisks: thesis.keyRisks || [],
    technicalInterpretation: thesis.technicalInterpretation,
    recommendationContext: thesis.recommendationContext,
    confidenceContext: thesis.confidenceContext,
  };
}
