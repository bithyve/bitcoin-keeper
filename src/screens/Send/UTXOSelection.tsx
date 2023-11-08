import { useNavigation } from '@react-navigation/native';
import { Box, Text, useColorMode } from 'native-base';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { BtcToSats } from 'src/constants/Bitcoin';
import useBalance from 'src/hooks/useBalance';

import { hp, wp, windowWidth } from 'src/constants/responsive';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { useAppSelector } from 'src/store/hooks';
import Buttons from 'src/components/Buttons';
import _ from 'lodash';
import useToastMessage from 'src/hooks/useToastMessage';
import { useDispatch } from 'react-redux';
import { sendPhaseOne } from 'src/store/sagaActions/send_and_receive';
import config from 'src/core/config';
import { TxPriority, WalletType } from 'src/core/wallets/enums';
import UTXOList from 'src/components/UTXOsComponents/UTXOList';
import NoTransactionIcon from 'src/assets/images/no_transaction_icon.svg';
import UTXOSelectionTotal from 'src/components/UTXOsComponents/UTXOSelectionTotal';

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
  const [selectedUTXOMap, setSelectedUTXOMap] = useState({});

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
      amount: BtcToSats(amount),
    });
    dispatch(
      sendPhaseOne({
        wallet: sender,
        recipients,
        selectedUTXOs: utxos.filter((utxo) => selectedUTXOMap[`${utxo.txId}${utxo.vout}`]),
      })
    );
  };
  return (
    <ScreenWrapper>
      <KeeperHeader
        title="Select UTXOs"
        subtitle={`Select a minimum of ${amount} BTC to proceed`}
      />
      <UTXOSelectionTotal
        selectionTotal={selectionTotal}
        selectedUTXOs={utxos.filter((utxo) => selectedUTXOMap[`${utxo.txId}${utxo.vout}`])}
      />
      <UTXOList
        utxoState={utxos.map((utxo) => {
          utxo.confirmed = true;
          return utxo;
        })}
        enableSelection={true}
        setSelectionTotal={setSelectionTotal}
        selectedUTXOMap={selectedUTXOMap}
        setSelectedUTXOMap={setSelectedUTXOMap}
        currentWallet={sender}
        emptyIcon={NoTransactionIcon}
        selectedAccount={WalletType.DEFAULT}
        initateWhirlpoolMix={false}
      />
      <Box>
        {showFeeErrorMessage ? (
          <Text color={`${colorMode}.error`} style={styles.feeErrorMessage} textAlign="left">
            Please select more UTXOs to accomidate the minimun fee required
          </Text>
        ) : null}
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
