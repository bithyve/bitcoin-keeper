import { StyleSheet, ScrollView } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useContext, useRef } from 'react';
import { hp, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { TransactionType } from 'src/services/wallets/enums';
import { Signer, Vault } from 'src/services/wallets/interfaces/vault';
import RKSignersModal from '../../components/RKSignersModal';
import ReceiptWrapper from './ReceiptWrapper';
import TransferCard from './TransferCard';
import AmountDetails from './AmountDetails';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
import { SentryErrorBoundary } from 'src/services/sentry';

export interface PSBTSendConfirmationParams {
  sender: { address: string; amount: number }[];
  recipient: { address: string; amount: number; isChange: boolean }[];
  fees: string;
  signer: Signer;
  psbt: string;
  feeRate: string;
  isMiniscript?: boolean;
  activeVault?: Vault | null;
}

function PSBTSendConfirmation({ route }) {
  const { colorMode } = useColorMode();
  const {
    sender,
    recipient,
    fees,
    signer,
    psbt,
    feeRate,
    isMiniscript,
    activeVault,
  }: PSBTSendConfirmationParams = route.params;

  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslations, common } = translations;
  const signerModalRef = useRef(null);
  const navigation = useNavigation();
  const originalAmount = recipient.reduce(
    (acc, curr) => acc + (curr.isChange ? 0 : curr.amount),
    0
  );

  const createTnxObject = () => {
    const data = {
      tags: [],
      blockTime: 0,
      TransactionType: TransactionType.SENT,
      date: null,
      confirmations: 0,
      amount: originalAmount + fees,
      fees,
      txid: '',
      address: '',
      recipientAddresses: recipient.filter((address) => !address.isChange),
      senderAddresses: sender,
    };
    return data;
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={walletTranslations.signingTransaction}
        subtitle={walletTranslations.reviewTransaction}
        rightComponent={<CurrencyTypeSwitch />}
        rightComponentPadding={wp(10)}
        rightComponentBottomPadding={hp(5)}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Box style={styles.receiptContainer}>
          <ReceiptWrapper itemContainerStyle={{ paddingHorizontal: 0 }}>
            <TransferCard
              title={walletTranslations.sendingTo}
              titleFontSize={16}
              titleFontWeight={300}
              unitFontSize={13}
              unitFontWeight={200}
              type="list"
              list={recipient.filter((address) => !address.isChange)}
            />
            <TransferCard
              title={walletTranslations.advancedDetails}
              titleFontSize={16}
              titleFontWeight={500}
              type="cta"
              onPress={() => {
                navigation.dispatch(
                  CommonActions.navigate('TransactionAdvancedDetails', {
                    transaction: createTnxObject(),
                    showTnxId: false,
                  })
                );
              }}
            />
          </ReceiptWrapper>
        </Box>
        <Box style={styles.totalAmountWrapper}>
          <AmountDetails
            title={walletTranslations.totalAmount}
            titleFontSize={16}
            titleFontWeight={300}
            amount={originalAmount}
            amountFontSize={16}
            amountFontWeight={200}
            unitFontSize={12}
            unitFontWeight={200}
          />
          <AmountDetails
            title={walletTranslations.feeRate}
            titleFontSize={16}
            titleFontWeight={300}
            amount={feeRate}
            amountFontSize={16}
            amountFontWeight={200}
            unitFontSize={12}
            unitFontWeight={200}
            customUnit="sats/vbyte"
          />
          <AmountDetails
            title={walletTranslations.networkFee}
            titleFontSize={16}
            titleFontWeight={300}
            amount={fees}
            amountFontSize={16}
            amountFontWeight={200}
            unitFontSize={12}
            unitFontWeight={200}
          />
          <Box style={styles.horizontalLineStyle} borderBottomColor={`${colorMode}.Border`} />
          <AmountDetails
            title={walletTranslations.total}
            titleFontSize={16}
            titleFontWeight={300}
            amount={fees + originalAmount}
            amountFontSize={18}
            amountFontWeight={200}
            unitFontSize={12}
            unitFontWeight={200}
          />
        </Box>
      </ScrollView>

      <Buttons
        primaryText={walletTranslations.SignTransaction}
        secondaryText={common.cancel}
        secondaryCallback={() => navigation.goBack()}
        primaryCallback={() => signerModalRef.current.openModal()}
      />

      <RKSignersModal
        signer={signer}
        psbt={psbt}
        ref={signerModalRef}
        isMiniscript={isMiniscript}
        vaultId={activeVault?.id || ''}
      />
    </ScreenWrapper>
  );
}
export default SentryErrorBoundary(PSBTSendConfirmation);

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
  },
  contentContainer: {
    paddingBottom: hp(30),
  },
  receiptContainer: {
    paddingTop: hp(30),
    paddingBottom: hp(10),
  },
  totalAmountWrapper: {
    width: '100%',
    gap: 5,
    paddingVertical: hp(10),
    paddingHorizontal: wp(15),
  },
});
