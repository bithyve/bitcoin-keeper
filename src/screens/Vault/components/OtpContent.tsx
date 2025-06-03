import Clipboard from '@react-native-clipboard/clipboard';
import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import Buttons from 'src/components/Buttons';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function OtpContent({ otp, setOtp, showToast, callback }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common, error: errorText } = translations;

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
              showToast(errorText.invalidOtpshort);
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
              callback();
            }}
            fullWidth
            primaryText={common.confirm}
            primaryDisable={otp.length !== 6}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default OtpContent;

const styles = StyleSheet.create({
  otpContainer: {
    width: '100%',
  },
  CVVInputsView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
