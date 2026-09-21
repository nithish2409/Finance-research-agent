export class MarketDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MarketDataError';
  }
}

export class ProviderError extends MarketDataError {
  constructor(message: string, public readonly providerName: string, public readonly originalError?: unknown) {
    super(`[${providerName}] ${message}`);
    this.name = 'ProviderError';
  }
}

export class InvalidMarketDataError extends MarketDataError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMarketDataError';
  }
}

export class UnsupportedSymbolError extends MarketDataError {
  constructor(symbol: string) {
    super(`Symbol not supported or not found: ${symbol}`);
    this.name = 'UnsupportedSymbolError';
  }
}
