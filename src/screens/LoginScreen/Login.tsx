import Text from 'src/components/KeeperText';
import { Box, Image } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

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
import TestnetIndicator from 'src/components/TestnetIndicator';
import { isTestnet } from 'src/common/constants/Bitcoin';
import ResetPassSuccess from './components/ResetPassSuccess';
import { credsAuth } from '../../store/sagaActions/login';
import { credsAuthenticated } from '../../store/reducers/login';
import KeyPadView from '../../components/AppNumPad/KeyPadView';
import FogotPassword from './components/FogotPassword';
import { increasePinFailAttempts, resetPinFailAttempts } from '../../store/reducers/storage';
import { securityTips } from 'src/common/data/defaultData/defaultData';

const TIMEOUT = 60;
const RNBiometrics = new ReactNativeBiometrics();

function LoginScreen({ navigation, route }) {
  const { relogin } = route.params;
  const dispatch = useAppDispatch();
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [randomNum, setRandomNum] = useState(0);
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

  const loginData = securityTips[randomNum];

  const [canLogin, setCanLogin] = useState(false);
  const { isAuthenticated, authenticationFailed } = useAppSelector((state) => state.login);

  const { translations } = useContext(LocalizationContext);
  const { login } = translations;
  const { common } = translations;


  useEffect(() => {
    setRandomNum(Math.round(Math.random() * 5));
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

  function LoginModalContent() {
    return (
      <Box>
        <Box style={{
          width: '100%',
          alignItems: 'center',
          paddingVertical: hp(20)
        }}>
          {loginData.assert}
        </Box>
        <Text color="light.greenText" fontSize={13} letterSpacing={0.65} width={wp(290)}>
          {loginData.message}
        </Text>
      </Box>
    );
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
              color="light.white"
              fontSize={22}
              style={{
                marginTop: hp(65),
              }}
            >
              {login.welcomeback}
            </Text>
            <Box>
              <Text fontSize={13} ml={5} letterSpacing={0.65} color="light.textColor">
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

            {loginError && (
              <Text
                style={styles.errorMessage}
                color="light.error"
                fontSize={12}
                textAlign="right"
                letterSpacing={0.65}
                mr={12}
              >
                {errMessage}
              </Text>
            )}
            <Box mt={10} alignSelf="flex-end" mr={10}>
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
              <Text color="light.white" bold fontSize={14}>
                {login.ForgotPasscode}
              </Text>
            </TouchableOpacity>
          )}

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
        title={loginData.title}
        subTitle={loginData.subTitle}
        subTitleColor="light.secondaryText"
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
  errorMessage: {
    fontStyle: 'italic',
  },
});

export default LoginScreen;
