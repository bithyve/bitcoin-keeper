import { Box, HStack, Image, Switch, Text } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

import CustomButton from 'src/components/CustomButton/CustomButton';
import KeeperModal from 'src/components/KeeperModal';
import LinearGradient from 'react-native-linear-gradient';
import { LocalizationContext } from 'src/common/content/LocContext';
import LoginMethod from 'src/common/data/enums/LoginMethod';
import ModalContainer from 'src/components/Modal/ModalContainer';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import PinInputsView from 'src/components/AppPinInput/PinInputsView';
import ReactNativeBiometrics from 'react-native-biometrics';
import messaging from '@react-native-firebase/messaging';
import { updateFCMTokens } from 'src/store/sagaActions/notifications';
import ResetPassSuccess from './components/ResetPassSuccess';
import { credsAuth } from '../../store/sagaActions/login';
import { credsAuthenticated } from '../../store/reducers/login';
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
  const loginMethod = useAppSelector((state) => state.settings.loginMethod);
  const { appId, failedAttempts, lastLoginFailedAt } = useAppSelector((state) => state.storage);
  const [loggingIn, setLogging] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const [canLogin, setCanLogin] = useState(false);
  const { isAuthenticated, authenticationFailed } = useAppSelector((state) => state.login);

  const { translations } = useContext(LocalizationContext);
  const { login } = translations;
  const { common } = translations;

  useEffect(() => {
    if (loggingIn) {
      attemptLogin(passcode);
    }
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
      // if (!timer) {
      //   setTimeout(waitingTime - retryTime)
      //   setCanLogin(false)
      //   return
      // } else if (timeout !== 0) {
      //   setCanLogin(false)
      //   return
      // }
    }
    setCanLogin(true);
  }, [failedAttempts, lastLoginFailedAt]);

  // useEffect(() => {
  //   if (timeout) {
  //     const interval = setInterval(() => {
  //       const timeLeft = timeout - 1
  //       setTimeout(timeout - 1)
  //       if (timeLeft <= 0) {
  //         setLoginError(false)
  //         setErrMessage('')
  //         setTimer(null)
  //       } else {
  //         setLoginError(true)
  //         setErrMessage(`Please try after ${Number(timeout - 1)} secs`)
  //       }
  //     }, 1000);
  //     setTimer(interval)
  //     return () => {
  //       clearInterval(interval);
  //     }
  //   }
  // }, [timeout]);

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
      if (text != 'x') {
        tmpPasscode += text;
        setPasscode(tmpPasscode);
      }
    }
    if (passcode && text == 'x') {
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
        navigation.replace('NewKeeperApp');
      }
      dispatch(credsAuthenticated(false));
    }
  };
  const updateFCM = async () => {
    try {
      const token = await messaging().getToken();
      if (!existingFCMToken || existingFCMToken != token) dispatch(updateFCMTokens([token]));
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
  function LoginModalContent() {
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
          width={wp(260)}
        >
          This feature is *only* for the testnet version of the app. The developers will get your
          message along with other information from the app.
        </Text>
      </Box>
    );
  }
  return (
    <LinearGradient colors={['#00836A', '#073E39']} style={styles.linearGradient}>
      <Box flex={1}>
        <StatusBar />
        <Box flex={1}>
          <Box>
            <Text
              ml={5}
              color="light.textLight"
              fontSize={22}
              fontWeight="200"
              fontFamily="heading"
              style={{
                marginTop: heightPercentageToDP('10%'),
              }}
            >
              {login.welcomeback}
              {/* {wallet?wallet.walletName: ''} */}
            </Text>
            <Box>
              <Text
                fontSize={13}
                ml={5}
                letterSpacing={0.65}
                color="light.textColor"
                fontFamily="body"
                fontWeight={200}
              >
                {/* {strings.EnterYourName}{' '} */}
                {login.enter_your}
                {login.passcode}
                {/* <Text fontSize={(13)} fontFamily={'body'}>
                  {login.passcode}
                </Text> */}
              </Text>
              {/* pin input view */}
              <Box marginTop={heightPercentageToDP(7)}>
                <PinInputsView passCode={passcode} passcodeFlag={passcodeFlag} />
              </Box>
              {/*  */}
            </Box>

            {loginError && (
              <Text
                color="light.error"
                fontSize={12}
                fontStyle="italic"
                textAlign="right"
                fontWeight={200}
                letterSpacing={0.65}
                mr={12}
              >
                {errMessage}
              </Text>
            )}
            <HStack justifyContent="space-between" mr={10} paddingTop="2">
              <Text color="light.white1" fontWeight="200" px="5" fontSize={13} letterSpacing={1}>
                Use bitcoin testnet
              </Text>
              <Switch
                defaultIsChecked
                disabled
                trackColor={{ true: '#FFFA' }}
                thumbColor="#358475"
                onChange={() => {}}
              />
            </HStack>
            <Box mt={10} alignSelf="flex-end" mr={10}>
              {passcode.length == 4 && (
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
          {attempts >= 1 && (
            <TouchableOpacity
              style={{
                flex: 0.8,
                justifyContent: 'flex-end',
                elevation: loggingIn ? 0 : 10,
                margin: 20,
              }}
              onPress={() => {
                setForgotVisible(true);
              }}
            >
              <Text color="light.white" fontWeight="300" fontSize={14} fontFamily="body">
                {login.ForgotPasscode}
              </Text>
            </TouchableOpacity>
          )}

          {/* keyboardview start */}
          <KeyPadView
            disabled={!canLogin}
            onDeletePressed={onDeletePressed}
            onPressNumber={onPressNumber}
            // ClearIcon={<DeleteIcon />}
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
        close={() => {}}
        title="Share Feedback"
        subTitle={`(Testnet only)\nShake your device to send us a bug report or a feature request`}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        textColor="#000"
        subTitleColor="#5F6965"
        showCloseIcon={false}
        buttonText={isAuthenticated ? 'Next' : null}
        buttonCallback={loginModalAction}
        Content={LoginModalContent}
        subTitleWidth={wp(210)}
      />
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
});

export default LoginScreen;
