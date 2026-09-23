import { describe, it, expect } from 'vitest';
import { normalizeTicker } from '../../utils/ticker-normalization';

describe('normalizeTicker', () => {
  it('should default bare Indian tickers to .NS', () => {
    expect(normalizeTicker('RELIANCE')).toBe('RELIANCE.NS');
    expect(normalizeTicker('TCS')).toBe('TCS.NS');
    expect(normalizeTicker('INFY')).toBe('INFY.NS');
    expect(normalizeTicker('HDFCBANK')).toBe('HDFCBANK.NS');
  });

  it('should trim whitespace', () => {
    expect(normalizeTicker(' RELIANCE ')).toBe('RELIANCE.NS');
    expect(normalizeTicker('\tTCS\n')).toBe('TCS.NS');
  });

  it('should convert to uppercase', () => {
    expect(normalizeTicker('reliance')).toBe('RELIANCE.NS');
    expect(normalizeTicker('Tcs')).toBe('TCS.NS');
  });

  it('should preserve explicit .NS suffix', () => {
    expect(normalizeTicker('RELIANCE.NS')).toBe('RELIANCE.NS');
    expect(normalizeTicker('reliance.ns')).toBe('RELIANCE.NS');
  });

  it('should preserve other explicit suffixes', () => {
    expect(normalizeTicker('TCS.BO')).toBe('TCS.BO');
    expect(normalizeTicker('AAPL.US')).toBe('AAPL.US');
  });

  it('should handle empty or invalid inputs gracefully', () => {
    expect(normalizeTicker('')).toBe('');
    expect(normalizeTicker('   ')).toBe('');
  });
});
