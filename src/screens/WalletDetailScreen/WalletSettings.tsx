import React, { useContext, useEffect, useState } from 'react';
import Text from 'src/components/KeeperText';
import { Box, Pressable, ScrollView, useColorMode } from 'native-base';
import { useDispatch } from 'react-redux';
import { ScaledSheet } from 'react-native-size-matters';
import { CommonActions, useNavigation } from '@react-navigation/native';
import ShowXPub from 'src/components/XPub/ShowXPub';
import SeedConfirmPasscode from 'src/components/XPub/SeedConfirmPasscode';
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { wp, hp } from 'src/common/data/responsiveness/responsive';
import KeeperModal from 'src/components/KeeperModal';
import useToastMessage from 'src/hooks/useToastMessage';
import { testSatsRecieve } from 'src/store/sagaActions/wallets';
import { useAppSelector } from 'src/store/hooks';
import { setTestCoinsFailed, setTestCoinsReceived } from 'src/store/reducers/wallets';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { AppContext } from 'src/common/content/AppContext';
import { LocalizationContext } from 'src/common/content/LocContext';
import { signCosignerPSBT } from 'src/core/wallets/factories/WalletFactory';
import Note from 'src/components/Note/Note';
import Arrow from 'src/assets/images/icon_arrow_Wallet.svg';
import TransferPolicy from 'src/components/XPub/TransferPolicy';
import TickIcon from 'src/assets/images/icon_tick.svg';
import config from 'src/core/config';
import { NetworkType, SignerType } from 'src/core/wallets/enums';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import BtcWallet from 'src/assets/images/btc_walletCard.svg';
import useWallets from 'src/hooks/useWallets';
import { getAmt, getCurrencyImageByRegion } from 'src/common/constants/Bitcoin';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import KeeperSetup from 'src/assets/images/illustration_ksd.svg';
import useCollaborativeWallet from 'src/hooks/useCollaborativeWallet';

type Props = {
  title: string;
  subTitle: string;
  onPress: () => void;
};

function Option({ title, subTitle, onPress }: Props) {
  const { colorMode } = useColorMode();
  return (
    <Pressable
      style={styles.optionContainer}
      onPress={onPress}
      testID={`btn_${title.replace(/ /g, '_')}`}
    >
      <Box style={{ width: '96%' }}>
        <Text
          color={`${colorMode}.primaryText`}
          style={styles.optionTitle}
          testID={`text_${title.replace(/ /g, '_')}`}
        >
          {title}
        </Text>
        <Text
          color={`${colorMode}.GreyText`}
          style={styles.optionSubtitle}
          numberOfLines={2}
          testID={`text_${subTitle.replace(/ /g, '_')}`}
        >
          {subTitle}
        </Text>
      </Box>
      <Box style={{ width: '4%' }}>
        <Arrow />
      </Box>
    </Pressable>
  );
}

function CollabrativeModalContent({
  navigation,
  wallet,
  setCollaborativeModalVisible,
  signPSBT,
}: any) {
  return (
    <Box>
      <Box>
        <Option
          title="View CoSigner Details"
          subTitle="To create a collaborative wallet"
          onPress={() => {
            setCollaborativeModalVisible(false);
            navigation.dispatch(CommonActions.navigate('CosignerDetails', { wallet }));
          }}
        />
        <Option
          title="Import Output Descriptor"
          subTitle="To view collaborative wallet"
          onPress={() => {
            setCollaborativeModalVisible(false);
            navigation.dispatch(
              CommonActions.navigate('ImportDescriptorScreen', { walletId: wallet.id })
            );
          }}
        />
        <Option
          title="Sign a PSBT"
          subTitle="Sign a collaborative transaction"
          onPress={() => {
            navigation.dispatch(
              CommonActions.navigate({
                name: 'ScanQR',
                params: {
                  title: `Scan PSBT to Sign`,
                  subtitle: 'Please scan until all the QR data has been retrieved',
                  onQrScan: signPSBT,
                  type: SignerType.KEEPER,
                },
              })
            );
          }}
        />
      </Box>
    </Box>
  );
}

function WalletSettings({ route }) {
  const { colorMode } = useColorMode();
  const { wallet: walletRoute, editPolicy = false } = route.params || {};
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const { setAppLoading, setLoadingContent } = useContext(AppContext);
  const [xpubVisible, setXPubVisible] = useState(false);
  const [cosignerVisible, setCosignerVisible] = useState(false);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [transferPolicyVisible, setTransferPolicyVisible] = useState(editPolicy);
  const [collaborativeModalVisible, setCollaborativeModalVisible] = useState(false);

  const [addWalletCosigner, setAddWalletCosignerVisible] = useState(editPolicy);
  const { useQuery } = useContext(RealmWrapperContext);
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
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
      <Box variant="linearGradient" style={styles.walletCardContainer}>
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

  function AddWalletCosignerContent() {
    return (
      <Box>
        <Box m={5}>
          <KeeperSetup />
        </Box>
        <Text color="light.greenText" fontSize={13}>
          {walletTranslation?.AddWalletCosignerParagraph}
        </Text>
      </Box>
    );
  }

  // const { collaborativeWallet } = useCollaborativeWallet(wallet.id);

  // const collaborativeWalletCheck = () => {
  //   if (collaborativeWallet) {
  //     navigation.dispatch(
  //       CommonActions.navigate('VaultDetails', { walletId: wallet.id, isCollaborativeWallet: true })
  //     );
  //   } else {
  //     setCollaborativeModalVisible(true);
  //   }
  // };

  const signPSBT = (serializedPSBT) => {
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
  };

  return (
    <Box style={styles.Container} background={`${colorMode}.primaryBackground`}>
      <StatusBarComponent padding={50} />
      <Box>
        <HeaderTitle
          title="Wallet Settings"
          subtitle="Setting for the wallet only"
          onPressHandler={() => navigation.goBack()}
          headerTitleColor={`${colorMode}.black`}
          titleFontSize={20}
          paddingTop={hp(5)}
          paddingLeft={20}
        />
      </Box>
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
      <Box style={styles.optionsListContainer}>
        <ScrollView
          style={{
            marginBottom: hp(40),
          }}
          showsVerticalScrollIndicator={false}
        >
          <Option
            title="Wallet Details"
            subTitle="Change wallet name & description"
            onPress={() => {
              navigation.navigate('WalletDetailsSettings', { wallet });
            }}
          />
          <Option
            title="Wallet Seed Words"
            subTitle="Use to link external wallets to Keeper"
            onPress={() => {
              setConfirmPassVisible(true);
            }}
          />
          {/* <Option
            title="Collaborative Wallet"
            subTitle="Create, sign and view multisig"
            onPress={collaborativeWalletCheck}
          /> */}
          {config.NETWORK_TYPE === NetworkType.TESTNET && (
            <Option
              title="Receive Test Sats"
              subTitle="Receive Test Sats to this address"
              onPress={() => {
                setAppLoading(true);
                getTestSats();
              }}
            />
          )}
        </ScrollView>
      </Box>
      {/* {Bottom note} */}
      <Box style={styles.note} backgroundColor={`${colorMode}.primaryBackground`}>
        <Note
          title="Note"
          subtitle="These settings are for your selected wallet only and does not affect other wallets"
          subtitleColor="GreyText"
        />
      </Box>
      <Box>
        <KeeperModal
          visible={confirmPassVisible}
          close={() => setConfirmPassVisible(false)}
          title={walletTranslation?.confirmPassTitle}
          subTitleWidth={wp(240)}
          subTitle={walletTranslation?.confirmPassSubTitle}
          modalBackground={[
            `${colorMode}.modalWhiteBackground`,
            `${colorMode}.modalWhiteBackground`,
          ]}
          subTitleColor={`${colorMode}.secondaryText`}
          textColor={`${colorMode}.primaryText`}
          // eslint-disable-next-line react/no-unstable-nested-components
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
          modalBackground={[
            `${colorMode}.modalWhiteBackground`,
            `${colorMode}.modalWhiteBackground`,
          ]}
          subTitleColor={`${colorMode}.secondaryText`}
          textColor={`${colorMode}.primaryText`}
          // eslint-disable-next-line react/no-unstable-nested-components
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
        <KeeperModal
          visible={cosignerVisible}
          close={() => setCosignerVisible(false)}
          title="Cosigner Details"
          subTitleWidth={wp(260)}
          subTitle="Scan the cosigner details from another app in order to add this as a signer"
          modalBackground={[
            `${colorMode}.modalWhiteBackground`,
            `${colorMode}.modalWhiteBackground`,
          ]}
          subTitleColor={`${colorMode}.secondaryText`}
          textColor={`${colorMode}.primaryText`}
          buttonText="Done"
          buttonCallback={() => {
            setCosignerVisible(false);
            // setAddWalletCosignerVisible(true)
          }}
          Content={() => (
            <ShowXPub
              data=""
              wallet={wallet}
              cosignerDetails
              copy={() => showToast('Cosigner Details Copied Successfully', <TickIcon />)}
              subText="Cosigner Details"
              noteSubText="The cosigner details are for the selected wallet only"
              copyable={false}
              keeper={keeper}
            />
          )}
        />
        <KeeperModal
          visible={transferPolicyVisible}
          close={() => {
            setTransferPolicyVisible(false);
          }}
          title="Edit Transfer Policy"
          subTitle="Threshold amount at which transfer is triggered"
          modalBackground={[
            `${colorMode}.modalWhiteBackground`,
            `${colorMode}.modalWhiteBackground`,
          ]}
          subTitleColor={`${colorMode}.secondaryText`}
          textColor={`${colorMode}.primaryText`}
          DarkCloseIcon={colorMode === 'dark'}
          Content={() => (
            <TransferPolicy
              wallet={wallet}
              close={() => {
                showToast('Transfer Policy Changed', <TickIcon />);
                setTransferPolicyVisible(false);
              }}
              secondaryBtnPress={() => {
                setTransferPolicyVisible(false);
              }}
            />
          )}
        />
        <KeeperModal
          visible={addWalletCosigner}
          close={() => setAddWalletCosignerVisible(false)}
          title={walletTranslation?.AddWalletCosigner}
          subTitleWidth={wp(240)}
          subTitle={walletTranslation?.AddWalletCosignerSubTitle}
          subTitleColor="light.secondaryText"
          textColor="light.primaryText"
          buttonText="Confirm"
          buttonCallback={() => setAddWalletCosignerVisible(false)}
          showButtons
          secondaryButtonText="Decline"
          Content={AddWalletCosignerContent}
        />
      </Box>

      {/* <KeeperModal
        visible={collaborativeModalVisible}
        close={() => {
          setCollaborativeModalVisible(false);
        }}
        title="No Collaborative Wallet Created"
        subTitle="Import a product descriptor or BSMS file to view a collaborative wallet"
        Content={() => (
          <CollabrativeModalContent
            navigation={navigation}
            wallet={wallet}
            setCollaborativeModalVisible={setCollaborativeModalVisible}
            signPSBT={signPSBT}
          />
        )}
      /> */}
      {/* end */}
    </Box>
  );
}

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  note: {
    position: 'absolute',
    bottom: hp(35),
    marginLeft: 26,
    width: '90%',
    paddingTop: hp(10),
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
    fontWeight: '300',
  },
  walletBalance: {
    letterSpacing: 1.2,
    fontSize: 23,
    padding: 5,
  },
  optionsListContainer: {
    alignItems: 'center',
    marginLeft: wp(25),
    marginTop: 10,
    height: hp(425),
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
