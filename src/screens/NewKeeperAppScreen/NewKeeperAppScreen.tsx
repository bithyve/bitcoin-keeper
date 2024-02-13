/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/no-unstable-nested-components */
import { ActivityIndicator, StyleSheet, BackHandler, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import React, { useEffect, useState } from 'react';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import App from 'src/assets/images/app.svg';
import ArrowIcon from 'src/assets/images/icon_arrow.svg';
import KeeperModal from 'src/components/KeeperModal';
import Recover from 'src/assets/images/recover.svg';
import ScreenWrapper from 'src/components/ScreenWrapper';
import messaging from '@react-native-firebase/messaging';
import { setupKeeperApp } from 'src/store/sagaActions/storage';
import useToastMessage from 'src/hooks/useToastMessage';
import { Box, Pressable, useColorMode } from 'native-base';
import openLink from 'src/utils/OpenLink';
import LoadingAnimation from 'src/components/Loader';
import { updateFCMTokens } from 'src/store/sagaActions/notifications';
import Fonts from 'src/constants/Fonts';
import { KEEPER_WEBSITE_BASE_URL } from 'src/core/config';
import BounceLoader from 'src/components/BounceLoader';
import KeeperHeader from 'src/components/KeeperHeader';

export function Tile({ title, subTitle, onPress, Icon = null, loading = false }) {
  const { colorMode } = useColorMode();
  return (
    <Pressable
      onPress={onPress}
      backgroundColor={`${colorMode}.seashellWhite`}
      flexDirection="row"
      alignItems="center"
      width="100%"
      testID="btn_startNew"
      style={{ marginTop: hp(20), height: hp(110), borderRadius: hp(10) }}
      paddingX={2}
    >
      {Icon && <Box style={{ marginLeft: wp(20) }}>{Icon}</Box>}
      <Box
        style={{
          paddingVertical: hp(20),
          paddingLeft: wp(24),
          width: '75%',
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
  const { colorMode } = useColorMode();
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
        navigation.replace('App', { screen: 'Home' });
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
    subTitle: 'Keeper allows you to create single sig wallets and multisig wallets called Vaults',
    message: 'Stack sats, whirlpool them, hodl long term and plan your inheritance with Keeper.',
  });

  function SignUpModalContent() {
    return (
      <Box style={{ width: windowWidth * 0.7 }}>
        <Box style={{ width: windowWidth * 0.7, marginBottom: hp(20) }}>
          <LoadingAnimation />
        </Box>
        <Text color={`${colorMode}.greenText`} style={styles.contentText}>
          {getSignUpModalContent().message}
        </Text>
        {!appCreated ? (
          <Box style={styles.modalMessageWrapper}>
            <Box style={{ width: '80%' }}>
              <Text color={`${colorMode}.greenText`} style={styles.modalMessageText}>
                This step will take a few seconds. You would be able to proceed soon
              </Text>
            </Box>
            <Box style={{ width: '20%' }}>
              <BounceLoader />
            </Box>
          </Box>
        ) : null}
      </Box>
    );
  }

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <Box style={{ marginTop: hp(30) }}>
        <Box style={styles.headerContainer} testID="view_newKeeperHeader">
          <KeeperHeader
            enableBack={false}
            marginLeft={false}
            title="New Keeper App"
            subtitle="Choose this option when you want to start with a fresh app"
          />
        </Box>
        <Box style={styles.tileContainer} testID="view_startNewTile">
          <Tile
            title="Start New"
            subTitle="New wallets and vaults"
            Icon={<App />}
            onPress={() => {
              setInitiating(true);
            }}
            loading={keeperInitiating}
          />
        </Box>
      </Box>

      <Box style={styles.titleWrapper02}>
        <Box style={styles.headerContainer} testID="view_restore">
          <KeeperHeader
            enableBack={false}
            marginLeft={false}
            title="Restore"
            subtitle="Recover the Keeper app with a 12-word Recovery Phrase, or use other methods to restore the vault"
          />
        </Box>
        <Box style={styles.tileContainer} testID="view_recoverTile">
          <Tile
            title="Recover an existing app"
            subTitle="Enter 12-word Recovery Phrase"
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
            <Text
              color={`${colorMode}.headerText`}
              style={styles.title}
              testID="text_termOfService"
            >
              Note
            </Text>
          </Box>
          <Box style={styles.subTitleWrapper}>
            <Text color="light.secondaryText" style={styles.subTitle}>
              By proceeding, you agree to our{' '}
            </Text>
            <TouchableOpacity
              onPress={() => openLink(`${KEEPER_WEBSITE_BASE_URL}terms-of-service/`)}
            >
              <Text color={`${colorMode}.headerText`} italic style={styles.termOfServiceText}>
                Terms of Service
              </Text>
            </TouchableOpacity>
            <Text color="light.secondaryText" style={styles.subTitle}>
              {' '}
              and our{' '}
            </Text>
            <TouchableOpacity onPress={() => openLink(`${KEEPER_WEBSITE_BASE_URL}privacy-policy/`)}>
              <Text color="#2D6759" italic style={styles.termOfServiceText}>
                {' '}
                Privacy Policy
              </Text>
            </TouchableOpacity>
          </Box>
        </Box>
      </Box>
      <KeeperModal
        dismissible={false}
        close={() => {}}
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
        close={() => {}}
        visible={modalVisible}
        title={getSignUpModalContent().title}
        subTitle={getSignUpModalContent().subTitle}
        Content={SignUpModalContent}
        buttonText={appCreated ? 'Next' : null}
        buttonCallback={() => {
          setModalVisible(false);
          navigation.replace('App', { screen: 'Home' });
        }}
        subTitleColor="light.secondaryText"
        subTitleWidth={wp(210)}
        showCloseIcon={false}
      />
      <KeeperModal
        dismissible={false}
        close={() => {}}
        visible={appCreationError}
        title="Something went wrong"
        subTitle="Please check your internet connection and try again."
        Content={Box}
        buttonText="Retry"
        buttonCallback={() => {
          setInitiating(true);
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
    marginRight: 20,
    flexDirection: 'row-reverse',
  },
  tileContainer: {
    marginTop: hp(5),
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
    width: wp(290),
  },
  title: {
    fontSize: 14,
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
    flexWrap: 'wrap',
  },
  modalMessageWrapper: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  modalMessageText: {
    fontSize: 13,
    letterSpacing: 0.65,
    paddingTop: 5,
  },
  contentText: {
    fontSize: 13,
    letterSpacing: 0.65,
  },
  addWalletText: {
    lineHeight: 26,
    letterSpacing: 0.8,
  },
  addWalletDescription: {
    fontSize: 12,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
});

export default NewKeeperApp;
