import { defineTool } from '@flue/runtime';
import { comparisonInputSchema, comparisonResultSchema } from '../comparison/schemas';
import { generateComparison } from '../comparison/engine';
import { MarketDataService } from '../market-data/service';
import { YahooFinanceProvider } from '../market-data/providers/yahoo-finance-provider';
import { calculate_indicators } from '../indicators/engine';
import { analyzeBullishFactors, analyzeRiskFactors } from '../signals/engine';
import { generateRecommendation } from '../recommendation/engine';
import { StockComparisonSnapshot } from '../comparison/types';
import * as v from 'valibot';
import { normalizeTicker } from '../utils/ticker-normalization';

const marketDataProvider = new YahooFinanceProvider();
const marketDataService = new MarketDataService(marketDataProvider);

export const compareStocksTool = defineTool({
  name: 'compare_stocks',
  description: 'Compares two stock symbols deterministically using the existing financial research pipeline.',
  input: comparisonInputSchema,
  output: v.union([
    v.object({
      success: v.literal(true),
      output: comparisonResultSchema,
    }),
    v.object({
      success: v.literal(false),
      error: v.string(),
      message: v.string(),
      symbol: v.string(),
    })
  ]),
  async run({ data }) {
    const symbolA = normalizeTicker(data.symbolA);
    const symbolB = normalizeTicker(data.symbolB);

    if (symbolA === symbolB) {
      return {
        output: {
          success: false as const,
          error: 'INVALID_COMPARISON',
          message: 'symbolA and symbolB must be different stocks after normalization.',
          symbol: symbolA
        }
      };
    }

    async function getSnapshot(symbol: string): Promise<StockComparisonSnapshot> {
      console.log(`[tool] snapshot -> ${symbol.toUpperCase()}`);
      // 1. Fetch Market Data
      const marketData = await marketDataService.getHistoricalData({
        symbol,
        period: '1y',
        interval: '1d',
      });

      // 2. Calculate Indicators
      const indicators = calculate_indicators(marketData);

      // 3. Analyze Signals
      const bullishFactors = analyzeBullishFactors(indicators);
      const riskFactors = analyzeRiskFactors(indicators);

      // 4. Generate Recommendation
      const recommendationResult = generateRecommendation(indicators, bullishFactors, riskFactors);

      // 5. Construct Snapshot
      return {
        symbol: symbol.toUpperCase(),
        currentPrice: indicators.currentPrice,
        recommendation: recommendationResult.recommendation,
        score: recommendationResult.score,
        confidence: recommendationResult.confidence,
        bullishSignalCount: bullishFactors.signals.length,
        riskSignalCount: riskFactors.signals.length,
        sma20: indicators.movingAverages.sma20,
        sma50: indicators.movingAverages.sma50,
        priceVsSma20: (indicators.currentPrice !== null && indicators.movingAverages.sma20 !== null) ? Number((indicators.currentPrice - indicators.movingAverages.sma20).toFixed(2)) : null,
        priceVsSma50: (indicators.currentPrice !== null && indicators.movingAverages.sma50 !== null) ? Number((indicators.currentPrice - indicators.movingAverages.sma50).toFixed(2)) : null,
      };
    }

    try {
      const snapshotA = await getSnapshot(symbolA);
      const snapshotB = await getSnapshot(symbolB);

      const comparisonResult = generateComparison(snapshotA, snapshotB);

      return {
        output: {
          success: true as const,
          output: comparisonResult
        }
      };
    } catch (error: any) {
      let errorCode = 'MARKET_DATA_ERROR';
      let errorMessage = error.message || 'An unknown error occurred while fetching market data.';
      let failedSymbol = 'unknown';

      // We can't easily extract which symbol failed from a raw error, but the provider errors usually contain it.
      if (error.name === 'UnsupportedSymbolError') {
        errorCode = 'UNSUPPORTED_SYMBOL';
        errorMessage = `Unable to find market data. For Indian equities, try an NSE ticker such as RELIANCE, TCS, INFY, or provide an explicit exchange suffix. Original error: ${error.message}`;
      } else if (error.name === 'ProviderError') {
        errorCode = 'PROVIDER_ERROR';
        errorMessage = `Unable to retrieve market data from Yahoo Finance: ${error.message}`;
      }

      return {
        output: {
          success: false as const,
          error: errorCode,
          message: errorMessage,
          symbol: failedSymbol
        }
      };
    }
  },
});
