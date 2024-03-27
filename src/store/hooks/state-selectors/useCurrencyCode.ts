import { CurrencyCodes } from 'src/services/wallets/interfaces';
import { useAppSelector } from '..';

export default function useCurrencyCode(defaultCode = CurrencyCodes.USD): string {
  return useAppSelector((state) => state.settings.currencyCode || defaultCode);
}
