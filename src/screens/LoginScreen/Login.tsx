/* eslint-disable react/no-unstable-nested-components */
import Text from 'src/components/KeeperText';
import { Box } from 'native-base';
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import TorAsset from 'src/components/Loader';
import CustomButton from 'src/components/CustomButton/CustomButton';
import KeeperModal from 'src/components/KeeperModal';
import LinearGradient from 'src/components/KeeperGradient';
import { LocalizationContext } from 'src/common/content/LocContext';
import LoginMethod from 'src/common/data/enums/LoginMethod';
import ModalContainer from 'src/components/Modal/ModalContainer';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import PinInputsView from 'src/components/AppPinInput/PinInputsView';
import ReactNativeBiometrics from 'react-native-biometrics';
import messaging from '@react-native-firebase/messaging';
import { updateFCMTokens } from 'src/store/sagaActions/notifications';
import DeleteIcon from 'src/assets/images/deleteLight.svg';
import DowngradeToPleb from 'src/assets/images/downgradetopleb.svg';
import TestnetIndicator from 'src/components/TestnetIndicator';
import { isTestnet } from 'src/common/constants/Bitcoin';
import { getSecurityTip } from 'src/common/data/defaultData/defaultData';
import RestClient, { TorStatus } from 'src/core/services/rest/RestClient';
import { setTorEnabled } from 'src/store/reducers/settings';
import { AppSubscriptionLevel, SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import SubScription from 'src/common/data/models/interfaces/Subscription';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { Shadow } from 'react-native-shadow-2';
import ResetPassSuccess from './components/ResetPassSuccess';
import { credsAuth } from '../../store/sagaActions/login';
import { credsAuthenticated, setRecepitVerificationError } from '../../store/reducers/login';
import KeyPadView from '../../components/AppNumPad/KeyPadView';
import FogotPassword from './components/FogotPassword';
import { increasePinFailAttempts, resetPinFailAttempts } from '../../store/reducers/storage';

const TIMEOUT = 60;
const RNBiometrics = new ReactNativeBiometrics();

function LoginScreen({ navigation, route }) {
  const { relogin } = route.params;
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
  const { appId, failedAttempts, lastLoginFailedAt, } = useAppSelector((state) => state.storage);
  const [loggingIn, setLogging] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [loginData, setLoginData] = useState(getSecurityTip());
  const [torStatus, settorStatus] = useState<TorStatus>(RestClient.getTorStatus());

  const [canLogin, setCanLogin] = useState(false);
  const { isAuthenticated, authenticationFailed, recepitVerificationError } = useAppSelector((state) => state.login);

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

  useEffect(() => {
    if (attempts >= 3) {
      setAttempts(1);
      dispatch(increasePinFailAttempts());
    }
  }, [attempts]);

  useEffect(() => {
    if (authenticationFailed && passcode) {
      setLoginModal(false);
      setLoginError(true);
      setErrMessage('Incorrect password');
      setPasscode('');
      setAttempts(attempts + 1);
      setLogging(false);
    } else {
      setLoginError(false);
    }
  }, [authenticationFailed]);

  const loginModalAction = () => {
    if (isAuthenticated) {
      setLoginModal(false);
      if (relogin) {
        navigation.goBack();
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
    setAttempts(0);
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
        <Box style={styles.modalAssetsWrapper}>
          {modelAsset}
        </Box>
        <Text color="light.greenText" style={styles.modalMessageText}>
          {modelMessage}
        </Text>
        {modelButtonText === null ? <Text color="light.greenText" style={[styles.modalMessageText, { paddingTop: hp(20) }]}>
          This step will take a few seconds. You would be able to proceed soon
        </Text> : null}
      </Box>
    );
  }


  function resetToPleb() {
    const app: KeeperApp = dbManager.getCollection(RealmSchema.KeeperApp)[0]
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
        <DowngradeToPleb />
        {/* <Text numberOfLines={1} style={[styles.btnText, { marginBottom: 30, marginTop: 20 }]}>You may choose to downgrade to Pleb</Text> */}
        <Box mt={10} alignItems="center" flexDirection="row">
          <TouchableOpacity
            style={[
              styles.cancelBtn,
            ]}
            onPress={() => {
              setLoginError(false);
              setLogging(false);
              dispatch(setRecepitVerificationError(false));
              resetToPleb()
            }}
            activeOpacity={0.5}
          >
            <Text numberOfLines={1} style={styles.btnText} color="light.greenText" bold>
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
                style={[styles.createBtn,]}
                paddingLeft={10}
                paddingRight={10}
                backgroundColor={{
                  linearGradient: {
                    colors: ['light.gradientStart', 'light.gradientEnd'],
                    start: [0, 0],
                    end: [1, 1],
                  },
                }}
              >
                <Text numberOfLines={1} style={styles.btnText} color="light.white" bold>
                  Retry
                </Text>
              </Box>
            </Shadow>
          </TouchableOpacity>
        </Box>
      </Box>
    )
  }

  return (
    <LinearGradient
      colors={['light.gradientStart', 'light.gradientEnd']}
      style={styles.linearGradient}
    >
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
              {login.welcomeback}
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
                <Text style={styles.errorMessage} color="light.error">
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

          <Box style={styles.btnContainer}>
            {attempts >= 1 ? (
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
            )}
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
          </Box>

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
        visible={loginModal}
        close={() => { }}
        title={modelTitle}
        subTitle={modelSubTitle}
        subTitleColor="light.secondaryText"
        showCloseIcon={false}
        buttonText={modelButtonText}
        buttonCallback={loginModalAction}
        showButtons
        Content={LoginModalContent}
        subTitleWidth={wp(250)}
      />

      <KeeperModal
        dismissible={false}
        close={() => { }}
        visible={recepitVerificationError}
        title="Something went wrong"
        subTitle="Please check your internet connection and try again."
        Content={NoInternetModalContent}
        subTitleColor="light.secondaryText"
        subTitleWidth={wp(210)}
        showCloseIcon={false}
        showButtons
      />

      {/* <KeeperModal
        dismissible
        close={() => { setShowDowngradeModal(false) }}
        visible={showDowngradeModal}
        title="Failed to validate your subscription"
        subTitle="Do you want to downgrade to pleb and continue?"
        Content={DowngradeModalContent}
        subTitleColor="light.secondaryText"
        subTitleWidth={wp(210)}
        showCloseIcon
        closeOnOverlayClick={() => setShowDowngradeModal(false)}
        showButtons
      /> */}
    </LinearGradient>
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
  linearGradient: {
    flex: 1,
    padding: 10,
  },
  errorMessage: {
    fontStyle: 'italic',
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 0.65,
  },
  btnContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
  },
  forgotPassWrapper: {
    flex: 0.8,
    margin: 20,
    width: '65%',
    marginTop: 30,
  },
  btnWrapper: {
    marginTop: 25,
    alignSelf: 'flex-start',
    marginRight: 15,
    width: '35%',
  },
  createBtn: {
    paddingVertical: hp(15),
    borderRadius: 10,
    paddingHorizontal: 20
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
    width: '88%',
    alignItems: 'center',
    paddingVertical: hp(20),
  },
  modalMessageText: {
    fontSize: 13,
    letterSpacing: 0.65,
    width: wp(275),
  }
});

export default LoginScreen;
