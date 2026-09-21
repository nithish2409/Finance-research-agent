import * as v from 'valibot';

export const signalStrengthSchema = v.union([
  v.literal('weak'),
  v.literal('moderate'),
  v.literal('strong'),
]);

export const signalTypeSchema = v.union([
  v.literal('bullish'),
  v.literal('risk'),
]);

export const signalSchema = v.object({
  type: signalTypeSchema,
  factor: v.string(),
  evidence: v.string(),
  strength: signalStrengthSchema,
});

export const signalAnalysisResultSchema = v.object({
  symbol: v.string(),
  signals: v.array(signalSchema),
});
