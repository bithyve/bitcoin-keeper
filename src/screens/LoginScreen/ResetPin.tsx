import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box } from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LinearGradient from 'src/components/KeeperGradient';
import CustomButton from 'src/components/CustomButton/CustomButton';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import DeleteIcon from 'src/assets/images/deleteLight.svg';

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
        if (text !== 'x') {
          tmpPasscode += text;
          setPasscode(tmpPasscode);
        }
      } else if (passcode.length === 4 && passcodeFlag) {
        setPasscodeFlag(false);
        setConfirmPasscodeFlag(1);
        setPasscode(passcode);
      }
      if (passcode && text === 'x') {
        const passcodeTemp = passcode.slice(0, -1);
        setPasscode(passcodeTemp);
        if (passcodeTemp.length === 0) {
          setConfirmPasscodeFlag(0);
        }
      }
    } else if (confirmPasscodeFlag) {
      if (confirmPasscode.length < 4) {
        if (text !== 'x') {
          tmpConfirmPasscode += text;
          setConfirmPasscode(tmpConfirmPasscode);
        }
      }
      if (confirmPasscode && text === 'x') {
        setConfirmPasscode(confirmPasscode.slice(0, -1));
      } else if (!confirmPasscode && text === 'x') {
        setPasscodeFlag(true);
        setConfirmPasscodeFlag(0);
        setConfirmPasscode(confirmPasscode);
      }
    }
  }

  const onDeletePressed = () => {
    if (passcodeFlag) {
      setPasscode(passcode.slice(0, -1));
    } else {
      setConfirmPasscode(confirmPasscode.slice(0, confirmPasscode.length - 1));
    }
  };

  useEffect(() => {
    if (confirmPasscode.length <= 4 && confirmPasscode.length > 0 && passcode.length === 4) {
      setPasscodeFlag(false);
      setConfirmPasscodeFlag(2);
    } else if (passcode.length === 4 && confirmPasscodeFlag !== 2) {
      setPasscodeFlag(false);
      setConfirmPasscodeFlag(1);
    } else if (
      !confirmPasscode &&
      passcode.length > 0 &&
      passcode.length <= 4 &&
      confirmPasscodeFlag === 2
    ) {
      setPasscodeFlag(true);
      setConfirmPasscodeFlag(0);
    } else if (!confirmPasscode && passcode.length > 0 && passcode.length <= 4) {
      setPasscodeFlag(true);
      setConfirmPasscodeFlag(0);
    }
  }, [passcode, confirmPasscode]);

  useEffect(() => {
    if (credsChanged === 'changed') {
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
    if (passcode === confirmPasscode) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [passcode, confirmPasscode]);

  return (
    <LinearGradient
      colors={['light.gradientStart', 'light.gradientEnd']}
      style={styles.linearGradient}
    >
      <Box style={styles.wrapper}>
        <Box pt={50}>
          <StatusBar barStyle="light-content" />
        </Box>
        <Box style={styles.wrapper}>
          <Box>
            <Box>
              <Text style={styles.titleText} color="light.white">
                {login.ResetPasscode}
              </Text>
              <Text style={styles.labelText} color="light.white">
                {login.Createpasscode}
              </Text>

              {/* pin input view */}
              <PinInputsView passCode={passcode} passcodeFlag={passcodeFlag} />
              {/*  */}
            </Box>
            <Box>
              <Text style={styles.labelText} color="light.white">
                {login.Confirmyourpasscode}
              </Text>
              <Box mb={10}>
                {/* pin input view */}
                {/* <PinInputsView
                  passCode={confirmPasscode}
                  passcodeFlag={confirmPasscodeFlag !== 0 && confirmPasscodeFlag===2}
                /> */}
                <PinInputsView
                  passCode={confirmPasscode}
                  passcodeFlag={!(confirmPasscodeFlag === 0 && confirmPasscodeFlag === 2)}
                  borderColor={
                    passcode !== confirmPasscode && confirmPasscode.length === 4
                      ? '#FF8F79'
                      : 'transparent'
                  }
                />
                {/*  */}
                {passcode !== confirmPasscode && confirmPasscode.length === 4 && (
                  <Text color="light.error" style={styles.errorText}>
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
  linearGradient: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
  },
  wrapper: {
    flex: 1,
  },
  titleText: {
    marginLeft: 18,
    marginTop: hp(4),
    fontSize: 20,
  },
  labelText: {
    fontSize: 12,
    marginLeft: 20,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '400',
    width: wp('68%'),
    textAlign: 'right',
    marginTop: hp('1.5%'),
  },
});
