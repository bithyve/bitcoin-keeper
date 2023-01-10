import { ActivityIndicator, BackHandler, Platform, StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, Image, Pressable, ScrollView } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import App from 'src/assets/images/app.svg';
import ArrowIcon from 'src/assets/images/icon_arrow.svg';
import CloudRecoveryModal from 'src/components/CloudRecoveryModal';
import CreateCloudBackup from 'src/components/CloudBackup/CreateCloudBackup';
import Inheritance from 'src/assets/images/inheritanceKeeper.svg';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/common/content/LocContext';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import PasswordModal from 'src/components/PasswordModal';
import Recover from 'src/assets/images/recover.svg';
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
      backgroundColor="light.primaryBackground"
      flexDirection="row"
      alignItems="center"
      width="90%"
      style={{ marginTop: hp(10), height: hp(110) }}
      marginLeft="5%"
      paddingX={2}
    >
      <Box style={{ marginLeft: wp(20) }}>{Icon}</Box>
      <Box
        backgroundColor="light.primaryBackground"
        style={{
          paddingVertical: hp(20),
          paddingLeft: wp(24),
          borderRadius: hp(10),
          width: '80%',
        }}
      >
        <Text color="light.primaryText" fontSize={14} letterSpacing={1.12} width="90%">
          {title}
        </Text>
        <Text color="light.GreyText" fontSize={12} letterSpacing={0.6} width="80%">
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
  const { appImageRecoverd, appRecreated, appRecoveryLoading, appImageError } = useAppSelector(
    (state) => state.bhr
  );
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
  }, [appImageRecoverd, appImageError]);

  useEffect(() => {
    if (appRecoveryLoading) {
      closePassword();
      openLoaderModal();
    }
  }, [appRecoveryLoading]);

  useEffect(() => {
    if (appRecreated) {
      setTimeout(() => {
        closePassword();
        closeLoaderModal();
        navigation.replace('App', { screen: 'NewHome' });
      }, 3000);
    }
  }, [appRecreated]);

  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

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
        <Text color="light.greenText" fontSize={13} letterSpacing={0.65} width={wp(240)}>
          This feature is *only* for the testnet version of the app. The developers will get your
          message along with other information from the app.
        </Text>
      </Box>
    );
  }

  return (
    <ScreenWrapper barStyle="dark-content">
      <ScrollView style={styles.wrapper}>
        <Box>
          <Box style={styles.titleWrapper}>
            <Text color="light.textBlack" style={styles.titleText}>
              New Keeper App
            </Text>
            <Text color="light.GreyText" style={styles.subTitleText}>
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

          <Box style={styles.titleWrapper02}>
            <Text color="light.textBlack" style={styles.titleText}>
              Existing Keeper App
            </Text>
            <Text color="light.textBlack" style={styles.subTitleText}>
              If you previously had a Keeper wallet you can recover it
            </Text>

            <Tile
              title="Recover for myself"
              subTitle="Using Backup Phrase"
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
      <Text color="light.primaryText" style={styles.noteText}>
        When you use signing devices to restore Keeper, only vault is restored and the app has new
        wallets
      </Text>
      <CloudRecoveryModal
        visible={cloudModal}
        close={closeCloudModal}
        title={Platform.OS === 'ios' ? 'Recover wallet from iCloud' : 'Recover wallet from Drive'}
        subTitle={seed.seedDescription}
        buttonText="Next"
        buttonTextColor="light.white"
        buttonCallback={passwordScreen}
        textColor="light.primaryText"
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
        buttonText="Next"
        buttonTextColor="light.white"
        textColor="light.primaryText"
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
        close={() => {}}
        visible={modalVisible}
        title="Shake to send feedback"
        subTitle="Shake your device to send us a bug report or a feature request"
        Content={SignUpModalContent}
        buttonText={appCreated ? 'Next' : null}
        buttonCallback={() => {
          setModalVisible(false);
          navigation.replace('App', { screen: 'NewHome' });
        }}
        subTitleColor="light.secondaryText"
        subTitleWidth={wp(210)}
        showCloseIcon={false}
      />
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    paddingTop: '5%',
  },
  titleWrapper: {
    marginBottom: hp(10),
  },
  titleText: {
    fontSize: 18,
    paddingHorizontal: 18,
    fontWeight: '400',
    letterSpacing: 0.9,
  },
  subTitleText: {
    fontSize: 12,
    fontWeight: '400',
    paddingHorizontal: 18,
    letterSpacing: 0.6,
  },
  titleWrapper02: {
    marginTop: hp(70),
  },
  noteText: {
    fontSize: 12,
    paddingHorizontal: '5%',
    paddingVertical: '5%',
  },
});

export default NewKeeperApp;
