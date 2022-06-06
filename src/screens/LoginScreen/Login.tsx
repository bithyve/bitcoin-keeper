import React, { useState, useContext, useEffect } from 'react';
import { StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, Text } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
// import messaging from '@react-native-firebase/messaging'
import LinearGradient from 'react-native-linear-gradient';
// import { LocalizationContext } from '../../common/content/LocContext'
// import { credsAuth } from '../../store/actions/setupAndAuth'
// import { autoSyncShells } from '../../store/actions/accounts'
import { useDispatch, useSelector } from 'react-redux';
// import { setFCMToken } from '../../store/actions/preferences'
// import { updateFCMTokens } from '../../store/actions/notifications'
import KeyPadView from '../../components/AppNumPad/KeyPadView';
import CustomButton from 'src/components/CustomButton/CustomButton';
import ModalContainer from 'src/components/Modal/ModalContainer';
import FogotPassword from './components/FogotPassword';
// import { LoginMethod } from '../../bitcoin/utilities/Interface'
// import ReactNativeBiometrics from 'react-native-biometrics'

const CreatePin = ({ navigation }: any) => {
  // const { translations } = useContext( LocalizationContext )
  // const strings = translations[ 'login' ]
  // const common = translations[ 'common' ]
  const dispatch = useDispatch();
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [errMessage, setErrMessage] = useState('');
  const [passcodeFlag] = useState(true);
  const [isDisabledProceed, setIsDisabledProceed] = useState(false);

  const [forgotVisible, setForgotVisible] = useState(false);

  const [Elevation, setElevation] = useState(10);
  const [attempts, setAttempts] = useState(0);
  // const { isAuthenticated, authenticationFailed, canLogin, failedLogin } = useSelector(
  //   ( state ) => state.setupAndAuth,
  // )
  // const { walletExists, loginMethod, wallet } = useSelector( ( state ) => state.storage )
  // const existingFCMToken = useSelector(
  //   ( state ) => state.preferences.fcmTokenValue,
  // )

  // useEffect(() => {
  //   biometricAuth()
  // }, [])

  // const biometricAuth = async () => {
  //   if(loginMethod === LoginMethod.BIOMETRIC){
  //     try {
  //       const {success, signature} = await ReactNativeBiometrics.createSignature({
  //         promptMessage: 'Authenticate',
  //         payload: wallet.walletId,
  //         cancelButtonText: 'Use PIN'
  //       })
  //       if(success){
  //         dispatch( credsAuth( signature, LoginMethod.BIOMETRIC ) )
  //       }

  //     } catch ( error ) {
  //       //
  //       console.log(error)
  //     }
  //   }
  // }

  // useEffect( ()=>{
  //   if( walletExists ) {
  //     storeFCMToken()
  //   }
  // } )

  // const storeFCMToken = async () => {
  //   try {
  //     const fcmToken = await messaging().getToken()
  //     if ( !existingFCMToken || existingFCMToken != fcmToken ) {
  //       dispatch( setFCMToken( fcmToken ) )
  //       dispatch( updateFCMTokens( [ fcmToken ] ) )
  //     }
  //   } catch ( error ) {
  //     //
  //   }
  // }

  const onPressNumber = (text: any) => {
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

  // useEffect( () => {
  //   if ( authenticationFailed && passcode ) {
  //     setLoginError( true )
  //     setErrMessage(strings.Incorrect)
  //     setPasscode( '' )
  //     setAttempts( attempts + 1 )
  //   } else {
  //     setLoginError( false )
  //   }
  // }, [ authenticationFailed ] )

  // useEffect( () => {
  //   if ( isAuthenticated ) {
  //     if( !walletExists ) {
  //       navigation.replace( 'WalletInitialization' )
  //       } else {
  //         dispatch( autoSyncShells(true) )
  //         navigation.replace( 'Home' )
  //     }
  //   }
  // }, [ isAuthenticated, walletExists ] )

  // const attemptLogin = ( passcode: any ) => {
  //   dispatch( credsAuth( passcode, LoginMethod.PIN ) )
  // }

  return (
    <LinearGradient colors={['#00836A', '#073E39']} style={styles.linearGradient}>
      <Box flex={1}>
        <StatusBar />
        <Box flex={1}>
          <Box>
            <Text ml={5} color={'#FFF'} fontSize={RFValue(16)} mt={hp('10%')} fontWeight={'bold'}>
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
                    <Text
                      style={[
                        passcode.length == 0 && passcodeFlag == true
                          ? styles.textFocused
                          : styles.textStyles,
                      ]}
                    >
                      {passcode.length >= 1 ? (
                        <Text
                          fontSize={RFValue(10)}
                          textAlignVertical={'center'}
                          justifyContent={'center'}
                          alignItems={'center'}
                        >
                          <FontAwesome size={10} name={'circle'} color={'#000'} />
                        </Text>
                      ) : passcode.length == 0 && passcodeFlag == true ? (
                        <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                      ) : (
                        ''
                      )}
                    </Text>
                  </Box>
                  <Box style={[passcode.length == 1 ? styles.textBoxActive : styles.textBoxStyles]}>
                    <Text style={[passcode.length == 1 ? styles.textFocused : styles.textStyles]}>
                      {passcode.length >= 2 ? (
                        <Text
                          style={{
                            fontSize: RFValue(10),
                          }}
                        >
                          <FontAwesome size={10} name={'circle'} color={'#000'} />
                        </Text>
                      ) : passcode.length == 1 ? (
                        <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                      ) : (
                        ''
                      )}
                    </Text>
                  </Box>
                  <Box style={[passcode.length == 2 ? styles.textBoxActive : styles.textBoxStyles]}>
                    <Text style={[passcode.length == 2 ? styles.textFocused : styles.textStyles]}>
                      {passcode.length >= 3 ? (
                        <Text
                          style={{
                            fontSize: RFValue(10),
                          }}
                        >
                          <FontAwesome size={10} name={'circle'} color={'#000'} />
                        </Text>
                      ) : passcode.length == 2 ? (
                        <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                      ) : (
                        ''
                      )}
                    </Text>
                  </Box>
                  <Box style={[passcode.length == 3 ? styles.textBoxActive : styles.textBoxStyles]}>
                    <Text style={[passcode.length == 3 ? styles.textFocused : styles.textStyles]}>
                      {passcode.length >= 4 ? (
                        <Text
                          style={{
                            fontSize: RFValue(10),
                          }}
                        >
                          <FontAwesome size={10} name={'circle'} color={'#000'} />
                        </Text>
                      ) : passcode.length == 3 ? (
                        <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                      ) : (
                        ''
                      )}
                    </Text>
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
                py={20}
              >
                {errMessage}
              </Text>
            )}

            <Box mt={10} alignSelf={'flex-end'} mr={10}>
              {passcode.length == 4 && (
                <Box>
                  <CustomButton
                    onPress={() => {
                      navigation.navigate('NewHome');
                      setLoginError(false);
                      setTimeout(() => {
                        setIsDisabledProceed(true);
                        setElevation(0);
                      }, 2);
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
                marginTop: '20%',
                elevation: Elevation,
                marginHorizontal: 20,
              }}
              onPress={() => {
                setForgotVisible(true);
              }}
            >
              <Text color={'white'}>{'Forgot Passcode?'}</Text>
            </TouchableOpacity>
          )}
          {/* keyboardview start */}
          <KeyPadView onPressNumber={onPressNumber} />
        </Box>
        {/* forgot modal */}
        <ModalContainer
          visible={forgotVisible}
          closeBottomSheet={() => {
            setForgotVisible(false);
          }}
        >
          <FogotPassword
            closeBottomSheet={() => {
              setForgotVisible(false);
            }}
            onNavigate={() => navigation.navigate('ResetPin')}
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
    backgroundColor: '#FCFCFC',
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
    backgroundColor: '#FAFAFA',
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
  },
});

export default CreatePin;
