import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { Box, useColorMode, View } from 'native-base';
import React, { useCallback, useContext, useState } from 'react';
import { hp, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import KeeperModal from 'src/components/KeeperModal';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import Note from 'src/components/Note/Note';

import { authenticator } from 'otplib';
import useToastMessage from 'src/hooks/useToastMessage';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperQRCode from 'src/components/KeeperQRCode';
import WalletCopiableData from 'src/components/WalletCopiableData';
import WalletHeader from 'src/components/WalletHeader';

function SetupAdditionalServerKey({ route }: { route }) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const [validationModal, showValidationModal] = useState(false);
  const [validationKey, setValidationKey] = useState('');
  const [isSetupValidated, setIsSetupValidated] = useState(false);
  const [otp, setOtp] = useState('');

  const { addSignerFlow, newUserName, PermittedActionData } = route.params;
  console.log('addSignerFlow', addSignerFlow);
  console.log('newUserName', newUserName);
  console.log('PermittedActionData', PermittedActionData);

  const validateSetup = async () => {
    const verificationToken = Number(otp);
    try {
      const valid = true; // TODO: replace with actual validation logic
      if (valid) {
        setIsSetupValidated(valid);
        showValidationModal(false);
        setOtp('');
      } else {
        showValidationModal(false);
        showToast('Invalid OTP. Please try again!');
        setOtp('');
      }
    } catch (err) {
      showValidationModal(false);
      showToast(`${err.message}`);
      setOtp('');
    }
  };

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
              primaryText="Confirm"
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
          <WalletHeader
            title="Set up Server Key 2FA"
            subTitle="Set up a 2FA code with an authenticator app. The server will ask for the 2FA codes for signing transactions and updating the settings"
            subtitleColor={`${colorMode}.GreyText`}
          />
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
                <WalletCopiableData data={validationKey} dataType="2fa" width="95%" />
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
export default SetupAdditionalServerKey;
