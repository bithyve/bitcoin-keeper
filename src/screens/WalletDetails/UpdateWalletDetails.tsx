import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperText from 'src/components/KeeperText';
import ShowXPub from 'src/components/XPub/ShowXPub';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import KeeperHeader from 'src/components/KeeperHeader';
import Text from 'src/components/KeeperText';

function UpdateWalletDetails({ route }) {
  const { colorMode } = useColorMode();
  const { wallet, isFromSeed, seed } = route.params;

  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation, seed: seedTranslation, common } = translations;

  const getPurpose = (key) => {
    switch (key) {
      case 'P2WPKH':
        return 'P2WPKH: native segwit, single-sig';
      case 'P2TR':
        return 'P2TR: taproot, single-sig';
      default:
        return 'Purpose unknown or unsupported';
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.scrollViewWrapper}
      >
        <KeeperHeader
          title={isFromSeed ? seedTranslation.walletSeedWords : walletTranslation.WalletDetails}
          subtitle={
            isFromSeed ? walletTranslation.qrofRecoveryPhrase : walletTranslation.viewWalletPath
          }
        />
        <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
          <Box style={styles.container}>
            <KeeperText
              style={[styles.autoTransferText, { marginTop: hp(25), marginBottom: 5 }]}
              color={`${colorMode}.GreyText`}
            >
              {common.path}
            </KeeperText>
            <Box style={styles.textInputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
              <Text medium>{`${(wallet as Wallet)?.derivationDetails?.xDerivationPath}`}</Text>
            </Box>
            <KeeperText
              style={[styles.autoTransferText, { marginTop: hp(25), marginBottom: 5 }]}
              color={`${colorMode}.GreyText`}
            >
              {common.purpose}
            </KeeperText>
            <Box style={styles.textInputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
              <Text medium>{getPurpose(wallet?.scriptType)}</Text>
            </Box>
            {isFromSeed ? (
              <Box style={{ marginTop: wp(20) }}>
                <ShowXPub
                  data={seed.toString().replace(/,/g, ' ')}
                  subText={seedTranslation.walletSeedWords}
                  noteSubText={seedTranslation.showXPubNoteSubText}
                  copyable={false}
                />
              </Box>
            ) : null}
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '95%',
    alignSelf: 'center',
  },
  autoTransferText: {
    fontSize: 12,
    paddingHorizontal: wp(5),
    letterSpacing: 0.6,
  },
  scrollViewWrapper: {
    flex: 1,
  },
  textInputWrapper: {
    flexDirection: 'row',
    width: '100%',
    height: hp(50),
    paddingHorizontal: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
});

export default UpdateWalletDetails;
