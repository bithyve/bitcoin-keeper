import React from 'react';
import { Box, useColorMode } from 'native-base';

import { getAmount, getUnit } from 'src/common/constants/Bitcoin';
import { getTransactionPadding, hp, wp } from 'src/common/data/responsiveness/responsive';
import { Transaction } from 'src/core/wallets/interfaces';

import IconRecieve from 'src/assets/images/svgs/icon_received.svg';
import IconSent from 'src/assets/images/svgs/icon_sent.svg';
import BtcBlack from 'src/assets/images/svgs/btc_black.svg';
import IconArrowGrey from 'src/assets/images/svgs/icon_arrow_grey.svg';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';

function TransactionElement({
  transaction,
  onPress = () => {},
}: {
  transaction: Transaction;
  onPress?: () => void;
}) {
  const { colorMode } = useColorMode();
  const date = new Date(transaction?.date).toLocaleString(undefined, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity onPress={onPress}>
      <Box style={styles.container}>
        <Box style={styles.rowCenter}>
          {transaction.transactionType === 'Received' ? <IconRecieve /> : <IconSent />}
          <Box style={styles.transactionContainer}>
            <Text
              color={`${colorMode}.GreyText`}
              style={styles.transactionIdText}
              numberOfLines={1}
            >
              {transaction?.txid}
            </Text>
            <Text color={`${colorMode}.dateText`} style={styles.transactionDate}>
              {new Date(date).toUTCString()}
            </Text>
          </Box>
        </Box>
        <Box style={styles.rowCenter}>
          <Box>
            <BtcBlack />
          </Box>
          <Text style={styles.amountText}>
            {getAmount(transaction.amount)}
            <Text color={`${colorMode}.dateText`} style={styles.unitText}>
              {getUnit()}
            </Text>
          </Text>
          <Box>
            <IconArrowGrey />
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: getTransactionPadding(),
    borderRadius: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(25),
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionContainer: {
    flexDirection: 'column',
    marginLeft: 1.5,
  },
  transactionIdText: {
    fontSize: 13,
    letterSpacing: 0.6,
    width: wp(125),
    marginHorizontal: 3,
  },
  transactionDate: {
    marginHorizontal: 4,
    fontSize: 11,
    fontWeight: '200',
    letterSpacing: 0.5,
    opacity: 0.82,
  },
  amountText: {
    fontSize: 19,
    letterSpacing: 0.95,
    marginHorizontal: 3,
    marginRight: 3,
  },
  unitText: {
    letterSpacing: 0.6,
    fontSize: hp(12),
  },
});
export default TransactionElement;
