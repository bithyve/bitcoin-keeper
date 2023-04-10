import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import moment from 'moment';

import useBalance from 'src/hooks/useBalance';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { Transaction } from 'src/core/wallets/interfaces';

import IconRecieve from 'src/assets/images/icon_received.svg';
import UnconfirmedIcon from 'src/assets/images/pending.svg';
import IconSent from 'src/assets/images/icon_sent.svg';
import BtcBlack from 'src/assets/images/btc_black.svg';
import Text from 'src/components/KeeperText';

function TransactionElement({
  transaction,
  onPress = () => { },
}: {
  transaction: Transaction;
  onPress?: () => void;
}) {
  const { colorMode } = useColorMode();
  const date = moment(transaction?.date)?.format('DD MMM YY  •  hh:mmA');
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();

  return (
    <TouchableOpacity onPress={onPress}>
      <Box style={styles.container}>
        <Box style={styles.rowCenter}>
          {transaction?.transactionType === 'Received' ? <IconRecieve /> : <IconSent />}
          <Box style={styles.transactionContainer}>
            <Text
              color={`${colorMode}.GreyText`}
              style={styles.transactionIdText}
              numberOfLines={1}
            >
              {transaction?.txid}
            </Text>
            <Text color={`${colorMode}.dateText`} style={styles.transactionDate}>
              {date}
            </Text>
          </Box>
        </Box>
        <Box style={styles.rowCenter}>
          {transaction.confirmations > 0 ? null : (
            <Box style={styles.unconfirmIconWrapper}>
              <UnconfirmedIcon />
            </Box>
          )}
          <Box>{getCurrencyIcon(BtcBlack, 'dark')}</Box>
          <Text style={styles.amountText}>
            {getBalance(transaction?.amount)}
            <Text color={`${colorMode}.dateText`} style={styles.unitText}>
              {getSatUnit()}
            </Text>
          </Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(20),
    paddingVertical: 1,
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
    width: 125,
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
  unconfirmIconWrapper: {
    paddingHorizontal: 5
  }
});
export default TransactionElement;
