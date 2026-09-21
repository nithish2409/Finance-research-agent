import { defineTool } from '@flue/runtime';
import { finalResearchReportSchema, investmentThesisSchema } from '../report/schemas';
import { produceFinalReport } from '../report/report';
import { indicatorResultSchema } from '../indicators/schemas';
import { signalAnalysisResultSchema } from '../signals/schemas';
import { recommendationResultSchema } from '../recommendation/schemas';
import { marketDataResponseSchema } from '../market-data/schemas';
import * as v from 'valibot';

export const produceFinalReportTool = defineTool({
  name: 'produce_final_report',
  description: 'Deterministically assembles the Final Research Report from all structured components. Must be called last.',
  input: v.object({
    marketData: marketDataResponseSchema,
    indicators: indicatorResultSchema,
    bullishFactors: signalAnalysisResultSchema,
    riskFactors: signalAnalysisResultSchema,
    recommendation: recommendationResultSchema,
    thesis: investmentThesisSchema,
  }),
  output: finalResearchReportSchema,
  async run({ data }) {
    const result = produceFinalReport(
      data.marketData as any,
      data.indicators as any,
      data.bullishFactors as any,
      data.riskFactors as any,
      data.recommendation as any,
      data.thesis as any
    );
    return { output: result };
  },
});
