import React, { useContext, useState, useEffect } from 'react';
import { Box, Text } from 'native-base';
import { TouchableOpacity } from 'react-native';

import { useAppDispatch, useAppSelector } from 'src/store/hooks';

import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';

import { LocalizationContext } from 'src/common/content/LocContext';
import PinInputsView from '../AppPinInput/PinInputsView';
import { increasePinFailAttempts } from 'src/store/reducers/storage';
import { credsAuthenticated } from 'src/store/reducers/login';
import { credsAuth } from 'src/store/sagaActions/login';
import LoginMethod from 'src/common/data/enums/LoginMethod';
import KeyPadView from '../AppNumPad/KeyPadView';
import DeleteIcon from 'src/assets/icons/deleteBlack.svg';
import CustomGreenButton from '../CustomButton/CustomGreenButton';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { WalletType } from 'src/core/wallets/enums';

const SeedConfirmPasscode = (props) => {
  const navigation = useNavigation();
  const relogin = false;
  const { translations } = useContext(LocalizationContext);
  const wallet = translations['wallet'];
  const common = translations['common'];
  const dispatch = useAppDispatch();

  const [passcode, setPasscode] = useState('');
  const [passcodeFlag] = useState(true);

  const [loginError, setLoginError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [errMessage, setErrMessage] = useState('');
  const [walletIndex, setWalletIndex] = useState<number>(0);
  const { isAuthenticated, authenticationFailed } = useAppSelector((state) => state.login);

  const { useQuery } = useContext(RealmWrapperContext);
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet)
    .map(getJSONFromRealmObject)
    .filter((wallet: Wallet) => wallet.type !== WalletType.READ_ONLY);
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
        });
        props.closeBottomSheet();
      }
      dispatch(credsAuthenticated(false));
    }
  }, [isAuthenticated]);

  const attemptLogin = (passcode: string) => {
    dispatch(credsAuth(passcode, LoginMethod.PIN, relogin));
  };

  return (
    <Box bg={'#F7F2EC'} borderRadius={10}>
      <TouchableOpacity onPress={() => props.closeBottomSheet()}>
        <Box
          m={5}
          bg={'#E3BE96'}
          borderRadius={32}
          h={8}
          w={8}
          alignItems={'center'}
          justifyContent={'center'}
          alignSelf={'flex-end'}
        >
          <Text fontSize={18} color={'#FFF'}>
            X
          </Text>
        </Box>
      </TouchableOpacity>
      <Box p={10}>
        <Text fontSize={RFValue(19)} color={'light.lightBlack'} fontFamily={'heading'}>
          {wallet.confirmPassTitle}
        </Text>
        <Text fontSize={RFValue(13)} color={'light.lightBlack2'} fontFamily={'body'}>
          {wallet.confirmPassSubTitle}
        </Text>
      </Box>
      <Box>
        {/* pin input view */}
        <PinInputsView
          passCode={passcode}
          passcodeFlag={passcodeFlag}
          backgroundColor={true}
          textColor={true}
        />
        {/*  */}
        <Box mt={10} alignSelf={'flex-end'} mr={10}>
          {passcode.length == 4 && (
            <Box>
              <CustomGreenButton
                onPress={() => {
                  setLoginError(false);
                  attemptLogin(passcode);
                }}
                value={common.proceed}
              />
            </Box>
          )}
        </Box>
      </Box>
      {/* keyboardview start */}
      <KeyPadView onPressNumber={onPressNumber} keyColor={'#041513'} ClearIcon={<DeleteIcon />} />
    </Box>
  );
};
export default SeedConfirmPasscode;
