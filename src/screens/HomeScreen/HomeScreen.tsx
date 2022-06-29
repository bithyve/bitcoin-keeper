import { Alert, FlatList, ImageBackground, TouchableOpacity } from 'react-native';
import {
  BACKUP_KEYS,
  WALLET,
  walletData,
  defaultBackupKeys,
  defaultWallets,
} from 'src/common/data/defaultData/defaultData';
import { Box, HStack, Text, View } from 'native-base';
import React, { useCallback, useEffect, useRef, useState, useContext } from 'react';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

import AddNewIcon from 'src/assets/images/svgs/add_key.svg';
import { CommonActions } from '@react-navigation/native';
// components
import DevicesComponent from 'src/screens/HomeScreen/DevicesComponent';
import DiamondIcon from 'src/assets/images/svgs/elite.svg';
import HomeCard from 'src/screens/HomeScreen/HomeCard';
import { QR_TYPES } from '../LoginScreen/constants';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import ScannerIcon from 'src/assets/images/svgs/scanner.svg';
import SecureHexa from 'src/screens/HomeScreen/SecureHexa';
import SettingIcon from 'src/assets/images/svgs/settings.svg';
import SuccessIcon from 'src/assets/images/checkboxfilled.svg';
// icons and images
import backgroundImage from 'src/assets/images/background.png';
import { getResponsiveHome } from 'src/common/data/responsiveness/responsive';
import { updateFCMTokens } from '../../store/sagaActions/notifications';
import messaging from '@react-native-firebase/messaging';
import { loginWithHexa } from 'src/store/sagaActions/wallets';
import { addToUaiStack } from 'src/store/sagaActions/uai';
import { uaiType } from 'src/common/data/models/interfaces/Uai';
import { useUaiStack } from 'src/hooks/useUaiStack';
import { MultiSigWallet, Wallet } from 'src/core/wallets/interfaces/wallet';
import { LocalizationContext } from 'src/common/content/LocContext';

type Props = {
  route: any | undefined;
  navigation: any;
};

const HomeScreen = ({ navigation, route }: Props) => {
  const secureHexaRef = useRef(null);
  const dispatch = useDispatch();

  const [parsedQRData, setParsedQRData] = useState(null);
  const [inheritanceReady, setInheritance] = useState<boolean>(false);
  const [backupKeys, setBackupKeys] = useState<BACKUP_KEYS[]>([
    ...defaultBackupKeys,
    {
      id: '58694a0f-3da1-471f-bd96-145571e2675679d72',
      title: 'Add',
      subtitle: 'New Key',
      Icon: AddNewIcon,
      onPress: () => dispatch(addToUaiStack('Cloud Back', false, uaiType.DISPLAY_MESSAGE, 10)),
    },
  ]);

  const wallets: (Wallet | MultiSigWallet)[] = useSelector(
    (state: RootStateOrAny) => state.wallet.wallets
  );
  const allWallets = [...defaultWallets, ...wallets, { isEnd: true }];

  const { translations } = useContext(LocalizationContext);
  const home = translations['home'];

  async function storeFCMToken() {
    const fcmToken = await messaging().getToken();
    dispatch(updateFCMTokens([fcmToken]));
  }
  useEffect(() => {
    if (route.params !== undefined) {
      setBackupKeys((prev) => {
        if (route.params?.id) {
          return [route.params, ...prev];
        } else {
          return prev;
        }
      });
    }
  }, [route?.params]);

  const renderBackupKeys = ({ item }) => {
    return <DevicesComponent title={item.title} onPress={item.onPress} Icon={item.Icon} />;
  };

  const renderWallets = ({ item, index }) => {
    return (
      <HomeCard
        Icon={walletData(item).Icon}
        type={walletData(item).type}
        name={walletData(item).name}
        description={walletData(item).description}
        balance={walletData(item).balance}
        isImported={item.isImported}
        isEnd={item?.isEnd}
        index={index}
      />
    );
  };

  const openInheritance = useCallback(() => {
    navigation.dispatch(
      CommonActions.navigate({ name: 'Inheritance', params: { setInheritance } })
    );
  }, []);

  const processQR = (qrData: string) => {
    try {
      const parsedData = JSON.parse(qrData.data);
      console.log('parsedData', parsedData);
      switch (parsedData.type) {
        case QR_TYPES.SECURE_WITH_HEXA:
          setParsedQRData(parsedData);
          secureHexaRef.current.expand();
          break;

        case QR_TYPES.LOGIN_WITH_HEXA:
          dispatch(loginWithHexa(parsedData.authToken, parsedData.walletName));
          break;

        default:
          throw new Error('Invalid QR');
      }
    } catch (err) {
      // Alert.alert('Device Imported', 'The keys have been backed up from your device successfully!');
    }
  };

  return (
    <View style={styles.Container} background={'light.lightYellow'}>
      <ImageBackground style={styles.backgroundImage} source={backgroundImage}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('QRscanner', {
                processQR,
              })
            }
          >
            <ScannerIcon />
          </TouchableOpacity>
          {inheritanceReady ? (
            <HStack alignItems={'center'}>
              <SuccessIcon />
              <Box
                bg="#F3EABF"
                px="2"
                borderRadius={'41'}
                _text={{ color: '#073E39', fontSize: 9, fontWeight: '300', letterSpacing: 0.6 }}
              >
                {home.InheritanceReady}
              </Box>
            </HStack>
          ) : null}
          <TouchableOpacity onPress={openInheritance}>
            <SettingIcon />
          </TouchableOpacity>
        </View>
        <View style={styles.eliteUserContentContainer}>
          <DiamondIcon />
          <View style={styles.eliteUserContainer} backgroundColor={'light.brown'}>
            <Text
              style={styles.eliteUserText}
              color={'light.lightBlack'}
              fontFamily={'body'}
              fontWeight={'300'}
            >
              {home.EliteUser}
            </Text>
          </View>
        </View>
        <View style={styles.userNameContainer}>
          <Text
            style={styles.helloText}
            color={'light.white'}
            fontFamily={'body'}
            fontWeight={'200'}
          >
            {home.Hello}
          </Text>
          <Text
            style={styles.helloText}
            color={'light.white'}
            fontFamily={'body'}
            fontWeight={'300'}
            fontStyle={'italic'}
          >
            {' '}
            Anant
          </Text>
        </View>
        <Text style={styles.loremText} color={'light.white'} fontFamily={'body'} fontWeight={'200'}>
          {home.Yourstacksafe}
        </Text>
      </ImageBackground>
      <Text
        style={styles.devicesText}
        color={'light.lightBlack'}
        fontFamily={'body'}
        fontWeight={'200'}
      >
        {backupKeys.length - 1} {home.BackupKey}
        {backupKeys.length - 1 > 1 && 's'}
      </Text>
      <Text
        style={styles.securingFundsText}
        color={'light.lightBlack'}
        fontFamily={'body'}
        fontWeight={'100'}
      >
        {home.Usedforsecuringfunds}
      </Text>
      <FlatList
        data={backupKeys}
        renderItem={renderBackupKeys}
        keyExtractor={(item) => item?.id}
        horizontal={true}
        style={styles.flatlistContainer}
        showsHorizontalScrollIndicator={false}
        ListFooterComponent={<View style={{ width: 40 }}></View>}
      />
      <Text
        style={styles.devicesText}
        color={'light.lightBlack'}
        fontFamily={'body'}
        fontWeight={'200'}
      >
        {allWallets?.length - 1} {home.wallet}
        {allWallets?.length - 1 > 1 && 's'}
      </Text>
      <Text
        style={styles.securingFundsText}
        color={'light.lightBlack'}
        fontFamily={'body'}
        fontWeight={'100'}
      >
        {home.Keepersecuringwallets}
      </Text>
      {allWallets?.length != 0 && (
        <FlatList
          data={allWallets}
          renderItem={renderWallets}
          keyExtractor={(item) => item.id}
          horizontal={true}
          style={styles.cardFlatlistContainer}
          showsHorizontalScrollIndicator={false}
          ListFooterComponent={<View style={{ width: 50 }}></View>}
        />
      )}

      <SecureHexa bottomSheetRef={secureHexaRef} secureData={parsedQRData} />
    </View>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: hp(getResponsiveHome().padingTop),
    paddingHorizontal: wp(10),
  },
  backgroundImage: {
    width: wp('100%'),
    height: hp(getResponsiveHome().height),
    marginTop: hp(getResponsiveHome().marginTop),
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helloText: {
    fontSize: RFValue(24),
    lineHeight: '24@s',
    letterSpacing: '0.7@s',
  },
  loremText: {
    fontSize: RFValue(12),
    lineHeight: '20@s',
    letterSpacing: '0.5@s',
    textAlign: 'center',
  },
  devicesText: {
    fontSize: RFValue(20),
    lineHeight: '27@s',
    letterSpacing: '0.5@s',
    marginLeft: wp(10),
  },
  securingFundsText: {
    fontSize: RFValue(12),
    lineHeight: '16@s',
    letterSpacing: '0.5@s',
    marginLeft: wp(10),
  },
  flatlistContainer: {
    flexGrow: 0,
    marginBottom: hp(4),
    marginTop: hp(3),
    paddingLeft: wp(10),
  },
  cardFlatlistContainer: {
    paddingLeft: wp(8),
  },
  eliteUserContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(8),
    marginBottom: hp(1.3),
  },
  eliteUserContainer: {
    paddingHorizontal: wp(1.5),
    borderRadius: '20@s',
    height: hp(1.7),
    marginLeft: wp(1),
  },
  eliteUserText: {
    fontSize: RFValue(8),
    lineHeight: '12@s',
    letterSpacing: '0.5@s',
  },
});

export default HomeScreen;
