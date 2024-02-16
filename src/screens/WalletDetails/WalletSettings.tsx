import React, { useContext, useEffect, useState } from 'react';
import Text from 'src/components/KeeperText';
import { Box, ScrollView, useColorMode } from 'native-base';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation } from '@react-navigation/native';
import ShowXPub from 'src/components/XPub/ShowXPub';
import KeeperHeader from 'src/components/KeeperHeader';
import { wp, hp } from 'src/constants/responsive';
import KeeperModal from 'src/components/KeeperModal';
import useToastMessage from 'src/hooks/useToastMessage';
import { testSatsRecieve } from 'src/store/sagaActions/wallets';
import { useAppSelector } from 'src/store/hooks';
import { setTestCoinsFailed, setTestCoinsReceived } from 'src/store/reducers/wallets';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { signCosignerPSBT } from 'src/core/wallets/factories/WalletFactory';
import TickIcon from 'src/assets/images/icon_tick.svg';
import config from 'src/core/config';
import { EntityKind, NetworkType, SignerType } from 'src/core/wallets/enums';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import useWallets from 'src/hooks/useWallets';
import { AppContext } from 'src/context/AppContext';
import { StyleSheet } from 'react-native';
import OptionCard from 'src/components/OptionCard';
import ScreenWrapper from 'src/components/ScreenWrapper';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import { captureError } from 'src/services/sentry';
import WalletFingerprint from 'src/components/WalletFingerPrint';
import TransferPolicy from 'src/components/XPub/TransferPolicy';

function WalletSettings({ route }) {
  const { colorMode } = useColorMode();
  const { wallet: walletRoute, editPolicy = false } = route.params || {};
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const { setAppLoading, setLoadingContent } = useContext(AppContext);
  const [xpubVisible, setXPubVisible] = useState(false);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [transferPolicyVisible, setTransferPolicyVisible] = useState(editPolicy);

  const { wallets } = useWallets();
  const wallet = wallets.find((item) => item.id === walletRoute.id);
  const { testCoinsReceived, testCoinsFailed } = useAppSelector((state) => state.wallet);
  const { translations } = useContext(LocalizationContext);
  const walletTranslation = translations.wallet;
  const { settings, common } = translations;

  const getTestSats = () => {
    dispatch(testSatsRecieve(wallet));
  };

  useEffect(() => {
    setLoadingContent({
      title: common.pleaseWait,
      subtitle: common.receiveTestSats,
      message: '',
    });

    return () => {
      setLoadingContent({
        title: '',
        subTitle: '',
        message: '',
      });
      setAppLoading(false);
    };
  }, []);

  useEffect(() => {
    setAppLoading(false);
    if (testCoinsReceived) {
      showToast('5000 Sats Received', <TickIcon />);
      setTimeout(() => {
        dispatch(setTestCoinsReceived(false));
        navigation.goBack();
      }, 3000);
    } else if (testCoinsFailed) {
      showToast('Process Failed');
      dispatch(setTestCoinsFailed(false));
    }
  }, [testCoinsReceived, testCoinsFailed]);

  const signPSBT = (serializedPSBT, resetQR) => {
    try {
      let signedSerialisedPSBT;
      try {
        signedSerialisedPSBT = signCosignerPSBT(wallet, serializedPSBT);
      } catch (e) {
        captureError(e);
      }
      // try signing with single sig key
      if (!signedSerialisedPSBT) {
        signedSerialisedPSBT = signCosignerPSBT(wallet, serializedPSBT, EntityKind.WALLET);
      }
      navigation.dispatch(
        CommonActions.navigate({
          name: 'ShowQR',
          params: {
            data: signedSerialisedPSBT,
            encodeToBytes: false,
            title: 'Signed PSBT',
            subtitle: 'Please scan until all the QR data has been retrieved',
            type: SignerType.KEEPER,
          },
        })
      );
    } catch (e) {
      resetQR();
      showToast('Please scan a valid PSBT', null, 3000, true);
    }
  };

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
        <OptionCard
          title={walletTranslation.walletSeedWord}
          description={walletTranslation.walletSeedWordSubTitle}
          callback={() => {
            setConfirmPassVisible(true);
          }}
        />
        <OptionCard
          title={walletTranslation.showCoSignerDetails}
          description={walletTranslation.showCoSignerDetailsSubTitle}
          callback={() => {
            navigation.navigate('CosignerDetails', { wallet });
          }}
        />
        <OptionCard
          title={walletTranslation.actCoSigner}
          description={`Sign transactions (${wallet.id})`}
          callback={() => {
            navigation.dispatch(
              CommonActions.navigate({
                name: 'ScanQR',
                params: {
                  title: 'Scan PSBT to Sign',
                  subtitle: 'Please scan until all the QR data has been retrieved',
                  onQrScan: signPSBT,
                  type: SignerType.KEEPER,
                },
              })
            );
          }}
        />
        <OptionCard
          title={walletTranslation.TransferPolicy}
          description={walletTranslation.TransferPolicyDesc}
          callback={() => {
            setTransferPolicyVisible(true);
          }}
        />
        {config.NETWORK_TYPE === NetworkType.TESTNET && (
          <Box style={{ marginVertical: 40 }}>
            <OptionCard
              title={walletTranslation.recieveTestSats}
              description={walletTranslation.recieveTestSatSubTitle}
              callback={() => {
                setAppLoading(true);
                getTestSats();
              }}
            />
          </Box>
        )}
      </ScrollView>
      <Box style={styles.fingerprint}>
        <WalletFingerprint fingerprint={wallet.id} />
      </Box>

      <KeeperModal
        visible={transferPolicyVisible}
        close={() => {
          setTransferPolicyVisible(false);
        }}
        title={walletTranslation.editTransPolicy}
        subTitle={walletTranslation.editTransPolicySubTitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        DarkCloseIcon={colorMode === 'dark'}
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
              navigation.navigate('ExportSeed', {
                seed: wallet?.derivationDetails?.mnemonic,
                next: false,
                wallet,
              });
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
            close={() => setXPubVisible(false)}
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
