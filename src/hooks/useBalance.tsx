import {
  getAmt,
  getConvertedAmt,
  getCurrencyImageByRegion,
  getFiatIcon,
  getUnit,
} from 'src/constants/Bitcoin';
import { useAppSelector } from 'src/store/hooks';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import useExchangeRates from './useExchangeRates';

const useBalance = () => {
  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const { satsEnabled } = useAppSelector((state) => state.settings);

  const getBalance = (balance: number) =>
    getAmt(balance, exchangeRates, currencyCode, currentCurrency, satsEnabled);

  const getConvertedBalance = (balance: number) =>
    getConvertedAmt(balance, exchangeRates, currencyCode, currentCurrency, satsEnabled);

  const getSatUnit = () => getUnit(currentCurrency, satsEnabled);

  const getCurrencyIcon = (
    Icon: any,
    variation: 'light' | 'green' | 'dark' | 'grey' | 'slateGreen'
  ) => getCurrencyImageByRegion(currencyCode, variation, currentCurrency, Icon);

  const getFiatCurrencyIcon = (variation: 'light' | 'green' | 'dark' | 'grey') =>
    getFiatIcon(currencyCode, variation);

  return { getBalance, getSatUnit, getCurrencyIcon, getFiatCurrencyIcon, getConvertedBalance };
};

export default useBalance;
