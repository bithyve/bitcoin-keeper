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
import SigningServerIllustration from 'src/assets/images/backup-server-illustration.svg';

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
import WalletHeader from 'src/components/WalletHeader';
import Colors from 'src/theme/Colors';

function SetupSigningServer({ route }: { route }) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultTranslation, signingServer, common } = translations;
  const [validationModal, showValidationModal] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [validationKey, setValidationKey] = useState('true');
  const [isSetupValidated, setIsSetupValidated] = useState(false);
  const [backupKeyModal, setBackupKeyModal] = useState(false);
  // const { addSignerFlow = false } = route.params;
  const addSignerFlow = false;

  // const registerSigningServer = async () => {
  //   try {
  //     const { setupData } = await SigningServer.register(policy);
  //     setSetupData(setupData);
  //     setValidationKey(setupData.verification.verifier);
  //   } catch (err) {
  //     showToast('Something went wrong. Please try again!');
  //   }
  // };

  const validateSetup = async () => {
    const verificationToken = Number(otp);
    try {
      // const { valid } = await SigningServer.validate(setupData.id, verificationToken);
      const valid = true;
      if (valid) {
        // setIsSetupValidated(valid);
        showValidationModal(false);
        setBackupKeyModal(true);
      } else {
        showValidationModal(false);
        showToast('Invalid OTP. Please try again!');
      }
    } catch (err) {
      showValidationModal(false);
      showToast(`${err.message}`);
    }
  };

  const setupSigningServerKey = async () => {
    // const { policy } = route.params;
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
      // signerPolicy: policy,
    });

    dispatch(addSigningDevice([signingServerKey]));
    const navigationState = addSignerFlow
      ? {
          name: 'Home',
          params: { selectedOption: 'Keys', addedSigner: signingServerKey },
        }
      : {
          name: 'AddSigningDevice',
          merge: true,
          params: { addedSigner: signingServerKey },
        };
    navigation.dispatch(CommonActions.navigate(navigationState));
  };

  // useEffect(() => {
  //   registerSigningServer();
  // }, []);

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
              primaryText="Confirm"
            />
          </Box>
        </Box>
      </Box>
    );
  }, [otp]);
  const BackupModalContent = useCallback(() => {
    return (
      <Box style={styles.modalContainer}>
        {<SigningServerIllustration />}
        <Box>
          <Text fontSize={12} semiBold style={styles.modalTitle}>
            {signingServer.attention}:
          </Text>
          <Text fontSize={12} style={styles.modalTitle}>
            {signingServer.attentionSubTitle}
          </Text>
        </Box>
        <Buttons primaryCallback={() => {}} fullWidth primaryText="Backup Now" />
        <Box style={styles.modalButtonContainer}>
          <Buttons
            primaryCallback={() => {
              setBackupKeyModal(false);
              navigation.navigate('ServerKeySuccessScreen');
            }}
            primaryText={common.Later}
            primaryBackgroundColor={'transparent'}
            primaryTextColor={
              isDarkMode ? `${colorMode}.modalHeaderTitle` : `${colorMode}.brownColor`
            }
            primaryBorderColor={isDarkMode ? Colors.separator : Colors.BrownBorder}
            width={wp(150)}
          />
          <Buttons
            primaryCallback={() => {
              setBackupKeyModal(false);
              navigation.navigate('ServerKeySuccessScreen');
            }}
            primaryText={common.Never}
            primaryBackgroundColor={'transparent'}
            primaryTextColor={
              isDarkMode ? `${colorMode}.modalHeaderTitle` : `${colorMode}.brownColor`
            }
            primaryBorderColor={isDarkMode ? Colors.separator : Colors.BrownBorder}
            width={wp(150)}
          />
        </Box>
      </Box>
    );
  }, []);

  return (
    <ScreenWrapper>
      <View style={styles.Container}>
        <Box>
          <WalletHeader title="Set up 2FA for signer" />
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
                  qrData={authenticator.keyuri('bitcoin-keeper.io', 'Keeper', validationKey)}
                  logoBackgroundColor="transparent"
                  size={wp(200)}
                  showLogo
                />
              </Box>
              <Box>
                <WalletCopiableData
                  data={validationKey}
                  dataType="2fa"
                  width={'95%'}
                ></WalletCopiableData>
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
            fullWidth
            primaryText="Next"
          />
        </Box>
        <KeeperModal
          visible={validationModal}
          close={() => {
            showValidationModal(false);
          }}
          title="Confirm 2FA Code"
          subTitle="Confirm the currrent 2FA code from your authenticator app"
          modalBackground={`${colorMode}.modalWhiteBackground`}
          textColor={`${colorMode}.modalHeaderTitle`}
          subTitleColor={`${colorMode}.modalSubtitleBlack`}
          Content={otpContent}
        />
        <KeeperModal
          visible={backupKeyModal}
          close={() => {
            setBackupKeyModal(false);
          }}
          title={signingServer.BackUpModalTitle}
          subTitle={signingServer.BackUpModalSubTitle}
          modalBackground={`${colorMode}.modalWhiteBackground`}
          textColor={`${colorMode}.modalHeaderTitle`}
          subTitleColor={`${colorMode}.modalSubtitleBlack`}
          Content={BackupModalContent}
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
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  modalTitle: {
    marginBottom: 10,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  CVVInputsView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default SetupSigningServer;
