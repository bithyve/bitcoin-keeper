import React from 'react';
import { Box, Text } from 'native-base';
import { StyleSheet } from 'react-native';
import { useColorMode } from 'native-base';
import useBalance from 'src/hooks/useBalance';
import BTC from 'src/assets/images/btc.svg';
import { useAppSelector } from 'src/store/hooks';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';

interface TransferCardProps {
  title: string;
  subTitle?: string;
  amount?: number;
  titleFontSize?: number;
  titleFontWeight?: number | string;
  titleColor?: string;
  subTitleFontSize?: number;
  subTitleFontWeight?: number | string;
  subTitleColor?: string;
  amountFontSize?: number;
  amountFontWeight?: number | string;
  amountColor?: string;
  unitFontSize?: number;
  unitColor?: string;
  unitFontWeight?: number | string;
}

const TransferCard: React.FC<TransferCardProps> = ({
  title,
  subTitle = '',
  amount,
  titleFontSize,
  titleFontWeight,
  titleColor,
  subTitleFontSize,
  subTitleFontWeight,
  subTitleColor,
  amountFontSize,
  amountFontWeight,
  amountColor,
  unitFontSize,
  unitFontWeight,
  unitColor,
}) => {
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();
  const { colorMode } = useColorMode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const isCurrentCurrencyFiat = currentCurrency === CurrencyKind.FIAT;
  const currencyCode = useCurrencyCode();

  return (
    <Box style={styles.container}>
      <Text
        color={titleColor || `${colorMode}.primaryText`}
        fontSize={titleFontSize || 15}
        fontWeight={titleFontWeight}
      >
        {title}
      </Text>
      <Box style={styles.subtitleContainer}>
        <Text
          color={subTitleColor || `${colorMode}.textGreenGrey`}
          fontSize={subTitleFontSize || 14}
          fontWeight={subTitleFontWeight}
        >
          {subTitle}
        </Text>
        {amount && (
          <Box style={styles.amountContainer}>
            {!isCurrentCurrencyFiat &&
              getCurrencyIcon(BTC, colorMode === 'light' ? 'dark' : 'light')}
            <Text
              color={amountColor || `${colorMode}.textGreenGrey`}
              fontSize={amountFontSize || 15}
              fontWeight={amountFontWeight}
            >
              {` ${getBalance(amount)} `}
            </Text>

            <Text
              color={unitColor || `${colorMode}.textGreenGrey`}
              fontSize={unitFontSize || 12}
              fontWeight={unitFontWeight}
            >
              {getSatUnit()}
              {isCurrentCurrencyFiat && currencyCode}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    gap: 2.5,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default TransferCard;
