/* eslint-disable react/no-unstable-nested-components */
import Text from 'src/components/KeeperText';
import { Box, StatusBar, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import TorAsset from 'src/components/Loader';
import KeeperModal from 'src/components/KeeperModal';
import LoginMethod from 'src/models/enums/LoginMethod';
import ModalContainer from 'src/components/Modal/ModalContainer';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import ReactNativeBiometrics from 'react-native-biometrics';
import messaging from '@react-native-firebase/messaging';
import { updateFCMTokens } from 'src/store/sagaActions/notifications';
import DeleteIcon from 'src/assets/images/deleteLight.svg';
import DowngradeToPleb from 'src/assets/images/downgradetopleb.svg';
import DowngradeToPlebDark from 'src/assets/images/downgradetoplebDark.svg';
import TestnetIndicator from 'src/components/TestnetIndicator';
import { isTestnet } from 'src/constants/Bitcoin';
import { getSecurityTip } from 'src/constants/defaultData';
import RestClient, { TorStatus } from 'src/services/rest/RestClient';
import { setSubscription, setTorEnabled } from 'src/store/reducers/settings';
import { AppSubscriptionLevel, SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import SubScription from 'src/models/interfaces/Subscription';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { credsAuth } from 'src/store/sagaActions/login';
import {
  credsAuthenticated,
  setOfflineStatus,
  setRecepitVerificationError,
} from 'src/store/reducers/login';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import {
  increasePinFailAttempts,
  setAutoUpdateEnabledBeforeDowngrade,
  setPlebDueToOffline,
} from 'src/store/reducers/storage';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import BounceLoader from 'src/components/BounceLoader';
import { fetchOneDayInsight } from 'src/store/sagaActions/send_and_receive';
import { PasswordTimeout } from 'src/utils/PasswordTimeout';
import Buttons from 'src/components/Buttons';
import PinDotView from 'src/components/AppPinInput/PinDotView';
import { setAutomaticCloudBackup } from 'src/store/reducers/bhr';

const TIMEOUT = 60;
const RNBiometrics = new ReactNativeBiometrics();

function LoginScreen({ navigation, route }) {
  const { colorMode } = useColorMode();
  const { relogin, title, screen, internalCheck } = route.params;
  const dispatch = useAppDispatch();
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [errMessage, setErrMessage] = useState('');
  const existingFCMToken = useAppSelector((state) => state.notifications.fcmToken);
  const { loginMethod } = useAppSelector((state) => state.settings);
  const torEnbled = false;
  const { appId, failedAttempts, lastLoginFailedAt } = useAppSelector((state) => state.storage);
  const [loggingIn, setLogging] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBiometric, setIsBiometric] = useState(false);
  const [incorrectPassword, setIncorrectPassword] = useState(false);
  const [loginData] = useState(getSecurityTip());
  const [torStatus, settorStatus] = useState<TorStatus>(RestClient.getTorStatus());
  const retryTime = Number((Date.now() - lastLoginFailedAt) / 1000);
  const isOnPleb = useAppSelector((state) => state.settings.subscription) === SubscriptionTier.L1;
  const { automaticCloudBackup } = useAppSelector((state) => state.bhr);

  const [canLogin, setCanLogin] = useState(false);
  const {
    isAuthenticated,
    authenticationFailed,
    credsAuthenticatedError,
    recepitVerificationError,
  } = useAppSelector((state) => state.login);

  const { translations } = useContext(LocalizationContext);
  const { login } = translations;
  const { common } = translations;

  const onChangeTorStatus = (status: TorStatus) => {
    settorStatus(status);
  };

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  useEffect(() => {
    RestClient.subToTorStatus(onChangeTorStatus);
    if (loggingIn && !isBiometric) {
      attemptLogin(passcode);
    }
    return () => {
      RestClient.unsubscribe(onChangeTorStatus);
    };
  }, [loggingIn, isBiometric]);

  useEffect(() => {
    dispatch(fetchOneDayInsight());
  }, []);

  useEffect(() => {
    const remainingTime = PasswordTimeout(failedAttempts) - retryTime;
    if (failedAttempts >= 1) {
      if (retryTime > PasswordTimeout(failedAttempts)) {
        setCanLogin(true);
        return;
      }

      setTimeout(() => {
        setLoginError(true);
        setErrMessage(`Please try after ${PasswordTimeout(failedAttempts) / TIMEOUT} minutes`);
        setCanLogin(false);
      }, 100);

      setTimeout(() => {
        setCanLogin(false);
      }, 1000);

      setTimeout(() => {
        setCanLogin(true);
        setErrMessage('');
        setLoginError(false);
      }, remainingTime * 1000);
    } else {
      setCanLogin(true);
    }
  }, [failedAttempts, lastLoginFailedAt]);

  useEffect(() => {
    biometricAuth();
  }, [canLogin]);

  useEffect(() => {
    requestUserPermission();
  }, []);

  useEffect(() => {
    if (recepitVerificationError && isOnPleb) {
      setLoginError(false);
      setLogging(false);
      dispatch(setRecepitVerificationError(false));
      dispatch(setOfflineStatus(true));
      navigation.replace('App');
    }
  }, [recepitVerificationError]);

  const biometricAuth = async () => {
    if (loginMethod === LoginMethod.BIOMETRIC) {
      try {
        setTimeout(async () => {
          if (canLogin) {
            const { success, signature } = await RNBiometrics.createSignature({
              promptMessage: 'Authenticate',
              payload: appId,
              cancelButtonText: 'Use PIN',
            });
            if (success) {
              setIsBiometric(true);
              setLoginModal(true);
              setLogging(true);
              setLoginError(false);
              dispatch(credsAuth(signature, LoginMethod.BIOMETRIC));
            }
          }
        }, 200);
      } catch (error) {
        //
        console.log(error);
      }
    }
  };

  const onPressNumber = (text) => {
    let tmpPasscode = passcode;
    if (passcode.length < 4) {
      if (text !== 'x') {
        tmpPasscode += text;
        setPasscode(tmpPasscode);
      }
    }
    if (passcode && text === 'x') {
      setPasscode(passcode.slice(0, -1));
      setLoginError(false);
    }
  };

  const onDeletePressed = (text) => {
    setPasscode(passcode.slice(0, passcode.length - 1));
  };

  useEffect(() => {
    if (attempts >= 3 && authenticationFailed) {
      setAttempts(1);
      dispatch(increasePinFailAttempts());
      setIncorrectPassword(true);
    }
  }, [attempts, authenticationFailed]);

  useEffect(() => {
    if (loggingIn && authenticationFailed) {
      setLoginModal(false);
      setIsBiometric(false);
      setPasscode('');

      setAttempts(attempts + 1);

      setLoginError(true);

      if (credsAuthenticatedError) {
        if (credsAuthenticatedError.toString().includes('Incorrect Passcode')) {
          setErrMessage('Incorrect Passcode');
        } else {
          setErrMessage(
            credsAuthenticatedError +
              '\n\n' +
              'Please close and reopen the app. If the issue persists please contact support.'
          );
        }
      }

      setLogging(false);
    }
  }, [authenticationFailed, credsAuthenticatedError, passcode]);

  useEffect(() => {
    if (isAuthenticated && internalCheck) {
      navigation.navigate({
        name: screen,
        params: { isAuthenticated: true },
        merge: true,
      });
      dispatch(credsAuthenticated(false));
    }
  }, [isAuthenticated, internalCheck]);

  const loginModalAction = async () => {
    if (isAuthenticated) {
      setLoginModal(false);
      if (relogin) {
        navigation.navigate({
          name: screen,
          params: { isAuthenticated: true },
          merge: true,
        });
      } else if (appId !== '') {
        updateFCM();
        navigation.replace('App');
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'NewKeeperApp' }] });
      }
      dispatch(credsAuthenticated(false));
    }
  };

  const updateFCM = async () => {
    try {
      const token = await messaging().getToken();
      if (!existingFCMToken || existingFCMToken !== token) dispatch(updateFCMTokens([token]));
    } catch (error) {
      console.log(error);
    }
  };

  const attemptLogin = (passcode: string) => {
    setLoginModal(true);

    dispatch(credsAuth(passcode, LoginMethod.PIN, relogin));
  };

  const modelAsset = useMemo(() => {
    if (torEnbled) {
      return <TorAsset />;
    }
    return loginData.assert;
  }, [torEnbled, torStatus]);

  const modelMessage = useMemo(() => {
    if (torEnbled) {
      if (torStatus === TorStatus.CONNECTED) {
        return loginData.message;
      }
      if (torStatus === TorStatus.ERROR) {
        return '';
      }
      return 'It might take upto minute';
    }
    return loginData.message;
  }, [torEnbled, torStatus]);

  const modelTitle = useMemo(() => {
    if (torEnbled) {
      if (torStatus === TorStatus.CONNECTED) {
        return loginData.title;
      }
      if (torStatus === TorStatus.ERROR) {
        return 'Error';
      }
      return 'Connecting to Tor ';
    }
    return loginData.title;
  }, [torEnbled, torStatus]);

  const modelSubTitle = useMemo(() => {
    if (torEnbled) {
      if (torStatus === TorStatus.CONNECTED) {
        return loginData.subTitle;
      }
      if (torStatus === TorStatus.ERROR) {
        return 'Failed to connect to tor';
      }
      return 'Network calls and some functions may work slower when the Tor is enabled  ';
    }
    return loginData.subTitle;
  }, [torEnbled, torStatus]);

  const modelButtonText = useMemo(() => {
    if (isAuthenticated) {
      if (torEnbled) {
        if (torStatus === TorStatus.CONNECTED) {
          return 'Next';
        }
        if (torStatus === TorStatus.ERROR) {
          return 'Login w/o tor';
        }
        return null;
      }
      return 'Next';
    }
    return null;
  }, [torEnbled, torStatus, isAuthenticated]);

  function LoginModalContent() {
    return (
      <Box style={{ width: wp(280) }}>
        <Box style={styles.modalAssetsWrapper}>{modelAsset}</Box>
        <Text color={`${colorMode}.primaryText`} style={styles.modalMessageText}>
          {modelMessage}
        </Text>
        {modelButtonText === null ? (
          <Box style={styles.modalMessageWrapper}>
            <Box style={{ width: '80%' }}>
              <Text
                color={`${colorMode}.primaryText`}
                style={[styles.modalMessageText, { paddingTop: hp(20) }]}
              >
                {login.Wait}
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

  function resetToPleb() {
    const app: KeeperApp = dbManager.getCollection(RealmSchema.KeeperApp)[0];
    const updatedSubscription: SubScription = {
      receipt: '',
      productId: SubscriptionTier.L1,
      name: SubscriptionTier.L1,
      level: AppSubscriptionLevel.L1,
      icon: 'assets/ic_pleb.svg',
    };
    dbManager.updateObjectById(RealmSchema.KeeperApp, app.id, {
      subscription: updatedSubscription,
    });
    dispatch(setSubscription(updatedSubscription.name));
    dispatch(setOfflineStatus(true));
    // disable assisted server backup for pleb
    dispatch(setAutomaticCloudBackup(false));
    dispatch(setPlebDueToOffline(true));
    dispatch(setAutoUpdateEnabledBeforeDowngrade(automaticCloudBackup));
    navigation.replace('App');
  }

  function NoInternetModalContent() {
    return (
      <Box style={styles.noInternetModalContainer}>
        {colorMode === 'light' ? <DowngradeToPleb /> : <DowngradeToPlebDark />}
      </Box>
    );
  }

  return (
    <Box style={styles.content} safeAreaTop backgroundColor={`${colorMode}.pantoneGreen`}>
      <Box flex={1}>
        <StatusBar />
        <Box flex={1}>
          <Box>
            <Box style={styles.testnetIndicatorWrapper}>{isTestnet() && <TestnetIndicator />}</Box>
            <Text color={`${colorMode}.headerWhite`} fontSize={25} style={styles.welcomeText}>
              {relogin ? title : login.welcomeback}
            </Text>
            <Box>
              <Box style={styles.passcodeWrapper}>
                <Text fontSize={14} color={`${colorMode}.headerWhite`}>
                  {login.enter_your}
                  {login.passcode}
                </Text>
                <PinDotView passCode={passcode} />
              </Box>
            </Box>
            <Box>
              {loginError && (
                <Text style={styles.errorMessage} color={`${colorMode}.error`}>
                  {errMessage}
                </Text>
              )}
            </Box>
          </Box>
          <KeyPadView
            disabled={!canLogin}
            onDeletePressed={onDeletePressed}
            onPressNumber={onPressNumber}
            ClearIcon={<DeleteIcon />}
            bubbleEffect
          />
          <Box style={styles.btnWrapper}>
            <Buttons
              primaryCallback={() => {
                setLoginError(false);
                setLogging(true);
              }}
              primaryText={common.proceed}
              primaryDisable={passcode.length !== 4}
              primaryBackgroundColor={`${colorMode}.buttonText`}
              primaryTextColor={`${colorMode}.pantoneGreen`}
              fullWidth
            />
          </Box>
        </Box>
      </Box>
      <KeeperModal
        visible={loginModal && !internalCheck}
        close={() => {}}
        title={modelTitle}
        subTitle={modelSubTitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        buttonBackground={`${colorMode}.pantoneGreen`}
        showCloseIcon={false}
        buttonText={modelButtonText}
        buttonCallback={loginModalAction}
        buttonTextColor={`${colorMode}.buttonText`}
        Content={LoginModalContent}
        subTitleWidth={wp(280)}
      />

      <KeeperModal
        dismissible={false}
        close={() => {}}
        visible={!isOnPleb && recepitVerificationError}
        title="Something went wrong"
        subTitle="Please check your internet connection and try again. If you continue offline, some features may not be available."
        Content={NoInternetModalContent}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        subTitleWidth={wp(230)}
        showCloseIcon={false}
        buttonText={'Retry'}
        buttonCallback={() => {
          setLoginError(false);
          setLogging(true);
          dispatch(setRecepitVerificationError(false));
          dispatch(credsAuth(passcode, LoginMethod.PIN, relogin));
        }}
        secondaryButtonText={'Continue offline'}
        secondaryCallback={() => {
          setLoginError(false);
          setLogging(false);
          dispatch(setRecepitVerificationError(false));
          resetToPleb();
        }}
      />
      <KeeperModal
        visible={incorrectPassword}
        close={() => {}}
        title="Incorrect Password"
        subTitle="You have entered an incorrect passcode. Please, try again. If you don’t remember your passcode, you will have to recover your wallet through the recovery flow"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.modalGreenTitle`}
        showCloseIcon={false}
        buttonText="Retry"
        buttonCallback={() => setIncorrectPassword(false)}
        subTitleWidth={wp(250)}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  textBoxStyles: {
    height: widthPercentageToDP('13%'),
    width: widthPercentageToDP('13%'),
    borderRadius: 7,
    marginLeft: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDF7F0',
  },
  textBoxActive: {
    height: widthPercentageToDP('13%'),
    width: widthPercentageToDP('13%'),
    borderRadius: 7,
    marginLeft: 20,
    elevation: 10,
    shadowOpacity: 1,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDF7F0',
  },
  textStyles: {
    color: '#000000',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  textFocused: {
    color: '#000000',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  errorMessage: {
    fontStyle: 'italic',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 18,
  },
  forgotPassWrapper: {
    flex: 0.8,
    margin: 20,
    width: '65%',
    marginTop: 30,
  },
  btnWrapper: {
    marginTop: 25,
    marginBottom: 30,
    alignSelf: 'center',
    width: '90%',
  },
  createBtn: {
    paddingVertical: hp(15),
    borderRadius: 10,
    paddingHorizontal: 20,
  },
  cancelBtn: {
    marginRight: wp(20),
    borderRadius: 10,
  },
  btnText: {
    fontSize: 12,
    letterSpacing: 0.84,
  },
  modalAssetsWrapper: {
    width: windowWidth * 0.8,
    alignItems: 'center',
    paddingVertical: hp(20),
  },
  modalMessageText: {
    fontSize: 14,
    letterSpacing: 0.13,
  },
  modalMessageWrapper: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  noInternetModalContainer: {
    width: wp(200),
    alignItems: 'center',
    marginTop: hp(20),
    marginBottom: hp(60),
  },
  testnetIndicatorWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  welcomeText: {
    marginTop: hp(47),
    textAlign: 'center',
  },
  passcodeWrapper: {
    alignItems: 'center',
    marginTop: hp(45),
    gap: hp(15),
  },
});

export default LoginScreen;
