import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, Text } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import { credsAuth } from '../../store/sagaActions/login';
import { increasePinFailAttempts, resetPinFailAttempts } from '../../store/reducers/storage';
import KeyPadView from '../../components/AppNumPad/KeyPadView';
import CustomButton from 'src/components/CustomButton/CustomButton';
import ModalContainer from 'src/components/Modal/ModalContainer';
import FogotPassword from './components/FogotPassword';
import LoginMethod from 'src/common/data/enums/LoginMethod';
import ReactNativeBiometrics from 'react-native-biometrics';
import DotView from 'src/components/DotView';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

const TIMEOUT = 60

const CreatePin = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [errMessage, setErrMessage] = useState('');
  const [passcodeFlag] = useState(true);
  const [forgotVisible, setForgotVisible] = useState(false);
  const loginMethod = useAppSelector((state) => state.settings.loginMethod);
  const { appId, failedAttempts, lastLoginFailedAt } = useAppSelector((state) => state.storage);
  const [Elevation, setElevation] = useState(10);
  const [attempts, setAttempts] = useState(0);
  // const [timeout, setTimeout] = useState(0)
  const [canLogin, setCanLogin] = useState(false)
  const { isAuthenticated, authenticationFailed } = useAppSelector(
    (state) => state.login
  );

  useEffect(() => {
    if (failedAttempts >= 1) {
      const retryTime = Number((Date.now() - lastLoginFailedAt) / 1000);
      const waitingTime = TIMEOUT * failedAttempts;
      if (retryTime > waitingTime) {
        setCanLogin(true)
        return
      } else {
        setTimeout(() => {
          setLoginError(true)
          setErrMessage(`Please try after sometime`)
          setCanLogin(false)
        }, 100);
        return
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
    setCanLogin(true)
  }, [failedAttempts, lastLoginFailedAt])

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
            const { success, signature } = await ReactNativeBiometrics.createSignature({
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

  useEffect(() => {
    if (attempts >= 3) {
      setAttempts(1)
      dispatch(increasePinFailAttempts())
    }
  }, [attempts])

  useEffect(() => {
    if (authenticationFailed && passcode) {
      setLoginError(true);
      setErrMessage('Incorrect password');
      setPasscode('');
      setAttempts(attempts + 1);
    } else {
      setLoginError(false);
    }
  }, [authenticationFailed]);

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('NewHome');
    }
  }, [isAuthenticated]);

  const attemptLogin = (passcode: string) => {
    dispatch(credsAuth(passcode, LoginMethod.PIN));
  };

  const onPinChange = () => {
    setLoginError(false);
    setErrMessage('');
    setAttempts(0)
    dispatch(resetPinFailAttempts())
  }

  return (
    <LinearGradient colors={['#00836A', '#073E39']} style={styles.linearGradient}>
      <Box flex={1}>
        <StatusBar />
        <Box flex={1}>
          <Box>
            <Text ml={5} color={'#FFF'} fontSize={RFValue(22)} mt={hp('10%')} fontWeight={'bold'}>
              {'Welcome Back,'}
              {/* {wallet?wallet.walletName: ''} */}
            </Text>
            <Box>
              <Text fontSize={RFValue(12)} ml={5} color={'#CDD8D6'}>
                {/* {strings.EnterYourName}{' '} */}
                {'Enter your '}
                <Text fontWeight={'bold'} fontStyle={'italic'}>
                  {/* {strings.passcode} */}
                  {'passcode'}
                </Text>
              </Text>
              <Box alignSelf={'baseline'}>
                <Box
                  flexDirection={'row'}
                  marginTop={hp('4.5%')}
                  marginBottom={hp('1.5%')}
                  width={'auto'}
                >
                  <Box
                    style={[
                      passcode.length == 0 && passcodeFlag == true
                        ? styles.textBoxActive
                        : styles.textBoxStyles,
                    ]}
                  >
                    <Box>
                      {passcode.length >= 1 ? (
                        <DotView />
                      ) : passcode.length == 0 && passcodeFlag == true ? (
                        <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                      ) : (
                            ''
                          )}
                    </Box>
                  </Box>
                  <Box
                    style={[
                      passcode.length == 1 && passcodeFlag == true
                        ? styles.textBoxActive
                        : styles.textBoxStyles,
                    ]}
                  >
                    <Box>
                      {passcode.length >= 2 ? (
                        <DotView />
                      ) : passcode.length == 1 ? (
                        <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                      ) : (
                            ''
                          )}
                    </Box>
                  </Box>
                  <Box
                    style={[
                      passcode.length == 2 && passcodeFlag == true
                        ? styles.textBoxActive
                        : styles.textBoxStyles,
                    ]}
                  >
                    <Box>
                      {passcode.length >= 3 ? (
                        <DotView />
                      ) : passcode.length == 2 ? (
                        <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                      ) : (
                            ''
                          )}
                    </Box>
                  </Box>
                  <Box
                    style={[
                      passcode.length == 3 && passcodeFlag == true
                        ? styles.textBoxActive
                        : styles.textBoxStyles,
                    ]}
                  >
                    <Box>
                      {passcode.length >= 4 ? (
                        <DotView />
                      ) : passcode.length == 3 ? (
                        <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                      ) : (
                            ''
                          )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
            {loginError && (
              <Text
                color={'white'}
                fontSize={RFValue(12)}
                fontStyle={'italic'}
                textAlign={'right'}
                mr={20}
              >
                {errMessage}
              </Text>
            )}

            <Box mt={10} alignSelf={'flex-end'} mr={10}>
              {passcode.length == 4 && (
                <Box>
                  <CustomButton
                    onPress={() => {
                      setLoginError(false);
                      setElevation(0);
                      attemptLogin(passcode);
                    }}
                    value={'Proceed'}
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
                elevation: Elevation,
                margin: 20,
              }}
              onPress={() => {
                setForgotVisible(true);
              }}
            >
              <Text color={'white'} fontWeight={'bold'} fontSize={RFValue(14)}>
                {'Forgot Passcode?'}
              </Text>
            </TouchableOpacity>
          )}
          {/* keyboardview start */}
          <KeyPadView disabled={!canLogin} onPressNumber={onPressNumber} />
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
              })
            }}
          />
        </ModalContainer>
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
  passcodeTextInputText: {
    color: '#006CB4',
    fontWeight: 'bold',
    fontSize: RFValue(13),
  },
  linearGradient: {
    flex: 1,
    padding: 10,
  },
});

export default CreatePin;
