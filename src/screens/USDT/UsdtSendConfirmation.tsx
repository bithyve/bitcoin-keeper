import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import ReceiptWrapper from '../Send/ReceiptWrapper';
import SendingCard from '../Send/SendingCard';
import { hp, wp } from 'src/constants/responsive';
import AmountDetails from '../Send/AmountDetails';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import UsdtWalletLogo from 'src/assets/images/usdt-wallet-logo.svg';
import InfoBrownIcon from 'src/assets/images/info-brown-icon.svg';
import Text from 'src/components/KeeperText';
import KeeperModal from 'src/components/KeeperModal';
import InfoDarkIcon from 'src/assets/images/info-Dark-icon.svg';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import {
  getAvailableBalanceUSDTWallet,
  USDTWallet,
} from 'src/services/wallets/factories/USDTWalletFactory';
import USDT, {
  DEFAULT_DEADLINE_SECONDS,
  USDTTransferOptions,
} from 'src/services/wallets/operations/dollars/USDT';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import TickIcon from 'src/assets/images/icon_check.svg';
import { useUSDTWallets } from 'src/hooks/useUSDTWallets';
import { useNavigation } from '@react-navigation/native';
import GasFree from 'src/services/wallets/operations/dollars/GasFree';

const UsdtSendConfirmation = ({ route }) => {
  const {
    recipientAddress,
    sender,
    amount,
    fees,
  }: {
    recipientAddress: string;
    sender: USDTWallet;
    amount: number;
    fees: { activateFee: number; transferFee: number; totalFee: number };
  } = route.params;
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslations, common, usdtWalletText } = translations;
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const [inProgress, setProgress] = useState(false);
  const [learnMore, setLearnMore] = useState(false);
  const { showToast } = useToastMessage();
  const { updateWallet } = useUSDTWallets();
  const navigation: any = useNavigation();

  const processPermitTransaction = async () => {
    try {
      setProgress(true);

      const transferOptions: USDTTransferOptions = {
        source: sender,
        toAddress: recipientAddress,
        amount,
        networkType: sender.networkType,
        deadlineInSeconds: DEFAULT_DEADLINE_SECONDS,
      };

      // Step 1: Prepare the transfer
      const preparation = await USDT.prepareTransfer(transferOptions);

      if (!preparation?.isValid) {
        throw new Error(preparation?.error || 'Transfer preparation failed');
      }

      // Step 2: Submit the transfer
      const transferResult = await USDT.submitTransfer(
        transferOptions.source,
        preparation.signaturePayload
      );

      if (transferResult?.success) {
        // Transaction successful - show success modal
        showToast('Permit Transfer successful!', <TickIcon />);

        const updatedWallet: USDTWallet = {
          ...sender,
          specs: {
            ...sender.specs,
            balance: Number(
              (getAvailableBalanceUSDTWallet(sender) - (amount + fees.totalFee)).toFixed(3)
            ),
            transactions: [
              transferResult.transaction, // transfer w/ the trace id(missing txid); to be processed and confirmed
              ...sender.specs.transactions,
            ],
          },
        };
        await updateWallet(updatedWallet);
        setTimeout(() => {
          // Navigate back to the home screen or any other screen
          navigation.navigate('usdtDetails', { usdtWalletId: sender.id, autoRefresh: true });
          setProgress(false);
        }, 1000);
      } else {
        throw new Error(transferResult?.error || 'Transfer failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      showToast(`Permit Transfer failed: ${errorMessage}`, <ToastErrorIcon />);
      setProgress(false);
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader
        title={usdtWalletText.sendConfirmation}
        learnMore
        learnMorePressed={() => {
          setLearnMore(true);
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Box style={styles.receiptContainer}>
          <ReceiptWrapper showThemedSvg>
            <SendingCard
              title={walletTranslations.sendingFrom}
              subTitle={sender.accountStatus.gasFreeAddress}
              icon={<UsdtWalletLogo width={20} height={20} />}
            />
            <SendingCard
              title={walletTranslations.sendingTo}
              subTitle={recipientAddress}
              icon={<UsdtWalletLogo width={20} height={20} />}
              amount={amount}
              multiItem={false}
            />
          </ReceiptWrapper>
        </Box>
        {!sender.accountStatus.isActive ? (
          <Box
            style={styles.infoWrapper}
            borderColor={`${colorMode}.separator`}
            backgroundColor={`${colorMode}.separator`}
          >
            <Box style={styles.iconWrapper}>
              {isDarkMode ? (
                <InfoDarkIcon width={16} height={16} />
              ) : (
                <InfoBrownIcon width={16} height={16} />
              )}
            </Box>
            <Text style={styles.textContainer}>{usdtWalletText.gasFreeWallet}</Text>
          </Box>
        ) : null}
        <Box
          style={styles.totalAmountWrapper}
          borderColor={`${colorMode}.separator`}
          backgroundColor={`${colorMode}.textInputBackground`}
        >
          {!sender.accountStatus.isActive ? (
            <AmountDetails
              title={usdtWalletText.activationFee}
              titleFontSize={12}
              amount={fees.activateFee}
              amountFontSize={12}
              unitFontSize={12}
              titleColor={`${colorMode}.activationFeeText`}
              amountColor={`${colorMode}.activationFeeText`}
              unitColor={`${colorMode}.activationFeeText`}
              customUnit="USTD"
            />
          ) : null}
          <AmountDetails
            title={usdtWalletText.transactionFee}
            titleFontSize={12}
            amount={fees.transferFee}
            amountFontSize={12}
            unitFontSize={12}
            titleColor={`${colorMode}.activationFeeText`}
            amountColor={`${colorMode}.activationFeeText`}
            unitColor={`${colorMode}.activationFeeText`}
            customUnit="USTD"
          />
          <AmountDetails
            title={walletTranslations.amountBeingSend}
            titleFontSize={13}
            titleFontWeight={500}
            amount={amount}
            amountFontSize={15}
            unitFontSize={12}
            amountColor={`${colorMode}.secondaryText`}
            unitColor={`${colorMode}.secondaryText`}
            customUnit="USTD"
          />
          <Box style={styles.horizontalLineStyle} borderBottomColor={`${colorMode}.Border`} />
          <AmountDetails
            title={walletTranslations.totalAmount}
            titleFontSize={13}
            titleFontWeight={500}
            amount={amount + fees.totalFee}
            amountFontSize={15}
            unitFontSize={12}
            amountColor={`${colorMode}.secondaryText`}
            unitColor={`${colorMode}.secondaryText`}
            customUnit="USTD"
          />
        </Box>
      </ScrollView>
      <Box marginTop={hp(15)}>
        <Buttons
          primaryText={common.confirmProceed}
          primaryCallback={processPermitTransaction}
          primaryLoading={inProgress}
          fullWidth
        />
      </Box>
      <KeeperModal
        visible={learnMore}
        close={() => {
          setLearnMore(false);
        }}
        title={usdtWalletText.gasFreeWalletTitle}
        subTitle={usdtWalletText.gasFreeWalletDesc}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <Box>
            <Box alignItems={'center'}>
              <ThemedSvg name={'usdt_illustration'} width={wp(185)} height={wp(145)} />
            </Box>
            <Box style={styles.textwrapper}>
              <Text medium>{usdtWalletText.permitTransfer}</Text>
              <Text>{usdtWalletText.permitTransferDesc}</Text>
            </Box>
          </Box>
        )}
      />
    </ScreenWrapper>
  );
};

export default UsdtSendConfirmation;

const styles = StyleSheet.create({
  horizontalLineStyle: {
    borderBottomWidth: 0.3,
    marginTop: hp(12),
    marginBottom: hp(6),
    opacity: 0.5,
  },

  container: {
    flex: 1,
    marginHorizontal: wp(0),
    marginTop: hp(5),
  },
  contentContainer: {
    paddingBottom: hp(30),
  },

  receiptContainer: {
    paddingTop: hp(20),
    paddingBottom: hp(10),
  },
  totalAmountWrapper: {
    width: '100%',
    gap: 5,
    paddingVertical: hp(22),
    paddingHorizontal: wp(20),
    marginBottom: hp(10),
    marginTop: hp(15),
    borderWidth: 1,
    borderRadius: wp(20),
  },
  infoWrapper: {
    borderWidth: 1,
    borderRadius: wp(10),
    paddingHorizontal: wp(15),
    paddingVertical: hp(18),
    flexDirection: 'row',
    gap: 15,
  },
  textContainer: {
    width: '94%',
  },
  iconWrapper: {
    paddingTop: hp(5),
  },
  textwrapper: {
    marginVertical: hp(10),
    gap: hp(10),
  },
});
