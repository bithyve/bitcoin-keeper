import React, { useContext } from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import BTC from 'src/assets/images/btc.svg';
import ThreeDotsGrey from 'src/assets/images/three-dots-grey.svg';
import ThreeDotsWhite from 'src/assets/images/three-dots-white.svg';

import Text from 'src/components/KeeperText';

const TransactionPriorityDetails = ({
  transactionPriority,
  txFeeInfo,
  getBalance,
  getCurrencyIcon,
  getSatUnit,
  isAutoTransfer,
  sendMaxFee,
  sendMaxFeeEstimatedBlocks,
}) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
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
        <Box style={styles.dots}>{isDarkMode ? <ThreeDotsWhite /> : <ThreeDotsGrey />}</Box>
      </Box>

      <Box style={styles.priorityWrapper}>
        <Box style={styles.mainContainer}>
          <Box style={styles.leftContainer}>
            <Text style={styles.transLabelText} color={`${colorMode}.textGreenGrey`}>
              {capitalizeFirstLetter(transactionPriority)}
            </Text>
          </Box>
          <Box style={styles.rightContainer}>
            <Text style={styles.transLabelText} color={`${colorMode}.textGreenGrey`}>
              ≈
            </Text>
            <Text style={styles.transLabelText} color={`${colorMode}.textGreenGrey`}>
              {(isAutoTransfer
                ? sendMaxFeeEstimatedBlocks
                : txFeeInfo[transactionPriority?.toLowerCase()]
                    ?.estimatedBlocksBeforeConfirmation) * 10}
              min
            </Text>
          </Box>
        </Box>
        <Box style={styles.mainContainer}>
          <Box style={styles.leftContainer}>
            <Text style={styles.transLabelText} color={`${colorMode}.textGreenGrey`}>
              {walletTransactions.fees}
            </Text>
          </Box>
          <Box style={styles.rightContainer}>
            <Box style={styles.transSatsFeeWrapper}>
              {getCurrencyIcon(BTC, 'dark')}
              &nbsp;
              <Text color={`${colorMode}.textGreenGrey`} style={styles.transSatsFeeText}>
                {isAutoTransfer
                  ? sendMaxFee
                  : `${getBalance(txFeeInfo[transactionPriority?.toLowerCase()]?.amount)} `}
              </Text>
              {!isAutoTransfer && (
                <Text color={`${colorMode}.textGreenGrey`} style={styles.satsText}>
                  {getSatUnit()}
                </Text>
              )}
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
    fontSize: 16,
  },
  transLabelText: {
    fontSize: 14,
  },
  transSatsFeeText: {
    fontSize: 15,
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
