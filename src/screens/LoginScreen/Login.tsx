/* eslint-disable react/no-unstable-nested-components */
import Text from 'src/components/KeeperText';
import { Box, StatusBar, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import TorAsset from 'src/components/Loader';
import CustomButton from 'src/components/CustomButton/CustomButton';
import KeeperModal from 'src/components/KeeperModal';
import LoginMethod from 'src/models/enums/LoginMethod';
import ModalContainer from 'src/components/Modal/ModalContainer';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import PinInputsView from 'src/components/AppPinInput/PinInputsView';
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
import { setTorEnabled } from 'src/store/reducers/settings';
import { AppSubscriptionLevel, SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import SubScription from 'src/models/interfaces/Subscription';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { Shadow } from 'react-native-shadow-2';
import ResetPassSuccess from './components/ResetPassSuccess';
import { credsAuth } from 'src/store/sagaActions/login';
import { credsAuthenticated, setRecepitVerificationError } from 'src/store/reducers/login';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import FogotPassword from './components/FogotPassword';
import { resetPinFailAttempts } from 'src/store/reducers/storage';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import BounceLoader from 'src/components/BounceLoader';

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
  const [passcodeFlag] = useState(true);
  const [forgotVisible, setForgotVisible] = useState(false);
  const [resetPassSuccessVisible, setResetPassSuccessVisible] = useState(false);
  const existingFCMToken = useAppSelector((state) => state.notifications.fcmToken);
  const { loginMethod, torEnbled } = useAppSelector((state) => state.settings);
  const { appId, failedAttempts, lastLoginFailedAt } = useAppSelector((state) => state.storage);
  const [loggingIn, setLogging] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [incorrectPassword, setIncorrectPassword] = useState(false);
  const [loginData, setLoginData] = useState(getSecurityTip());
  const [torStatus, settorStatus] = useState<TorStatus>(RestClient.getTorStatus());

  const [canLogin, setCanLogin] = useState(false);
  const { isAuthenticated, authenticationFailed, recepitVerificationError } = useAppSelector(
    (state) => state.login
  );

  const { translations } = useContext(LocalizationContext);
  const { login } = translations;
  const { common } = translations;

  const onChangeTorStatus = (status: TorStatus) => {
    settorStatus(status);
  };

  useEffect(() => {
    RestClient.subToTorStatus(onChangeTorStatus);
    if (loggingIn) {
      attemptLogin(passcode);
    }
    return () => {
      RestClient.unsubscribe(onChangeTorStatus);
    };
  }, [loggingIn]);

  useEffect(() => {
    if (failedAttempts >= 1) {
      const retryTime = Number((Date.now() - lastLoginFailedAt) / 1000);
      const waitingTime = TIMEOUT * failedAttempts;
      if (retryTime > waitingTime) {
        setCanLogin(true);
        return;
      }
      setTimeout(() => {
        setLoginError(true);
        setErrMessage(`Please try after sometime`);
        setCanLogin(false);
      }, 100);
      return;
    }
    setCanLogin(true);
  }, [failedAttempts, lastLoginFailedAt]);

  useEffect(() => {
    biometricAuth();
  }, [canLogin]);

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
              setLoginModal(true);
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

  // useEffect(() => {
  //   if (attempts >= 3) {
  //     setAttempts(1);
  //     dispatch(increasePinFailAttempts());
  //   }
  // }, [attempts]);

  useEffect(() => {
    if (authenticationFailed && passcode) {
      setLoginModal(false);
      setLoginError(true);
      setErrMessage('Incorrect passcode');
      setPasscode('');
      // setAttempts(attempts + 1);
      setIncorrectPassword(true);
      setLogging(false);
    } else {
      setLoginError(false);
    }
  }, [authenticationFailed]);

  useEffect(() => {
    if (isAuthenticated && internalCheck) {
      navigation.navigate({
        name: screen,
        params: { isAuthenticated: true },
        merge: true,
      });
      dispatch(credsAuthenticated(false));
    }
  }, [isAuthenticated]);

  const loginModalAction = () => {
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

  const onPinChange = () => {
    setLoginError(false);
    setErrMessage('');
    // setAttempts(0);
    setIncorrectPassword(false);
    dispatch(resetPinFailAttempts());
    setResetPassSuccessVisible(true);
  };

  const toggleTor = () => {
    if (torStatus === TorStatus.OFF || torStatus === TorStatus.ERROR) {
      RestClient.setUseTor(true);
      dispatch(setTorEnabled(true));
    } else {
      RestClient.setUseTor(false);
      dispatch(setTorEnabled(false));
    }
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
        <Text color={`${colorMode}.greenText`} style={styles.modalMessageText}>
          {modelMessage}
        </Text>
        {modelButtonText === null ? (
          <Box style={styles.modalMessageWrapper}>
            <Box style={{ width: '80%' }}>
              <Text
                color={`${colorMode}.greenText`}
                style={[styles.modalMessageText, { paddingTop: hp(20) }]}
              >
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
    navigation.replace('App');
  }

  // eslint-disable-next-line react/no-unstable-nested-components
  function NoInternetModalContent() {
    return (
      <Box width={wp(250)}>
        {colorMode === 'light' ? <DowngradeToPleb /> : <DowngradeToPlebDark />}
        {/* <Text numberOfLines={1} style={[styles.btnText, { marginBottom: 30, marginTop: 20 }]}>You may choose to downgrade to Pleb</Text> */}
        <Box mt={10} alignItems="center" flexDirection="row">
          <TouchableOpacity
            style={[styles.cancelBtn]}
            onPress={() => {
              setLoginError(false);
              setLogging(false);
              dispatch(setRecepitVerificationError(false));
              resetToPleb();
            }}
            activeOpacity={0.5}
          >
            <Text numberOfLines={1} style={styles.btnText} color={`${colorMode}.greenText`} bold>
              Continue as Pleb
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setLoginError(false);
              setLogging(true);
              dispatch(setRecepitVerificationError(false));
            }}
          >
            <Shadow distance={10} startColor="#073E3926" offset={[3, 4]}>
              <Box
                style={[styles.createBtn]}
                paddingLeft={10}
                paddingRight={10}
                backgroundColor={`${colorMode}.greenButtonBackground`}
              >
                <Text numberOfLines={1} style={styles.btnText} color="light.white" bold>
                  Retry
                </Text>
              </Box>
            </Shadow>
          </TouchableOpacity>
        </Box>
      </Box>
    );
  }

  return (
    <Box style={styles.content} backgroundColor={`${colorMode}.primaryGreenBackground`}>
      <Box flex={1}>
        <StatusBar />
        <Box flex={1}>
          <Box>
            <Box
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: hp(44),
              }}
            >
              {isTestnet() && <TestnetIndicator />}
            </Box>
            <Text
              ml={5}
              color="light.primaryBackground"
              fontSize={22}
              style={{
                marginTop: hp(65),
              }}
            >
              {relogin ? title : login.welcomeback}
            </Text>
            <Box>
              <Text fontSize={13} ml={5} letterSpacing={0.65} color="light.primaryBackground">
                {login.enter_your}
                {login.passcode}
              </Text>
              {/* pin input view */}
              <Box
                style={{
                  marginTop: hp(50),
                }}
              >
                <PinInputsView passCode={passcode} passcodeFlag={passcodeFlag} />
              </Box>
              {/*  */}
            </Box>
            <Box>
              {loginError && (
                <Text style={styles.errorMessage} color={`${colorMode}.error`}>
                  {errMessage}
                </Text>
              )}
            </Box>
          </Box>

          {/* <HStack justifyContent="space-between" mr={10} paddingTop="1">
            <Text color="light.white" px="5" fontSize={13} letterSpacing={1}>
              Use tor
            </Text>
            <Switch
              value={torEnbled}
              trackColor={{ true: '#FFFA' }}
              thumbColor="#358475"
              onChange={toggleTor}
              defaultIsChecked={torEnbled}
            />
          </HStack> */}
          {/* {attempts >= 1 ? (
              <TouchableOpacity
                style={[styles.forgotPassWrapper, { elevation: loggingIn ? 0 : 10 }]}
                onPress={() => {
                  setForgotVisible(true);
                }}
              >
                <Text color="light.primaryBackground" bold fontSize={14}>
                  {login.ForgotPasscode}
                </Text>
              </TouchableOpacity>
            ) : (
              <Box />
            )} */}
          <Box style={styles.btnWrapper}>
            {passcode.length === 4 && (
              <Box>
                <CustomButton
                  onPress={() => {
                    setLoginError(false);
                    setLogging(true);
                  }}
                  loading={loggingIn}
                  value={common.proceed}
                />
              </Box>
            )}
          </Box>
          {/* </Box> */}

          {/* keyboardview start */}
          <KeyPadView
            disabled={!canLogin}
            onDeletePressed={onDeletePressed}
            onPressNumber={onPressNumber}
            ClearIcon={<DeleteIcon />}
          />
        </Box>
        {/* forgot modal */}
        {forgotVisible && (
          <ModalContainer
            visible={forgotVisible}
            closeBottomSheet={() => {
              setForgotVisible(false);
            }}
          >
            <FogotPassword
              type="seed"
              closeBottomSheet={() => setForgotVisible(false)}
              onVerify={() => {
                setForgotVisible(false);
                navigation.navigate('ResetPin', {
                  onPinChange,
                });
              }}
            />
          </ModalContainer>
        )}
        {/* reset password success modal */}
        <Box>
          <ModalWrapper
            visible={resetPassSuccessVisible}
            onSwipeComplete={() => setResetPassSuccessVisible(false)}
          >
            <ResetPassSuccess
              closeBottomSheet={() => {
                setResetPassSuccessVisible(false);
              }}
            />
          </ModalWrapper>
        </Box>
      </Box>
      <KeeperModal
        visible={loginModal && !internalCheck}
        close={() => {}}
        title={modelTitle}
        subTitle={modelSubTitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.SlateGrey`}
        textColor={`${colorMode}.modalGreenTitle`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        showCloseIcon={false}
        buttonText={modelButtonText}
        buttonCallback={loginModalAction}
        showButtons
        Content={LoginModalContent}
        subTitleWidth={wp(250)}
      />

      <KeeperModal
        dismissible={false}
        close={() => {}}
        visible={recepitVerificationError}
        title="Something went wrong"
        subTitle="Please check your internet connection and try again."
        Content={NoInternetModalContent}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        subTitleWidth={wp(210)}
        showCloseIcon={false}
        showButtons
      />
      <KeeperModal
        visible={incorrectPassword}
        close={() => {}}
        title={'Incorrect Password'}
        subTitle={
          'You have entered an incorrect passcode. Please, try again. If you don’t remember your passcode, you will have to recover your wallet through the recovery flow'
        }
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.modalGreenTitle`}
        showCloseIcon={false}
        buttonText={'Retry'}
        buttonCallback={() => setIncorrectPassword(false)}
        showButtons
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
    letterSpacing: 0.65,
  },
  forgotPassWrapper: {
    flex: 0.8,
    margin: 20,
    width: '65%',
    marginTop: 30,
  },
  btnWrapper: {
    flex: 1,
    marginTop: 25,
    alignItems: 'flex-end',
    width: '92%',
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
    fontSize: 13,
    letterSpacing: 0.65,
  },
  modalMessageWrapper: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
});

export default LoginScreen;
