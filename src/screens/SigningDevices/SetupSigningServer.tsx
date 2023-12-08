import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { Box, View } from 'native-base';
import DeleteIcon from 'src/assets/images/deleteBlack.svg';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import Buttons from 'src/components/Buttons';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import CopyIcon from 'src/assets/images/icon_copy.svg';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import KeeperHeader from 'src/components/KeeperHeader';
import KeeperModal from 'src/components/KeeperModal';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import Note from 'src/components/Note/Note';
import QRCode from 'react-native-qrcode-svg';
import StatusBarComponent from 'src/components/StatusBarComponent';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { authenticator } from 'otplib';
import { useDispatch } from 'react-redux';
import useToastMessage from 'src/hooks/useToastMessage';
import { generateSignerFromMetaData } from 'src/hardware';
import SigningServer from 'src/services/operations/SigningServer';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function SetupSigningServer({ route }: { route }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultTranslation } = translations;
  const [validationModal, showValidationModal] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [validationKey, setValidationKey] = useState('');
  const [isSetupValidated, setIsSetupValidated] = useState(false);

  const registerSigningServer = async () => {
    const { policy } = route.params;
    try {
      const { setupData } = await SigningServer.register(policy);
      setSetupData(setupData);
      setValidationKey(setupData.verification.verifier);
    } catch (err) {
      showToast('Something went wrong. Please try again!');
    }
  };

  const validateSetup = async () => {
    const verificationToken = Number(otp);
    try {
      const { valid } = await SigningServer.validate(setupData.id, verificationToken);
      if (valid) setIsSetupValidated(valid);
      else showToast('Invalid OTP. Please try again!');
    } catch (err) {
      showToast('Validation failed. Please try again!');
    }
  };

  const setupSigningServerKey = async () => {
    const { policy } = route.params;
    const { id, bhXpub: xpub, derivationPath, masterFingerprint } = setupData;
    const signingServerKey = generateSignerFromMetaData({
      xpub,
      derivationPath,
      xfp: masterFingerprint,
      signerType: SignerType.POLICY_SERVER,
      storageType: SignerStorage.WARM,
      isMultisig: true,
      signerId: id,
      signerPolicy: policy,
    });

    dispatch(addSigningDevice(signingServerKey));
    navigation.dispatch(
      CommonActions.navigate({ name: 'AddSigningDevice', merge: true, params: {} })
    );
    showToast(`${signingServerKey.signerName} added successfully`, <TickIcon />);
  };

  useEffect(() => {
    registerSigningServer();
  }, []);

  useEffect(() => {
    if (setupData && isSetupValidated) setupSigningServerKey();
  }, [setupData, isSetupValidated]);

  const [otp, setOtp] = useState('');

  const otpContent = useCallback(() => {
    const onPressNumber = (text) => {
      let tmpPasscode = otp;
      if (otp.length < 6) {
        if (text !== 'x') {
          tmpPasscode += text;
          setOtp(tmpPasscode);
        }
      }
      if (otp && text === 'x') {
        setOtp(otp.slice(0, -1));
      }
    };

    const onDeletePressed = () => {
      setOtp(otp.slice(0, otp.length - 1));
    };

    return (
      <Box width={hp(300)}>
        <Box>
          <TouchableOpacity
            onPress={async () => {
              const clipBoardData = await Clipboard.getString();
              if (clipBoardData.match(/^\d{6}$/)) {
                setOtp(clipBoardData);
              } else {
                showToast('Invalid OTP');
              }
            }}
          >
            <CVVInputsView passCode={otp} passcodeFlag={false} backgroundColor textColor />
          </TouchableOpacity>
          <Text style={styles.cvvInputInfoText} color="light.greenText">
            {vaultTranslation.cvvSigningServerInfo}
          </Text>
          <Box mt={10} alignSelf="flex-end" mr={2}>
            <Box>
              <CustomGreenButton onPress={validateSetup} value="Confirm" />
            </Box>
          </Box>
        </Box>
        <KeyPadView
          onPressNumber={onPressNumber}
          onDeletePressed={onDeletePressed}
          keyColor="light.primaryText"
          ClearIcon={<DeleteIcon />}
        />
      </Box>
    );
  }, [otp]);

  return (
    <View style={styles.Container} background="light.secondaryBackground">
      <StatusBarComponent padding={50} />
      <Box>
        <KeeperHeader title="Set up 2FA for Signing Server" subtitle="Scan on any 2FA auth app" />
      </Box>
      <Box marginTop={hp(50)} alignItems="center" alignSelf="center" width={wp(250)}>
        {validationKey === '' ? (
          <Box height={hp(250)} justifyContent="center">
            <ActivityIndicator animating size="small" />
          </Box>
        ) : (
          <Box
            alignItems="center"
            alignSelf="center"
            width={hp(200)}
            style={{
              marginTop: hp(30),
            }}
          >
            <QRCode
              value={authenticator.keyuri('bitcoin-keeper.io', 'Keeper', validationKey)}
              logoBackgroundColor="transparent"
              size={hp(200)}
            />
            <Box background="light.QrCode" height={6} width="100%" justifyContent="center">
              <Text
                textAlign="center"
                color="light.recieverAddress"
                bold
                fontSize={12}
                letterSpacing={1.08}
                width="100%"
                numberOfLines={1}
              >
                2FA Signing Server
              </Text>
            </Box>
            <Box alignItems="center" marginTop={hp(30)} width={wp(320)}>
              <Box
                flexDirection="row"
                width="90%"
                alignItems="center"
                justifyContent="space-between"
                backgroundColor="light.textInputBackground"
                borderBottomLeftRadius={10}
                borderTopLeftRadius={10}
              >
                <Text width="80%" marginLeft={4} numberOfLines={1}>
                  {validationKey}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.4}
                  onPress={() => {
                    Clipboard.setString(validationKey);
                    showToast('Address Copied Successfully', <TickIcon />);
                  }}
                >
                  <Box
                    backgroundColor="light.copyBackground"
                    padding={3}
                    borderTopRightRadius={10}
                    borderBottomRightRadius={10}
                  >
                    <CopyIcon />
                  </Box>
                </TouchableOpacity>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* {Bottom note} */}
      <Box position="absolute" bottom={hp(35)} marginX={5} width="100%">
        <Box marginBottom={hp(30)}>
          <Note
            title="Note"
            subtitle="It is a good idea to have the authenticator app on another device"
            subtitleColor="GreyText"
          />
        </Box>
        <Buttons
          primaryCallback={() => {
            showValidationModal(true);
          }}
          primaryText="Next"
          secondaryText="Cancel"
          secondaryCallback={() => {
            navigation.goBack();
          }}
        />
      </Box>
      <KeeperModal
        visible={validationModal}
        close={() => {
          showValidationModal(false);
        }}
        title="Confirm OTP to setup 2FA"
        subTitle="To complete setting up the signing server"
        textColor="light.primaryText"
        Content={otpContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  title: {
    fontSize: 12,
    letterSpacing: 0.24,
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  textBox: {
    width: '80%',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
  },
  cvvInputInfoText: {
    fontSize: 13,
    letterSpacing: 0.65,
    width: '100%',
    marginTop: 2,
  },
});
export default SetupSigningServer;
