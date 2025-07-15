import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Box, useColorMode, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { SignerStorage, SignerType } from 'src/services/wallets/enums';
import { hp, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import KeeperModal from 'src/components/KeeperModal';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import Note from 'src/components/Note/Note';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';

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
import WalletHeader from 'src/components/WalletHeader';

function SetupSigningServer({ route }: { route }) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { common, error: errorText, signingServer } = translations;
  const [validationModal, showValidationModal] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [validationKey, setValidationKey] = useState('');
  const [isSetupValidated, setIsSetupValidated] = useState(false);
  const { addSignerFlow } = route.params;

  const registerSigningServer = async () => {
    try {
      const { policy } = route.params;
      const { setupData } = await SigningServer.register(policy);
      setSetupData(setupData);
      setValidationKey(setupData.verification.verifier);
    } catch (err) {
      showToast(err.message || err.toString(), <ToastErrorIcon />);
    }
  };

  const validateSetup = async () => {
    const verificationToken = Number(otp);
    try {
      const { valid } = await SigningServer.validate(setupData.id, verificationToken);
      if (valid) {
        setIsSetupValidated(valid);
        showValidationModal(false);
        setOtp('');
      } else {
        showValidationModal(false);
        showToast(errorText.invalidOtp);
        setOtp('');
      }
    } catch (err) {
      showValidationModal(false);
      showToast(`${err.message}`);
      setOtp('');
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
          name: 'ServerKeySuccessScreen',
          params: { addedSigner: signingServerKey, setupData },
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
                setOtp('');
              }
            }}
            testID="otpClipboardButton"
          >
            <CVVInputsView
              passCode={otp}
              passcodeFlag={false}
              backgroundColor
              textColor
              height={hp(46)}
              width={hp(46)}
              marginTop={hp(0)}
              marginBottom={hp(40)}
              inputGap={2}
              customStyle={styles.CVVInputsView}
            />
          </TouchableOpacity>
        </Box>
        <KeyPadView
          onPressNumber={onPressNumber}
          onDeletePressed={onDeletePressed}
          keyColor={`${colorMode}.primaryText`}
        />
        <Box mt={10} alignSelf="flex-end">
          <Box>
            <Buttons
              primaryCallback={() => {
                validateSetup();
              }}
              fullWidth
              primaryText={common.confirm}
              primaryDisable={otp.length !== 6}
            />
          </Box>
        </Box>
      </Box>
    );
  }, [otp]);

  return (
    <ScreenWrapper>
      <View style={styles.Container}>
        <Box>
          <WalletHeader title={signingServer.setupServer2FATitle} />
        </Box>
        <Box>
          {validationKey === '' ? (
            <Box height={hp(200)} justifyContent="center">
              <ActivityIndicator animating size="small" />
            </Box>
          ) : (
            <Box
              style={styles.qrContainer}
              backgroundColor={
                isDarkMode ? `${colorMode}.modalWhiteBackground` : `${colorMode}.ChampagneBliss`
              }
            >
              <Box alignItems="center" alignSelf="center" width={wp(250)}>
                <KeeperQRCode
                  qrData={authenticator.keyuri(
                    'bitcoinkeeper.app',
                    'Bitcoin Keeper',
                    validationKey
                  )}
                  logoBackgroundColor="transparent"
                  size={wp(200)}
                  showLogo
                />
              </Box>
              <Box>
                <WalletCopiableData
                  data={validationKey}
                  dataType="2fa"
                  width="95%"
                  height={hp(65)}
                />
              </Box>
            </Box>
          )}
        </Box>

        {/* {Bottom note} */}
        <Box style={styles.bottomNoteContainer}>
          <Box marginBottom={hp(30)}>
            <Note title={common.note} subtitle={signingServer.noteDesC2} subtitleColor="GreyText" />
          </Box>
          <Buttons
            primaryCallback={() => {
              showValidationModal(true);
            }}
            fullWidth
            primaryText={common.next}
          />
        </Box>
        <KeeperModal
          visible={validationModal}
          close={() => {
            showValidationModal(false);
            setOtp('');
          }}
          title={common.confirm2FACodeTitle}
          subTitle={common.confirm2FACodeSubtitle}
          modalBackground={`${colorMode}.modalWhiteBackground`}
          textColor={`${colorMode}.textGreen`}
          subTitleColor={`${colorMode}.modalSubtitleBlack`}
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
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp(15),
    paddingHorizontal: wp(20),
    paddingTop: hp(30),
    paddingBottom: hp(10),
    marginTop: hp(15),
  },
  CVVInputsView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default SetupSigningServer;
