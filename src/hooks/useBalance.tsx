import {
  getAmt,
  getCurrencyImageByRegion,
  getFiatIcon,
  getUnit,
} from 'src/common/constants/Bitcoin';
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

  const getSatUnit = () => getUnit(currentCurrency, satsEnabled);

  const getCurrencyIcon = (Icon: any, variation: 'light' | 'green' | 'dark' | 'grey') =>
    getCurrencyImageByRegion(currencyCode, variation, currentCurrency, Icon);

  const getFiatCurrencyIcon = (variation: 'light' | 'green' | 'dark' | 'grey') =>
    getFiatIcon(currencyCode, variation);

  return { getBalance, getSatUnit, getCurrencyIcon, getFiatCurrencyIcon };
};

export default useBalance;
