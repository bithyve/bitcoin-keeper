import { Platform, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { CKTapCard } from 'cktap-protocol-react-native';

import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { getTapsignerErrorMessage, unlockRateLimit } from 'src/hardware/tapsigner';
import Buttons from 'src/components/Buttons';
import KeeperHeader from 'src/components/KeeperHeader';
import NFC from 'src/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React from 'react';
import useTapsignerModal from 'src/hooks/useTapsignerModal';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { windowHeight, windowWidth, wp } from 'src/constants/responsive';
import ScreenWrapper from 'src/components/ScreenWrapper';
import useAsync from 'src/hooks/useAsync';
import NfcManager from 'react-native-nfc-manager';
import DeviceInfo from 'react-native-device-info';
import Note from 'src/components/Note/Note';

function UnlockTapsigner() {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const card = React.useRef(new CKTapCard()).current;
  const { withModal, nfcVisible, closeNfc } = useTapsignerModal(card);

  const { showToast } = useToastMessage();

  const { inProgress, start } = useAsync();

  const unlockTapsignerWithProgress = async () => {
    NfcManager.isSupported().then(async (supported) => {
      if (supported) {
        await start(unlockCard);
      } else if (!DeviceInfo.isEmulator()) {
        showToast('NFC not supported on this device', <ToastErrorIcon />, 3000);
      }
    });
  };

  const unlockCard = React.useCallback(async () => {
    try {
      const { authDelay } = await withModal(async () => unlockRateLimit(card))();
      console.log(authDelay);
      if (authDelay === 0) {
        navigation.dispatch(CommonActions.goBack());
        showToast('Tapsigner unlocked successfully', <TickIcon />);
      } else {
        if (Platform.OS === 'ios') {
          NFC.showiOSMessage(
            `It was not unlocked completely, please try holding for ${authDelay}s`
          );
        } else {
          showToast(
            `It was not unlocked completely, please try holding for ${authDelay}s`,
            null,
            4000,
            true
          );
        }
      }
    } catch (error) {
      const errorMessage = getTapsignerErrorMessage(error);
      if (errorMessage) {
        if (Platform.OS === 'ios') NFC.showiOSMessage(errorMessage);
        showToast(errorMessage, null, 2000, true);
      } else if (error.toString() === 'Error') {
        // do nothing when nfc is dismissed by the user
      } else {
        showToast('Something went wrong, please try again!', null, 2000, true);
      }
      closeNfc();
      card.endNfcSession();
    }
  }, []);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Unlock TAPSIGNER rate-limit"
        subtitle="You might have entered the wrong pin too many times, please unlock here and try again"
      />
      <ScrollView />
      <Box style={styles.btnContainer}>
        <Buttons
          primaryText="Unlock"
          primaryCallback={unlockTapsignerWithProgress}
          primaryLoading={inProgress}
        />
        <Note title="Note" subtitle="This might take approximately 15s or less" />
      </Box>
      <NfcPrompt visible={nfcVisible} close={closeNfc} />
    </ScreenWrapper>
  );
}

export default UnlockTapsigner;

const styles = StyleSheet.create({
  header: {
    flex: 1,
    paddingHorizontal: '5%',
    marginBottom: windowHeight > 850 ? 0 : '25%',
  },
  input: {
    margin: '5%',
    paddingHorizontal: 15,
    width: wp(305),
    height: 50,
    borderRadius: 10,
    letterSpacing: 5,
    justifyContent: 'center',
  },
  inputContainer: {
    alignItems: 'flex-end',
  },
  heading: {
    margin: '5%',
    padding: 5,
    width: windowWidth * 0.8,
    fontSize: 13,
    letterSpacing: 0.65,
  },
  btnContainer: {
    marginHorizontal: 15,
  },
});
