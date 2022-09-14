import React, { useContext, useEffect, useState } from 'react';
import { Box, Text, ScrollView, StatusBar, Pressable } from 'native-base';
import { SafeAreaView, TouchableOpacity, Platform, View } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { LocalizationContext } from 'src/common/content/LocContext';
import { setupKeeperApp, SETUP_KEEPER_APP } from 'src/store/sagaActions/storage';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { wp, hp } from 'src/common/data/responsiveness/responsive';
import { getCloudData, recoverBackup } from 'src/store/sagaActions/bhr';
import ArrowIcon from 'src/assets/images/svgs/icon_arrow.svg';
import App from 'src/assets/images/svgs/app.svg';
import Recover from 'src/assets/images/svgs/recover.svg';
import Inheritance from 'src/assets/images/svgs/inheritanceKeeper.svg';
import KeeperModal from 'src/components/KeeperModal';
import PasswordModal from 'src/components/PasswordModal';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import CreateCloudBackup from 'src/components/CloudBackup/CreateCloudBackup';
import useToastMessage from 'src/hooks/useToastMessage';
import CloudRecoveryModal from 'src/components/CloudRecoveryModal';

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
  const dispatch = useAppDispatch();
  const [cloudModal, setCloudModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const {
    appImageRecoverd,
    appRecreated,
    appRecoveryLoading,
    appImageError,
    appImagerecoveryRetry,
  } = useAppSelector((state) => state.bhr);
  const {
    appId
  } = useAppSelector((state) => state.storage);

  const openLoaderModal = () => setCreateCloudBackupModal(true);
  const closeLoaderModal = () => setCreateCloudBackupModal(false);
  const [createCloudBackupModal, setCreateCloudBackupModal] = useState(false);
  const { showToast } = useToastMessage();

  useEffect(() => {
    if (appImageError) {
      closePassword();
      showToast('Failed to get app image');
    }

    if (appRecoveryLoading) {
      closePassword();
      openLoaderModal();
    }
    if (appRecreated) {
      setTimeout(() => {
        closePassword();
        closeLoaderModal();
        navigation.navigate('App', { screen: 'NewHome' });
      }, 3000);
    }
  }, [appImageRecoverd, appRecreated, appRecoveryLoading, appImageError, appImagerecoveryRetry]);

  useEffect(() => {
    appId && navigation.navigate('App', { screen: 'NewHome' });
  }, [appId])
  const passwordScreen = () => {
    setCloudModal(false);
    setPasswordModal(true);
  };

  const closePassword = () => {
    setPasswordModal(false);
  };

  const closeCloudModal = () => setCloudModal(false);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: 'light.ReceiveBackground',
      }}
    >
      <StatusBar backgroundColor={'light.ReceiveBackground'} barStyle="dark-content" />
      <ScrollView
        style={{
          paddingTop: 50,
        }}
      >
        <Box mx={3}>
          <Text
            color={'light.blackHeaderText'}
            fontSize={RFValue(20)}
            fontFamily={'heading'}
            pl={10}
          >
            New Keeper App
          </Text>
          <Text
            px={'5%'}
            color={'light.blackHeaderText'}
            fontSize={RFValue(12)}
            fontFamily={'body'}
            pl={10}
          >
            Use this option if you want to create a new Keeper app
          </Text>
          <Tile
            title={'Start New'}
            subTitle={'New Vault and Wallets'}
            Icon={<App />}
            onPress={() => {
              dispatch(setupKeeperApp());
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
          {/* <Tile
            title={'Recover for myself'}
            subTitle={'Using Cloud'}
            Icon={<Recover />}
            onPress={() => {
              dispatch(getCloudData());
              setCloudModal(true);
            }}
          /> */}
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
            onPress={() => {
              navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
            }}
            Icon={<Inheritance />}
          />
        </Box>
      </ScrollView>
      <Text px={'10%'} py={'5%'} color={'light.lightBlack'} fontSize={12}>
        When you use Signing Devices to restore Keeper, only Vault is restored and the app has new
        wallets
      </Text>
      <CloudRecoveryModal
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
        onPressNext={(backup) => {
          setSelectedBackup(backup);
          passwordScreen();
        }}
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
        backup={selectedBackup}
        onPressNext={(password) => {
          dispatch(recoverBackup(password, selectedBackup.encData));
        }}
      />

      <ModalWrapper
        visible={createCloudBackupModal}
        onSwipeComplete={() => setCreateCloudBackupModal(false)}
      >
        <CreateCloudBackup closeBottomSheet={() => setCreateCloudBackupModal(false)} />
      </ModalWrapper>
    </SafeAreaView>
  );
};
export default NewKeeperApp;
