import { describe, it, expect } from 'vitest';
import { validateSingleInput, validateComparisonInput, extractStructuredData } from '../../ui/logic';
import { FinalResearchReport } from '../../report/types';
import { ComparisonResult } from '../../comparison/types';

describe('UI Logic and State Validation', () => {
  it('validates single stock input correctly', () => {
    expect(validateSingleInput(' ')).toBe('Stock symbol must not be empty.');
    expect(validateSingleInput('')).toBe('Stock symbol must not be empty.');
    expect(validateSingleInput('RELIANCE.NS')).toBeNull();
  });

  it('validates comparison input correctly', () => {
    expect(validateComparisonInput('', 'TCS.NS')).toBe('Symbol A must not be empty.');
    expect(validateComparisonInput('RELIANCE.NS', '  ')).toBe('Symbol B must not be empty.');
    expect(validateComparisonInput('RELIANCE.NS', 'RELIANCE.NS')).toBe('Comparison symbols must be different.');
    expect(validateComparisonInput('RELIANCE.NS', 'reliance.ns')).toBe('Comparison symbols must be different.');
    expect(validateComparisonInput('RELIANCE.NS', 'TCS.NS')).toBeNull();
  });

  it('extracts FinalResearchReport from agent messages', () => {
    const mockReport: FinalResearchReport = {
      symbol: 'AAPL',
      currentPrice: 150,
      dailyChange: 2.5,
      week52High: 180,
      week52Low: 120,
      volume: 1000000,
      bullishFactors: ['Good earnings'],
      riskFactors: [],
      technicalView: 'Bullish trend',
      recommendation: 'BUY',
      confidence: 90,
      thesisSummary: 'Solid company',
      volatility: 0.22,
      disclaimer: 'This is only an educational mock analysis and not financial advice.'
    };

    const messages = [
      {
        parts: [
          { type: 'text', text: 'Some text' }
        ]
      },
      {
        parts: [
          {
            type: 'tool-result',
            name: 'produce_final_report',
            result: { output: mockReport }
          }
        ]
      }
    ];

    const { finalReport, comparisonResult } = extractStructuredData(messages);
    expect(finalReport).toEqual(mockReport);
    expect(comparisonResult).toBeNull();
  });

  it('extracts FinalResearchReport from stringified JSON agent messages', () => {
    const mockReport: FinalResearchReport = {
      symbol: 'AAPL',
      currentPrice: 150,
      dailyChange: 2.5,
      week52High: 180,
      week52Low: 120,
      volume: 1000000,
      bullishFactors: ['Good earnings'],
      riskFactors: [],
      technicalView: 'Bullish trend',
      recommendation: 'BUY',
      confidence: 90,
      thesisSummary: 'Solid company',
      volatility: 0.22,
      disclaimer: 'This is only an educational mock analysis and not financial advice.'
    };

    const messages = [
      {
        parts: [
          { type: 'text', text: 'Some text' }
        ]
      },
      {
        parts: [
          {
            type: 'tool-result',
            name: 'produce_final_report',
            result: JSON.stringify({ output: mockReport })
          }
        ]
      }
    ];

    const { finalReport, comparisonResult } = extractStructuredData(messages);
    expect(finalReport).toEqual(mockReport);
    expect(comparisonResult).toBeNull();
  });


  it('extracts ComparisonResult from agent messages', () => {
    const mockComparison: ComparisonResult = {
      symbolA: 'AAPL',
      symbolB: 'MSFT',
      stockA: {
        symbol: 'AAPL',
        currentPrice: 150,
        sma20: 145,
        sma50: 140,
        priceVsSma20: 5,
        priceVsSma50: 10,
        bullishSignalCount: 3,
        riskSignalCount: 1,
        recommendation: 'BUY',
        score: 70,
        confidence: 80
      },
      stockB: {
        symbol: 'MSFT',
        currentPrice: 300,
        sma20: 290,
        sma50: 280,
        priceVsSma20: 10,
        priceVsSma50: 20,
        bullishSignalCount: 4,
        riskSignalCount: 0,
        recommendation: 'BUY',
        score: 90,
        confidence: 85
      },
      strongerProfile: 'MSFT',
      reasoning: 'MSFT has a higher score.'
    };

    const messages = [
      {
        parts: [
          {
            type: 'tool_result', // Testing alternate type format
            toolName: 'compare_stocks', // Testing alternate name format
            output: mockComparison
          }
        ]
      }
    ];

    const { finalReport, comparisonResult } = extractStructuredData(messages);
    expect(finalReport).toBeNull();
    expect(comparisonResult).toEqual(mockComparison);
  });

  it('handles empty or malformed messages gracefully', () => {
    expect(extractStructuredData([])).toEqual({ finalReport: null, comparisonResult: null });
    expect(extractStructuredData([{}])).toEqual({ finalReport: null, comparisonResult: null });
    expect(extractStructuredData([{ parts: [{ type: 'text', text: 'Hello' }] }])).toEqual({ finalReport: null, comparisonResult: null });
  });
});
