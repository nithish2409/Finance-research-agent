import { defineTool } from '@flue/runtime';
import { investmentThesisSchema } from '../report/schemas';
import { normalizeTicker } from '../utils/ticker-normalization';
import * as v from 'valibot';

export const thesisCache = new Map<string, any>();

export const generateInvestmentThesisTool = defineTool({
  name: 'generate_investment_thesis',
  description: 'Structures and validates the natural-language investment thesis synthesized by the LLM from the deterministic evidence.',
  input: v.object({
    symbol: v.string(),
    thesis: investmentThesisSchema,
  }),
  output: investmentThesisSchema,
  async run({ data }) {
    // The LLM writes the thesis, this tool just validates it matches the required structure
    thesisCache.set(normalizeTicker(data.symbol), data.thesis);
    return { output: data.thesis };
  },
});
