import { useContext } from 'react';
import { getCountry } from 'react-native-localize';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useAppSelector } from 'src/store/hooks';

export const useGetInUK = () => {
  const { translations } = useContext(LocalizationContext);
  const { buyBTC: buyBTCText } = translations;
  const { currencyCode } = useAppSelector((state) => state.settings);
  const isUK = currencyCode === 'GBP' || getCountry() === 'UK';

  const sanitizeBuyText = (text) => {
    if (isUK) {
      return text.replace(buyBTCText.buy, buyBTCText.get);
    }
    return text;
  };

  return { sanitizeBuyText };
};
