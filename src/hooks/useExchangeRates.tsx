import { useAppSelector } from 'src/store/hooks';

const useExchangeRates = () => {
  const exchangeRates = useAppSelector((state) => state.network.exchangeRates);
  return exchangeRates.exchangeRates;
};

export default useExchangeRates;
