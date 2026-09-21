import { FinalResearchReport } from '../report/types';
import { ComparisonResult } from '../comparison/types';

export function extractStructuredData(messages: any[]): {
  finalReport: FinalResearchReport | null,
  comparisonResult: ComparisonResult | null
} {
  let finalReport: FinalResearchReport | null = null;
  let comparisonResult: ComparisonResult | null = null;

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.parts && Array.isArray(msg.parts)) {
      for (const part of msg.parts) {
        // Look for tool calls or tool results that contain our output.
        // The exact field name depends on Flue internals (toolName, name, tool_name, etc).
        // It might also be nested under result.output.

        const isToolCallOrResult = part.type === 'tool-result' || part.type === 'tool_result' || part.type === 'tool-call' || part.type === 'tool_call';
        const name = part.name || part.toolName || (part.toolCall && part.toolCall.name) || (part.call && part.call.name);

        if (isToolCallOrResult) {
          const payload = part.result || part.output || part.args || (part.toolCall && part.toolCall.args) || (part.call && part.call.args);
          const actualOutput = payload?.output || payload; // If the tool returned { output: ... }, it might be nested

          if (name === 'produce_final_report' && actualOutput && actualOutput.symbol) {
            if (!finalReport) finalReport = actualOutput as FinalResearchReport;
          }
          if (name === 'compare_stocks' && actualOutput && actualOutput.stockA) {
            if (!comparisonResult) comparisonResult = actualOutput as ComparisonResult;
          }
        }
      }
    }
  }

  return { finalReport, comparisonResult };
}

export function validateSingleInput(symbol: string): string | null {
  if (!symbol.trim()) return 'Stock symbol must not be empty.';
  return null;
}

export function validateComparisonInput(symbolA: string, symbolB: string): string | null {
  if (!symbolA.trim()) return 'Symbol A must not be empty.';
  if (!symbolB.trim()) return 'Symbol B must not be empty.';
  if (symbolA.trim().toUpperCase() === symbolB.trim().toUpperCase()) return 'Comparison symbols must be different.';
  return null;
}
