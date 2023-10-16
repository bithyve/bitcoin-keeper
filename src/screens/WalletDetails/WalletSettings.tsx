import React, { useContext, useEffect, useState } from 'react';
import Text from 'src/components/KeeperText';
import { Box, ScrollView, useColorMode } from 'native-base';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation } from '@react-navigation/native';
import ShowXPub from 'src/components/XPub/ShowXPub';
import SeedConfirmPasscode from 'src/components/XPub/SeedConfirmPasscode';
import KeeperHeader from 'src/components/KeeperHeader';
import { wp, hp } from 'src/constants/responsive';
import KeeperModal from 'src/components/KeeperModal';
import useToastMessage from 'src/hooks/useToastMessage';
import { testSatsRecieve } from 'src/store/sagaActions/wallets';
import { useAppSelector } from 'src/store/hooks';
import { setTestCoinsFailed, setTestCoinsReceived } from 'src/store/reducers/wallets';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { signCosignerPSBT } from 'src/core/wallets/factories/WalletFactory';
import Note from 'src/components/Note/Note';
import TickIcon from 'src/assets/images/icon_tick.svg';
import config from 'src/core/config';
import { NetworkType, SignerType } from 'src/core/wallets/enums';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import BtcWallet from 'src/assets/images/btc_walletCard.svg';
import useWallets from 'src/hooks/useWallets';
import { getAmt, getCurrencyImageByRegion } from 'src/constants/Bitcoin';
import { AppContext } from 'src/context/AppContext';
import { StyleSheet } from 'react-native';
import OptionCard from 'src/components/OptionCard';
import ScreenWrapper from 'src/components/ScreenWrapper';

function WalletSettings({ route }) {
  const { colorMode } = useColorMode();
  const { wallet: walletRoute, editPolicy = false } = route.params || {};
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const { setAppLoading, setLoadingContent } = useContext(AppContext);
  const [xpubVisible, setXPubVisible] = useState(false);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);

  const { wallets } = useWallets();
  const wallet = wallets.find((item) => item.id === walletRoute.id);
  const { testCoinsReceived, testCoinsFailed } = useAppSelector((state) => state.wallet);
  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const { translations } = useContext(LocalizationContext);
  const walletTranslation = translations.wallet;

  // eslint-disable-next-line react/no-unstable-nested-components
  function WalletCard({ walletName, walletBalance, walletDescription, Icon }: any) {
    return (
      <Box
        backgroundColor={`${colorMode}.seashellWhite`}
        style={styles.walletCardContainer}
      >
        <Box style={styles.walletCard}>
          <Box style={styles.walletDetailsWrapper}>
            <Text color="light.white" style={styles.walletName}>
              {walletName}
            </Text>
            <Text color="light.white" style={styles.walletDescription}>
              {walletDescription}
            </Text>
          </Box>
          <Box style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Box>{Icon}</Box>
            <Text color="light.white" style={styles.walletBalance}>
              {walletBalance}
            </Text>
          </Box>
        </Box>
      </Box>
    );
  }

  const getTestSats = () => {
    dispatch(testSatsRecieve(wallet));
  };

  useEffect(() => {
    setLoadingContent({
      title: 'Please Wait',
      subtitle: 'Receiving test sats',
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
      const signedSerialisedPSBT = signCosignerPSBT(wallet, serializedPSBT);
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
      <KeeperHeader title="Wallet Settings" subtitle="Setting for the wallet only" />
      <Box
        style={{
          marginTop: hp(35),
          marginLeft: wp(25),
        }}
      >
        <WalletCard
          walletName={wallet?.presentationData?.name}
          walletDescription={wallet?.presentationData?.description}
          walletBalance={getAmt(
            wallet?.specs?.balances?.confirmed + wallet?.specs?.balances?.unconfirmed,
            exchangeRates,
            currencyCode,
            currentCurrency,
            satsEnabled
          )}
          Icon={getCurrencyImageByRegion(currencyCode, 'light', currentCurrency, BtcWallet)}
        />
      </Box>
      <ScrollView
        contentContainerStyle={styles.optionsListContainer}
        showsVerticalScrollIndicator={false}
      >
        <OptionCard
          title="Wallet Details"
          description="Change wallet name & description"
          callback={() => {
            navigation.navigate('WalletDetailsSettings', { wallet });
          }}
        />
        <OptionCard
          title="Wallet Seed Words"
          description="Use to link external wallets to Keeper"
          callback={() => {
            setConfirmPassVisible(true);
          }}
        />
        <OptionCard
          title="Show co-signer Details"
          description="Use this wallet as a co-signer with other vaults"
          callback={() => {
            navigation.navigate('CosignerDetails', { wallet });
          }}
        />
        <OptionCard
          title="Act as co-signer"
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
        {config.NETWORK_TYPE === NetworkType.TESTNET && (
          <OptionCard
            title="Receive Test Sats"
            description="Receive Test Sats to this address"
            callback={() => {
              setAppLoading(true);
              getTestSats();
            }}
          />
        )}
      </ScrollView>
      <Box style={styles.note}>
        <Note
          title="Note"
          subtitle="These settings are for your selected wallet only and does not affect other wallets"
          subtitleColor="GreyText"
        />
      </Box>
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
          <SeedConfirmPasscode
            closeBottomSheet={() => {
              setConfirmPassVisible(false);
            }}
            wallet={wallet}
            navigation={navigation}
          />
        )}
      />
      <KeeperModal
        visible={xpubVisible}
        close={() => setXPubVisible(false)}
        title="Wallet xPub"
        subTitleWidth={wp(240)}
        subTitle="Scan or copy the xPub in another app for generating new addresses and fetching balances"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        DarkCloseIcon={colorMode === 'dark'}
        Content={() => (
          <ShowXPub
            data={wallet?.specs?.xpub}
            copy={() => {
              setXPubVisible(false);
              showToast('Xpub Copied Successfully', <TickIcon />);
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
  note: {
    marginHorizontal: '5%',
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
