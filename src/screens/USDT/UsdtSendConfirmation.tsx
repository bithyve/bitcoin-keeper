import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
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
import UsdtIllustration from 'src/assets/images/ustd-illustration.svg';
import InfoDarkIcon from 'src/assets/images/info-Dark-icon.svg';

const UsdtSendConfirmation = ({ route }) => {
  const { amount } = route.params;
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslations, common } = translations;
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const [inProgress, setProgress] = useState(false);
  const [learnMore, setLearnMore] = useState(false);

  console.log('amount', amount);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader
        title="Send Confirmation"
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
              subTitle={'USDT'}
              icon={<UsdtWalletLogo width={20} height={20} />}
            />
            <SendingCard
              title={walletTranslations.sendingTo}
              subTitle={'usdt'}
              icon={<UsdtWalletLogo width={20} height={20} />}
              amount={amount}
              multiItem={amount.length > 1 ? true : false}
            />
          </ReceiptWrapper>
        </Box>
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
          <Text style={styles.textContainer}>
            Since the GasFree wallet is not activated, an activation fee will be charged along with
            the current permit transfer
          </Text>
        </Box>
        <Box
          style={styles.totalAmountWrapper}
          borderColor={`${colorMode}.separator`}
          backgroundColor={`${colorMode}.textInputBackground`}
        >
          <AmountDetails
            title={'Activation Fee'}
            titleFontSize={12}
            amount={1}
            amountFontSize={12}
            unitFontSize={12}
            titleColor={`${colorMode}.secondaryLightGrey`}
            amountColor={`${colorMode}.secondaryLightGrey`}
            unitColor={`${colorMode}.secondaryLightGrey`}
            customUnit="USTD"
          />
          <AmountDetails
            title={'Transaction Fee'}
            titleFontSize={12}
            amount={1}
            amountFontSize={12}
            unitFontSize={12}
            titleColor={`${colorMode}.secondaryLightGrey`}
            amountColor={`${colorMode}.secondaryLightGrey`}
            unitColor={`${colorMode}.secondaryLightGrey`}
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
            amount={amount + 1 + 1}
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
          primaryCallback={() => {}}
          primaryLoading={inProgress}
          fullWidth
        />
      </Box>
      <KeeperModal
        visible={learnMore}
        close={() => {
          setLearnMore(false);
        }}
        title="Gas-Free Wallet"
        subTitle="A Gas-Free Wallet lets you send USDT without needing TRX in your wallet. It works by covering the transaction fee in USDT instead of TRX. You’ll be charged a one-time activation fee the first time you use it."
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <Box>
            <Box alignItems={'center'}>
              <UsdtIllustration width={wp(185)} height={wp(145)} />
            </Box>
            <Box style={styles.textwrapper}>
              <Text medium>Permit Transfer</Text>
              <Text>
                Permit Transfer allows you to authorize USDT transfers using just your signature.
                It’s efficient, secure, and keeps your wallet interaction simple.
              </Text>
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
    paddingTop: hp(30),
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
