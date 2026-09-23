export function normalizeTicker(symbol: string): string {
  if (!symbol) return '';

  let normalized = symbol.trim().toUpperCase();
  if (!normalized) return normalized;

  // If the symbol already contains a dot (e.g. .NS, .BO), we assume it's explicitly suffixed.
  if (!normalized.includes('.')) {
    normalized = `${normalized}.NS`;
  }

  return normalized;
}
