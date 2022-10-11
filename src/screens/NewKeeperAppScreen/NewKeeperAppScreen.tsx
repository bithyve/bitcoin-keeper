import { ActivityIndicator, Platform } from 'react-native';
import { Box, HStack, Image, Pressable, ScrollView, Switch, Text } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

import App from 'src/assets/images/svgs/app.svg';
import ArrowIcon from 'src/assets/images/svgs/icon_arrow.svg';
import CloudRecoveryModal from 'src/components/CloudRecoveryModal';
import CreateCloudBackup from 'src/components/CloudBackup/CreateCloudBackup';
import Inheritance from 'src/assets/images/svgs/inheritanceKeeper.svg';
import { LocalizationContext } from 'src/common/content/LocContext';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import { NetworkType } from 'src/core/wallets/enums';
import PasswordModal from 'src/components/PasswordModal';
import { RFValue } from 'react-native-responsive-fontsize';
import Recover from 'src/assets/images/svgs/recover.svg';
import ScreenWrapper from 'src/components/ScreenWrapper';
import config from 'src/core/config';
import messaging from '@react-native-firebase/messaging';
import { recoverBackup } from 'src/store/sagaActions/bhr';
import { setupKeeperApp } from 'src/store/sagaActions/storage';
import { updateFCMTokens } from '../../store/sagaActions/notifications';
import useToastMessage from 'src/hooks/useToastMessage';
import KeeperLoader from 'src/components/KeeperLoader';

const Tile = ({ title, subTitle, onPress, Icon, loading = false }) => {
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
          width: '80%',
        }}
      >
        <Text
          color={'light.lightBlack'}
          fontFamily={'body'}
          fontWeight={200}
          fontSize={RFValue(13)}
          letterSpacing={0.65}
          width={'80%'}
        >
          {title}
        </Text>
        <Text
          color={'light.GreyText'}
          fontFamily={'body'}
          fontWeight={200}
          fontSize={RFValue(12)}
          letterSpacing={0.6}
          width={'80%'}
        >
          {subTitle}
        </Text>
      </Box>
      {loading ? (
        <Box marginRight={'10'}>
          <ActivityIndicator />
        </Box>
      ) : (
        <ArrowIcon />
      )}
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
  const appCreated = useAppSelector((state) => state.storage.appId);
  const openLoaderModal = () => setCreateCloudBackupModal(true);
  const closeLoaderModal = () => setCreateCloudBackupModal(false);
  const [createCloudBackupModal, setCreateCloudBackupModal] = useState(false);
  const { showToast } = useToastMessage();
  const [keeperInitiating, setInitiating] = useState(false);
  const [isTestnet, setTestnet] = useState(config.NETWORK_TYPE === NetworkType.TESTNET);
  useEffect(() => {
    if (appCreated) {
      setInitiating(false);
      navigation.navigate('App', { screen: 'NewHome' });
      updateFCM();
    }
  }, [appCreated]);

  async function updateFCM() {
    try {
      const token = await messaging().getToken();
      dispatch(updateFCMTokens([token]));
    } catch (error) {
      //
    }
  }

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

  const passwordScreen = () => {
    setCloudModal(false);
    setPasswordModal(true);
  };

  const closePassword = () => {
    setPasswordModal(false);
  };

  const closeCloudModal = () => setCloudModal(false);

  const switchConfig = () => {
    config.setNetwork(isTestnet ? NetworkType.MAINNET : NetworkType.TESTNET);
    setTestnet(isTestnet ? false : true);
  };

  useEffect(() => {
    if (keeperInitiating) {
      dispatch(setupKeeperApp());
    }
  }, [keeperInitiating]);

  return (
    <ScreenWrapper barStyle="dark-content">
      <ScrollView
        style={{
          paddingTop: '5%',
        }}
      >
        <Box>
          <Text
            color={'light.blackHeaderText'}
            fontSize={RFValue(20)}
            fontFamily={'heading'}
            px={'8'}
          >
            New Keeper App
          </Text>
          <Text color={'light.blackHeaderText'} fontSize={RFValue(12)} fontFamily={'body'} px={'8'}>
            Use this option if you want to create a new Keeper app
          </Text>
          <Tile
            title={'Start New'}
            subTitle={'New Vault and Wallets'}
            Icon={<App />}
            onPress={() => {
              setInitiating(true);
            }}
            loading={keeperInitiating}
          />
          <HStack justifyContent={'space-between'} paddingTop={'2'}>
            <Text
              color={'light.blackHeaderText'}
              fontFamily={'heading'}
              fontWeight={'300'}
              px={'8'}
            >
              Use TESTNET:
            </Text>
            <Switch
              defaultIsChecked
              trackColor={{ true: 'green' }}
              style={{ marginRight: '5%' }}
              onChange={switchConfig}
            />
          </HStack>
          <Text
            color={'light.blackHeaderText'}
            fontSize={RFValue(20)}
            style={{ marginTop: 10 }}
            fontFamily={'heading'}
            px={'8'}
          >
            Exsisting Keeper App
          </Text>
          <Text color={'light.blackHeaderText'} fontSize={RFValue(12)} fontFamily={'body'} px={'8'}>
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
      <KeeperLoader
        visible={keeperInitiating}
        loadingContent={{
          title: 'Share Feedback (Testnet only)',
          subTitle: 'Shake your device or take a screenshot to send feedback'
        }}
        close={() => { }}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        textColor={'#000'}
        Content={() => {
          return (
            <Box>
              <Image
                source={require('src/assets/video/test-net.gif')}
                style={{
                  width: wp(250),
                  height: wp(120),
                  alignSelf: 'center',
                  marginTop: hp(30)
                }} />
              <Text
                color={'light.modalText'}
                fontWeight={200}
                fontSize={13}
                letterSpacing={0.65}
                marginTop={hp(60)}
                width={wp(240)}
              >
                {'This feature is *only* for the testnet version of the app. The developers will get your message along with other information from the app.'}
              </Text>
            </Box>)
        }}
      />
      <ModalWrapper
        visible={createCloudBackupModal}
        onSwipeComplete={() => setCreateCloudBackupModal(false)}
      >
        <CreateCloudBackup closeBottomSheet={() => setCreateCloudBackupModal(false)} />
      </ModalWrapper>
    </ScreenWrapper>
  );
};
export default NewKeeperApp;
