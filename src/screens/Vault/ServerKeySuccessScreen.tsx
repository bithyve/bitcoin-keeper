import { Box, useColorMode } from 'native-base';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SigningServerIllustration from 'src/assets/images/Server-key-successful-illustration.svg';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { CommonActions, useNavigation } from '@react-navigation/native';
import KeeperModal from 'src/components/KeeperModal';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import SigningServerIllustrations from 'src/assets/images/backup-server-illustration.svg';
import SigningServer from 'src/services/backend/SigningServer';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Clipboard from '@react-native-community/clipboard';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import useToastMessage from 'src/hooks/useToastMessage';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';

const ServerKeySuccessScreen = ({ route }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const { translations } = useContext(LocalizationContext);
  const { signingServer, common } = translations;
  const navigation = useNavigation();
  const { addedSigner, vaultKey, vaultId } = route.params || {};

  const [backupKeyModal, setBackupKeyModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [OTBLoading, setOTBLoading] = useState(false);
  const { showToast } = useToastMessage();

  useEffect(() => {
    if (addedSigner) {
      setBackupKeyModal(true);
    }
  }, [addedSigner]);
  useEffect(() => {
    if (!showOTPModal) {
      setOtp('');
    }
  }, [showOTPModal]);

  const BackupModalContent = useCallback(() => {
    return (
      <Box style={styles.modalContainer}>
        <SigningServerIllustrations />
        <Box>
          <Text fontSize={12} semiBold style={styles.modalTitle}>
            {signingServer.attention}:
          </Text>
          <Text fontSize={12} style={styles.modalTitle}>
            {signingServer.attentionSubTitle}
          </Text>
        </Box>
        <Buttons
          primaryCallback={() => {
            setShowOTPModal(true);
            setBackupKeyModal(false);
          }}
          fullWidth
          primaryText="Backup Now"
        />
        <Box style={styles.modalButtonContainer}>
          <Buttons
            primaryCallback={() => {
              setBackupKeyModal(false);
            }}
            primaryText={common.Later}
            primaryBackgroundColor="transparent"
            primaryTextColor={
              isDarkMode ? `${colorMode}.modalHeaderTitle` : `${colorMode}.brownColor`
            }
            primaryBorderColor={isDarkMode ? Colors.separator : Colors.BrownBorder}
            width={wp(150)}
          />
          <Buttons
            primaryCallback={() => {
              setBackupKeyModal(false);
            }}
            primaryText={common.Never}
            primaryBackgroundColor="transparent"
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

  function SigningServerOTPModal() {
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

    const onPressConfirm = async () => {
      try {
        setOTBLoading(true);
        const { mnemonic, derivationPath } = await SigningServer.fetchBackup(
          vaultKey?.xfp,
          Number(otp)
        );
        setOTBLoading(false);
        navigation.navigate('ExportSeed', {
          vaultKey,
          vaultId,
          seed: mnemonic,
          derivationPath,
          signer,
          isFromAssistedKey: true,
          isSS: true,
        });
      } catch (err) {
        setOTBLoading(false);
        showToast(`${err}`);
      }
      setShowOTPModal(false);
    };

    const onDeletePressed = () => {
      setOtp(otp.slice(0, otp.length - 1));
    };

    return (
      <Box style={styles.otpModal}>
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
            <CVVInputsView
              passCode={otp}
              passcodeFlag={false}
              backgroundColor
              textColor
              height={hp(46)}
              width={hp(46)}
              marginTop={hp(0)}
              marginBottom={hp(10)}
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
        <Box mt={5} alignSelf="flex-end">
          <Box>
            <Buttons
              primaryCallback={() => {
                onPressConfirm();
              }}
              fullWidth
              primaryText="Confirm"
            />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <ScreenWrapper>
      <ActivityIndicatorView visible={OTBLoading} showLoader={true} />

      <Box style={styles.container}>
        <SigningServerIllustration />
        <Text semiBold fontSize={20} color={`${colorMode}.textGreen`} style={styles.title}>
          {signingServer.successTitle}
        </Text>
        <Text fontSize={18} color={`${colorMode}.secondaryText`} style={styles.subtitle}>
          {signingServer.successSubTitle}
        </Text>
      </Box>
      <Buttons
        primaryCallback={() => {
          const navigationState = {
            name: 'Home',
            params: { selectedOption: 'Keys', addedSigner: addedSigner },
          };

          navigation.dispatch(CommonActions.navigate(navigationState));
        }}
        fullWidth
        primaryText="Finish"
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
      <KeeperModal
        visible={showOTPModal}
        close={() => setShowOTPModal(false)}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        title={common.confirm2FACodeTitle}
        subTitle={common.confirm2FACodeSubtitle}
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={SigningServerOTPModal}
      />
    </ScreenWrapper>
  );
};

export default ServerKeySuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    paddingVertical: hp(15),
  },
  subtitle: {
    textAlign: 'center',
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
  otpModal: {
    width: '100%',
  },
  CVVInputsView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
