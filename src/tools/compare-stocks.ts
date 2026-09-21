import { defineTool } from '@flue/runtime';
import { comparisonInputSchema, comparisonResultSchema } from '../comparison/schemas';
import { generateComparison } from '../comparison/engine';
import { MarketDataService } from '../market-data/service';
import { YahooFinanceProvider } from '../market-data/providers/yahoo-finance-provider';
import { calculate_indicators } from '../indicators/engine';
import { analyzeBullishFactors, analyzeRiskFactors } from '../signals/engine';
import { generateRecommendation } from '../recommendation/engine';
import { StockComparisonSnapshot } from '../comparison/types';

const marketDataProvider = new YahooFinanceProvider();
const marketDataService = new MarketDataService(marketDataProvider);

export const compareStocksTool = defineTool({
  name: 'compare_stocks',
  description: 'Compares two stock symbols deterministically using the existing financial research pipeline.',
  input: comparisonInputSchema,
  output: comparisonResultSchema,
  async run({ data }) {
    if (data.symbolA.toUpperCase() === data.symbolB.toUpperCase()) {
      throw new Error('symbolA and symbolB must be different stocks.');
    }

    async function getSnapshot(symbol: string): Promise<StockComparisonSnapshot> {
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
      };
    }

    const snapshotA = await getSnapshot(data.symbolA);
    const snapshotB = await getSnapshot(data.symbolB);

    const comparisonResult = generateComparison(snapshotA, snapshotB);

    return { output: comparisonResult };
  },
});
