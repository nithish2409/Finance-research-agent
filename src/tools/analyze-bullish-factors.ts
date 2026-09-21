import { defineTool } from '@flue/runtime';
import { indicatorResultSchema } from '../indicators/schemas';
import { signalAnalysisResultSchema } from '../signals/schemas';
import { analyzeBullishFactors } from '../signals/engine';
import * as v from 'valibot';

export const analyzeBullishFactorsTool = defineTool({
  name: 'analyze_bullish_factors',
  description: 'Analyzes structured technical indicator results to deterministically identify positive (bullish) evidence and signals.',
  input: v.object({
    indicators: indicatorResultSchema,
  }),
  output: signalAnalysisResultSchema,
  async run({ data }) {
    const result = analyzeBullishFactors(data.indicators as any);
    return { output: result };
  },
});
