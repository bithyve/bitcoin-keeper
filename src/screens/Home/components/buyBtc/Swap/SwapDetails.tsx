import { CommonActions } from '@react-navigation/native';
import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Buttons from 'src/components/Buttons';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { SATOSHIS_IN_BTC } from 'src/constants/Bitcoin';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { sendPhaseOneReset } from 'src/store/reducers/send_and_receive';
import { sendPhaseOne } from 'src/store/sagaActions/send_and_receive';
import MiniscriptPathSelector, {
  MiniscriptPathSelectorRef,
} from 'src/components/MiniscriptPathSelector';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { TxPriority, VaultType } from 'src/services/wallets/enums';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import SwapConfirmCard from './component/SwapConfirmCard';
import SvgIcon from 'src/assets/images/@.svg';
import { hp, wp } from 'src/constants/responsive';
import DualArrow from 'src/assets/images/dualarrow.svg';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import Clipboard from '@react-native-clipboard/clipboard';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';
import TickIcon from 'src/assets/images/icon_tick.svg';
import Text from 'src/components/KeeperText';

export const SwapDetails = ({ navigation, route }) => {
  const { data, wallet, recievedWallet } = route.params;
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const sendPhaseOneState = useAppSelector((state) => state.sendAndReceive.sendPhaseOne);
  const miniscriptPathSelectorRef = useRef<MiniscriptPathSelectorRef>(null);
  const {
    error: errorText,
    buyBTC: buyBTCText,
    common,
  } = useContext(LocalizationContext).translations;
  const [miniscriptSatisfier, setMiniscriptSatisfier] = useState(null);
  const copyToClipboard = ThemedColor({ name: 'copyToClipboard' });

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

  const navigateToSendConfirmation = () => {
    navigation.dispatch(
      CommonActions.navigate('SendConfirmation', {
        sender: wallet,
        internalRecipients: [],
        addresses: data.deposit,
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
      <WalletHeader title={buyBTCText.swapDetails} />
      <ScrollView
        automaticallyAdjustKeyboardInsets={true}
        style={styles.flex1}
        showsVerticalScrollIndicator={false}
      >
        <Box
          style={styles.contentContainer}
          backgroundColor={`${colorMode}.textInputBackground`}
          borderColor={`${colorMode}.separator`}
        >
          <SwapConfirmCard
            icon={<SvgIcon />}
            text={`Send ${data?.coin_from} from`}
            subText={wallet?.presentationData?.name}
          />
          <Box style={styles.horizontalDivider} backgroundColor={`${colorMode}.separator`} />
          <SwapConfirmCard
            text={buyBTCText.amountToSwap}
            subText={`${data?.deposit_amount} ${data?.coin_from}`}
          />
          <Box style={styles.horizontalDivider} backgroundColor={`${colorMode}.separator`} />
          <SwapConfirmCard
            text={buyBTCText.letsExchangeId}
            subText={`${data?.transaction_id} `}
            rightComponent={() => (
              <TouchableOpacity
                onPress={() => {
                  Clipboard.setString(data?.transaction_id);
                  showToast(buyBTCText.letsExchangeIdCopied, <TickIcon />);
                }}
              >
                <Box style={styles.copyIcon} backgroundColor={copyToClipboard}>
                  <ThemedSvg name={'copy_icon'} width={14} height={14} />
                </Box>
              </TouchableOpacity>
            )}
          />
          <Box style={styles.dividerWithIcon}>
            <Box style={styles.horizontalDivider} backgroundColor={`${colorMode}.separator`} />
            <Box style={styles.iconWrapper}>
              <CircleIconWrapper
                icon={<DualArrow />}
                width={39}
                backgroundColor={`${colorMode}.pantoneGreen`}
              />
            </Box>
          </Box>
          <SwapConfirmCard
            icon={<SvgIcon />}
            text={`${data?.coin_to} ${buyBTCText.receivedIn} `}
            subText={recievedWallet?.presentationData?.name}
          />
          <Box style={styles.horizontalDivider} backgroundColor={`${colorMode}.separator`} />
          <SwapConfirmCard
            text={buyBTCText.estimatedAmount}
            subText={`${Number(data?.withdrawal_amount).toFixed(2)} ${data?.coin_to}`}
          />
        </Box>
      </ScrollView>
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        backgroundColor={`${colorMode}.primaryBackground`}
        borderColor={`${colorMode}.separator`}
        style={styles.buttonContainer}
      >
        <Box style={styles.noteContainer}>
          <Text fontSize={15} medium color={`${colorMode}.textGreen`}>
            {common.note}
          </Text>
          <Text fontSize={13} color={`${colorMode}.primaryText`}>
            {buyBTCText.copyExchangeId}
          </Text>
          <Text fontSize={13} color={`${colorMode}.primaryText`}>
            {buyBTCText.agreedTerms}
          </Text>
        </Box>
        <Buttons
          primaryCallback={() => {
            executeSendPhaseOne(null);
          }}
          primaryText=" Start the Swap"
          fullWidth
        />
      </Box>

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
    borderWidth: 1,
    borderRadius: 20,
    marginVertical: hp(20),
  },
  flex1: {
    flex: 1,
  },
  dividerWithIcon: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(20),
    marginVertical: hp(20),
  },
  horizontalDivider: {
    height: 1,
    width: '100%',
  },
  iconWrapper: {
    position: 'absolute',
    paddingHorizontal: 6,
  },
  copyIcon: {
    width: 30,
    height: 30,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteContainer: {
    marginVertical: wp(20),
    gap: 5,
  },
  buttonContainer: {
    marginBottom: hp(20),
    paddingHorizontal: wp(20),
    paddingVertical: hp(10),
  },
});
