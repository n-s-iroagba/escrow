import { Currency } from './constants';

export const isCryptoCurrency = (currency: string): boolean => {
  const cryptoCurrencies = [
    Currency.BTC,
    Currency.ETH,
    Currency.USDT,
    Currency.USDC,
    Currency.LTC,
    Currency.XRP,
  ];
  return cryptoCurrencies.includes(currency as any);
};

export const isFiatCurrency = (currency: string): boolean => {
  const fiatCurrencies = [
    Currency.USD,
    Currency.EUR,
    Currency.GBP,
  ];
  return fiatCurrencies.includes(currency as any);
};

export const getCurrencyDecimals = (currency: string): number => {
  const decimalMap: Record<string, number> = {
    [Currency.BTC]: 8,
    [Currency.ETH]: 18,
    [Currency.USDT]: 6,
    [Currency.USDC]: 6,
    [Currency.LTC]: 8,
    [Currency.XRP]: 6,
    [Currency.USD]: 2,
    [Currency.EUR]: 2,
    [Currency.GBP]: 2,
  };

  return decimalMap[currency] || 2;
};

export const formatCurrency = (amount: number, currency: string): string => {
  const decimals = getCurrencyDecimals(currency);
  const formatted = amount.toFixed(decimals);

  // Add currency symbol
  const symbolMap: Record<string, string> = {
    [Currency.USD]: '$',
    [Currency.EUR]: '€',
    [Currency.GBP]: '£',
    [Currency.BTC]: '₿',
    [Currency.ETH]: 'Ξ',
  };

  const symbol = symbolMap[currency] || currency;
  return `${symbol} ${formatted}`;
};

export const validateCurrencyPair = (
  buyCurrency: string,
  sellCurrency: string,
  tradeType: string
): boolean => {
  if (tradeType === 'CRYPTO_TO_CRYPTO') {
    return isCryptoCurrency(buyCurrency) && isCryptoCurrency(sellCurrency);
  } else if (tradeType === 'CRYPTO_TO_FIAT') {
    return isCryptoCurrency(buyCurrency) && isFiatCurrency(sellCurrency);
  }
  return false;
};