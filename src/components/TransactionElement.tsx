import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import moment from 'moment';

import { hp, wp } from 'src/constants/responsive';
import { Transaction } from 'src/core/wallets/interfaces';

import IconSent from 'src/assets/images/icon_sent_red.svg';
import IconRecieve from 'src/assets/images/icon_recieved_red.svg';
import TransactionPendingIcon from 'src/assets/images/transaction_pending.svg';

import IconArrow from 'src/assets/images/icon_arrow_grey.svg';
import Text from 'src/components/KeeperText';
import CurrencyInfo from 'src/screens/Home/components/CurrencyInfo';

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

  return (
    <TouchableOpacity onPress={onPress} testID={`btn_transaction_${index}`}>
      <Box style={styles.container}>
        <Box style={styles.rowCenter}>
          <Box backgroundColor={`${colorMode}.Eggshell`} style={styles.circle}>
            {transaction.confirmations === 0 && (
              <Box style={styles.transaction}>
                <TransactionPendingIcon />
              </Box>
            )}
            {transaction?.transactionType === 'Received' ? <IconRecieve /> : <IconSent />}
          </Box>
          <Box style={styles.transactionContainer}>
            <Text color={`${colorMode}.GreenishGrey`} style={styles.transactionIdText}>
              {date}
            </Text>
            <Text
              color={`${colorMode}.GreenishGrey`}
              numberOfLines={1}
              style={styles.transactionDate}
            >
              {transaction?.txid}
            </Text>
          </Box>
        </Box>
        <Box style={styles.rowCenter}>
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
    marginLeft: 5,
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
    fontSize: 12,
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
  unconfirmIconWrapper: {
    paddingHorizontal: 5,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transaction: {
    position: 'absolute',
    top: -7,
    left: -4,
  },
});
export default TransactionElement;
