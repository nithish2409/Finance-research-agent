import { describe, it, expect, vi } from 'vitest';
import * as v from 'valibot';
import { investmentThesisSchema, finalResearchReportSchema } from '../../report/schemas';
import { generateInvestmentThesis } from '../../report/thesis';
import { produceFinalReport } from '../../report/report';
import { generateInvestmentThesisTool } from '../../tools/generate-investment-thesis';
import { produceFinalReportTool } from '../../tools/produce-final-report';
import { MarketDataResponse } from '../../market-data/types';
import { IndicatorResult } from '../../indicators/types';
import { SignalAnalysisResult } from '../../signals/types';
import { RecommendationResult } from '../../recommendation/types';

vi.mock('../../market-data/providers/yahoo-finance-provider', () => {
  return {
    YahooFinanceProvider: class {
      async getHistoricalData() {
        return {
          symbol: 'TCS.NS',
          period: '1y',
          interval: '1d',
          data: [
            { date: '2026-09-20', open: 3400, high: 3500, low: 3300, close: 3450, volume: 1000000 },
            { date: '2026-09-21', open: 3450, high: 3550, low: 3400, close: 3500, volume: 1200000 },
          ]
        };
      }
    }
  };
});

describe('Report Engine and Schemas', () => {
  const mockMarketData: MarketDataResponse = {
    symbol: 'TCS.NS',
    period: '1mo',
    interval: '1d',
    data: [
      { date: '2026-09-20', open: 3400, high: 3500, low: 3300, close: 3450, volume: 1000000 },
      { date: '2026-09-21', open: 3450, high: 3550, low: 3400, close: 3500, volume: 1200000 },
    ],
  };

  const mockIndicators: IndicatorResult = {
    symbol: 'TCS.NS',
    currentPrice: 3500,
    dailyReturn: { value: 50, percentage: 1.45, previousClose: 3450 },
    pricePosition: { currentPrice: 3500, week52High: 4000, week52Low: 3000, distanceFrom52WeekHighPct: -12.5, distanceFrom52WeekLowPct: 16.6 },
    movingAverages: { sma20: 3400, sma50: 3300 },
    momentum: 'Bullish',
    volatility: { proxyValue: 15 },
  };

  const mockBullish: SignalAnalysisResult = {
    symbol: 'TCS.NS',
    signals: [{ type: 'bullish', factor: 'Momentum', evidence: 'Bullish', strength: 'strong' }],
  };

  const mockRisk: SignalAnalysisResult = {
    symbol: 'TCS.NS',
    signals: [],
  };

  const mockRecommendation: RecommendationResult = {
    symbol: 'TCS.NS',
    recommendation: 'BUY',
    score: 4,
    confidence: 100,
    reasoning: ['Looks good'],
  };

  const mockThesis = {
    summary: 'Strong technicals',
    bullishEvidence: ['Momentum is strong'],
    keyRisks: [],
    technicalInterpretation: 'SMA aligned',
    recommendationContext: 'Score 4 supports BUY',
    confidenceContext: 'All data available',
  };

  describe('A. InvestmentThesis Schema', () => {
    it('should validate a correct thesis', () => {
      expect(() => v.parse(investmentThesisSchema, mockThesis)).not.toThrow();
    });

    it('should fail if missing required fields', () => {
      const invalid = { ...mockThesis };
      delete (invalid as any).summary;
      expect(() => v.parse(investmentThesisSchema, invalid)).toThrow();
    });

    it('should fail on invalid field types', () => {
      const invalid = { ...mockThesis, bullishEvidence: 'not an array' };
      expect(() => v.parse(investmentThesisSchema, invalid)).toThrow();
    });
  });

  describe('B. FinalResearchReport Schema', () => {
    const validReport = produceFinalReport(
      mockMarketData,
      mockIndicators,
      mockBullish,
      mockRisk,
      mockRecommendation,
      mockThesis
    );

    it('should validate a correct report', () => {
      expect(() => v.parse(finalResearchReportSchema, validReport)).not.toThrow();
    });

    it('should fail on invalid recommendation', () => {
      const invalid = { ...validReport, recommendation: 'STRONG_BUY' };
      expect(() => v.parse(finalResearchReportSchema, invalid)).toThrow();
    });

    it('should fail on confidence < 0', () => {
      const invalid = { ...validReport, confidence: -10 };
      expect(() => v.parse(finalResearchReportSchema, invalid)).toThrow();
    });

    it('should fail on confidence > 100', () => {
      const invalid = { ...validReport, confidence: 110 };
      expect(() => v.parse(finalResearchReportSchema, invalid)).toThrow();
    });

    it('should fail on missing disclaimer', () => {
      const invalid = { ...validReport };
      delete (invalid as any).disclaimer;
      expect(() => v.parse(finalResearchReportSchema, invalid)).toThrow();
    });
    
    it('should fail on missing required fields', () => {
      const invalid = { ...validReport };
      delete (invalid as any).symbol;
      expect(() => v.parse(finalResearchReportSchema, invalid)).toThrow();
    });
  });

  describe('C. Deterministic Report Assembly', () => {
    it('should deterministically assemble the report without modifying values', () => {
      const report1 = produceFinalReport(mockMarketData, mockIndicators, mockBullish, mockRisk, mockRecommendation, mockThesis);
      const report2 = produceFinalReport(mockMarketData, mockIndicators, mockBullish, mockRisk, mockRecommendation, mockThesis);

      expect(report1).toEqual(report2);
      expect(report1.symbol).toBe('TCS.NS');
      expect(report1.currentPrice).toBe(3500);
      expect(report1.volume).toBe(1200000); // Last entry volume
      expect(report1.recommendation).toBe('BUY');
      expect(report1.confidence).toBe(100);
      expect(report1.disclaimer).toBe('This is only an educational mock analysis and not financial advice.');
    });
  });

  describe('D. Thesis Structuring', () => {
    it('should return a properly structured thesis', () => {
      const thesis = generateInvestmentThesis(mockThesis);
      expect(thesis).toEqual(mockThesis);
    });
  });

  describe('E. Tool Wrappers', () => {
    it('generate_investment_thesis should accept structured inputs', async () => {
      const result = await generateInvestmentThesisTool.run({
        data: {
          symbol: 'TCS.NS',
          thesis: mockThesis as any,
        }
      } as any);
      
      expect(result.output).toBeDefined();
      expect(() => v.parse(investmentThesisSchema, result.output)).not.toThrow();
    });

    it('produce_final_report should assemble report', async () => {
      const result = await produceFinalReportTool.run({
        data: {
          symbol: 'TCS.NS',
          thesis: mockThesis as any,
        }
      } as any);

      expect(result.output).toBeDefined();
      expect(() => v.parse(finalResearchReportSchema, result.output)).not.toThrow();
      expect((result.output as any).recommendation).toBe('WATCHLIST');
      expect((result.output as any).volume).toBe(1200000);
    });
  });
});
