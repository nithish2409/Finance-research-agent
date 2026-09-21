import { defineTool } from '@flue/runtime';
import { investmentThesisSchema } from '../report/schemas';
import { generateInvestmentThesis } from '../report/thesis';
import { indicatorResultSchema } from '../indicators/schemas';
import { signalAnalysisResultSchema } from '../signals/schemas';
import { recommendationResultSchema } from '../recommendation/schemas';
import * as v from 'valibot';

export const generateInvestmentThesisTool = defineTool({
  name: 'generate_investment_thesis',
  description: 'Structures and validates the natural-language investment thesis synthesized by the LLM from the deterministic evidence.',
  input: v.object({
    indicators: indicatorResultSchema,
    bullishFactors: signalAnalysisResultSchema,
    riskFactors: signalAnalysisResultSchema,
    recommendation: recommendationResultSchema,
    thesis: investmentThesisSchema,
  }),
  output: investmentThesisSchema,
  async run({ data }) {
    const result = generateInvestmentThesis(data.thesis as any);
    return { output: result };
  },
});
