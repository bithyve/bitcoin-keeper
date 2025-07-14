import { Box, Pressable, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import HexagonIcon from 'src/components/HexagonIcon';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import UsdtWalletLogo from 'src/assets/images/usdt-wallet-logo.svg';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import Buttons from 'src/components/Buttons';
import DeleteDarkIcon from 'src/assets/images/delete.svg';
import DeleteIcon from 'src/assets/images/deleteLight.svg';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useToastMessage from 'src/hooks/useToastMessage';
import { useNavigation } from '@react-navigation/native';
import {
  getAvailableBalanceUSDTWallet,
  USDTWallet,
} from 'src/services/wallets/factories/USDTWalletFactory';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { useUSDTWallets } from 'src/hooks/useUSDTWallets';
import USDT from 'src/services/wallets/operations/dollars/USDT';

const UsdtAmount = ({ route }) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common, usdtWalletText } = translations;
  const { showToast } = useToastMessage();
  const navigation: any = useNavigation();
  const HexagonIconColor = ThemedColor({ name: 'HexagonIcon' });
  let { recipientAddress, sender }: { recipientAddress: string; sender: USDTWallet } =
    route.params || {};
  const [amount, setAmount] = useState('0');
  const [errorMessage, setErrorMessage] = useState('');
  const [inProgress, setInProgress] = useState(false);
  const { syncAccountStatus } = useUSDTWallets();

  const onPressNumber = (text) => {
    if (errorMessage) {
      showToast(errorMessage);
      return;
    }

    if (text === 'x') {
      onDeletePressed();
      return;
    }

    if (text === '.') {
      if (amount.includes('.')) return;
      setAmount((prev) => (prev === '0' ? '0.' : prev + '.'));
      return;
    }

    if (amount === '0') {
      setAmount(text);
    } else {
      const newAmount = amount + text;
      const parts = newAmount.split('.');
      if (parts[1] && parts[1].length > 2) return;
      setAmount(newAmount);
    }
  };

  const onDeletePressed = () => {
    if (amount.length <= 1) {
      setAmount('0');
    } else {
      setAmount(amount.slice(0, -1));
    }
  };

  const processSend = async (amountToSend: number) => {
    try {
      const updatedSender = await syncAccountStatus(sender);

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
        showToast(`Insufficient balance for this transaction.`, <ToastErrorIcon />);
        return;
      }

      navigation.navigate('usdtSendConfirmation', {
        sender: updatedSender,
        recipientAddress,
        amount: amountToSend,
        fees,
      });
    } catch (error) {
      showToast(error.message || 'Failed to process transaction', <ToastErrorIcon />);
    }
  };

  const handleSend = async () => {
    setInProgress(true);

    const amountToSend = parseFloat(amount);
    if (isNaN(amountToSend) || amountToSend <= 0) {
      setErrorMessage('Invalid amount');
      showToast('Please enter a valid amount', <ToastErrorIcon />);
      return;
    }

    await processSend(amountToSend);
    setInProgress(false);
  };

  const handleSendMax = () => {
    const availableBalance = getAvailableBalanceUSDTWallet(sender);
    const fees = USDT.evaluateTransferFee(sender.accountStatus);

    if (availableBalance < fees.totalFee) {
      showToast('Insufficient balance to send any amount after fees', <ToastErrorIcon />);
      return;
    }

    setAmount((availableBalance - fees.totalFee).toFixed(3));
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={usdtWalletText.enterAmount} />

      <Box
        style={styles.container}
        backgroundColor={`${colorMode}.boxSecondaryBackground`}
        borderColor={`${colorMode}.separator`}
      >
        <HexagonIcon
          backgroundColor={HexagonIconColor}
          icon={<UsdtWalletLogo width={16} height={16} />}
          width={33}
          height={30}
        />
        <Box>
          {/* Add wallet name  */}
          <Text bold>USDT Wallet</Text>
          <Text color={`${colorMode}.GreyText`}>
            {usdtWalletText.balance}: {getAvailableBalanceUSDTWallet(sender)} USDT
          </Text>
        </Box>
      </Box>

      <Box style={styles.amountWrapper}>
        <Text fontSize={32} color={`${colorMode}.primaryText`}>
          {amount}{' '}
        </Text>
        <Text fontSize={25} color={`${colorMode}.GreyText`}>
          USDT
        </Text>

        <Pressable
          onPress={handleSendMax}
          backgroundColor={`${colorMode}.brownBackground`}
          style={styles.sendMaxWrapper}
          testID="btn_sendMax"
        >
          <Text testID="text_sendmax" color={`${colorMode}.buttonText`} style={styles.sendMaxText}>
            {common.sendMax}
          </Text>
        </Pressable>
      </Box>

      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        enableDecimal
        keyColor={`${colorMode}.keyPadText`}
        ClearIcon={colorMode === 'dark' ? <DeleteIcon /> : <DeleteDarkIcon />}
      />

      <Box style={styles.ctaBtnWrapper}>
        <Buttons
          primaryText={common.done}
          primaryDisable={parseFloat(amount) <= 0 || !!errorMessage}
          primaryCallback={handleSend}
          primaryLoading={inProgress}
          fullWidth
        />
      </Box>
    </ScreenWrapper>
  );
};

export default UsdtAmount;

const styles = StyleSheet.create({
  container: {
    marginTop: hp(20),
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(16),
    paddingHorizontal: wp(20),
    borderRadius: 10,
    gap: wp(10),
  },
  ctaBtnWrapper: {
    marginTop: hp(30),
  },

  amountWrapper: {
    marginTop: '46%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  sendMaxWrapper: {
    width: wp(85),
    alignSelf: 'center',
    marginTop: hp(5),
    paddingHorizontal: hp(12),
    paddingVertical: hp(3),
    borderRadius: 5,
  },
  sendMaxText: {
    textAlign: 'center',
    fontSize: 11,
  },
});
