import { defineTool } from '@flue/runtime';
import { indicatorResultSchema } from '../indicators/schemas';
import { signalAnalysisResultSchema } from '../signals/schemas';
import { analyzeRiskFactors } from '../signals/engine';
import * as v from 'valibot';

export const analyzeRiskFactorsTool = defineTool({
  name: 'analyze_risk_factors',
  description: 'Analyzes structured technical indicator results to deterministically identify negative (risk) evidence and signals.',
  input: v.object({
    indicators: indicatorResultSchema,
  }),
  output: signalAnalysisResultSchema,
  async run({ data }) {
    const result = analyzeRiskFactors(data.indicators as any);
    return { output: result };
  },
});
