import React, { useContext, useState, useEffect } from 'react';
import { Box, useColorMode } from 'native-base';

import { useAppDispatch, useAppSelector } from 'src/store/hooks';

import { LocalizationContext } from 'src/context/Localization/LocContext';
import { increasePinFailAttempts } from 'src/store/reducers/storage';
import { credsAuthenticated } from 'src/store/reducers/login';
import { credsAuth } from 'src/store/sagaActions/login';
import LoginMethod from 'src/models/enums/LoginMethod';
import DeleteDarkIcon from 'src/assets/images/delete.svg';
import DeleteIcon from 'src/assets/images/deleteLight.svg';
import Buttons from 'src/components/Buttons';
import KeyPadView from '../AppNumPad/KeyPadView';
import PinInputsView from '../AppPinInput/PinInputsView';
import Text from '../KeeperText';

function SeedConfirmPasscode({ navigation, closeBottomSheet, wallet }) {
  const { colorMode } = useColorMode();
  const relogin = false;
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const dispatch = useAppDispatch();

  const [passcode, setPasscode] = useState('');

  const [loginError, setLoginError] = useState(false);
  const [btnDisable, setBtnDisable] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [errMessage, setErrMessage] = useState('Incorrect Passcode! Try Again');
  const { isAuthenticated, authenticationFailed } = useAppSelector((state) => state.login);
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

  const disableCTA = () => {
    setTimeout(() => {
      setBtnDisable(false);
    }, 7000);
  };

  useEffect(() => {
    if (attempts >= 3) {
      setAttempts(1);
      dispatch(increasePinFailAttempts());
    }
  }, [attempts]);

  useEffect(() => {
    if (authenticationFailed && passcode) {
      setLoginError(true);
      setErrMessage('Incorrect Passcode! Try Again');
      setPasscode('');
      setAttempts(attempts + 1);
      disableCTA();
    } else {
      setLoginError(false);
      disableCTA();
    }
  }, [authenticationFailed]);

  useEffect(() => {
    if (isAuthenticated) {
      if (relogin) {
        navigation.goBack();
      } else {
        navigation.navigate('ExportSeed', {
          seed: wallet?.derivationDetails?.mnemonic,
          next: false,
          wallet,
        });
        closeBottomSheet();
      }
      dispatch(credsAuthenticated(false));
    }
  }, [isAuthenticated]);

  const attemptLogin = (passcode: string) => {
    dispatch(credsAuth(passcode, LoginMethod.PIN, relogin));
  };

  return (
    <Box borderRadius={10}>
      <Box>
        {/* pin input view */}
        <PinInputsView
          passCode={passcode}
          passcodeFlag={loginError}
          backgroundColor={colorMode === 'light'}
        />
        {loginError && (
          <Text
            color={`${colorMode}.indicator`}
            style={{
              textAlign: 'right',
              fontStyle: 'italic',
            }}
          >
            {errMessage}
          </Text>
        )}
        {/*  */}
        {passcode.length === 4 && (
          <Buttons
            primaryCallback={() => {
              setBtnDisable(true);
              setLoginError(false);
              attemptLogin(passcode);
            }}
            primaryText={common.proceed}
            activeOpacity={0.5}
            primaryDisable={btnDisable}
          />
        )}
      </Box>
      {/* keyboardview start */}
      <Box style={{ width: 280 }}>
        <KeyPadView
          onDeletePressed={onDeletePressed}
          onPressNumber={onPressNumber}
          keyColor={colorMode === 'light' ? '#041513' : '#FFF'}
          ClearIcon={colorMode === 'dark' ? <DeleteIcon /> : <DeleteDarkIcon />}
        />
      </Box>
    </Box>
  );
}
export default SeedConfirmPasscode;
