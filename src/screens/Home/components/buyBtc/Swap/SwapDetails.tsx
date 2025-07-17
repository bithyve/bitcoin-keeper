import { CommonActions } from '@react-navigation/native';
import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { SATOSHIS_IN_BTC } from 'src/constants/Bitcoin';
import ReceiveAddress from 'src/screens/Recieve/ReceiveAddress';
import ReceiveQR from 'src/screens/Recieve/ReceiveQR';
import { useAppSelector } from 'src/store/hooks';
import { CoinLogo } from './Swaps';
import { useDispatch } from 'react-redux';
import { sendPhaseOneReset } from 'src/store/reducers/send_and_receive';
import { sendPhaseOne } from 'src/store/sagaActions/send_and_receive';
import MiniscriptPathSelector, {
  MiniscriptPathSelectorRef,
} from 'src/components/MiniscriptPathSelector';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { EntityKind, TxPriority, VaultType } from 'src/services/wallets/enums';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useUSDTWallets } from 'src/hooks/useUSDTWallets';
import USDT from 'src/services/wallets/operations/dollars/USDT';
import { getAvailableBalanceUSDTWallet } from 'src/services/wallets/factories/USDTWalletFactory';

export const SwapDetails = ({ navigation, route }) => {
  const { data, wallet } = route.params;
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const sendPhaseOneState = useAppSelector((state) => state.sendAndReceive.sendPhaseOne);
  const miniscriptPathSelectorRef = useRef<MiniscriptPathSelectorRef>(null);
  const { error: errorText } = useContext(LocalizationContext).translations;
  const [miniscriptSatisfier, setMiniscriptSatisfier] = useState(null);
  const { syncAccountStatus } = useUSDTWallets();

  useEffect(() => {
    if (sendPhaseOneState.isSuccessful) {
      navigateToSendConfirmation();
    } else if (sendPhaseOneState.hasFailed) {
      if (sendPhaseOneState.failedErrorMessage === 'Insufficient balance') {
        showToast(errorText.insufficientBalance);
      } else showToast(sendPhaseOneState.failedErrorMessage);
    }
  }, [sendPhaseOneState]);
  useEffect(
    () => () => {
      dispatch(sendPhaseOneReset());
    },
    []
  );

  const executeSendPhaseOne = async (miniscriptSelectedSatisfier) => {
    if (wallet.type === VaultType.MINISCRIPT) {
      if (!miniscriptSelectedSatisfier) {
        try {
          await selectVaultSpendingPaths();
          return;
        } catch (err) {
          console.log('🚀 ~ executeSendPhaseOne ~ err:', err);
          showToast(err, <ToastErrorIcon />);
        }
      }
    }

    dispatch(sendPhaseOneReset());
    dispatch(
      sendPhaseOne({
        wallet,
        recipients: [
          {
            address: data.deposit,
            amount: data.deposit_amount * SATOSHIS_IN_BTC,
          },
        ],
        selectedUTXOs: [],
        miniscriptSelectedSatisfier,
      })
    );
  };

  const selectVaultSpendingPaths = async () => {
    if (miniscriptPathSelectorRef.current) {
      await miniscriptPathSelectorRef.current.selectVaultSpendingPaths();
    }
  };

  const handlePathSelected = (miniscriptSelectedSatisfier) => {
    setMiniscriptSatisfier(miniscriptSelectedSatisfier);
    executeSendPhaseOne(miniscriptSelectedSatisfier);
  };

  const processUSDTSend = async () => {
    try {
      const amountToSend = parseFloat(data.deposit_amount);
      const updatedSender = await syncAccountStatus(wallet);
      const isActive = updatedSender.accountStatus.isActive;
      if (!isActive) {
        // If the account is not active and there is an outgoing transaction, show a warning
        // (GasFree account activation may take a couple of minutes at times, due to longer permit transaction processing queue on provider's end)

        const hasOutgoingTransaction = updatedSender.specs.transactions.some(
          (tx) =>
            tx.from === updatedSender.accountStatus.gasFreeAddress ||
            tx.from === updatedSender.accountStatus.address
        );

        if (hasOutgoingTransaction) {
          showToast(
            'Your account is not yet active. Please wait a moment before making another transaction to avoid being charged the activation fee again.',
            <ToastErrorIcon />
          );

          // await for a few seconds to allow the user to read the message
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
      const fees = USDT.evaluateTransferFee(updatedSender.accountStatus);
      if (!fees) {
        showToast('Failed to estimate fees', <ToastErrorIcon />);
        return;
      }
      // updatedSender = await syncWalletBalance(updatedSender); // discarded; since we're able to sync wallet on the details page itself therefore we effectively will have the latest balance
      const availableBalance = getAvailableBalanceUSDTWallet(updatedSender);
      const roundedOutflow = parseFloat((amountToSend + fees.totalFee).toFixed(3));
      if (availableBalance < roundedOutflow) {
        showToast(
          `Insufficient balance for this transaction (availableBalance: ${availableBalance} USDT, fees: ${fees.totalFee} USDT)`,
          <ToastErrorIcon />
        );
        return;
      }
      navigation.navigate('usdtSendConfirmation', {
        sender: updatedSender,
        recipientAddress: data.deposit,
        amount: amountToSend,
        fees,
      });
    } catch (error) {
      console.log('🚀 ~ processUSDTSend ~ error:', error);
      showToast(error.message || 'Failed to process transaction', <ToastErrorIcon />);
    }
  };

  const navigateToSendConfirmation = () => {
    navigation.dispatch(
      CommonActions.navigate('SendConfirmation', {
        sender: wallet,
        internalRecipients: [],
        addresses: [data.deposit],
        amounts: data.deposit_amount * SATOSHIS_IN_BTC,
        note: '',
        selectedUTXOs: [],
        parentScreen: undefined,
        date: new Date(),
        transactionPriority: TxPriority.LOW,
        customFeePerByte: 0,
        miniscriptSelectedSatisfier: miniscriptSatisfier,
      })
    );
  };

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={'Swap Details'} />
      <ScrollView
        automaticallyAdjustKeyboardInsets={true}
        contentContainerStyle={styles.contentContainer}
        style={styles.flex1}
        showsVerticalScrollIndicator={false}
      >
        <Box flex={1}>
          <Text>{`Created At : ${data.created_at}`}</Text>
          <Text>{`Expires At : ${new Date(data.expired_at)}`}</Text>
          <Text>{`Status : ${data.status}`}</Text>
          <Text>{`Transaction ID : ${data.transaction_id}`}</Text>
          <Text>{`Swap Rate : ${data.rate}`}</Text>

          <Box flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
            <CoinLogo code={data.coin_from} />
            <Text>{'=>'}</Text>
            <CoinLogo code={data.coin_to} />
          </Box>

          <Box m={1}>
            <Text>{`From ${data.coin_from_name} : ${data.coin_from}`}</Text>
            <Text>{`Refund Address: ${data.return}`}</Text>
            <Text>{`Deposit Amount: ${data.deposit_amount}`}</Text>
            <ReceiveQR qrValue={data.deposit} />
            <ReceiveAddress address={data.deposit} />
          </Box>
          <Box m={1}>
            <Text>{`To ${data.coin_to_name} : ${data.coin_to} : ${data.coin_to_network}`}</Text>
            <Text>{`Receive Address: ${data.withdrawal}`}</Text>
            <Text>{`Receive Amount: ${data.withdrawal_amount}`}</Text>
          </Box>

          <Box>
            <Buttons
              primaryCallback={() => {
                if (wallet.entityKind === EntityKind.USDT_WALLET) processUSDTSend();
                else executeSendPhaseOne(null);
              }}
              primaryText="Pay with Wallet"
            />
          </Box>
        </Box>
      </ScrollView>
      <MiniscriptPathSelector
        ref={miniscriptPathSelectorRef}
        vault={wallet}
        onPathSelected={handlePathSelected}
        onError={(err) => showToast(err, <ToastErrorIcon />)}
        onCancel={() => {}}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
});
