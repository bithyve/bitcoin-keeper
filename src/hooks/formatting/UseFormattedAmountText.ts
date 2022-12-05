import { SATOSHIS_IN_BTC } from 'src/common/constants/Bitcoin'
import { UsNumberFormat } from 'src/common/utilities'
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode'
import CurrencyKind from 'src/common/data/enums/CurrencyKind'
import { useAppSelector } from 'src/store/hooks';

export default function useFormattedAmountText(
  balance: number,
): string {
  const { currencyKind } = useAppSelector((state) => state.settings);
  const exchangeRates = useAppSelector((state) => state.sendAndReceive.exchangeRates);
  const fiatCurrencyCode = useCurrencyCode()

  if (currencyKind === CurrencyKind.BITCOIN) {
    return UsNumberFormat(balance)
  } if (
    exchangeRates !== undefined &&
    exchangeRates[fiatCurrencyCode] !== undefined &&
    exchangeRates[fiatCurrencyCode].last !== undefined
  ) {
    return (
      (balance / SATOSHIS_IN_BTC) * exchangeRates[fiatCurrencyCode].last
    ).toFixed(2)
  } 
    return `${balance}`
  
}
