import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import moment from 'moment';

import useBalance from 'src/hooks/useBalance';
import { hp, wp } from 'src/constants/responsive';
import { Transaction } from 'src/core/wallets/interfaces';

import IconRecieve from 'src/assets/images/icon_received.svg';
import UnconfirmedIcon from 'src/assets/images/pending.svg';
import IconSent from 'src/assets/images/icon_sent.svg';
import IconArrow from 'src/assets/images/icon_arrow_grey.svg';
import Text from 'src/components/KeeperText';
import CurrencyInfo from 'src/screens/HomeScreen/components/CurrencyInfo';

function TransactionElement({
  transaction,
  onPress = () => {},
  index,
}: {
  transaction: Transaction;
  onPress?: () => void;
  index?: number;
}) {
  const { colorMode } = useColorMode();
  const date = moment(transaction?.date)?.format('DD MMM YY  •  HH:mm A');
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();

  return (
    <TouchableOpacity onPress={onPress} testID={`btn_transaction_${index}`}>
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
            <Box testID={`icon_unconfirmed_${index}`} style={styles.unconfirmIconWrapper}>
              <UnconfirmedIcon />
            </Box>
          )}
          {/* <Box>{getCurrencyIcon(BtcBlack, 'dark')}</Box>
          <Text style={styles.amountText}>
            {getBalance(transaction?.amount)}
            <Text color={`${colorMode}.dateText`} style={styles.unitText}>
              {getSatUnit()}
            </Text>
          </Text> */}
          <CurrencyInfo
            hideAmounts={false}
            amount={transaction?.amount}
            fontSize={17}
            color={`${colorMode}.dateText`}
            variation={colorMode === 'light' ? 'dark' : 'light'}
          />
          <Box style={styles.unconfirmIconWrapper}>
            <IconArrow />
          </Box>
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
    paddingHorizontal: 5,
  },
});
export default TransactionElement;
