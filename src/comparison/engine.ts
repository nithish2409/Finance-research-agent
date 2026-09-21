import { StockComparisonSnapshot, ComparisonResult } from './types';

export function generateComparison(
  snapshotA: StockComparisonSnapshot,
  snapshotB: StockComparisonSnapshot
): ComparisonResult {
  let strongerProfile: string | null = null;
  let reasoning = '';

  if (snapshotA.score > snapshotB.score) {
    strongerProfile = snapshotA.symbol;
    reasoning = `${snapshotA.symbol} has a higher recommendation score (${snapshotA.score}) than ${snapshotB.symbol} (${snapshotB.score}).`;
  } else if (snapshotB.score > snapshotA.score) {
    strongerProfile = snapshotB.symbol;
    reasoning = `${snapshotB.symbol} has a higher recommendation score (${snapshotB.score}) than ${snapshotA.symbol} (${snapshotA.score}).`;
  } else {
    // Scores are equal, compare confidence
    if (snapshotA.confidence > snapshotB.confidence) {
      strongerProfile = snapshotA.symbol;
      reasoning = `Both stocks have an equal recommendation score of ${snapshotA.score}. ${snapshotA.symbol} has a higher confidence (${snapshotA.confidence}%) than ${snapshotB.symbol} (${snapshotB.confidence}%).`;
    } else if (snapshotB.confidence > snapshotA.confidence) {
      strongerProfile = snapshotB.symbol;
      reasoning = `Both stocks have an equal recommendation score of ${snapshotB.score}. ${snapshotB.symbol} has a higher confidence (${snapshotB.confidence}%) than ${snapshotA.symbol} (${snapshotA.confidence}%).`;
    } else {
      // Both score and confidence are equal
      strongerProfile = null;
      reasoning = `Both stocks have an equal recommendation score of ${snapshotA.score} and equal confidence of ${snapshotA.confidence}%.`;
    }
  }

  return {
    symbolA: snapshotA.symbol,
    symbolB: snapshotB.symbol,
    stockA: snapshotA,
    stockB: snapshotB,
    strongerProfile,
    reasoning,
  };
}
