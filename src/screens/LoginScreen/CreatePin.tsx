/* eslint-disable react/no-unstable-nested-components */
import Text from 'src/components/KeeperText';
import { Box, StatusBar, useColorMode } from 'native-base';
import { Dimensions, StyleSheet } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

import CustomButton from 'src/components/CustomButton/CustomButton';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import PinInputsView from 'src/components/AppPinInput/PinInputsView';
import DeleteIcon from 'src/assets/images/deleteLight.svg';
import DowngradeToPleb from 'src/assets/images/downgradetopleb.svg';
import Passwordlock from 'src/assets/images/passwordlock.svg';

import { storeCreds, switchCredsChanged } from 'src/store/sagaActions/login';
import KeeperModal from 'src/components/KeeperModal';

const windowHeight = Dimensions.get('window').height;

export default function CreatePin(props) {
  const { colorMode } = useColorMode();
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeFlag, setPasscodeFlag] = useState(true);
  const [createPassword, setCreatePassword] = useState(false);
  const [confirmPasscodeFlag, setConfirmPasscodeFlag] = useState(0);
  const { oldPasscode } = props.route.params || {};
  const dispatch = useAppDispatch();
  const { credsChanged, hasCreds } = useAppSelector((state) => state.login);
  const [isDisabled, setIsDisabled] = useState(true);
  const { translations } = useContext(LocalizationContext);
  const { login } = translations;
  const { common } = translations;

  useEffect(() => {
    if (hasCreds) {
      props.navigation.navigate('OnBoardingSlides');
    }
  }, [hasCreds]);

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

  const onDeletePressed = (text) => {
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

  useEffect(() => {
    if (passcode === confirmPasscode) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [passcode, confirmPasscode]);

  function ElectrumErrorContent() {
    return (
      <Box width={wp(320)}>
        <Box margin={hp(5)}>
          <DowngradeToPleb />
        </Box>
        <Box>
          <Text color="light.greenText" fontSize={13} padding={1} letterSpacing={0.65}>
            Please try again later
          </Text>
        </Box>
      </Box>
    );
  }
  function CreatePassModalContent() {
    return (
      <Box>
        <Box style={styles.passImg}>
          <Passwordlock />
        </Box>
        <Text color={`${colorMode}.greenText`} style={styles.modalMessageText}>
          You would be locked out of the app if you forget your passcode and will have to recover it
        </Text>
      </Box>
    );
  }

  return (
    <Box testID="main" style={styles.container} backgroundColor="light.pantoneGreen">
      <Box style={styles.wrapper}>
        <Box pt={50}>
          <StatusBar barStyle="light-content" />
        </Box>
        <Box style={styles.wrapper}>
          <Box style={styles.titleWrapper}>
            <Box>
              <Text style={styles.welcomeText} color="light.primaryBackground">
                {login.welcome}
              </Text>
              <Text color="light.primaryBackground" style={styles.labelText}>
                {login.Createpasscode}
              </Text>

              {/* pin input view */}
              <PinInputsView
                passCode={passcode}
                passcodeFlag={passcodeFlag}
                borderColor={
                  passcode !== confirmPasscode && confirmPasscode.length === 4
                    ? // ? '#FF8F79'
                      'light.error'
                    : 'transparent'
                }
              />
              {/*  */}
            </Box>
            {passcode.length === 4 ? (
              <Box>
                <Text color="light.primaryBackground" style={styles.labelText}>
                  {login.Confirmyourpasscode}
                </Text>
                <Box>
                  {/* pin input view */}
                  <PinInputsView
                    passCode={confirmPasscode}
                    passcodeFlag={!(confirmPasscodeFlag === 0 && confirmPasscodeFlag === 2)}
                    borderColor={
                      passcode !== confirmPasscode && confirmPasscode.length === 4
                        ? '#FF8F79'
                        : 'transparent'
                    }
                    borderColor={
                      passcode != confirmPasscode && confirmPasscode.length === 4
                        ? `${colorMode}.error`
                        : 'transparent'
                    }
                  />
                  {/*  */}
                  {passcode !== confirmPasscode && confirmPasscode.length === 4 && (
                    <Text color={`${colorMode}.error`} style={styles.errorText}>
                      {login.MismatchPasscode}
                    </Text>
                  )}
                </Box>
                <Box alignSelf="flex-end" mr={5} mt={5}>
                  <CustomButton
                    disabled={isDisabled}
                    testID="button"
                    onPress={() => {
                      setCreatePassword(true);
                    }}
                    value={common.create}
                  />
                </Box>
              </Box>
            ) : null}
          </Box>
          <KeyPadView
            onDeletePressed={onDeletePressed}
            onPressNumber={onPressNumber}
            ClearIcon={<DeleteIcon />}
          />
        </Box>
      </Box>
      <KeeperModal
        visible={createPassword}
        close={() => {}}
        title="Remember your passcode"
        subTitle="Please remember your passcode and backup your wallet by writing down the 12-word Recovery
        Phrase"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.SlateGrey`}
        textColor={`${colorMode}.modalGreenTitle`}
        showCloseIcon={false}
        buttonText="Continue"
        secondaryButtonText="Back"
        buttonCallback={() => {
          dispatch(storeCreds(passcode));
          setCreatePassword(false);
        }}
        secondaryCallback={() => {
          setCreatePassword(false);
        }}
        Content={CreatePassModalContent}
        showButtons
        subTitleWidth={wp(60)}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  wrapper: {
    flex: 1,
  },
  titleWrapper: {
    marginTop: windowHeight > 670 ? hp('5%') : 0,
    flex: 0.7,
  },
  welcomeText: {
    marginLeft: 18,
    fontSize: 22,
  },
  labelText: {
    fontSize: 14,
    marginLeft: 18,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '400',
    width: wp('68%'),
    textAlign: 'right',
    fontStyle: 'italic',
  },
  bitcoinTestnetText: {
    fontWeight: '400',
    paddingHorizontal: 16,
    fontSize: 13,
    letterSpacing: 1,
  },
  modalMessageText: {
    fontSize: 13,
    letterSpacing: 0.65,
  },
  passImg: {
    alignItems: 'center',
    paddingVertical: 20,
  },
});
