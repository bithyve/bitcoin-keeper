import { Box, HStack, Switch, Text } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { increasePinFailAttempts, resetPinFailAttempts } from '../../store/reducers/storage';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

import { AppContext } from 'src/common/content/AppContext';
import CustomButton from 'src/components/CustomButton/CustomButton';
import DeleteIcon from 'src/assets/icons/deleteBlack.svg';
import FogotPassword from './components/FogotPassword';
import KeyPadView from '../../components/AppNumPad/KeyPadView';
import LinearGradient from 'react-native-linear-gradient';
import { LocalizationContext } from 'src/common/content/LocContext';
import LoginMethod from 'src/common/data/enums/LoginMethod';
import ModalContainer from 'src/components/Modal/ModalContainer';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import { NetworkType } from 'src/core/wallets/enums';
import PinInputsView from 'src/components/AppPinInput/PinInputsView';
import { RFValue } from 'react-native-responsive-fontsize';
import ReactNativeBiometrics from 'react-native-biometrics';
import ResetPassSuccess from './components/ResetPassSuccess';
import config from 'src/core/config';
import { credsAuth } from '../../store/sagaActions/login';
import { credsAuthenticated } from '../../store/reducers/login';
import messaging from '@react-native-firebase/messaging';
import { updateFCMTokens } from 'src/store/sagaActions/notifications';

const TIMEOUT = 60;
const RNBiometrics = new ReactNativeBiometrics();

const LoginScreen = ({ navigation, route }) => {
  const { relogin } = route.params;
  const dispatch = useAppDispatch();
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);
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
  const { setAppLoading, setLoadingContent } = useContext(AppContext);
  const login = translations['login'];
  const common = translations['common'];

  useEffect(() => {
    if (loggingIn) {
      attemptLogin(passcode);
    }
  }, [loggingIn]);

  useEffect(() => {
    setLoadingContent({
      title: 'Logging in to your Keeper',
      subTitle: 'Shake your device or take a screenshot to send feedback',
      message:
        'This feature is *only* for the testnet version of the app. The developers will get your message along with other information from the app.',
    });
  }, []);

  useEffect(() => {
    if (failedAttempts >= 1) {
      const retryTime = Number((Date.now() - lastLoginFailedAt) / 1000);
      const waitingTime = TIMEOUT * failedAttempts;
      if (retryTime > waitingTime) {
        setCanLogin(true);
        return;
      } else {
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
      setLoadingContent({
        title: '',
        subTitle: '',
        message: '',
      });
      setAppLoading(false);
      setLoginError(true);
      setErrMessage('Incorrect password');
      setPasscode('');
      setAttempts(attempts + 1);
      setLogging(false);
    } else {
      setLoginError(false);
    }
  }, [authenticationFailed]);

  useEffect(() => {
    if (isAuthenticated) {
      setLoadingContent({
        title: '',
        subTitle: '',
        message: '',
      });
      setAppLoading(false);
      if (relogin) {
        navigation.goBack();
      } else {
        if (appId !== '') {
          updateFCM();
          navigation.replace('App');
        } else {
          navigation.replace('NewKeeperApp');
        }
      }
      dispatch(credsAuthenticated(false));
    }
  }, [isAuthenticated]);

  const updateFCM = async () => {
    try {
      const token = await messaging().getToken();
      if (!existingFCMToken || existingFCMToken != token) dispatch(updateFCMTokens([token]));
    } catch (error) {
      console.log(error);
    }
  };

  const attemptLogin = (passcode: string) => {
    setAppLoading(true);
    dispatch(credsAuth(passcode, LoginMethod.PIN, relogin));
  };

  const onPinChange = () => {
    setLoginError(false);
    setErrMessage('');
    setAttempts(0);
    dispatch(resetPinFailAttempts());
    setResetPassSuccessVisible(true);
  };

  return (
    <LinearGradient colors={['#00836A', '#073E39']} style={styles.linearGradient}>
      <Box flex={1}>
        <StatusBar />
        <Box flex={1}>
          <Box>
            <Text
              ml={5}
              color={'light.textLight'}
              fontSize={RFValue(22)}
              fontWeight={'200'}
              fontFamily={'heading'}
              style={{
                marginTop: hp('10%')
              }}
            >
              {login.welcomeback}
              {/* {wallet?wallet.walletName: ''} */}
            </Text>
            <Box>
              <Text fontSize={RFValue(13)} ml={5} color={'light.textColor'} fontFamily={'body'}>
                {/* {strings.EnterYourName}{' '} */}
                {login.enter_your}
                {login.passcode}
                {/* <Text fontSize={RFValue(13)} fontFamily={'body'}>
                  {login.passcode}
                </Text> */}
              </Text>
              {/* pin input view */}
              <Box marginTop={hp(7)}>
                <PinInputsView passCode={passcode} passcodeFlag={passcodeFlag} />
              </Box>
              {/*  */}
            </Box>

            {loginError && (
              <Text
                color={'light.white'}
                fontSize={RFValue(12)}
                fontStyle={'italic'}
                textAlign={'right'}
                fontWeight={200}
                letterSpacing={0.65}
                mr={12}
              >
                {errMessage}
              </Text>
            )}
            <HStack justifyContent={'space-between'} mr={10} paddingTop={'2'}>
              <Text
                color={'light.white1'}
                fontWeight={'200'}
                px={'5'}
                fontSize={13}
                letterSpacing={1}
              >
                {'Use bitcoin testnet'}
              </Text>
              <Switch
                defaultIsChecked
                disabled={true}
                trackColor={{ true: '#FFFA' }}
                thumbColor={'#358475'}
                onChange={() => { }}
              />
            </HStack>
            <Box mt={10} alignSelf={'flex-end'} mr={10}>
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
              <Text
                color={'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(14)}
                fontFamily={'body'}
              >
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
        <ModalContainer
          visible={forgotVisible}
          closeBottomSheet={() => {
            setForgotVisible(false);
          }}
        >
          <FogotPassword
            type="seed"
            closeBottomSheet={() => {
              setForgotVisible(false);
            }}
            onVerify={() => {
              setForgotVisible(false);
              navigation.navigate('ResetPin', {
                onPinChange,
              });
            }}
          />
        </ModalContainer>
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  textBoxStyles: {
    height: wp('13%'),
    width: wp('13%'),
    borderRadius: 7,
    marginLeft: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDF7F0',
  },
  textBoxActive: {
    height: wp('13%'),
    width: wp('13%'),
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
    fontSize: RFValue(13),
    textAlign: 'center',
    lineHeight: 18,
  },
  textFocused: {
    color: '#000000',
    fontSize: RFValue(13),
    textAlign: 'center',
    lineHeight: 18,
  },
  linearGradient: {
    flex: 1,
    padding: 10,
  },
});

export default LoginScreen;
