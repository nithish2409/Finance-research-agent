import * as v from 'valibot';
import { recommendationCategorySchema } from '../recommendation/schemas';

export const investmentThesisSchema = v.object({
  summary: v.string(),
  bullishEvidence: v.array(v.string()),
  keyRisks: v.array(v.string()),
  technicalInterpretation: v.string(),
  recommendationContext: v.string(),
  confidenceContext: v.string(),
});

export const finalResearchReportSchema = v.object({
  symbol: v.string(),
  currentPrice: v.nullable(v.number()),
  dailyChange: v.nullable(v.number()),
  week52High: v.nullable(v.number()),
  week52Low: v.nullable(v.number()),
  volume: v.nullable(v.number()),
  bullishFactors: v.array(v.string()),
  riskFactors: v.array(v.string()),
  technicalView: v.string(),
  recommendation: recommendationCategorySchema,
  confidence: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  thesisSummary: v.string(),
  volatility: v.nullable(v.number()),
  disclaimer: v.literal('This is only an educational mock analysis and not financial advice.'),
});
