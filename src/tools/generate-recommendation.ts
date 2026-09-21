import { defineTool } from '@flue/runtime';
import { indicatorResultSchema } from '../indicators/schemas';
import { signalAnalysisResultSchema } from '../signals/schemas';
import { recommendationResultSchema } from '../recommendation/schemas';
import { generateRecommendation } from '../recommendation/engine';
import * as v from 'valibot';

export const generateRecommendationTool = defineTool({
  name: 'generate_recommendation',
  description: 'Generates a deterministic financial recommendation (BUY/HOLD/WATCHLIST/AVOID) and confidence score based on indicators and signal analysis.',
  input: v.object({
    indicators: indicatorResultSchema,
    bullishFactors: signalAnalysisResultSchema,
    riskFactors: signalAnalysisResultSchema,
  }),
  output: recommendationResultSchema,
  async run({ data }) {
    const result = generateRecommendation(
      data.indicators as any,
      data.bullishFactors as any,
      data.riskFactors as any
    );
    return { output: result };
  },
});
