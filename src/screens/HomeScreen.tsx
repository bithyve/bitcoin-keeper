import React, { useEffect, useState } from 'react';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { View, Text, HStack, Box } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { ImageBackground, FlatList, TouchableOpacity, Dimensions, Alert, Platform } from 'react-native';
import { CommonActions } from '@react-navigation/native';

import DevicesComponent from 'src/components/DevicesComponent';
import HomeCard from 'src/components/HomeCard';
import { setupWallet } from 'src/store/actions/storage';
import { loginWithHexa } from 'src/store/actions/accounts';
import { QR_TYPES } from './LoginScreen/constants';
import SecureHexa from 'src/components/SecureHexa';

import backgroundImage from 'src/assets/images/background.png';
import ScannerIcon from 'src/assets/images/svgs/scanner.svg';
import SettingIcon from 'src/assets/images/svgs/settings.svg';
import DiamondIcon from 'src/assets/images/svgs/elite.svg';
import AddNewIcon from 'src/assets/images/svgs/add_key.svg';
import SingleSigIcon from 'src/assets/images/svgs/single_sig.svg';
import ColdCardIcon from 'src/assets/images/svgs/coldcard_tile.svg';
import LaptopIcon from 'src/assets/images/svgs/laptop_tile.svg';
import PdfIcon from 'src/assets/images/svgs/pdf_tile.svg';
import SuccessIcon from 'src/assets/images/checkboxfilled.svg';
import BlueWalletIcon from 'src/assets/images/svgs/blue_wallet.svg';
import MultiSigIcon from 'src/assets/images/svgs/multi_sig.svg';
import BlockChainHomeIcon from 'src/assets/images/blockchainHome.svg';

const windowHeight = Dimensions.get('window').height;
console.log(windowHeight);
const getResponsive = () => {
  if (windowHeight >= 850) {
    return {
      padingTop: 7,
      marginTop: 0,
      height: 35,
    };
  } else if (windowHeight >= 750) {
    return {
      padingTop: 10,
      marginTop: -2,
      height: 38,
    };
  } else if (windowHeight >= 650 && Platform.OS == 'android') {
    return {
      padingTop: 10,
      marginTop: 0,
      height: 42,
    };
  } else if (windowHeight >= 650) {
    return {
      padingTop: 14,
      marginTop: -8,
      height: 42,
    };
  } else {
    return {
      padingTop: 16,
      marginTop: -9,
      height: 44,
    };
  }
};

// const DATATWO = [
//   {
//     id: 'bd7acbea-c1b1-46c2-aed5-3ad53a56bb28ba',
//     titles: 'First Item',
//     Childern: SingleSigIcon,
//     icontitle: 'Single-sig',
//   },
//   {
//     id: '3ac68afc-c605-48d3-a4f8-fbd91aa67897f63',
//     titles: 'Second Item',
//     Childern: BlueWalletIcon,
//     icontitle: 'Blue Wallet',
//   },
//   {
//     id: '58694a0f-3da1-471f-bd96-145571e6729d72',
//     titles: 'Third Item',
//     Childern: MultiSigIcon,
//     icontitle: 'Multi Sig',
//   },
//   {
//     id: '58694a0f-3da1-471f-bd96-14557677891e29d72',
//     titles: 'four Item',
//     Childern: LaptopIcon,
//     last: 'true',
//   },
// ];

// const DATA = [
//   {
//     id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
//     title: 'Arika’s',
//     subtitle: 'iPhone 12',
//     Icon: MobileIcon,
//     onPress: () => { }
//   },
//   {
//     id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
//     title: 'Personal ',
//     subtitle: 'iMac',
//     Icon: LaptopIcon,
//     onPress: () => { }
//   },
//   {
//     id: '58694a0f-3da1-471f-bd96-145571e29d72',
//     title: 'Cold Card ',
//     subtitle: 'Wallet',
//     Icon: ColdCardIcon,
//     onPress: () => { }
//   },
//   {
//     id: '58694a0f-3da1-471f-bd96-14557671e29d72',
//     title: 'Home',
//     subtitle: 'iPad',
//     Icon: IPardIcon,
//     onPress: () => { }
//   },
//   {
//     id: '58694a0f-3da1-471f-bd96-145571e2679d72',
//     title: 'Arika’s',
//     subtitle: 'PDF',
//     Icon: PdfIcon,
//     onPress: () => { }
//   },
//   {
//     id: '58694a0f-3da1-471f-bd96-145571e2675679d72',
//     title: 'Add',
//     subtitle: 'New Key',
//     Icon: AddNewIcon,
//     onPress: () => navigation.navigate('Backup')
//   },
// ];

const HomeScreen = ({ navigation, route }) => {
  const secureHexaRef = React.useRef(null);
  const [parsedQRData, setParsedQRData] = useState(null);
  const [inheritanceReady, setInheritance] = useState(false);

  const wallet = useSelector((state: RootStateOrAny) => state.storage.wallet);
  const allAccounts = [
    {
      Icon: SingleSigIcon,
      type: 'Single-sig',
      name: 'Maldives Funds',
      description: 'Beach and Sunshine baby!',
      isImported: false,
      balance: 0.000024,
    },
    {
      Icon: BlockChainHomeIcon,
      type: 'Blockchain.com Wallet',
      name: 'Investment Funds',
      description: 'Rainy day umbrella',
      isImported: true,
      balance: 0.000389,
    },
    ...useSelector((state: RootStateOrAny) => state.accounts.accountShells),
    { isEnd: true },
  ];
  const rehydrated = useSelector((state: RootStateOrAny) => state._persist.rehydrated);
  const dispatch = useDispatch();
  const [backupKeys, setBackupKeys] = useState([
    {
      id: '58694a0f-3da1-471f-bd96-14557114225679d72',
      title: 'Cold Card',
      Icon: ColdCardIcon,
    },
    {
      id: '58694a0f-3da1-471f-da34-145571e26ad5679d72',
      title: `Arika's MacBook`,
      Icon: LaptopIcon,
    },
    {
      id: '58694a0f-vc12-471f-1211-145571e26732179d72',
      title: `PDF on DropBox`,
      subtitle: 'New Key',
      Icon: PdfIcon,
    },
    {
      id: '58694a0f-3da1-471f-bd96-145571e2675679d72',
      title: 'Add',
      subtitle: 'New Key',
      Icon: AddNewIcon,
      onPress: () => navigation.navigate('Backup'),
    },
  ]);

  useEffect(() => {
    if (!wallet && rehydrated) {
      // await redux persist's rehydration
      setTimeout(() => {
        dispatch(setupWallet());
      }, 1000);
    }
  }, [wallet, rehydrated]);

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

  const renderItem = ({ item }) => {
    return (
      <DevicesComponent
        title={item.title}
        onPress={item.onPress}
        subtitle={item.subtitle}
        Icon={item.Icon}
      />
    );
  };
  const renderItemTwo = ({ item, index }) => {
    if (item?.primarySubAccount?.defaultTitle === 'Full Import') {
      return (
        <HomeCard
          Icon={BlueWalletIcon}
          type={'Blue Wallet'}
          name={'Imported Wallet'}
          description={'Daily Spends'}
          balance={
            item?.primarySubAccount?.balances?.confirmed +
            item?.primarySubAccount?.balances?.unconfirmed
          }
          isImported={true}
          isEnd={item?.isEnd}
          index={index}
        />
      );
    } else if (item?.primarySubAccount?.defaultTitle === 'Checking Account') {
      return (
        <HomeCard
          Icon={SingleSigIcon}
          type={'Single-sig'}
          name={item?.primarySubAccount?.customDisplayName}
          description={item?.primarySubAccount?.customDescription}
          balance={
            item?.primarySubAccount?.balances?.confirmed +
            item?.primarySubAccount?.balances?.unconfirmed
          }
          isImported={false}
          isEnd={item?.isEnd}
          index={index}
        />
      );
    }
    return (
      <HomeCard
        Icon={item.Icon}
        type={item.type}
        name={item.name}
        description={item.description}
        balance={item.balance}
        isImported={item.isImported}
        isEnd={item?.isEnd}
        index={index}
      />
    );
  };
  const openInheritance = React.useCallback(() => {
    navigation.dispatch(
      CommonActions.navigate({ name: 'Inheritance', params: { setInheritance } })
    );
  }, []);

  const processQR = (qrData: string) => {
    console.log('qrData', qrData.data);

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
      Alert.alert('Device Imported', 'The keys have been backed up from your device successfully!');
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
                Inheritance Ready
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
              Elite User
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
            Hello,
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
        <Text style={styles.loremText} color={'light.white'} fontFamily={'body'} fontWeight={'100'}>
          Your stack is safe
        </Text>
      </ImageBackground>
      <Text
        style={styles.devicesText}
        color={'light.lightBlack'}
        fontFamily={'body'}
        fontWeight={'200'}
      >
        {backupKeys.length - 1} Backup Key{backupKeys.length - 1 > 1 && 's'}
      </Text>
      <Text
        style={styles.securingFundsText}
        color={'light.lightBlack'}
        fontFamily={'body'}
        fontWeight={'100'}
      >
        Used for securing funds
      </Text>
      <FlatList
        data={backupKeys}
        renderItem={renderItem}
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
        {allAccounts.length - 1} Wallet{allAccounts.length - 1 > 1 && 's'}
      </Text>
      <Text
        style={styles.securingFundsText}
        color={'light.lightBlack'}
        fontFamily={'body'}
        fontWeight={'100'}
      >
        Keeper is securing these wallets
      </Text>
      {allAccounts.length != 0 && (
        <FlatList
          data={allAccounts}
          renderItem={renderItemTwo}
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
    paddingTop: hp(getResponsive().padingTop),
    paddingHorizontal: wp(10),
  },
  backgroundImage: {
    width: wp('100%'),
    height: hp(getResponsive().height),
    marginTop: hp(getResponsive().marginTop),
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
