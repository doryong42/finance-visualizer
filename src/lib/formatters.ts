export function parseAmount(amountStr: string): number {
  if (!amountStr || amountStr === '-') return 0;
  return parseInt(amountStr.replace(/,/g, ''), 10) || 0;
}

export function formatKoreanAmount(amount: number): string {
  if (amount === 0) return '0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1_000_000_000_000) {
    const jo = abs / 1_000_000_000_000;
    return `${sign}${jo.toFixed(1)}조원`;
  }
  if (abs >= 100_000_000) {
    const eok = abs / 100_000_000;
    return `${sign}${Math.round(eok).toLocaleString('ko-KR')}억원`;
  }
  return `${sign}${Math.round(abs / 10_000).toLocaleString('ko-KR')}만원`;
}

export function formatChartAmount(amount: number): number {
  return Math.round(amount / 100_000_000_000) / 10;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function calcGrowthRate(current: number, prev: number): number | null {
  if (prev === 0) return null;
  return ((current - prev) / Math.abs(prev)) * 100;
}
