import { MarketDataResponse, OHLCV } from '../market-data/types';
import {
  IndicatorResult,
  DailyReturn,
  PricePosition,
  MovingAverageResult,
  MomentumClassification,
  VolatilityResult,
} from './types';

export function calculate_indicators(data: MarketDataResponse): IndicatorResult {
  if (!data || !data.data || data.data.length === 0) {
    throw new Error('Insufficient market data to calculate indicators.');
  }

  const history = data.data; // Assumed sorted chronologically
  const currentRecord = history[history.length - 1];
  const currentPrice = data.currentPrice ?? currentRecord.close;

  const dailyReturn = calculateDailyReturn(history);
  const pricePosition = calculatePricePosition(data, currentPrice);
  const movingAverages = calculateMovingAverages(history);
  const momentum = calculateMomentum(currentPrice, movingAverages);
  const volatility = calculateVolatility(history);

  return {
    symbol: data.symbol,
    currentPrice,
    dailyReturn,
    pricePosition,
    movingAverages,
    momentum,
    volatility,
  };
}

function calculateDailyReturn(history: OHLCV[]): DailyReturn | null {
  if (history.length < 2) {
    return null;
  }
  const currentRecord = history[history.length - 1];
  const previousRecord = history[history.length - 2];

  if (previousRecord.close === 0) {
    return null; // Avoid division by zero
  }

  const value = currentRecord.close - previousRecord.close;
  const percentage = (value / previousRecord.close) * 100;

  return {
    value,
    percentage,
    previousClose: previousRecord.close,
  };
}

function calculatePricePosition(data: MarketDataResponse, currentPrice: number): PricePosition | null {
  if (data.fiftyTwoWeekHigh == null || data.fiftyTwoWeekLow == null) {
    return null;
  }

  const high = data.fiftyTwoWeekHigh;
  const low = data.fiftyTwoWeekLow;

  // Prevent division by zero
  if (high === 0 || low === 0) return null;

  const distanceFrom52WeekHighPct = ((currentPrice - high) / high) * 100;
  const distanceFrom52WeekLowPct = ((currentPrice - low) / low) * 100;

  return {
    currentPrice,
    week52High: high,
    week52Low: low,
    distanceFrom52WeekHighPct,
    distanceFrom52WeekLowPct,
  };
}

function calculateMovingAverages(history: OHLCV[]): MovingAverageResult {
  return {
    sma20: calculateSMA(history, 20),
    sma50: calculateSMA(history, 50),
  };
}

function calculateSMA(history: OHLCV[], period: number): number | null {
  if (history.length < period) {
    return null;
  }

  const slice = history.slice(-period);
  let sum = 0;
  for (const record of slice) {
    sum += record.close;
  }
  return sum / period;
}

function calculateMomentum(currentPrice: number, ma: MovingAverageResult): MomentumClassification {
  if (ma.sma20 === null) {
    return 'Insufficient Data';
  }

  if (ma.sma50 !== null) {
    // If both are available
    if (currentPrice > ma.sma20 && ma.sma20 > ma.sma50) {
      return 'Bullish';
    } else if (currentPrice < ma.sma20 && ma.sma20 < ma.sma50) {
      return 'Bearish';
    }
  } else {
    // If only SMA20 is available
    if (currentPrice > ma.sma20) {
      return 'Bullish';
    } else if (currentPrice < ma.sma20) {
      return 'Bearish';
    }
  }

  return 'Neutral';
}

function calculateVolatility(history: OHLCV[]): VolatilityResult {
  // Basic volatility proxy: standard deviation of the last 20 daily returns
  const period = 20;
  if (history.length <= period) { // Need at least 21 days to get 20 daily returns
    return { proxyValue: null };
  }

  const returns: number[] = [];
  const slice = history.slice(-(period + 1));
  for (let i = 1; i < slice.length; i++) {
    const prevClose = slice[i - 1].close;
    if (prevClose !== 0) {
      returns.push((slice[i].close - prevClose) / prevClose);
    }
  }

  if (returns.length === 0) return { proxyValue: null };

  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  // Return annualized proxy (approx 252 trading days)
  const annualizedVol = stdDev * Math.sqrt(252) * 100; // in percentage

  return { proxyValue: annualizedVol };
}
