import React, { useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Box, Text, Pressable, ScrollView } from 'native-base';
import { useDispatch } from 'react-redux';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { CommonActions, useNavigation } from '@react-navigation/native';
// components and functions
import ShowXPub from 'src/components/XPub/ShowXPub';
import SeedConfirmPasscode from 'src/components/XPub/SeedConfirmPasscode';
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { wp, hp } from 'src/common/data/responsiveness/responsive';
import KeeperModal from 'src/components/KeeperModal';
import useToastMessage from 'src/hooks/useToastMessage';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { testSatsRecieve } from 'src/store/sagaActions/wallets';
import { useAppSelector } from 'src/store/hooks';
import { setTestCoinsFailed, setTestCoinsReceived } from 'src/store/reducers/wallets';
import { getAmount } from 'src/common/constants/Bitcoin';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { AppContext } from 'src/common/content/AppContext';
// icons
import Arrow from 'src/assets/images/svgs/icon_arrow_Wallet.svg';
import BackupIcon from 'src/assets/icons/backup.svg';
import TransferPolicy from 'src/components/XPub/TransferPolicy';
import TickIcon from 'src/assets/images/icon_tick.svg';
import Note from 'src/components/Note/Note';
import { LocalizationContext } from 'src/common/content/LocContext';
import { getCosignerDetails, signCosignerPSBT } from 'src/core/wallets/factories/WalletFactory';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';

type Props = {
  title: string;
  subTitle: string;
  onPress: () => void;
};

function Option({ title, subTitle, onPress }: Props) {
  return (
    <Pressable
      style={styles.optionContainer}
      onPress={onPress}
    >
      <Box style={{ width: '96%' }}>
        <Text
          color="light.lightBlack"
          style={styles.optionTitle}
        >
          {title}
        </Text>
        <Text
          color="light.GreyText"
          style={styles.optionSubtitle}
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

function WalletSettings({ route }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const { setAppLoading, setLoadingContent } = useContext(AppContext);

  const [xpubVisible, setXPubVisible] = useState(false);
  const [cosignerVisible, setCosignerVisible] = useState(false);

  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [transferPolicyVisible, setTransferPolicyVisible] = useState(false);
  const walletRoute: Wallet = route?.params?.wallet;
  const { useQuery } = useContext(RealmWrapperContext);
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet).map(getJSONFromRealmObject);
  const wallet = wallets.find((item) => item.id == walletRoute.id);
  const { testCoinsReceived, testCoinsFailed } = useAppSelector((state) => state.wallet);
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];

  const { translations } = useContext(LocalizationContext);
  const walletTranslation = translations.wallet;

  function WalletCard({ walletName, walletBalance, walletDescription }) {
    return (
      <Box
        bg={{
          linearGradient: {
            colors: ['light.lgStart', 'light.lgEnd'],
            start: [0, 0],
            end: [1, 1],
          },
        }}
        style={styles.walletCardContainer}
      >
        <Box style={styles.walletCard} >
          <Box>
            <Text color="light.white" style={styles.walletName}>
              {walletName}
            </Text>
            <Text color="light.white" style={styles.walletDescription}>
              {walletDescription}
            </Text>
          </Box>
          <Text color="light.white" style={styles.walletBalance}>
            {walletBalance}
          </Text>
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
      Alert.alert('5000 Sats Received');
      setTimeout(() => {
        dispatch(setTestCoinsReceived(false));
        navigation.goBack();
      }, 3000);
    } else if (testCoinsFailed) {
      Alert.alert('Process Failed');
      dispatch(setTestCoinsFailed(false));
    }
  }, [testCoinsReceived, testCoinsFailed]);

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
        },
      })
    );
  };

  return (
    <Box style={styles.Container} background="light.ReceiveBackground">
      <StatusBarComponent padding={50} />
      <Box>
        <HeaderTitle
          title="Wallet Settings"
          subtitle="Setting for the wallet only"
          onPressHandler={() => navigation.goBack()}
          headerTitleColor="light.textBlack"
          titleFontSize={20}
          paddingTop={hp(5)}
        />
      </Box>
      <Box
        style={{
          marginTop: hp(35),
          marginLeft: wp(25),
        }}
      >
        <WalletCard
          walletName={wallet.presentationData?.name}
          walletDescription={wallet?.presentationData?.description}
          walletBalance={getAmount(
            wallet?.specs?.balances.confirmed + wallet?.specs?.balances?.unconfirmed
          )}
        />
      </Box>
      <Box style={styles.optionsListContainer}>
        <ScrollView
          style={{
            marginBottom: hp(40)
          }}
          showsVerticalScrollIndicator={false}
        >
          <Option
            title="Wallet Details"
            subTitle="Change wallet name & description"
            onPress={() => {
              navigation.navigate('EditWalletDetails', { wallet });
            }}
          />
          <Option
            title="Show xPub"
            subTitle="Use to create a external watch-only wallet"
            onPress={() => {
              setXPubVisible(true);
            }}
          />
          <Option
            title="Show Cosigner Details"
            subTitle="Use this wallet as a signing device"
            onPress={() => {
              setCosignerVisible(true);
            }}
          />
          <Option
            title="Wallet seed words"
            subTitle="Use to link external wallets to Keeper"
            onPress={() => {
              setConfirmPassVisible(true);
            }}
          />
          <Option
            title="Transfer Policy"
            subTitle={`Secure to vault after ${wallet.specs.transferPolicy / 1e9} BTC`}
            onPress={() => {
              setTransferPolicyVisible(true);
            }}
          />

          <Option
            title="Receive Test Sats"
            subTitle="Receive Test Sats to this address"
            onPress={() => {
              setAppLoading(true);
              getTestSats();
            }}
          />

          <Option
            title="Sign PSBT"
            subTitle="Sign a transaction if this wallet has been used as a co-signer"
            onPress={() => {
              navigation.dispatch(
                CommonActions.navigate({
                  name: 'ScanQR',
                  params: {
                    title: `Scan PSBT to Sign`,
                    subtitle: 'Please scan until all the QR data has been retrieved',
                    onQrScan: signPSBT,
                  },
                })
              );
            }}
          />
        </ScrollView>
      </Box>

      {/* {Bottom note} */}
      <Box style={styles.note} backgroundColor={'light.ReceiveBackground'}>
        <Note
          title="Note"
          subtitle="These settings are for your selected wallet only and does not affect other wallets"
          subtitleColor="GreyText"
        />
      </Box>
      {/* Modals */}
      <Box>
        <KeeperModal
          visible={confirmPassVisible}
          close={() => setConfirmPassVisible(false)}
          title={walletTranslation.confirmPassTitle}
          subTitleWidth={wp(240)}
          subTitle={walletTranslation.confirmPassSubTitle}
          subTitleColor="#5F6965"
          modalBackground={['#F7F2EC', '#F7F2EC']}
          textColor="#041513"
          Content={() => (
            <SeedConfirmPasscode
              closeBottomSheet={() => {
                setConfirmPassVisible(false);
              }}
              wallets={wallets}
              navigation={navigation} />
          )}
        />
        <KeeperModal
          visible={xpubVisible}
          close={() => setXPubVisible(false)}
          title="Wallet xPub"
          subTitleWidth={wp(240)}
          subTitle="Scan or copy paste the xPub in another app for generating new addresses and fetching balances"
          subTitleColor="#5F6965"
          modalBackground={['#F7F2EC', '#F7F2EC']}
          textColor="#041513"
          Content={() => (
            <ShowXPub
              data={wallet.specs.xpub}
              copy={() => {
                showToast('Xpub Copied Successfully', <TickIcon />);
              }}
              subText={walletTranslation.AccountXpub}
              noteSubText={walletTranslation.AccountXpubNote}
            />
          )}
        />
        <KeeperModal
          visible={cosignerVisible}
          close={() => setCosignerVisible(false)}
          title="Cosigner Details"
          subTitleWidth={wp(240)}
          subTitle="Scan the cosigner details from another app in order to add this as a signer"
          subTitleColor="#5F6965"
          modalBackground={['#F7F2EC', '#F7F2EC']}
          textColor="#041513"
          Content={() => (
            <ShowXPub
              data={JSON.stringify(getCosignerDetails(wallet, keeper.appID))}
              copy={() => {
                showToast('Cosigner Details Copied Successfully', <TickIcon />);
              }}
              subText="Cosigner Details"
              noteSubText="The cosigner details are only for the selected wallet and not other wallets in the app"
              copyable={false}
            />
          )}
        />
        <KeeperModal
          visible={transferPolicyVisible}
          close={() => setTransferPolicyVisible(false)}
          title="Edit Transfer Policy"
          subTitle="Threshold amount at which transfer is triggered"
          subTitleColor="#5F6965"
          modalBackground={['#F7F2EC', '#F7F2EC']}
          textColor="#041513"
          Content={() => (
            <TransferPolicy wallet={wallet} close={() => setTransferPolicyVisible(false)} />
          )}
        />
      </Box>
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
    height: hp(75),
    position: 'relative',
    marginLeft: -wp(20),
    marginBottom: hp(0),
  },
  walletCard: {
    marginTop: hp(17),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: wp(20),
  },
  walletName: {
    letterSpacing: 0.28,
    fontSize: 15
  },
  walletDescription: {
    letterSpacing: 0.24,
    fontSize: 13,
    fontWeight: '300'
  },
  walletBalance: {
    letterSpacing: 1.2,
    fontSize: 23,
    padding: 5
  },
  optionsListContainer: {
    alignItems: "center",
    marginLeft: wp(25),
    marginTop: 10,
    height: hp(425)
  },
  optionContainer: {
    marginTop: hp(20),
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  optionTitle: {
    fontSize: RFValue(14),
    letterSpacing: 1.12
  },
  optionSubtitle: {
    fontSize: RFValue(12),
    letterSpacing: 0.6
  }
});
export default WalletSettings;
