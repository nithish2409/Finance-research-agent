import * as v from 'valibot';

export const periodSchema = v.union([
  v.literal('1mo'),
  v.literal('3mo'),
  v.literal('6mo'),
  v.literal('1y'),
]);

export const intervalSchema = v.literal('1d');

export const marketDataRequestSchema = v.object({
  symbol: v.string(),
  period: periodSchema,
  interval: intervalSchema,
});

export const ohlcvSchema = v.object({
  date: v.string(), // Could add ISO date regex, but string is sufficient for now
  open: v.number(),
  high: v.number(),
  low: v.number(),
  close: v.number(),
  adjustedClose: v.optional(v.number()),
  volume: v.number(),
});

export const marketDataResponseSchema = v.object({
  symbol: v.string(),
  period: v.string(),
  interval: v.string(),
  data: v.array(ohlcvSchema),
  metadata: v.optional(
    v.object({
      provider: v.string(),
      exchange: v.optional(v.string()),
      currency: v.optional(v.string()),
    })
  ),
});
