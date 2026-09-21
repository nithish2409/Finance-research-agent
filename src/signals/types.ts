export type SignalType = 'bullish' | 'risk';
export type SignalStrength = 'weak' | 'moderate' | 'strong';

export interface Signal {
  type: SignalType;
  factor: string;
  evidence: string;
  strength: SignalStrength;
}

export interface SignalAnalysisResult {
  symbol: string;
  signals: Signal[];
}
