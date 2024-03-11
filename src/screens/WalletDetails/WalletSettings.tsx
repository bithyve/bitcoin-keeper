import React, { useContext, useState } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import ShowXPub from 'src/components/XPub/ShowXPub';
import KeeperHeader from 'src/components/KeeperHeader';
import { wp, hp } from 'src/constants/responsive';
import KeeperModal from 'src/components/KeeperModal';
import useToastMessage from 'src/hooks/useToastMessage';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import TickIcon from 'src/assets/images/icon_tick.svg';
import useWallets from 'src/hooks/useWallets';
import { StyleSheet } from 'react-native';
import OptionCard from 'src/components/OptionCard';
import ScreenWrapper from 'src/components/ScreenWrapper';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import WalletFingerprint from 'src/components/WalletFingerPrint';
import TransferPolicy from 'src/components/XPub/TransferPolicy';
import useTestSats from 'src/hooks/useTestSats';
import idx from 'idx';

function WalletSettings({ route }) {
  const { colorMode } = useColorMode();
  const { wallet: walletRoute, editPolicy = false } = route.params || {};
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const [xpubVisible, setXPubVisible] = useState(false);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [transferPolicyVisible, setTransferPolicyVisible] = useState(editPolicy);

  const { wallets } = useWallets();
  const wallet = wallets.find((item) => item.id === walletRoute.id);
  const walletMnemonic = idx(wallet, (_) => _.derivationDetails.mnemonic);

  const { translations } = useContext(LocalizationContext);
  const walletTranslation = translations.wallet;
  const { settings } = translations;
  const TestSatsComponent = useTestSats({ wallet });

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title={settings.walletSettings} subtitle={settings.walletSettingSubTitle} />
      <ScrollView
        contentContainerStyle={styles.optionsListContainer}
        showsVerticalScrollIndicator={false}
      >
        <OptionCard
          title={walletTranslation.WalletDetails}
          description={walletTranslation.changeWalletDetails}
          callback={() => {
            navigation.navigate('WalletDetailsSettings', { wallet });
          }}
        />
        {walletMnemonic && (
          <OptionCard
            title={walletTranslation.walletSeedWord}
            description={walletTranslation.walletSeedWordSubTitle}
            callback={() => {
              setConfirmPassVisible(true);
            }}
          />
        )}
        <OptionCard
          title={walletTranslation.TransferPolicy}
          description={walletTranslation.TransferPolicyDesc}
          callback={() => {
            setTransferPolicyVisible(true);
          }}
        />
        {TestSatsComponent}
      </ScrollView>
      <Box style={styles.fingerprint}>
        <WalletFingerprint fingerprint={wallet.id} title="Wallet Fingerprint" />
      </Box>

      <KeeperModal
        visible={transferPolicyVisible}
        close={() => {
          setTransferPolicyVisible(false);
        }}
        title={walletTranslation.editTransPolicy}
        subTitle={walletTranslation.editTransPolicySubTitle}
        subTitleWidth={wp(220)}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        showCloseIcon={false}
        Content={() => (
          <TransferPolicy
            wallet={wallet}
            close={() => {
              showToast(walletTranslation.TransPolicyChange, <TickIcon />);
              setTransferPolicyVisible(false);
            }}
            secondaryBtnPress={() => {
              setTransferPolicyVisible(false);
            }}
          />
        )}
      />

      <KeeperModal
        visible={confirmPassVisible}
        close={() => setConfirmPassVisible(false)}
        title={walletTranslation?.confirmPassTitle}
        subTitleWidth={wp(240)}
        subTitle={walletTranslation?.confirmPassSubTitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        Content={() => (
          <PasscodeVerifyModal
            useBiometrics
            close={() => {
              setConfirmPassVisible(false);
            }}
            onSuccess={() => {
              if (walletMnemonic) {
                navigation.navigate('ExportSeed', {
                  seed: walletMnemonic,
                  next: false,
                  wallet,
                });
              } else showToast("Mnemonic doesn't exists");
            }}
          />
        )}
      />
      <KeeperModal
        visible={xpubVisible}
        close={() => setXPubVisible(false)}
        title={walletTranslation.XPubTitle}
        subTitleWidth={wp(240)}
        subTitle={walletTranslation.xpubModalSubTitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        DarkCloseIcon={colorMode === 'dark'}
        Content={() => (
          <ShowXPub
            data={wallet?.specs?.xpub}
            copy={() => {
              setXPubVisible(false);
              showToast(walletTranslation.xPubCopyToastMsg, <TickIcon />);
            }}
            copyable
            subText={walletTranslation?.AccountXpub}
            noteSubText={walletTranslation?.AccountXpubNote}
          />
        )}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  fingerprint: {
    alignItems: 'center',
  },
  walletCardContainer: {
    borderRadius: hp(20),
    width: wp(320),
    paddingHorizontal: 5,
    paddingVertical: 20,
    position: 'relative',
    marginLeft: -wp(20),
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: wp(10),
  },
  walletDetailsWrapper: {
    width: wp(155),
  },
  walletName: {
    letterSpacing: 0.28,
    fontSize: 15,
  },
  walletDescription: {
    letterSpacing: 0.24,
    fontSize: 13,
  },
  walletBalance: {
    letterSpacing: 1.2,
    fontSize: 23,
    padding: 5,
  },
  optionsListContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  optionContainer: {
    marginTop: hp(20),
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  optionTitle: {
    fontSize: 14,
    letterSpacing: 1.12,
  },
  optionSubtitle: {
    fontSize: 12,
    letterSpacing: 0.6,
    width: '90%',
  },
});
export default WalletSettings;
