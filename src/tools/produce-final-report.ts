import { defineTool } from '@flue/runtime';
import { finalResearchReportSchema, investmentThesisSchema } from '../report/schemas';
import { generateRecommendation } from '../recommendation/engine';
import { analyzeBullishFactors, analyzeRiskFactors } from '../signals/engine';
import { calculate_indicators } from '../indicators/engine';
import { MarketDataService } from '../market-data/service';
import { YahooFinanceProvider } from '../market-data/providers/yahoo-finance-provider';
import { normalizeTicker } from '../utils/ticker-normalization';
import { produceFinalReport } from '../report/report';
import * as v from 'valibot';
import { thesisCache } from './generate-investment-thesis';

const marketDataService = new MarketDataService(new YahooFinanceProvider());

export const produceFinalReportTool = defineTool({
  name: 'produce_final_report',
  description: 'Deterministically assembles the Final Research Report from all structured components. Must be called last.',
  input: v.object({
    symbol: v.string(),
  }),
  output: finalResearchReportSchema,
  async run({ data }) {
    const symbol = normalizeTicker(data.symbol);
    const thesis = thesisCache.get(symbol.toUpperCase());

    if (!thesis) {
      throw new Error("Thesis not found in cache. The generate_investment_thesis tool must be called first.");
    }
    const md = await marketDataService.getHistoricalData({ symbol, period: '1y', interval: '1d' });
    const ind = calculate_indicators(md);
    const bullish = analyzeBullishFactors(ind);
    const risk = analyzeRiskFactors(ind);
    const rec = generateRecommendation(ind, bullish, risk);

    const report = produceFinalReport(md, ind, bullish, risk, rec, thesis);

    return {
      output: report,
    };
  },
});
