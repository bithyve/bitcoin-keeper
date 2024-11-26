import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { Box, useColorMode, View } from 'native-base';
import DeleteIcon from 'src/assets/images/deleteBlack.svg';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { SignerStorage, SignerType } from 'src/services/wallets/enums';
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
import TickIcon from 'src/assets/images/icon_tick.svg';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { authenticator } from 'otplib';
import { useDispatch } from 'react-redux';
import useToastMessage from 'src/hooks/useToastMessage';
import { generateSignerFromMetaData } from 'src/hardware';
import SigningServer from 'src/services/backend/SigningServer';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperQRCode from 'src/components/KeeperQRCode';
import WalletCopiableData from 'src/components/WalletCopiableData';

function SetupSigningServer({ route }: { route }) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultTranslation } = translations;
  const [validationModal, showValidationModal] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [validationKey, setValidationKey] = useState('');
  const [isSetupValidated, setIsSetupValidated] = useState(false);
  const { policy, addSignerFlow = false } = route.params;

  const registerSigningServer = async () => {
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
      else {
        showValidationModal(false);
        showToast('Invalid OTP. Please try again!');
      }
    } catch (err) {
      showValidationModal(false);
      showToast(`${err.message}`);
    }
  };

  const setupSigningServerKey = async () => {
    const { policy } = route.params;
    const { id, isBIP85, bhXpub: xpub, derivationPath, masterFingerprint } = setupData;
    const { signer: signingServerKey } = generateSignerFromMetaData({
      xpub,
      derivationPath,
      masterFingerprint,
      signerType: SignerType.POLICY_SERVER,
      storageType: SignerStorage.WARM,
      isMultisig: true,
      xfp: id,
      isBIP85,
      signerPolicy: policy,
    });

    dispatch(addSigningDevice([signingServerKey]));
    const navigationState = addSignerFlow
      ? {
          name: 'ManageSigners',
          params: { addedSigner: signingServerKey },
        }
      : {
          name: 'AddSigningDevice',
          merge: true,
          params: { addedSigner: signingServerKey },
        };
    navigation.dispatch(CommonActions.navigate(navigationState));
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
      <Box style={styles.otpContainer}>
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
          <Text style={styles.cvvInputInfoText} color={`${colorMode}.greenText`}>
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
          keyColor={`${colorMode}.primaryText`}
          ClearIcon={<DeleteIcon />}
        />
      </Box>
    );
  }, [otp]);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.secondaryBackground`}>
      <View style={styles.Container} background={`${colorMode}.secondaryBackground`}>
        <Box>
          <KeeperHeader title="Set up 2FA for signer" subtitle="Scan on any 2FA auth app" />
        </Box>
        <Box marginTop={hp(50)} alignItems="center" alignSelf="center">
          {validationKey === '' ? (
            <Box height={hp(250)} justifyContent="center">
              <ActivityIndicator animating size="small" />
            </Box>
          ) : (
            <Box alignItems="center" alignSelf="center" width="100%">
              <Box
                alignItems="center"
                alignSelf="center"
                width={wp(200)}
                style={{
                  marginTop: hp(30),
                }}
              >
                <KeeperQRCode
                  qrData={authenticator.keyuri('bitcoin-keeper.io', 'Keeper', validationKey)}
                  logoBackgroundColor="transparent"
                  size={wp(200)}
                  showLogo
                />
                <Box
                  background={`${colorMode}.QrCode`}
                  height={6}
                  width={wp(220)}
                  justifyContent="center"
                >
                  <Text
                    textAlign="center"
                    color={`${colorMode}.recieverAddress`}
                    bold
                    fontSize={12}
                    letterSpacing={1.08}
                    width={wp(220)}
                    numberOfLines={1}
                  >
                    2FA signer
                  </Text>
                </Box>
              </Box>
              <Box flex={1}>
                <WalletCopiableData data={validationKey} dataType="2fa"></WalletCopiableData>
              </Box>
            </Box>
          )}
        </Box>

        {/* {Bottom note} */}
        <Box style={styles.bottomNoteContainer}>
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
          subTitle="To complete setting up the signer"
          textColor={`${colorMode}.primaryText`}
          Content={otpContent}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
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
  otpContainer: {
    width: '100%',
  },
  bottomNoteContainer: {
    alignSelf: 'center',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    marginBottom: hp(10),
  },
});
export default SetupSigningServer;
