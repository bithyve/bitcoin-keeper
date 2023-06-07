/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/no-unstable-nested-components */
import { ActivityIndicator, StyleSheet, BackHandler, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import React, { useEffect, useState } from 'react';
import { hp, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import App from 'src/assets/images/app.svg';
import ArrowIcon from 'src/assets/images/icon_arrow.svg';
import KeeperModal from 'src/components/KeeperModal';
import Recover from 'src/assets/images/recover.svg';
import ScreenWrapper from 'src/components/ScreenWrapper';
import messaging from '@react-native-firebase/messaging';
import { setupKeeperApp } from 'src/store/sagaActions/storage';
import useToastMessage from 'src/hooks/useToastMessage';
import { Box, Pressable } from 'native-base';
import HeaderTitle from 'src/components/HeaderTitle';
import ShakingAssetsAnimation from 'src/components/ShakingAssetsAnimation';
import { isTestnet } from 'src/common/constants/Bitcoin';
import openLink from 'src/utils/OpenLink';
import Fonts from 'src/common/Fonts';
import WhirlpoolLoader from 'src/components/WhirlpoolLoader';
import LoadingAnimation from 'src/components/Loader';
import { updateFCMTokens } from '../../store/sagaActions/notifications';


export function Tile({ title, subTitle, onPress, Icon = null, loading = false }) {
  return (
    <Pressable
      onPress={onPress}
      backgroundColor="light.primaryBackground"
      flexDirection="row"
      alignItems="center"
      width="100%"
      testID="btn_startNew"
      style={{ marginTop: hp(20), height: hp(110) }}
      paddingX={2}
    >
      {Icon && <Box style={{ marginLeft: wp(20) }}>{Icon}</Box>}
      <Box
        backgroundColor="light.primaryBackground"
        style={{
          paddingVertical: hp(20),
          paddingLeft: wp(24),
          borderRadius: hp(10),
          width: '80%',
        }}
      >
        <Text color="light.primaryText" fontSize={14} letterSpacing={1.12}>
          {title}
        </Text>
        <Text color="light.GreyText" fontSize={12} letterSpacing={0.6}>
          {subTitle}
        </Text>
      </Box>
      <Box style={styles.iconContainer}>
        {loading ? (
          <Box marginRight="10">
            <ActivityIndicator />
          </Box>
        ) : (
          <ArrowIcon />
        )}
      </Box>
    </Pressable>
  );
}

function NewKeeperApp({ navigation }: { navigation }) {
  const dispatch = useAppDispatch();
  const { appImageRecoverd, appRecreated, appRecoveryLoading, appImageError } = useAppSelector(
    (state) => state.bhr
  );
  const appCreated = useAppSelector((state) => state.storage.appId);
  const { showToast } = useToastMessage();
  const [keeperInitiating, setInitiating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const appCreationError = useAppSelector((state) => state.login.appCreationError);

  useEffect(() => {
    if (appCreated) {
      setInitiating(false);
      updateFCM();
    }
    if (appCreationError) {
      setModalVisible(false);
      setInitiating(false);
    }
  }, [appCreated, appCreationError]);

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
      showToast('Failed to get app image');
    }
  }, [appImageRecoverd, appImageError]);

  useEffect(() => {
    if (appRecreated) {
      setTimeout(() => {
        navigation.replace('App', { screen: 'NewHome' });
      }, 3000);
    }
  }, [appRecreated]);

  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (keeperInitiating) {
      setModalVisible(true);
      createNewApp();
    }
  }, [keeperInitiating]);

  async function createNewApp() {
    try {
      const fcmToken = await messaging().getToken();
      dispatch(setupKeeperApp(fcmToken));
    } catch (error) {
      dispatch(setupKeeperApp());
    }
  }

  const getSignUpModalContent = () => ({
    title: 'Setting up your app',
    subTitle: 'Keeper allows you to create single sig wallets and a multisig Vault',
    message:
      'Stack sats, whirlpool them, hodl long term and plan your inheritance with Keeper.',
  });

  function SignUpModalContent() {
    return (
      <Box style={{ width: windowWidth * 0.7 }}>
        {/* <ShakingAssetsAnimation /> */}
        <Box style={{ width: windowWidth * 0.7, marginBottom: hp(20) }}>
          <LoadingAnimation />
        </Box>
        <Text color="light.greenText" fontSize={13} letterSpacing={0.65}>
          {getSignUpModalContent().message}
        </Text>
        {!appCreated ? <Text color="light.greenText" fontSize={13} letterSpacing={0.65} pt={5}>
          This step will take a few seconds. You would be able to proceed soon
        </Text> : null}
      </Box>
    );
  }

  return (
    <ScreenWrapper barStyle="dark-content">
      <Box style={{ marginTop: hp(30) }}>
        <Box style={styles.headerContainer}>
          <HeaderTitle
            title="New Keeper App"
            subtitle="Choose this option when you want to start with a fresh app"
            paddingTop={3}
            enableBack={false}
            headerTitleColor="black"
          />
        </Box>
        <Box style={styles.tileContainer}>
          <Tile
            title="Start New"
            subTitle="New wallets and Vault"
            Icon={<App />}
            onPress={() => {
              setInitiating(true);
            }}
            loading={keeperInitiating}
          />
        </Box>
      </Box>

      <Box style={styles.titleWrapper02}>
        <Box style={styles.headerContainer}>
          <HeaderTitle
            title="Restore"
            subtitle="Recover the Keeper app with a 12-word Recovery Phrase, or use other methods to restore the Vault"
            paddingTop={3}
            enableBack={false}
            headerTitleColor="black"
            textPadding={0}
          />
        </Box>
        <Box style={styles.tileContainer}>
          <Tile
            title="Recover Existing App"
            subTitle="For self or inherited Vault"
            Icon={<Recover />}
            onPress={() => {
              navigation.navigate('LoginStack', { screen: 'EnterSeedScreen' });
            }}
          />
        </Box>
      </Box>
      <Box style={styles.footerContainer}>
        <Box style={styles.noteContainer}>
          <Box opacity={1}>
            <Text color="light.black" style={styles.title}>
              Terms of Service
            </Text>
          </Box>
          <Box style={styles.subTitleWrapper}>
            <Text color="light.secondaryText" style={styles.subTitle}>By proceeding, you agree to our </Text>
            <TouchableOpacity onPress={() => openLink('https://bitcoinkeeper.app/terms-of-service/')}><Text color="#2D6759" italic style={styles.termOfServiceText}>Terms of Service</Text></TouchableOpacity>
            <Text color="light.secondaryText" style={styles.subTitle}> and </Text>
            <TouchableOpacity onPress={() => openLink('https://bitcoinkeeper.app/privacy-policy/')}><Text color="#2D6759" italic style={styles.termOfServiceText}> Privacy Policy</Text></TouchableOpacity>
          </Box>
        </Box>
      </Box>
      <KeeperModal
        dismissible={false}
        close={() => { }}
        visible={appCreationError}
        title="Something went wrong"
        subTitle="Please check your internet connection and try again."
        Content={Box}
        buttonText="Retry"
        buttonCallback={() => {
          setInitiating(true);
        }}
        subTitleColor="light.secondaryText"
        subTitleWidth={wp(250)}
        showCloseIcon={false}
      />
      <KeeperModal
        dismissible={false}
        close={() => { }}
        visible={modalVisible}
        title={getSignUpModalContent().title}
        subTitle={getSignUpModalContent().subTitle}
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
      <KeeperModal
        dismissible={false}
        close={() => { }}
        visible={appCreationError}
        title="Something went wrong"
        subTitle="Please check your internet connection and try again."
        Content={Box}
        buttonText="Retry"
        buttonCallback={() => {
          setInitiating(true)
        }}
        subTitleColor="light.secondaryText"
        subTitleWidth={wp(210)}
        showCloseIcon={false}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  titleWrapper02: {
    marginTop: hp(70),
  },
  iconContainer: {
    padding: 10,
    flex: 1,
    flexDirection: 'row-reverse',
  },
  tileContainer: {
    marginTop: hp(20),
  },
  headerContainer: {
    // width: wp(280),
  },
  footerContainer: {
    position: 'absolute',
    bottom: 10,
    width: wp(375),
    margin: 20,
  },
  noteContainer: {
    padding: 4,
    width: wp(290)
  },
  title: {
    fontSize: 15,
    letterSpacing: 1.12,
  },
  subTitle: {
    fontSize: 12,
    letterSpacing: 0.6,
  },
  termOfServiceText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: Fonts.FiraSansCondensedMediumItalic,
  },
  subTitleWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  }
});

export default NewKeeperApp;