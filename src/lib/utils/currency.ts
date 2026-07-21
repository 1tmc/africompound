// src/lib/utils/currency.ts
export type CurrencyCode = 'GHS' | 'USD' | 'EUR' | 'GBP';

export const CURRENCY_CONFIGS: Record<CurrencyCode, { symbol: string; label: string; rateToGHS: number }> = {
  GHS: { symbol: '₵', label: 'Ghanaian Cedi', rateToGHS: 1 },
  USD: { symbol: '$', label: 'US Dollar', rateToGHS: 0.068 }, // Sample 2026 rates
  EUR: { symbol: '€', label: 'Euro', rateToGHS: 0.063 },
  GBP: { symbol: '£', label: 'British Pound', rateToGHS: 0.054 },
};

export function formatPrice(amountInGHS: number, targetCurrency: CurrencyCode): string {
  const config = CURRENCY_CONFIGS[targetCurrency];
  const converted = amountInGHS * config.rateToGHS;
  return `${config.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}