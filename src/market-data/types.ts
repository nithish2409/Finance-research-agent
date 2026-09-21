export interface OHLCV {
  date: string; // ISO 8601 (YYYY-MM-DD)
  open: number;
  high: number;
  low: number;
  close: number;
  adjustedClose?: number;
  volume: number;
}

export interface MarketDataRequest {
  symbol: string;
  period: '1mo' | '3mo' | '6mo' | '1y';
  interval: '1d';
}

export interface MarketDataResponse {
  symbol: string;
  period: string;
  interval: string;
  data: OHLCV[];
  metadata?: {
    provider: string;
    exchange?: string;
    currency?: string;
  };
}
