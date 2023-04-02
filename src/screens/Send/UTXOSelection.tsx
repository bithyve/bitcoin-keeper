import { useNavigation } from '@react-navigation/native';
import { Box, Text, useColorMode } from 'native-base';
import React, { useCallback, useState } from 'react';
import { TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import {
  BtcToSats,
  SatsToBtc,
} from 'src/common/constants/Bitcoin';
import useBalance from 'src/hooks/useBalance';

import { hp, wp, windowWidth } from 'src/common/data/responsiveness/responsive';
import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { useAppSelector } from 'src/store/hooks';
import BtcBlack from 'src/assets/images/btc_black.svg';
import { UTXO } from 'src/core/wallets/interfaces';
import Buttons from 'src/components/Buttons';
import _ from 'lodash';
import useToastMessage from 'src/hooks/useToastMessage';
import { useDispatch } from 'react-redux';
import { sendPhaseOne } from 'src/store/sagaActions/send_and_receive';
import config from 'src/core/config';
import { TxPriority } from 'src/core/wallets/enums';

function UTXOSelection({ route }: any) {
  const navigation = useNavigation();
  const { sender, amount, address } = route.params;
  const utxos = _.clone(sender.specs.confirmedUTXOs);
  const { colorMode } = useColorMode();
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const { averageTxFees } = useAppSelector((state) => state.network);
  const [selectionTotal, setSelectionTotal] = useState(0);
  const [utxoState, setUtxoState] = useState(
    utxos.map((utxo) => {
      utxo.selected = false;
      return utxo;
    })
  );

  const RenderTransactionElement = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.wrapper}
        onPress={() => {
          let utxoSum = selectionTotal;
          setUtxoState(
            utxoState.map((utxo) => {
              if (utxo.txId === item.txId) {
                utxoSum = utxo.selected ? utxoSum - utxo.value : utxoSum + utxo.value;
                return { ...utxo, selected: !utxo.selected };
              }
              return utxo;
            })
          );
          setSelectionTotal(utxoSum);
        }}
      >
        <Box
          style={[styles.selectionView, { backgroundColor: item.selected ? 'orange' : 'white' }]}
        />
        <Box style={styles.amountWrapper}>
          <Box>{getCurrencyIcon(BtcBlack, 'dark')}</Box>
          <Text style={styles.amountText}>
            {getBalance(item.value)}
            <Text color={`${colorMode}.dateText`} style={styles.unitText}>
              {getSatUnit()}
            </Text>
          </Text>
        </Box>
        <Box style={styles.container}>
          <Box style={styles.rowCenter}>
            <Box style={styles.transactionContainer}>
              <Text
                color={`${colorMode}.GreyText`}
                style={styles.transactionIdText}
                numberOfLines={1}
              >
                {item.txId}
              </Text>
            </Box>
          </Box>
        </Box>
      </TouchableOpacity>
    ),
    [utxoState]
  );
  const minimumAvgFeeRequired = averageTxFees[config.NETWORK_TYPE][TxPriority.LOW].averageTxFee;
  const areEnoughUTXOsSelected =
    selectionTotal >= Number(BtcToSats(amount)) + Number(minimumAvgFeeRequired);
  const showFeeErrorMessage =
    selectionTotal >= Number(BtcToSats(amount)) &&
    selectionTotal < Number(BtcToSats(amount)) + Number(minimumAvgFeeRequired);
  const executeSendPhaseOne = () => {
    const recipients = [];
    if (!selectionTotal) {
      showToast('Please enter a valid amount');
      return;
    }
    recipients.push({
      address,
      amount,
    });
    dispatch(
      sendPhaseOne({
        wallet: sender,
        recipients,
        UTXOs: utxoState.filter((utxo) => utxo.selected),
      })
    );
  };
  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Manual Select UTXOs"
        subtitle={`Select a minimum of ${amount} BTC to proceed`}
        onPressHandler={() => navigation.goBack()}
      />
      <FlatList
        style={{ marginTop: 20 }}
        data={utxoState}
        renderItem={({ item }) => <RenderTransactionElement item={item} />}
        keyExtractor={(item: UTXO) => item.txId}
        showsVerticalScrollIndicator={false}
      />
      <Box>
        {showFeeErrorMessage ? (
          <Text color={`${colorMode}.error`} style={styles.feeErrorMessage} textAlign="left">
            Please select more UTXOs to accomidate the minimun fee required
          </Text>
        ) : null}
        <Text color={`${colorMode}.GreyText`} style={styles.totalAmount} textAlign="right">
          {SatsToBtc(selectionTotal)}/{amount}
        </Text>
      </Box>
      <Box style={styles.ctaBtnWrapper}>
        <Box ml={windowWidth * -0.09}>
          <Buttons
            secondaryText="Cancel"
            secondaryCallback={() => {
              navigation.goBack();
            }}
            primaryDisable={!areEnoughUTXOsSelected}
            primaryCallback={executeSendPhaseOne}
            primaryText="Send"
          />
        </Box>
      </Box>
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FDF7F0',
    marginVertical: 5,
    borderRadius: 10,
    padding: 10,
  },
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1,
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionContainer: {
    flexDirection: 'row',
    margin: 1.5,
    width: wp(320),
  },
  transactionIdText: {
    fontSize: 13,
    letterSpacing: 0.6,
    width: wp(320),
    marginRight: 5,
  },
  amountWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
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
  selectionView: {
    borderWidth: 1,
    borderColor: 'orange',
    height: 10,
    width: 10,
    marginBottom: 10,
  },
  ctaBtnWrapper: {
    marginBottom: hp(5),
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalAmount: {
    fontSize: 18,
    letterSpacing: 0.6,
  },
  feeErrorMessage: {
    fontSize: 14,
    letterSpacing: 0.6,
  },
});
export default UTXOSelection;
