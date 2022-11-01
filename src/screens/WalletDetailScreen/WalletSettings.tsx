import React, { useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Box, Text, Pressable, ScrollView } from 'native-base';
import { useDispatch } from 'react-redux';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
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
// icons
import Arrow from 'src/assets/images/svgs/icon_arrow_Wallet.svg';
import BackupIcon from 'src/assets/icons/backup.svg';
import TransferPolicy from 'src/components/XPub/TransferPolicy';
import TickIcon from 'src/assets/images/icon_tick.svg';
import Note from 'src/components/Note/Note';

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
      style={{ marginVertical: hp(15) }}
      onPress={onPress}
    >
      {Icon && (
        <Box w={'16%'}>
          <BackupIcon />
        </Box>
      )}
      <Box w={Icon ? '80%' : '96%'}>
        <Text
          color={'light.lightBlack'}
          fontFamily={'body'}
          fontWeight={200}
          fontSize={RFValue(14)}
          letterSpacing={1.12}
        >
          {title}
        </Text>
        <Text
          color={'light.GreyText'}
          fontFamily={'body'}
          fontWeight={200}
          fontSize={RFValue(12)}
          letterSpacing={0.6}
        >
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
  const navigtaion = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();

  const [xpubVisible, setXPubVisible] = useState(false);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [transferPolicyVisible, setTransferPolicyVisible] = useState(false);
  const walletRoute: Wallet = route?.params?.wallet;
  const { useQuery } = useContext(RealmWrapperContext);
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet).map(getJSONFromRealmObject);
  const wallet = wallets.find((item) => item.id == walletRoute.id);
  const { testCoinsReceived, testCoinsFailed } = useAppSelector((state) => state.wallet);

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
          marginBottom: hp(30),
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
            <Text
              color={'light.white'}
              letterSpacing={0.28}
              fontSize={RFValue(14)}
              fontWeight={200}
            >
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
          <Text color={'light.white'} letterSpacing={1.2} fontSize={hp(24)} fontWeight={200}>
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
    if (testCoinsReceived) {
      Alert.alert('5000 Sats Received');
      setTimeout(() => {
        dispatch(setTestCoinsReceived(false));
        navigtaion.goBack();
      }, 3000);
    } else {
      if (testCoinsFailed) {
        Alert.alert('Process Failed');
        dispatch(setTestCoinsFailed(false));
      }
    }
  }, [testCoinsReceived, testCoinsFailed]);

  return (
    <Box style={styles.Container} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={50} />
      <Box>
        <HeaderTitle
          title={'Wallet Settings'}
          subtitle={'Setting for the wallet only'}
          onPressHandler={() => navigtaion.goBack()}
          headerTitleColor={'light.textBlack'}
          titleFontSize={20}
          paddingTop={hp(5)}
        />
      </Box>
      <Box
        borderBottomColor={'light.divider'}
        borderBottomWidth={0.2}
        marginTop={hp(60)}
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
        {/* <Option
          title={'Wallet Backup'}
          subTitle={'Setup backup for Wallet'}
          onPress={() => {
            navigtaion.navigate('BackupWallet');
          }}
          Icon={true}
        /> */}
      </Box>
      <Box
        alignItems={'center'}
        style={{
          marginLeft: wp(25),
        }}
        height={hp(350)}
      >
        <ScrollView>
          <Option
            title={'Wallet Details'}
            subTitle={'Change wallet name & description'}
            onPress={() => {
              navigtaion.navigate('EditWalletDetails', { wallet: wallet });
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
              getTestSats();
            }}
            Icon={false}
          />
        </ScrollView>
      </Box>

      {/* {Bottom note} */}
      <Box position={'absolute'} bottom={hp(45)} marginX={5} w={'90%'}>
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
              copy={() => {
                showToast('Address Copied Successfully', <TickIcon />);
              }}
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
