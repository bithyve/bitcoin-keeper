import { ActivityIndicator, Platform } from 'react-native';
import { Box, Image, Pressable, ScrollView, Text } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

import App from 'src/assets/images/svgs/app.svg';
import ArrowIcon from 'src/assets/images/svgs/icon_arrow.svg';
import CloudRecoveryModal from 'src/components/CloudRecoveryModal';
import CreateCloudBackup from 'src/components/CloudBackup/CreateCloudBackup';
import Inheritance from 'src/assets/images/svgs/inheritanceKeeper.svg';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/common/content/LocContext';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import PasswordModal from 'src/components/PasswordModal';
import { RFValue } from 'react-native-responsive-fontsize';
import Recover from 'src/assets/images/svgs/recover.svg';
import ScreenWrapper from 'src/components/ScreenWrapper';
import messaging from '@react-native-firebase/messaging';
import { recoverBackup } from 'src/store/sagaActions/bhr';
import { setupKeeperApp } from 'src/store/sagaActions/storage';
import useToastMessage from 'src/hooks/useToastMessage';
import { updateFCMTokens } from '../../store/sagaActions/notifications';

function Tile({ title, subTitle, onPress, Icon, loading = false }) {
  return (
    <Pressable
      onPress={onPress}
      backgroundColor="light.lightYellow"
      flexDirection="row"
      alignItems="center"
      width="90%"
      style={{ marginTop: hp(10), height: hp(110) }}
      marginLeft="5%"
      paddingX={2}
    >
      <Box style={{ marginLeft: wp(20) }}>{Icon}</Box>
      <Box
        backgroundColor="light.lightYellow"
        style={{
          paddingVertical: hp(20),
          paddingLeft: wp(24),
          borderRadius: hp(10),
          width: '80%',
        }}
      >
        <Text
          color="light.lightBlack"
          fontFamily="body"
          fontWeight={200}
          fontSize={RFValue(14)}
          letterSpacing={1.12}
          width="90%"
        >
          {title}
        </Text>
        <Text
          color="light.GreyText"
          fontFamily="body"
          fontWeight={200}
          fontSize={RFValue(12)}
          letterSpacing={0.6}
          width="80%"
        >
          {subTitle}
        </Text>
      </Box>
      {loading ? (
        <Box marginRight="10">
          <ActivityIndicator />
        </Box>
      ) : (
        <ArrowIcon />
      )}
    </Pressable>
  );
}

function NewKeeperApp({ navigation }: { navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { seed } = translations;
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
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (appCreated) {
      setInitiating(false);
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
        navigation.replace('App', { screen: 'NewHome' });
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

  useEffect(() => {
    if (keeperInitiating) {
      setModalVisible(true);
      dispatch(setupKeeperApp());
    }
  }, [keeperInitiating]);

  function SignUpModalContent() {
    return (
      <Box>
        <Image
          source={require('src/assets/video/test-net.gif')}
          style={{
            width: wp(270),
            height: hp(200),
            alignSelf: 'center',
          }}
        />
        <Text
          color="light.modalText"
          fontWeight={200}
          fontSize={13}
          letterSpacing={0.65}
          width={wp(240)}
        >
          This feature is *only* for the testnet version of the app. The developers will get your
          message along with other information from the app.
        </Text>
      </Box>
    );
  }

  return (
    <ScreenWrapper barStyle="dark-content">
      <ScrollView
        style={{
          paddingTop: '5%',
        }}
      >
        <Box>
          <Box
            style={{
              marginBottom: hp(10),
            }}
          >
            <Text
              color="light.blackHeaderText"
              fontSize={RFValue(18)}
              fontFamily="heading"
              px="8"
              fontWeight={200}
              letterSpacing={0.9}
            >
              New Keeper App
            </Text>
            <Text
              fontWeight={200}
              color="light.GreyText"
              fontSize={RFValue(12)}
              fontFamily="body"
              px="8"
              letterSpacing={0.6}
            >
              Use this option if you want to create a new Keeper app
            </Text>
          </Box>
          <Tile
            title="Start New"
            subTitle="New vault and wallets"
            Icon={<App />}
            onPress={() => {
              setInitiating(true);
            }}
            loading={keeperInitiating}
          />

          <Box
            style={{
              marginTop: hp(70),
            }}
          >
            <Text
              color="light.blackHeaderText"
              fontSize={RFValue(18)}
              fontFamily="heading"
              px="8"
              fontWeight={200}
              letterSpacing={0.9}
            >
              Existing Keeper App
            </Text>
            <Text
              color="light.blackHeaderText"
              fontSize={RFValue(12)}
              fontFamily="body"
              px="8"
            >
              If you previously had a Keeper wallet you can recover it
            </Text>

            <Tile
              title="Recover for myself"
              subTitle="Using Phrase"
              Icon={<Recover />}
              onPress={() => {
                navigation.navigate('LoginStack', { screen: 'EnterSeedScreen' });
              }}
            />
            <Tile
              title="Inheritance Keeper vault"
              subTitle="Using signing devices"
              onPress={() => {
                navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
              }}
              Icon={<Inheritance />}
            />
          </Box>
        </Box>
      </ScrollView>
      <Text px="10%" py="5%" color="light.lightBlack" fontSize={12}>
        When you use signing devices to restore Keeper, only vault is restored and the app has new
        wallets
      </Text>
      <CloudRecoveryModal
        visible={cloudModal}
        close={closeCloudModal}
        title={Platform.OS == 'ios' ? 'Recover wallet from iCloud' : 'Recover wallet from Drive'}
        subTitle={seed.seedDescription}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText="Next"
        buttonTextColor="#FAFAFA"
        buttonCallback={passwordScreen}
        textColor="#041513"
        onPressNext={(backup) => {
          setSelectedBackup(backup);
          passwordScreen();
        }}
      />
      <PasswordModal
        visible={passwordModal}
        closePasswordModal={closePassword}
        title="Confirm Password"
        subTitle={seed.seedDescription}
        dscription={seed.seedDescription}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText="Next"
        buttonTextColor="#FAFAFA"
        textColor="#041513"
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
      <KeeperModal
        dismissible={false}
        close={() => { }}
        visible={modalVisible}
        title="Shake to send feedback"
        subTitle="Shake your device to send us a bug report or a feature request"
        Content={SignUpModalContent}
        buttonText={appCreated ? 'Next' : null}
        buttonCallback={() => {
          setModalVisible(false);
          navigation.replace('App', { screen: 'NewHome' });
        }}
        subTitleColor="#5F6965"
        subTitleWidth={wp(210)}
        showCloseIcon={false}
      />
    </ScreenWrapper>
  );
}
export default NewKeeperApp;
