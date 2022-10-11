import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Box, DeleteIcon, Text } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import ColdCardSVG from 'src/assets/images/ColdCardSetup.svg';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import KeeperModal from 'src/components/KeeperModal';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import { RFValue } from 'react-native-responsive-fontsize';
import { SignerType } from 'src/core/wallets/enums';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import { hash512 } from 'src/core/services/operations/encryption';
import { useAppSelector } from 'src/store/hooks';
import useScanLedger from '../AddLedger/useScanLedger';

const { width } = Dimensions.get('screen');

const DeviceItem = ({ device, onSelectDevice }) => {
  const [pending, setPending] = useState(false);
  const onPress = async () => {
    setPending(true);
    try {
      await onSelectDevice(device);
    } catch (error) {
      console.log(error);
    } finally {
      setPending(false);
    }
  };
  return (
    <TouchableOpacity onPress={() => onPress()} style={{ flexDirection: 'row' }}>
      <Text
        color={'light.textLight'}
        fontSize={RFValue(14)}
        fontWeight={200}
        fontFamily={'heading'}
        letterSpacing={1.12}
      >
        {device.name}
      </Text>
      {pending ? <ActivityIndicator /> : null}
    </TouchableOpacity>
  );
};

const LedgerContent = ({ onSelectDevice }) => {
  const { error, devices, scanning } = useScanLedger();
  if (error) {
    <Text style={styles.errorTitle}>{String(error.message)}</Text>;
  }
  return (
    <>
      {scanning ? <ActivityIndicator /> : null}
      {devices.map((device) => (
        <DeviceItem device={device} onSelectDevice={onSelectDevice} key={device.id} />
      ))}
    </>
  );
};

const ColdCardContent = ({ register }) => {
  return (
    <Box>
      <ColdCardSVG />
      <Box marginTop={2} width={wp(220)}>
        <Text color={'light.modalText'} fontSize={13} letterSpacing={0.65}>
          {register
            ? `\u2022 Since this is the first time you are signing with this device, the Mk4 requires for us to register the multisig wallet data before it can sign transactions.`
            : `\u2022 Make sure the multisig wallet is registered with the Mk4 before signing the transaction`}
        </Text>
        <Text color={'light.modalText'} fontSize={13} letterSpacing={0.65}>
          {register
            ? ``
            : `\u2022 On the Mk4 main menu, choose the 'Sign a transaction' option and choose the nfc option.`}
        </Text>
      </Box>
    </Box>
  );
};

const InputCvc = ({ textRef }) => {
  return (
    <TextInput
      style={styles.input}
      secureTextEntry={true}
      onChangeText={(text) => {
        textRef.current = text;
      }}
    />
  );
};

const PasswordEnter = ({ signTransaction }) => {
  const { pinHash } = useAppSelector((state) => state.storage);

  const [password, setPassword] = useState('');

  const onPressNumber = (text) => {
    let tmpPasscode = password;
    if (password.length < 4) {
      if (text != 'x') {
        tmpPasscode += text;
        setPassword(tmpPasscode);
      }
    }
    if (password && text == 'x') {
      setPassword(password.slice(0, -1));
    }
  };

  const onDeletePressed = (text) => {
    setPassword(password.slice(0, password.length - 1));
  };

  return (
    <Box width={hp(280)}>
      <Box>
        <CVVInputsView
          passCode={password}
          passcodeFlag={false}
          backgroundColor={true}
          textColor={true}
          length={4}
        />
        <Text
          fontSize={13}
          fontWeight={200}
          letterSpacing={0.65}
          width={wp(290)}
          color={'light.modalText'}
          marginTop={2}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et
        </Text>
        <Box mt={10} alignSelf={'flex-end'} mr={2}>
          <Box>
            <CustomGreenButton
              onPress={() => {
                const currentPinHash = hash512(password);
                if (currentPinHash === pinHash) {
                  signTransaction();
                } else Alert.alert('Incorrect password. Try again!');
              }}
              value={'Confirm'}
            />
          </Box>
        </Box>
      </Box>
      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        keyColor={'light.lightBlack'}
        ClearIcon={<DeleteIcon />}
      />
    </Box>
  );
};

const OtpContent = ({ signTransaction }) => {
  const [otp, setOtp] = useState('');
  const onPressNumber = (text) => {
    let tmpPasscode = otp;
    if (otp.length < 6) {
      if (text != 'x') {
        tmpPasscode += text;
        setOtp(tmpPasscode);
      }
    }
    if (otp && text == 'x') {
      setOtp(otp.slice(0, -1));
    }
  };
  const onDeletePressed = (text) => {
    setOtp(otp.slice(0, otp.length - 1));
  };
  return (
    <Box width={hp(280)}>
      <Box>
        <CVVInputsView
          passCode={otp}
          passcodeFlag={false}
          backgroundColor={true}
          textColor={true}
        />
        <Text
          fontSize={13}
          fontWeight={200}
          letterSpacing={0.65}
          width={wp(290)}
          color={'light.modalText'}
          marginTop={2}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et
        </Text>
        <Box mt={10} alignSelf={'flex-end'} mr={2}>
          <Box>
            <CustomGreenButton
              onPress={() => {
                signTransaction({ signingServerOTP: otp });
              }}
              value={'proceed'}
            />
          </Box>
        </Box>
      </Box>
      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        keyColor={'light.lightBlack'}
        ClearIcon={<DeleteIcon />}
      />
    </Box>
  );
};

const SignerModals = ({
  activeSignerId,
  coldCardModal,
  tapsignerModal,
  ledgerModal,
  otpModal,
  passwordModal,
  setColdCardModal,
  setTapsignerModal,
  setLedgerModal,
  setPasswordModal,
  showOTPModal,
  LedgerCom,
  signTransaction,
  textRef,
  signers,
}) => {
  const onSelectDevice = useCallback(async (device) => {
    try {
      const transport = await TransportBLE.open(device);
      transport.on('disconnect', () => {
        LedgerCom.current = null;
      });
      LedgerCom.current = transport;
      signTransaction();
    } catch (e) {
      console.log(e);
    }
  }, []);

  const navigation = useNavigation();
  return (
    <>
      {signers.map((signer) => {
        const currentSigner = signer.signerId === activeSignerId;
        switch (signer.type) {
          case SignerType.TAPSIGNER:
            return (
              <KeeperModal
                visible={currentSigner && tapsignerModal}
                close={() => setTapsignerModal(false)}
                title={'Enter CVC'}
                subTitle={'Please enter the 6-32 digit CVC of the TapSigner'}
                modalBackground={['#00836A', '#073E39']}
                buttonBackground={['#FFFFFF', '#80A8A1']}
                buttonText={'SIGN'}
                buttonTextColor={'#073E39'}
                buttonCallback={signTransaction}
                textColor={'#FFF'}
                Content={() => InputCvc({ textRef })}
                DarkCloseIcon={true}
              />
            );
          case SignerType.COLDCARD:
            const { hasSigned, isMock } = signer;
            const register = !hasSigned && !isMock;
            const navigateToSignWithColdCard = () => {
              setColdCardModal(false);
              navigation.dispatch(
                CommonActions.navigate('SignWithColdCard', { signTransaction, signer })
              );
            };
            return (
              <KeeperModal
                visible={currentSigner && coldCardModal}
                close={() => setColdCardModal(false)}
                title={register ? 'Register ColdCard' : 'Upload Multi-sig data'}
                subTitle={'Keep your Mk4 ready before proceeding'}
                modalBackground={['#F7F2EC', '#F7F2EC']}
                Content={() => <ColdCardContent register={register} />}
                buttonText={register ? 'Register' : 'Proceed'}
                buttonCallback={navigateToSignWithColdCard}
              />
            );

          case SignerType.LEDGER:
            return (
              <KeeperModal
                visible={currentSigner && ledgerModal}
                close={() => setLedgerModal(false)}
                title={'Looking for Nano X'}
                subTitle={'Power up your Ledger Nano X and open the BTC app...'}
                modalBackground={['#00836A', '#073E39']}
                buttonBackground={['#FFFFFF', '#80A8A1']}
                buttonText={LedgerCom.current ? 'SIGN' : ''}
                buttonTextColor={'#073E39'}
                buttonCallback={signTransaction}
                textColor={'#FFF'}
                DarkCloseIcon={true}
                Content={() => <LedgerContent onSelectDevice={onSelectDevice} />}
              />
            );
          case SignerType.MOBILE_KEY:
            return (
              <KeeperModal
                visible={currentSigner && passwordModal}
                close={() => {
                  setPasswordModal(false);
                }}
                title={'Enter your password'}
                subTitle={'Lorem ipsum dolor sit amet, '}
                modalBackground={['#F7F2EC', '#F7F2EC']}
                textColor={'#041513'}
                Content={() => <PasswordEnter signTransaction={signTransaction} />}
              />
            );
          case SignerType.POLICY_SERVER:
            return (
              <KeeperModal
                visible={currentSigner && otpModal}
                close={() => {
                  showOTPModal(false);
                }}
                title={'Confirm OTP to setup 2FA'}
                subTitle={'Lorem ipsum dolor sit amet, '}
                modalBackground={['#F7F2EC', '#F7F2EC']}
                textColor={'#041513'}
                Content={() => <OtpContent signTransaction={signTransaction} />}
              />
            );
        }
      })}
    </>
  );
};

export default SignerModals;

const styles = StyleSheet.create({
  errorTitle: {
    color: '#c00',
    fontSize: 16,
  },
  input: {
    paddingHorizontal: 20,
    marginVertical: '3%',
    width: width * 0.7,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#f0e7dd',
    letterSpacing: 5,
  },
});
