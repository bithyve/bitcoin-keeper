import React, { useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Box, Text, Pressable, ScrollView } from 'native-base';
import { useDispatch } from 'react-redux';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { CommonActions, useNavigation } from '@react-navigation/native';
//components and functions
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
  Icon: boolean;
};

const Option = ({ title, subTitle, onPress, Icon }: Props) => {
  return (
    <Pressable
      flexDirection={'row'}
      alignItems={'center'}
      width={'100%'}
      style={{ marginTop: hp(20) }}
      onPress={onPress}
    >
      {Icon && (
        <Box w={'16%'}>
          <BackupIcon />
        </Box>
      )}
      <Box w={Icon ? '80%' : '96%'}>
        <Text color={'light.lightBlack'} fontSize={RFValue(14)} letterSpacing={1.12}>
          {title}
        </Text>
        <Text color={'light.GreyText'} fontSize={RFValue(12)} letterSpacing={0.6}>
          {subTitle}
        </Text>
      </Box>
      <Box w={'4%'}>
        <Arrow />
      </Box>
    </Pressable>
  );
};

const WalletSettings = ({ route }) => {
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
  const walletTranslation = translations['wallet'];

  const WalletCard = ({ walletName, walletBalance, walletDescription }) => {
    return (
      <Box
        bg={{
          linearGradient: {
            colors: ['light.lgStart', 'light.lgEnd'],
            start: [0, 0],
            end: [1, 1],
          },
        }}
        style={{
          borderRadius: hp(20),
          width: wp(320),
          height: hp(75),
          position: 'relative',
          marginLeft: -wp(20),
          marginBottom: hp(0),
        }}
      >
        <Box
          marginTop={hp(17)}
          flexDirection={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}
          style={{
            marginHorizontal: wp(20),
          }}
        >
          <Box>
            <Text color={'light.white'} letterSpacing={0.28} fontSize={RFValue(14)}>
              {walletName}
            </Text>
            <Text
              color={'light.white'}
              letterSpacing={0.24}
              fontSize={RFValue(12)}
              fontWeight={100}
            >
              {walletDescription}
            </Text>
          </Box>
          <Text color={'light.white'} letterSpacing={1.2} fontSize={hp(24)}>
            {walletBalance}
          </Text>
        </Box>
      </Box>
    );
  };

  const getTestSats = () => {
    dispatch(testSatsRecieve(wallet));
  };

  useEffect(() => {
    setLoadingContent({
      title: 'Please Wait',
      subtitle: 'Recieving test sats',
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
    } else {
      if (testCoinsFailed) {
        Alert.alert('Process Failed');
        dispatch(setTestCoinsFailed(false));
      }
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
    <Box style={styles.Container} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={50} />
      <Box>
        <HeaderTitle
          title={'Wallet Settings'}
          subtitle={'Setting for the wallet only'}
          onPressHandler={() => navigation.goBack()}
          headerTitleColor={'light.textBlack'}
          titleFontSize={20}
          paddingTop={hp(5)}
        />
      </Box>
      <Box
        marginTop={hp(40)}
        style={{
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
      <Box
        alignItems={'center'}
        style={{
          marginLeft: wp(25),
        }}
        height={hp(400)}
      >
        <ScrollView>
          <Option
            title={'Wallet Details'}
            subTitle={'Change wallet name & description'}
            onPress={() => {
              navigation.navigate('EditWalletDetails', { wallet: wallet });
            }}
            Icon={false}
          />
          <Option
            title={'Show xPub'}
            subTitle={'Use to create a external watch-only wallet'}
            onPress={() => {
              setXPubVisible(true);
            }}
            Icon={false}
          />
          <Option
            title={'Show Cosigner Details'}
            subTitle={'Use to create a signing device'}
            onPress={() => {
              setCosignerVisible(true);
            }}
            Icon={false}
          />
          <Option
            title={'Wallet seed words'}
            subTitle={'Use to link external wallets to Keeper'}
            onPress={() => {
              setConfirmPassVisible(true);
            }}
            Icon={false}
          />
          <Option
            title={'Transfer Policy'}
            subTitle={`Secure to vault after ${wallet.specs.transferPolicy / 1e9} BTC`}
            onPress={() => {
              setTransferPolicyVisible(true);
            }}
            Icon={false}
          />

          <Option
            title={'Receive Test Sats'}
            subTitle={'Recieve Test Sats to this address'}
            onPress={() => {
              setAppLoading(true);
              getTestSats();
            }}
            Icon={false}
          />

          <Option
            title={'Sign PSBT'}
            subTitle={'Lorem ipsum dolor sit amet, consectetur'}
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
            Icon={false}
          />
        </ScrollView>
      </Box>

      {/* {Bottom note} */}
      <Box
        style={{
          position: 'absolute',
          bottom: hp(30),
          marginLeft: 26,
          width: '90%',
        }}
      >
        <Note
          title={'Note'}
          subtitle={
            'These settings are for your Default Wallet only and does not affect other wallets'
          }
          subtitleColor={'GreyText'}
        />
      </Box>
      {/* Modals */}
      <Box>
        <ModalWrapper
          visible={confirmPassVisible}
          onSwipeComplete={() => setConfirmPassVisible(false)}
        >
          <SeedConfirmPasscode
            closeBottomSheet={() => {
              setConfirmPassVisible(false);
            }}
          />
        </ModalWrapper>
        <KeeperModal
          visible={xpubVisible}
          close={() => setXPubVisible(false)}
          title={'Wallet xPub'}
          subTitleWidth={wp(240)}
          subTitle={
            'Scan or copy paste the xPub in another app for generating new addresses and fetching balances'
          }
          subTitleColor={'#5F6965'}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          textColor={'#041513'}
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
          title={'Cosigner Details'}
          subTitleWidth={wp(240)}
          subTitle={'Scan the cosigner details from another app in order to add this as a signer'}
          subTitleColor={'#5F6965'}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          textColor={'#041513'}
          Content={() => (
            <ShowXPub
              data={JSON.stringify(getCosignerDetails(wallet, keeper.appID))}
              copy={() => {
                showToast('Cosigner Details Copied Successfully', <TickIcon />);
              }}
              subText={'Cosigner Details'}
              noteSubText={
                'The cosigner details are only for the selected wallet and not other wallets in the app'
              }
              copyable={false}
            />
          )}
        />
        <KeeperModal
          visible={transferPolicyVisible}
          close={() => setTransferPolicyVisible(false)}
          title={'Edit Transfer Policy'}
          subTitle={'Threshold amount at which transfer is triggered'}
          subTitleColor={'#5F6965'}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          textColor={'#041513'}
          Content={() => {
            return <TransferPolicy wallet={wallet} close={() => setTransferPolicyVisible(false)} />;
          }}
        />
      </Box>
      {/* end */}
    </Box>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
    position: 'relative',
  },
});
export default WalletSettings;
export { Option };
