import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { Box, Text } from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from 'src/components/CustomButton/CustomButton';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import DeleteIcon from 'src/assets/icons/deleteBlack.svg';

import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import PinInputsView from 'src/components/AppPinInput/PinInputsView';
import { LocalizationContext } from 'src/common/content/LocContext';
import { resetPin } from '../../store/sagaActions/login';

export default function ResetPin(props) {
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeFlag, setPasscodeFlag] = useState(true);
  const [confirmPasscodeFlag, setConfirmPasscodeFlag] = useState(0);
  const isPinChangedFailed = useAppSelector((state) => state.login.pinChangedFailed);
  const dispatch = useAppDispatch();
  const { credsChanged } = useAppSelector((state) => state.login);
  const [isDisabled, setIsDisabled] = useState(true);
  const oldPasscode = props.route.params.oldPin || '';

  const { translations } = useContext(LocalizationContext);
  const { login } = translations;
  const { common } = translations;

  function onPressNumber(text) {
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

  const onDeletePressed = (text) => {
    setPasscode(passcode.slice(0, passcode.length - 1));
  };

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
        if (props.route.params.onPinChange) {
          props.route.params.onPinChange();
        }
        props.navigation.goBack();
      }
    }
  }, [credsChanged]);

  useEffect(() => {
    if (isPinChangedFailed) {
      // todo
    }
  }, [isPinChangedFailed]);

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
          <StatusBar barStyle="light-content" />
        </Box>
        <Box flex={1}>
          <Box>
            <Box>
              <Text
                ml={5}
                mt={hp(1)}
                fontSize={RFValue(22)}
                color="light.white"
                fontFamily="heading"
              >
                {login.ResetPasscode}
              </Text>
              <Text color="light.white" fontSize={RFValue(12)} ml={5} fontFamily="body">
                {login.Createpasscode}
              </Text>

              {/* pin input view */}
              <PinInputsView passCode={passcode} passcodeFlag={passcodeFlag} />
              {/*  */}
            </Box>
            <Box>
              <Text color="#FFFFFF" fontSize={RFValue(12)} ml={5} fontFamily="body">
                {login.Confirmyourpasscode}
              </Text>
              <Box mb={10}>
                {/* pin input view */}
                <PinInputsView passCode={confirmPasscode} passcodeFlag={confirmPasscodeFlag != 0} />
                {/*  */}
                {passcode != confirmPasscode && confirmPasscode.length == 4 && (
                  <Text
                    color="light.error"
                    fontSize={RFValue(13)}
                    fontWeight="500"
                    width={wp('72%')}
                    textAlign="right"
                    mt={hp('1.5%')}
                  >
                    {login.MismatchPasscode}
                  </Text>
                )}
              </Box>
              <Box alignSelf="flex-end" mr={5}>
                <CustomButton
                  onPress={() => {
                    dispatch(resetPin(passcode));
                  }}
                  value={common.proceed}
                />
              </Box>
            </Box>
          </Box>
          <KeyPadView
            onDeletePressed={onDeletePressed}
            onPressNumber={onPressNumber}
            ClearIcon={<DeleteIcon />}
          />
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
