import React, { useContext, useEffect, useState } from 'react';
import { Box, Text, ScrollView, StatusBar, Pressable } from 'native-base';
import { SafeAreaView, TouchableOpacity, Platform, View } from 'react-native';
import BackIcon from 'src/assets/icons/back.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import { LocalizationContext } from 'src/common/content/LocContext';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setupKeeperApp, SETUP_KEEPER_APP } from 'src/store/sagaActions/storage';
import { useAppSelector } from 'src/store/hooks';
import { wp, hp } from 'src/common/data/responsiveness/responsive';
import { getAppImage } from 'src/store/sagaActions/bhr';
import ArrowIcon from 'src/assets/images/svgs/icon_arrow.svg';
import App from 'src/assets/images/svgs/app.svg';
import Recover from 'src/assets/images/svgs/recover.svg';
import Inheritance from 'src/assets/images/svgs/inheritanceKeeper.svg';
import KeeperModal from 'src/components/KeeperModal';
import PasswordModal from 'src/components/PasswordModal';
import GoogleDrive from 'src/assets/images/drive.svg';
import ICloud from 'src/assets/images/icloud.svg';

const Tile = ({ title, subTitle, onPress, Icon }) => {
  return (
    <Pressable
      onPress={onPress}
      backgroundColor={'light.lightYellow'}
      flexDirection={'row'}
      alignItems={'center'}
      width={'90%'}
      style={{ marginTop: hp(10) }}
      marginLeft={'5%'}
    >
      <Box style={{ marginLeft: wp(20) }}>{Icon}</Box>
      <Box
        backgroundColor={'light.lightYellow'}
        style={{
          paddingVertical: hp(20),
          paddingLeft: wp(24),
          borderRadius: hp(10),
          width: wp(250),
        }}
      >
        <Text
          color={'light.lightBlack'}
          fontFamily={'body'}
          fontWeight={200}
          fontSize={RFValue(13)}
          letterSpacing={0.65}
          width={wp(233)}
        >
          {title}
        </Text>
        <Text
          color={'light.GreyText'}
          fontFamily={'body'}
          fontWeight={200}
          fontSize={RFValue(12)}
          letterSpacing={0.6}
          width={wp(240)}
          marginTop={hp(5)}
        >
          {subTitle}
        </Text>
      </Box>
      <ArrowIcon />
    </Pressable>
  );
};

const NewKeeperApp = ({ navigation }: { navigation }) => {
  const { translations } = useContext(LocalizationContext);
  const inheritence = translations['inheritence'];
  const seed = translations['seed'];

  const [cloudModal, setCloudModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const dispatch = useDispatch();

  const passwordScreen = () => {
    setCloudModal(false);
    setPasswordModal(true);
  };

  const closePassword = () => {
    setPasswordModal(false);
  };

  const closeCloudModal = () => setCloudModal(false);

  const RecoverWalletScreen = () => {
    const IconName = Platform.OS == 'ios' ? <ICloud /> : <GoogleDrive />;

    return (
      <View>
        <View style={{ backgroundColor: '#FDF7F0', marginVertical: 20 }}>
          <Box flexDirection={'row'} marginY={5} alignSelf={'center'}>
            {IconName}
            <Text color={'#4F5955'} marginLeft={5} marginTop={1}>
              dastanp@gmail.com
            </Text>
          </Box>
          <Box flexDirection={'row'} justifyContent={'space-between'}>
            <View>
              <Text fontSize={12} color={'#4F5955'}>
                Folder: Blue Wallet Backup
              </Text>
              <Text fontSize={12} color={'#4F5955'}>
                Pro Tier Backup
              </Text>
            </View>
            <View>
              <Text fontSize={12} color={'#4F5955'}>
                Backed Up
              </Text>
              <Text fontSize={12} color={'#4F5955'}>
                July 15, 2021
              </Text>
            </View>
          </Box>
        </View>
        <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'200'} p={2}>
          {'Lorem ipsum dolor sit amet, consectetur adipiscing elit, iqua'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: 'light.ReceiveBackground',
      }}
    >
      <StatusBar backgroundColor={'light.ReceiveBackground'} barStyle="dark-content" />
      <ScrollView>
        <Box mx={10} my={10}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackIcon />
          </TouchableOpacity>
        </Box>
        <Box mx={3}>
          <Text
            color={'light.blackHeaderText'}
            fontSize={RFValue(20)}
            fontFamily={'heading'}
            pl={10}
          >
            New Keeper App
          </Text>
          <Text color={'light.blackHeaderText'} fontSize={RFValue(12)} fontFamily={'body'} pl={10}>
            Use this option if you want to create a new Keeper app
          </Text>
          <Tile
            title={'Start New'}
            subTitle={'New Vault and Wallets'}
            Icon={<App />}
            onPress={() => {
              dispatch(setupKeeperApp());
              // navigation.replace('App');
              navigation.dispatch(CommonActions.navigate('NewHome'));
            }}
          />
          <Text
            color={'light.blackHeaderText'}
            fontSize={RFValue(20)}
            style={{ marginTop: 50 }}
            fontFamily={'heading'}
            pl={10}
          >
            Exsisting Keeper App
          </Text>
          <Text color={'light.blackHeaderText'} fontSize={RFValue(12)} fontFamily={'body'} pl={10}>
            If you previously had a Keeper wallet you can recover it
          </Text>
          <Tile
            title={'Recover for myself'}
            subTitle={'Using Cloud'}
            Icon={<Recover />}
            onPress={() => setCloudModal(true)}
          />
          <Tile
            title={'Recover for myself'}
            subTitle={'Using Seed'}
            Icon={<Recover />}
            onPress={() => {
              navigation.navigate('LoginStack', { screen: 'EnterSeedScreen' });
            }}
          />
          <Tile
            title={'Inheritance Keeper Vault'}
            subTitle={'Using Signing Devices'}
            onPress={() => console.log('using Signing Devices')}
            Icon={<Inheritance />}
          />
          {/* <TouchableOpacity
            onPress={() => {
              dispatch(setupKeeperApp());
              navigation.replace('App');
            }}
          >
            <Text>New App</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text>Backup From Seed</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text>Backup From Cloud</Text>
          </TouchableOpacity> */}
        </Box>
      </ScrollView>
      <KeeperModal
        visible={cloudModal}
        close={closeCloudModal}
        title={Platform.OS == 'ios' ? 'Recover wallet from iCloud' : 'Recover wallet from Drive'}
        subTitle={seed.seedDescription}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Next'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={passwordScreen}
        textColor={'#041513'}
        Content={RecoverWalletScreen}
      />
      <PasswordModal
        visible={passwordModal}
        closePasswordModal={closePassword}
        title={'Confirm Password'}
        subTitle={seed.seedDescription}
        dscription={seed.seedDescription}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Next'}
        buttonTextColor={'#FAFAFA'}
        textColor={'#041513'}
      />
    </SafeAreaView>
  );
};
export default NewKeeperApp;
