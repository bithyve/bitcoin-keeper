import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import moment from 'moment';

import { hp, wp } from 'src/constants/responsive';
import { Transaction } from 'src/services/wallets/interfaces';

import IconSent from 'src/assets/images/icon_sent_red.svg';
import IconRecieve from 'src/assets/images/icon_recieved_red.svg';
import TransactionPendingIcon from 'src/assets/images/transaction_pending.svg';
import IconCache from 'src/assets/images/cache_icon.svg';

import IconArrow from 'src/assets/images/icon_arrow_grey.svg';
import Text from 'src/components/KeeperText';
import CurrencyInfo from 'src/screens/Home/components/CurrencyInfo';
import Colors from 'src/theme/Colors';

function TransactionElement({
  transaction,
  onPress = () => {},
  index,
  isCached,
}: {
  transaction: Transaction;
  onPress?: () => void;
  index?: number;
  isCached: boolean;
}) {
  const { colorMode } = useColorMode();
  const date = moment(transaction?.date)?.format('DD MMM YY  •  HH:mm A');

  return (
    <TouchableOpacity onPress={onPress} testID={`btn_transaction_${transaction?.txid}`}>
      <Box
        style={[
          styles.container,
          isCached && [
            styles.cachedContainer,
            { backgroundColor: colorMode === 'light' ? Colors.Seashell : Colors.SeashellDark },
          ],
        ]}
      >
        <Box style={styles.rowCenter}>
          <Box
            backgroundColor={!isCached ? `${colorMode}.TransactionIconBackColor` : null}
            style={styles.circle}
          >
            {transaction.confirmations === 0 && !isCached && (
              <Box style={styles.transaction}>
                <TransactionPendingIcon />
              </Box>
            )}
            {isCached ? (
              <IconCache />
            ) : transaction?.transactionType === 'Received' ? (
              <IconRecieve />
            ) : (
              <IconSent />
            )}
          </Box>
          <Box style={styles.transactionContainer}>
            <Text color={`${colorMode}.secondaryText`} medium style={styles.transactionIdText}>
              {date}
            </Text>
            <Text
              color={`${colorMode}.secondaryText`}
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
            fontSize={18}
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
    marginHorizontal: wp(10),
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
    letterSpacing: 0.12,
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
  cachedContainer: {
    marginBottom: -5,
    paddingVertical: 12,
  },
});
export default TransactionElement;
