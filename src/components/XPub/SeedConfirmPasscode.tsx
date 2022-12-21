import React, { useContext, useState, useEffect } from 'react';
import { Box } from 'native-base';

import { useAppDispatch, useAppSelector } from 'src/store/hooks';

import { LocalizationContext } from 'src/common/content/LocContext';
import { increasePinFailAttempts } from 'src/store/reducers/storage';
import { credsAuthenticated } from 'src/store/reducers/login';
import { credsAuth } from 'src/store/sagaActions/login';
import LoginMethod from 'src/common/data/enums/LoginMethod';
import DeleteIcon from 'src/assets/icons/deleteBlack.svg';
import KeyPadView from '../AppNumPad/KeyPadView';
import PinInputsView from '../AppPinInput/PinInputsView';
import Buttons from '../Buttons';

function SeedConfirmPasscode({ navigation, closeBottomSheet, wallets }) {
  const relogin = false;
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const dispatch = useAppDispatch();

  const [passcode, setPasscode] = useState('');
  const [passcodeFlag] = useState(true);

  const [loginError, setLoginError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [errMessage, setErrMessage] = useState('');
  const [walletIndex, setWalletIndex] = useState<number>(0);
  const { isAuthenticated, authenticationFailed } = useAppSelector((state) => state.login);

  const currentWallet = wallets[walletIndex];

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
      if (relogin) {
        navigation.goBack();
      } else {
        navigation.navigate('ExportSeed', {
          seed: currentWallet?.derivationDetails?.mnemonic,
          next: false,
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
        <PinInputsView passCode={passcode} passcodeFlag={passcodeFlag} backgroundColor textColor />
        {/*  */}
        {passcode.length == 4 && (
          <Buttons
            primaryCallback={() => {
              setLoginError(false);
              attemptLogin(passcode);
            }}
            primaryText={common.proceed}
            activeOpacity={0.5}
          />
        )}
      </Box>
      {/* keyboardview start */}
      <Box style={{ width: 280 }}>
        <KeyPadView
          onDeletePressed={onDeletePressed}
          onPressNumber={onPressNumber}
          keyColor="light.primaryText"
          ClearIcon={<DeleteIcon />}
        />
      </Box>
    </Box>
  );
}
export default SeedConfirmPasscode;
