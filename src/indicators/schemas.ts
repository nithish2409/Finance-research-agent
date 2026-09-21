import * as v from 'valibot';

export const dailyReturnSchema = v.object({
  value: v.number(),
  percentage: v.number(),
  previousClose: v.number(),
});

export const pricePositionSchema = v.object({
  currentPrice: v.number(),
  week52High: v.number(),
  week52Low: v.number(),
  distanceFrom52WeekHighPct: v.number(),
  distanceFrom52WeekLowPct: v.number(),
});

export const movingAverageResultSchema = v.object({
  sma20: v.nullable(v.number()),
  sma50: v.nullable(v.number()),
});

export const momentumClassificationSchema = v.union([
  v.literal('Bullish'),
  v.literal('Bearish'),
  v.literal('Neutral'),
  v.literal('Insufficient Data'),
]);

export const volatilityResultSchema = v.object({
  proxyValue: v.nullable(v.number()),
});

export const indicatorResultSchema = v.object({
  symbol: v.string(),
  currentPrice: v.number(),
  dailyReturn: v.nullable(dailyReturnSchema),
  pricePosition: v.nullable(pricePositionSchema),
  movingAverages: movingAverageResultSchema,
  momentum: momentumClassificationSchema,
  volatility: volatilityResultSchema,
});
