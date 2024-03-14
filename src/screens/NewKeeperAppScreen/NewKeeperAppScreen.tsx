/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/no-unstable-nested-components */
import { ActivityIndicator, StyleSheet, BackHandler } from 'react-native';
import Text from 'src/components/KeeperText';
import React, { useEffect, useState } from 'react';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import AppIcon from 'src/assets/images/app.svg';
import ArrowIcon from 'src/assets/images/icon_arrow.svg';
import KeeperModal from 'src/components/KeeperModal';
import Recover from 'src/assets/images/recover_app.svg';
import ScreenWrapper from 'src/components/ScreenWrapper';
import messaging from '@react-native-firebase/messaging';
import { setupKeeperApp } from 'src/store/sagaActions/storage';
import useToastMessage from 'src/hooks/useToastMessage';
import { Box, Pressable, useColorMode } from 'native-base';
import LoadingAnimation from 'src/components/Loader';
import { updateFCMTokens } from 'src/store/sagaActions/notifications';
import BounceLoader from 'src/components/BounceLoader';
import openLink from 'src/utils/OpenLink';
import { KEEPER_WEBSITE_BASE_URL } from 'src/utils/service-utilities/config';

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
        <Text color={`${colorMode}.primaryText`} fontSize={14} letterSpacing={1.12}>
          {title}
        </Text>
        <Text color={`${colorMode}.GreyText`} fontSize={12} letterSpacing={0.6}>
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
  const { appImageRecoverd, appRecreated, appImageError } = useAppSelector((state) => state.bhr);
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
    subTitle:
      'Keeper lets you create single-key (singlesig) wallets and multi-key (multisig) wallets called vaults.',
    message: 'Stack sats, whirlpool them, hodl long term and plan your inheritance with Keeper.',
  });

  function SignUpModalContent() {
    return (
      <Box style={{ width: windowWidth * 0.8 }}>
        <Box style={{ width: windowWidth * 0.8, marginBottom: hp(20) }}>
          <LoadingAnimation />
        </Box>
        <Text color={`${colorMode}.secondaryText`} style={styles.contentText}>
          {getSignUpModalContent().message}
        </Text>
        {!appCreated ? (
          <Box style={styles.modalMessageWrapper}>
            <Box style={{ width: '80%' }}>
              <Text color={`${colorMode}.secondaryText`} style={styles.modalMessageText}>
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
      {
        //Todo Learn more
      }
      {/* <Pressable
        backgroundColor={`${colorMode}.brownColor`}
        borderColor={`${colorMode}.brownColor`}
        style={styles.learnMoreContainer}
        // learn more modal
      >
        <Text style={styles.learnMoreText} medium color={`${colorMode}.primaryBackground`}>
          Need Help?
        </Text>
      </Pressable> */}
      <Box style={styles.contentContainer}>
        <Box>
          <Box style={styles.headingContainer}>
            <Text color={`${colorMode}.headerText`} fontSize={18}>
              Welcome
            </Text>
            <Text fontSize={14} color={`${colorMode}.secondaryText`}>
              Create a fresh app or recover an exisiting one
            </Text>
          </Box>
          <Pressable
            backgroundColor={`${colorMode}.seashellWhite`}
            style={styles.tileContainer}
            testID="view_startNewTile"
            onPress={() => {
              setInitiating(true);
            }}
          >
            <AppIcon />
            <Box>
              <Text fontSize={13}>Start New</Text>
              <Text fontSize={12} color={`${colorMode}.GreyText`}>
                New wallets and vaults
              </Text>
            </Box>
          </Pressable>
          <Pressable
            backgroundColor={`${colorMode}.seashellWhite`}
            style={styles.tileContainer}
            testID="view_recoverTile"
            onPress={() => {
              navigation.navigate('LoginStack', { screen: 'EnterSeedScreen' });
            }}
          >
            <Recover />
            <Box>
              <Text fontSize={13}>Recover an existing app</Text>
              <Text fontSize={12} color={`${colorMode}.GreyText`}>
                Enter 12-word Recovery Key
              </Text>
            </Box>
          </Pressable>
        </Box>
        <Box style={styles.note}>
          <Text color={`${colorMode}.headerText`} medium fontSize={14}>
            Note
          </Text>
          <Text fontSize={12} color={`${colorMode}.GreenishGrey`}>
            By proceeding you agree to our
            <Text
              color={`${colorMode}.headerText`}
              italic
              bold
              onPress={() => openLink(`${KEEPER_WEBSITE_BASE_URL}terms-of-service/`)}
            >
              {' '}
              Terms of Service{' '}
            </Text>
            {'and our'}
            <Text
              color={`${colorMode}.headerText`}
              italic
              bold
              onPress={() => openLink(`${KEEPER_WEBSITE_BASE_URL}privacy-policy/`)}
            >
              {' '}
              Privacy Policy
            </Text>
          </Text>
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
        subTitleColor={`${colorMode}.secondaryText`}
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
          setTimeout(() => {
            navigation.replace('App', { screen: 'Home' });
          }, 500);
        }}
        subTitleColor={`${colorMode}.secondaryText`}
        subTitleWidth={wp(300)}
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
  iconContainer: {
    marginRight: 20,
    flexDirection: 'row-reverse',
  },
  tileContainer: {
    marginBottom: hp(40),
    width: '100%',
    height: hp(125),
    paddingTop: 20,
    paddingHorizontal: 30,
    gap: 10,
    justifyContent: 'center',
    borderRadius: 10,
  },
  title: {
    fontSize: 14,
    letterSpacing: 1.12,
  },
  subTitle: {
    fontSize: 12,
    letterSpacing: 0.6,
  },
  modalMessageWrapper: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  modalMessageText: {
    fontSize: 13,
    letterSpacing: 0.13,
    paddingTop: 20,
  },
  contentText: {
    fontSize: 13,
    letterSpacing: 0.13,
    width: '100%',
  },
  learnMoreContainer: {
    marginTop: hp(10),
    alignSelf: 'flex-end',
    borderRadius: 5,
    borderWidth: 0.5,
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  learnMoreText: {
    fontSize: 12,
    letterSpacing: 0.24,
  },
  contentContainer: {
    justifyContent: 'space-between',
    flex: 1,
    marginHorizontal: 10,
    marginBottom: 20,
  },
  headingContainer: {
    marginTop: 20,
    marginBottom: 30,
    marginLeft: 10,
  },
  note: {
    width: wp(280),
  },
});

export default NewKeeperApp;
