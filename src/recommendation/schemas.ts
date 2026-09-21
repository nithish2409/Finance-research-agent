import * as v from 'valibot';

export const recommendationCategorySchema = v.union([
  v.literal('BUY'),
  v.literal('HOLD'),
  v.literal('WATCHLIST'),
  v.literal('AVOID'),
]);

export const recommendationResultSchema = v.object({
  symbol: v.string(),
  recommendation: recommendationCategorySchema,
  score: v.number(),
  confidence: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  reasoning: v.array(v.string()),
});
