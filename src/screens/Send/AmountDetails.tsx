import { Box, Text, useColorMode } from 'native-base';
import useBalance from 'src/hooks/useBalance';
import BTC from 'src/assets/images/btc.svg';
import { StyleSheet } from 'react-native';
import { useAppSelector } from 'src/store/hooks';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';

interface AmountDetailsProps {
  title?: string;
  titleFontSize?: number;
  titleFontWeight?: number | string;
  titleColor?: string;
  amount?: number | string;
  amountFontSize?: number;
  amountFontWeight?: number | string;
  amountColor?: string;
  unitFontSize?: number;
  unitFontWeight?: number | string;
  unitColor?: string;
  customUnit?: string;
}

const AmountDetails: React.FC<AmountDetailsProps> = ({
  title = '',
  titleFontSize = 15,
  titleFontWeight = 'medium',
  titleColor,
  amount,
  amountFontSize = 15,
  amountFontWeight = 'normal',
  amountColor,
  unitFontSize = 11,
  unitFontWeight = 'normal',
  unitColor,
  customUnit = null,
}) => {
  const { getBalance, getCurrencyIcon, getSatUnit } = useBalance();
  const { colorMode } = useColorMode();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const isCurrentCurrencyFiat = currentCurrency === CurrencyKind.FIAT;

  return (
    <Box style={styles.amountDetailsWrapper}>
      <Box style={styles.amtDetailsTitleWrapper}>
        <Text
          color={titleColor || `${colorMode}.primaryText`}
          fontSize={titleFontSize}
          fontWeight={titleFontWeight}
        >
          {title}
        </Text>
      </Box>
      {amount && (
        <Box style={styles.amtTitleWrapper}>
          <Box style={styles.currencyIcon}>
            {!isCurrentCurrencyFiat &&
              getCurrencyIcon(BTC, colorMode === 'light' ? 'dark' : 'light')}
            &nbsp;
            <Text
              color={amountColor || `${colorMode}.secondaryText`}
              fontSize={amountFontSize}
              fontWeight={amountFontWeight}
            >
              {`${getBalance(Number(amount))} `}
            </Text>
            <Text
              color={unitColor || `${colorMode}.secondaryText`}
              fontSize={unitFontSize || 12}
              fontWeight={unitFontWeight}
            >
              {customUnit ?? getSatUnit()}
              {isCurrentCurrencyFiat && currencyCode}
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AmountDetails;

const styles = StyleSheet.create({
  amountDetailsWrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amtDetailsTitleWrapper: {
    justifyContent: 'flex-start',
  },
  amtTitleWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  currencyIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
