import React, { useContext } from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import BTC from 'src/assets/images/btc.svg';
import ThreeDotsGrey from 'src/assets/images/three-dots-grey.svg';
import ThreeDotsWhite from 'src/assets/images/three-dots-white.svg';

import Text from 'src/components/KeeperText';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import { useAppSelector } from 'src/store/hooks';
import { hp } from 'src/constants/responsive';

const TransactionPriorityDetails = ({
  transactionPriority,
  txFeeInfo,
  getBalance,
  getCurrencyIcon,
  getSatUnit,
  estimationSign,
  disabled = false,
}) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const isCurrentCurrencyFiat = currentCurrency === CurrencyKind.FIAT;
  const currencyCode = useCurrencyCode();
  const { wallet: walletTransactions } = translations;
  const isDarkMode = colorMode === 'dark';

  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  return (
    <Box>
      <Box>
        <Text style={styles.transTitleText} medium color={`${colorMode}.primaryText`}>
          {walletTransactions.transactionPriority}
        </Text>
        {!disabled && (
          <Box style={styles.dots}>{isDarkMode ? <ThreeDotsWhite /> : <ThreeDotsGrey />}</Box>
        )}
      </Box>

      <Box style={styles.priorityWrapper}>
        <Box style={styles.mainContainer}>
          <Box style={styles.leftContainer}>
            <Text style={styles.transLabelText} color={`${colorMode}.GreyText`}>
              {capitalizeFirstLetter(transactionPriority)}
            </Text>
          </Box>
          <Box style={styles.rightContainer}>
            <Text style={styles.transLabelText} color={`${colorMode}.GreyText`}>
              {estimationSign}
              &nbsp;
              {txFeeInfo[transactionPriority?.toLowerCase()]?.estimatedBlocksBeforeConfirmation *
                10}
              &nbsp;minutes
            </Text>
          </Box>
        </Box>
        <Box style={styles.mainContainer}>
          <Box style={styles.leftContainer}>
            <Text style={styles.transLabelText} color={`${colorMode}.GreyText`}>
              {walletTransactions.fees}
            </Text>
          </Box>
          <Box style={styles.rightContainer}>
            <Box style={styles.transSatsFeeWrapper}>
              {!getSatUnit() && getCurrencyIcon(BTC, colorMode === 'light' ? 'dark' : 'light')}
              &nbsp;
              <Text color={`${colorMode}.GreyText`} style={styles.transSatsFeeText}>
                {`${getBalance(txFeeInfo[transactionPriority?.toLowerCase()]?.amount)} `}
              </Text>
              {
                <Text color={`${colorMode}.GreyText`} style={styles.satsText}>
                  {getSatUnit()}
                  {isCurrentCurrencyFiat && currencyCode}
                </Text>
              }
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  priorityWrapper: {
    gap: 5,
  },
  mainContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  leftContainer: {
    width: '23%',
  },
  rightContainer: {
    width: '77%',
  },
  transTitleText: {
    fontSize: 13,
    marginBottom: hp(5),
  },
  transLabelText: {
    fontSize: 12,
  },
  transSatsFeeText: {
    fontSize: 12,
  },
  satsText: {
    fontSize: 12,
  },
  transSatsFeeWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  dots: {
    position: 'absolute',
    bottom: '80%',
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TransactionPriorityDetails;
