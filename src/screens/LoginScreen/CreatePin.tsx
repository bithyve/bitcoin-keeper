import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, TouchableOpacity, StatusBar, TouchableHighlight } from 'react-native';
import { Box, Text } from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import { pinChangedFailed, storeCreds, switchCredsChanged } from '../../store/actions/login';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from 'src/components/CustomButton/CustomButton';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';

export default function CreatePin(props: any) {
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeFlag, setPasscodeFlag] = useState(true);
  const [confirmPasscodeFlag, setConfirmPasscodeFlag] = useState(0);
  const { oldPasscode } = props.route.params || {};
  const dispatch = useDispatch();
  const { credsChanged } = useSelector((state) => state.login);
  const [isDisabled, setIsDisabled] = useState(true);

  function onPressNumber(text: any) {
    let tmpPasscode = passcode;
    let tmpConfirmPasscode = confirmPasscode;
    if (passcodeFlag) {
      if (passcode.length < 4) {
        if (text != 'x') {
          tmpPasscode += text;
          setPasscode(tmpPasscode);
        }
      } else if (passcode.length == 4 && passcodeFlag) {
        setPasscodeFlag(false);
        setConfirmPasscodeFlag(1);
        setPasscode(passcode);
      }
      if (passcode && text == 'x') {
        const passcodeTemp = passcode.slice(0, -1);
        setPasscode(passcodeTemp);
        if (passcodeTemp.length == 0) {
          setConfirmPasscodeFlag(0);
        }
      }
    } else if (confirmPasscodeFlag) {
      if (confirmPasscode.length < 4) {
        if (text != 'x') {
          tmpConfirmPasscode += text;
          setConfirmPasscode(tmpConfirmPasscode);
        }
      }
      if (confirmPasscode && text == 'x') {
        setConfirmPasscode(confirmPasscode.slice(0, -1));
      } else if (!confirmPasscode && text == 'x') {
        setPasscodeFlag(true);
        setConfirmPasscodeFlag(0);
        setConfirmPasscode(confirmPasscode);
      }
    }
  }

  useEffect(() => {
    if (confirmPasscode.length <= 4 && confirmPasscode.length > 0 && passcode.length == 4) {
      setPasscodeFlag(false);
      setConfirmPasscodeFlag(2);
    } else if (passcode.length == 4 && confirmPasscodeFlag != 2) {
      setPasscodeFlag(false);
      setConfirmPasscodeFlag(1);
    } else if (
      !confirmPasscode &&
      passcode.length > 0 &&
      passcode.length <= 4 &&
      confirmPasscodeFlag == 2
    ) {
      setPasscodeFlag(true);
      setConfirmPasscodeFlag(0);
    } else if (!confirmPasscode && passcode.length > 0 && passcode.length <= 4) {
      setPasscodeFlag(true);
      setConfirmPasscodeFlag(0);
    }
  }, [passcode, confirmPasscode]);

  useEffect(() => {
    if (credsChanged == 'changed') {
      setIsDisabled(false);
      if (oldPasscode === '') {
        dispatch(switchCredsChanged());
        props.navigation.goBack();
        if (props.navigation.state.params.onPasscodeReset) {
          props.navigation.state.params.onPasscodeReset();
        }
      } else {
        props.navigation.navigate('PasscodeChangeSuccessPage');
      }
    }
  }, [credsChanged]);

  // if (isPinChangedFailed) {
  //   setTimeout(() => {
  //     setErrorMessageHeader('Passcode change error');
  //     setErrorMessage('There was some error while changing the Passcode, please try again');
  //   }, 2);
  //   (ErrorBottomSheet as any).current.snapTo(1);
  //   dispatch(pinChangedFailed(null));
  // }

  useEffect(() => {
    if (passcode == confirmPasscode) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [passcode, confirmPasscode]);

  return (
    <LinearGradient colors={['#00836A', '#073E39']} style={styles.linearGradient}>
      <Box flex={1}>
        <Box pt={50}>
          <StatusBar barStyle={'light-content'} />
        </Box>
        <Box flex={1}>
          <Box>
            {/* {oldPasscode !== '' && (
              <Box
                borderBottomWidth={1}
                borderColor={'#E3E3E3'}
                alignItems={'center'}
                flexDirection={'row'}
                pr={10}
                pb={15}
                pt={10}
                ml={20}
                mb={15}
              >
                <Box flexDirection={'row'} alignItems={'center'}>
                  <TouchableOpacity
                    onPress={() => props.navigation.goBack()}
                    hitSlop={{
                      top: 20,
                      left: 20,
                      bottom: 20,
                      right: 20,
                    }}
                    style={{
                      height: 30,
                      width: 30,
                      justifyContent: 'center',
                    }}
                  >
                    <FontAwesome name="long-arrow-left" color={'#000'} size={17} />
                  </TouchableOpacity>
                  <Text color={'#006CB4'} fontSize={RFValue(25)} ml={20} mt={hp('10%')}>
                    {'Manage Passcode'}
                  </Text>
                </Box>
              </Box>
            )} */}

            <Box>
              <Text ml={5} mt={hp(1)} fontSize={RFValue(22)} color={'#FFFFFF'}>
                Welcome
              </Text>
              <Text color={'#FFFFFF'} fontSize={RFValue(12)} ml={5}>
                {'Enter New '}{' '}
                <Text fontWeight={'bold'} fontStyle={'italic'}>
                  {'Passcode'}
                </Text>
              </Text>

              <Box>
                <Box flexDirection={'row'} mt={hp('4.5%')} mb={hp('4.5%')}>
                  <Box
                    style={[
                      passcode.length == 0 && passcodeFlag == true
                        ? styles.textBoxActive
                        : styles.textBoxStyles,
                    ]}
                  >
                    <Text
                      color={'#000'}
                      fontSize={RFValue(13)}
                      textAlign={'center'}
                      lineHeight={18}
                    >
                      {passcode.length >= 1 ? (
                        <Text
                          style={{
                            fontSize: RFValue(10),
                            textAlignVertical: 'center',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <FontAwesome size={8} name={'circle'} color={'#000'} />
                        </Text>
                      ) : passcode.length == 0 && passcodeFlag == true ? (
                        <Text color={'#006CB4'} fontWeight={'bold'} fontSize={RFValue(13, 812)}>
                          {'|'}
                        </Text>
                      ) : (
                            ''
                          )}
                    </Text>
                  </Box>
                  <Box style={[passcode.length == 1 ? styles.textBoxActive : styles.textBoxStyles]}>
                    <Text
                      color={'#000'}
                      fontSize={RFValue(13)}
                      textAlign={'center'}
                      lineHeight={18}
                    >
                      {passcode.length >= 2 ? (
                        <Text
                          style={{
                            fontSize: RFValue(10, 812),
                          }}
                        >
                          <FontAwesome size={8} name={'circle'} color={'#000'} />
                        </Text>
                      ) : passcode.length == 1 ? (
                        <Text color={'#006CB4'} fontWeight={'bold'} fontSize={RFValue(13, 812)}>
                          {'|'}
                        </Text>
                      ) : (
                            ''
                          )}
                    </Text>
                  </Box>
                  <Box style={[passcode.length == 2 ? styles.textBoxActive : styles.textBoxStyles]}>
                    <Text
                      color={'#000'}
                      fontSize={RFValue(13)}
                      textAlign={'center'}
                      lineHeight={18}
                    >
                      {passcode.length >= 3 ? (
                        <Text
                          style={{
                            fontSize: RFValue(10, 812),
                          }}
                        >
                          <FontAwesome size={8} name={'circle'} color={'#000'} />
                        </Text>
                      ) : passcode.length == 2 ? (
                        <Text color={'#006CB4'} fontWeight={'bold'} fontSize={RFValue(13, 812)}>
                          {'|'}
                        </Text>
                      ) : (
                            ''
                          )}
                    </Text>
                  </Box>
                  <Box style={[passcode.length == 3 ? styles.textBoxActive : styles.textBoxStyles]}>
                    <Text
                      color={'#000'}
                      fontSize={RFValue(13)}
                      textAlign={'center'}
                      lineHeight={18}
                    >
                      {passcode.length >= 4 ? (
                        <Text fontSize={RFValue(10, 812)}>
                          <FontAwesome size={8} name={'circle'} color={'#000'} />
                        </Text>
                      ) : passcode.length == 3 ? (
                        <Text color={'#006CB4'} fontWeight={'bold'} fontSize={RFValue(13, 812)}>
                          {'|'}
                        </Text>
                      ) : (
                            ''
                          )}
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>
            {passcode.length == 4 ? (
              <Box>
                <Text color={'#FFFFFF'} fontSize={RFValue(12)} ml={5}>
                  {'Re Enter'}{' '}
                  <Text fontWeight={'bold'} fontStyle={'italic'}>
                    {'Passcode'}
                  </Text>{' '}
                </Text>
                <Box mb={10}>
                  <Box flexDirection={'row'} mt={hp('1.5%')}>
                    <Box
                      style={[
                        confirmPasscode.length == 0
                          ? styles.textBoxActive
                          : {
                            ...styles.textBoxStyles,
                            //   borderColor:
                            //       passcode != confirmPasscode &&
                            //       confirmPasscode.length == 4
                            //         ? Colors.red
                            //         : Colors.borderColor,
                          },
                      ]}
                    >
                      <Text
                        color={'#000'}
                        fontSize={RFValue(13)}
                        textAlign={'center'}
                        lineHeight={18}
                      >
                        {confirmPasscode.length >= 1 ? (
                          <Text fontSize={RFValue(10, 812)}>
                            <FontAwesome size={8} name={'circle'} color={'#000'} />
                          </Text>
                        ) : confirmPasscode.length == 0 && confirmPasscodeFlag == 1 ? (
                          <Text color={'#006CB4'} fontWeight={'bold'} fontSize={RFValue(13, 812)}>
                            {'|'}
                          </Text>
                        ) : (
                              ''
                            )}
                      </Text>
                    </Box>
                    <Box
                      style={[
                        confirmPasscode.length == 1
                          ? styles.textBoxActive
                          : {
                            ...styles.textBoxStyles,
                            //   borderColor:
                            //       passcode != confirmPasscode &&
                            //       confirmPasscode.length == 4
                            //         ? Colors.red
                            //         : Colors.borderColor,
                          },
                      ]}
                    >
                      <Text
                        color={'#000'}
                        fontSize={RFValue(13)}
                        textAlign={'center'}
                        lineHeight={18}
                      >
                        {confirmPasscode.length >= 2 ? (
                          <Text
                            style={{
                              fontSize: RFValue(10, 812),
                            }}
                          >
                            <FontAwesome size={8} name={'circle'} color={'#000'} />
                          </Text>
                        ) : confirmPasscode.length == 1 ? (
                          <Text color={'#006CB4'} fontWeight={'bold'} fontSize={RFValue(13, 812)}>
                            {'|'}
                          </Text>
                        ) : (
                              ''
                            )}
                      </Text>
                    </Box>
                    <Box
                      style={[
                        confirmPasscode.length == 2
                          ? styles.textBoxActive
                          : {
                            ...styles.textBoxStyles,
                            //   borderColor:
                            //       passcode != confirmPasscode &&
                            //       confirmPasscode.length == 4
                            //         ? Colors.red
                            //         : Colors.borderColor,
                          },
                      ]}
                    >
                      <Text
                        color={'#000'}
                        fontSize={RFValue(13)}
                        textAlign={'center'}
                        lineHeight={18}
                      >
                        {confirmPasscode.length >= 3 ? (
                          <Text
                            style={{
                              fontSize: RFValue(10, 812),
                            }}
                          >
                            <FontAwesome size={8} name={'circle'} color={'#000'} />
                          </Text>
                        ) : confirmPasscode.length == 2 ? (
                          <Text color={'#006CB4'} fontWeight={'bold'} fontSize={RFValue(13, 812)}>
                            {'|'}
                          </Text>
                        ) : (
                              ''
                            )}
                      </Text>
                    </Box>
                    <Box
                      style={[
                        confirmPasscode.length == 3
                          ? styles.textBoxActive
                          : {
                            ...styles.textBoxStyles,
                            //   borderColor:
                            //       passcode != confirmPasscode &&
                            //       confirmPasscode.length == 4
                            //         ? Colors.red
                            //         : Colors.borderColor,
                          },
                      ]}
                    >
                      <Text
                        color={'#000'}
                        fontSize={RFValue(13)}
                        textAlign={'center'}
                        lineHeight={18}
                      >
                        {confirmPasscode.length >= 4 ? (
                          <Text fontSize={RFValue(10, 812)}>
                            <FontAwesome size={8} name={'circle'} color={'#000'} />
                          </Text>
                        ) : confirmPasscode.length == 3 ? (
                          <Text color={'#006CB4'} fontWeight={'bold'} fontSize={RFValue(13, 812)}>
                            {'|'}
                          </Text>
                        ) : (
                              ''
                            )}
                      </Text>
                    </Box>
                  </Box>
                  {passcode != confirmPasscode && confirmPasscode.length == 4 && (
                    <Text
                      color={'white'}
                      fontSize={RFValue(13)}
                      fontWeight={'500'}
                      width={wp('72%')}
                      textAlign={'right'}
                      mt={hp('1.5%')}
                    >
                      {'Mismatch Passcode'}
                    </Text>
                  )}
                </Box>
                <Box alignSelf={'flex-end'} mr={5}>
                  <CustomButton
                    disabled={isDisabled}
                    onPress={() => {
                      dispatch(storeCreds(passcode));
                      setTimeout(() => {
                        setIsDisabled(true);
                      }, 2);
                      props.navigation.replace('NewHome');
                    }}
                    value={'Proceed'}
                  />
                </Box>
              </Box>
            ) : null}
          </Box>
          <KeyPadView onPressNumber={onPressNumber} />
        </Box>
      </Box>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  textBoxStyles: {
    borderWidth: 0.5,
    height: wp('13%'),
    width: wp('13%'),
    borderRadius: 7,
    marginLeft: 20,
    // borderColor: Colors.borderColor,
    borderColor: '#E3E3E3',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: Colors.white,
    backgroundColor: '#FDF7F0',
  },
  textBoxActive: {
    borderWidth: 0.5,
    height: wp('13%'),
    width: wp('13%'),
    borderRadius: 7,
    marginLeft: 20,
    elevation: 10,
    // shadowColor: Colors.borderColor,
    shadowColor: '#E3E3E3',
    shadowOpacity: 0.35,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    // borderColor: Colors.borderColor,
    borderColor: '#E3E3E3',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: Colors.white,
    backgroundColor: '#FDF7F0',
  },
  keyPadElementTouchable: {
    flex: 1,
    height: hp('8%'),
    fontSize: RFValue(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyPadElementText: {
    // color: Colors.blue,
    color: '#FFF',
    fontSize: RFValue(25),
    // fontFamily: Fonts.FiraSansRegular,
    fontStyle: 'normal',
  },
  proceedButtonView: {
    marginLeft: 20,
    marginTop: hp('4%'),
    height: wp('13%'),
    width: wp('30%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    // shadowColor: Colors.shadowBlue,
    // shadowColor: '#DDECF5',
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 15,
      height: 15,
    },
  },
  linearGradient: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
  },
});
