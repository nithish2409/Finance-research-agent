import * as v from 'valibot';
import { recommendationCategorySchema } from '../recommendation/schemas';

export const comparisonInputSchema = v.object({
  symbolA: v.pipe(v.string(), v.minLength(1, 'symbolA must not be empty')),
  symbolB: v.pipe(v.string(), v.minLength(1, 'symbolB must not be empty')),
});

export const stockComparisonSnapshotSchema = v.object({
  symbol: v.string(),
  currentPrice: v.nullable(v.number()),
  recommendation: recommendationCategorySchema,
  score: v.number(),
  confidence: v.number(),
  bullishSignalCount: v.number(),
  riskSignalCount: v.number(),
  sma20: v.nullable(v.number()),
  sma50: v.nullable(v.number()),
  priceVsSma20: v.nullable(v.number()),
  priceVsSma50: v.nullable(v.number()),
});

export const comparisonResultSchema = v.object({
  symbolA: v.string(),
  symbolB: v.string(),
  stockA: stockComparisonSnapshotSchema,
  stockB: stockComparisonSnapshotSchema,
  strongerProfile: v.nullable(v.string()),
  reasoning: v.string(),
});
