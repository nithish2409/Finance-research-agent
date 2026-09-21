export interface DailyReturn {
  value: number;
  percentage: number;
  previousClose: number;
}

export interface PricePosition {
  currentPrice: number;
  week52High: number;
  week52Low: number;
  distanceFrom52WeekHighPct: number;
  distanceFrom52WeekLowPct: number;
}

export interface MovingAverageResult {
  sma20: number | null;
  sma50: number | null;
}

export type MomentumClassification = 'Bullish' | 'Bearish' | 'Neutral' | 'Insufficient Data';

export interface VolatilityResult {
  proxyValue: number | null; // e.g. standard deviation of recent daily returns
}

export interface IndicatorResult {
  symbol: string;
  currentPrice: number;
  dailyReturn: DailyReturn | null;
  pricePosition: PricePosition | null;
  movingAverages: MovingAverageResult;
  momentum: MomentumClassification;
  volatility: VolatilityResult;
}
