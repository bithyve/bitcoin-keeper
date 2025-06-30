import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import moment from 'moment';

import { hp, wp } from 'src/constants/responsive';
import { Transaction } from 'src/services/wallets/interfaces';

import IconSent from 'src/assets/images/icon_sent_red.svg';
import IconRecieve from 'src/assets/images/icon_recieved_red.svg';
import IconSentDark from 'src/assets/images/icon_sent_red.svg';
import IconRecieveDark from 'src/assets/images/icon_recieved_dark.svg';
import TransactionPendingIcon from 'src/assets/images/transaction_pending.svg';
import IconCache from 'src/assets/images/cache_icon.svg';

import IconArrow from 'src/assets/images/icon_arrow_grey.svg';
import IconArrowWhite from 'src/assets/images/icon_arrow_white.svg';
import Text from 'src/components/KeeperText';
import CurrencyInfo from 'src/screens/Home/components/CurrencyInfo';
import Colors from 'src/theme/Colors';
import useLabelsNew from 'src/hooks/useLabelsNew';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { Vault } from 'src/services/wallets/interfaces/vault';

function TransactionElement({
  transaction,
  wallet,
  onPress = () => {},
  index,
  isCached,
}: {
  transaction: Transaction;
  wallet: Wallet | Vault;
  onPress?: () => void;
  index?: number;
  isCached: boolean;
}) {
  const { labels } = useLabelsNew({ txid: transaction.txid });
  const { colorMode } = useColorMode();
  const date = moment(transaction?.date)?.format('DD MMM YY  .  HH:mm A');

  return (
    <TouchableOpacity onPress={onPress} testID={`btn_transaction_${transaction?.txid}`}>
      <Box
        style={[
          styles.container,
          isCached && [
            styles.cachedContainer,
            { backgroundColor: colorMode === 'light' ? Colors.brightCream : Colors.TertiaryBlack },
          ],
        ]}
        borderBottomColor={`${colorMode}.border`}
      >
        <Box style={styles.rowCenter}>
          <Box style={styles.circle}>
            {transaction.confirmations === 0 && !isCached && (
              <Box style={styles.transaction}>
                <TransactionPendingIcon />
              </Box>
            )}
            {isCached ? (
              <IconCache />
            ) : transaction?.transactionType === 'Received' ? (
              colorMode === 'light' ? (
                <IconRecieve />
              ) : (
                <IconRecieveDark />
              )
            ) : colorMode === 'light' ? (
              <IconSent />
            ) : (
              <IconSentDark />
            )}
          </Box>
          <Box style={styles.transactionContainer}>
            <Text
              color={`${colorMode}.primaryText`}
              numberOfLines={1}
              style={styles.transactionIdText}
              medium
            >
              {labels[transaction.txid]?.[0]?.name || transaction?.txid}
            </Text>
            <Text
              color={`${colorMode}.secondaryText`}
              style={styles.transactionDate}
              numberOfLines={1}
            >
              {date}
            </Text>
          </Box>
        </Box>
        <Box style={styles.rowCenter}>
          <CurrencyInfo
            hideAmounts={false}
            amount={transaction?.amount}
            fontSize={15}
            color={`${colorMode}.primaryText`}
            balanceMaxWidth={wp(90)}
            variation={colorMode === 'light' ? 'richBlack' : 'light'}
          />
          <Box style={[styles.arrowIconWrapper]}>
            {colorMode === 'dark' ? <IconArrowWhite /> : <IconArrow />}
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
    height: hp(76),
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  rowCenter: {
    marginHorizontal: wp(10),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionContainer: {
    flexDirection: 'column',
    marginLeft: 5,
    gap: 2.5,
  },
  transactionDate: {
    fontSize: 11,
    width: wp(125),
    marginHorizontal: 3,
    lineHeight: 17,
  },
  transactionIdText: {
    marginHorizontal: 4,
    fontSize: 14,
    lineHeight: 20,
    width: wp(125),
  },
  arrowIconWrapper: {
    paddingRight: wp(5),
    paddingLeft: wp(10),
    paddingTop: hp(2),
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(10),
  },
  transaction: {
    position: 'absolute',
    top: -7,
    left: -4,
    zIndex: 1,
  },
  cachedContainer: {
    borderBottomWidth: 0,
    marginBottom: 5,
    paddingVertical: 12,
  },
});
export default TransactionElement;
