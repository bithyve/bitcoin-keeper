import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import HexagonIcon from 'src/components/HexagonIcon';
import Text from 'src/components/KeeperText';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';
import { hp, wp } from 'src/constants/responsive';
import useBalance from 'src/hooks/useBalance';
import BTC from 'src/assets/images/btc.svg';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { useAppSelector } from 'src/store/hooks';
import { LocalizationContext } from 'src/context/Localization/LocContext';

interface SendingCardProps {
  title?: string;
  titleColor?: string;
  subTitle?: string;
  subTitleColor?: string;
  icon?: React.ReactNode;
  amount?: number;
  amountColor?: string;
  unitColor?: string;
  multiItem?: boolean;
}
const SendingCard: React.FC<SendingCardProps> = ({
  title,
  titleColor,
  subTitle,
  subTitleColor,
  icon,
  amount,
  amountColor,
  unitColor,
  multiItem,
}) => {
  const { colorMode } = useColorMode();
  const HexagonIconColor = ThemedColor({ name: 'HexagonIcon' });
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const isCurrentCurrencyFiat = currentCurrency === CurrencyKind.FIAT;
  const currencyCode = useCurrencyCode();
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation } = translations;

  return (
    <Box>
      <Box style={styles.container}>
        <Box style={styles.iconContainer}>
          <HexagonIcon width={40} height={40} backgroundColor={HexagonIconColor} icon={icon} />
        </Box>
        <Box style={styles.textcontainer}>
          <Text color={titleColor || `${colorMode}.primaryText`} style={styles.title} medium>
            {title}
          </Text>
          <Text color={subTitleColor || `${colorMode}.primaryText`} style={styles.subtitle}>
            {subTitle}
          </Text>
        </Box>
      </Box>
      {amount && multiItem && (
        <Box style={styles.amountData}>
          <Box style={styles.amountContainer} backgroundColor={`${colorMode}.separator`}>
            <Text>{walletTranslation.sendingAmount}</Text>
            <Box style={{ flexDirection: 'row', alignItems: 'center' }}>
              {!getSatUnit() && getCurrencyIcon(BTC, colorMode === 'light' ? 'dark' : 'light')}
              <Text color={amountColor || `${colorMode}.GreyText`}>{` ${getBalance(
                amount
              )} `}</Text>

              <Text color={unitColor || `${colorMode}.GreyText`}>
                {getSatUnit()}
                {isCurrentCurrencyFiat && currencyCode}
              </Text>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SendingCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: 'transparent',
    paddingVertical: hp(5),
    gap: 12,
  },
  textcontainer: {
    flex: 1,
  },
  iconContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 15,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    width: '85%',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(15),
    paddingVertical: hp(10),
    borderRadius: 8,
    marginBottom: hp(2),
    marginTop: hp(8),
    width: wp(250),
  },
  amountData: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
  },
});
