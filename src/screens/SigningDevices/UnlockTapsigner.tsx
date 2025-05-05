import { Platform, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { CKTapCard } from 'cktap-protocol-react-native';

import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { handleTapsignerError, unlockRateLimit } from 'src/hardware/tapsigner';
import Buttons from 'src/components/Buttons';
import NFC from 'src/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React from 'react';
import useTapsignerModal from 'src/hooks/useTapsignerModal';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { hp } from 'src/constants/responsive';
import ScreenWrapper from 'src/components/ScreenWrapper';
import useAsync from 'src/hooks/useAsync';
import NfcManager from 'react-native-nfc-manager';
import DeviceInfo from 'react-native-device-info';
import Note from 'src/components/Note/Note';
import WalletHeader from 'src/components/WalletHeader';

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
        showToast('NFC not supported on this device', <ToastErrorIcon />);
      }
    });
  };

  const unlockCard = React.useCallback(async () => {
    try {
      const { authDelay } = await withModal(async () => unlockRateLimit(card))();
      if (authDelay === 0) {
        navigation.dispatch(CommonActions.goBack());
        if (Platform.OS === 'ios') NFC.showiOSMessage(`Tapsigner unlocked successfully!`);
        showToast('Tapsigner unlocked successfully', <TickIcon />);
      } else {
        if (Platform.OS === 'ios') {
          NFC.showiOSMessage(
            `It was not unlocked completely, please try holding for ${authDelay}s`
          );
        } else {
          showToast(`It was not unlocked completely, please try holding for ${authDelay}s`);
        }
      }
    } catch (error) {
      const errorMessage = handleTapsignerError(error, navigation);
      if (errorMessage) {
        showToast(errorMessage, <ToastErrorIcon />, IToastCategory.DEFAULT, 3000, true);
      }
    } finally {
      closeNfc();
      card.endNfcSession();
    }
  }, []);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader
        title="Unlock TAPSIGNER rate-limit"
        subTitle="You might have entered the wrong pin too many times, please unlock here and try again"
      />
      <ScrollView />
      <Box style={styles.btnContainer}>
        <Buttons
          primaryText="Unlock"
          primaryCallback={unlockTapsignerWithProgress}
          primaryLoading={inProgress}
          fullWidth
        />
        <Box marginTop={hp(20)}>
          <Note title="Note" subtitle="This might take approximately 15s or less" />
        </Box>
      </Box>
      <NfcPrompt visible={nfcVisible} close={closeNfc} />
    </ScreenWrapper>
  );
}

export default UnlockTapsigner;

const styles = StyleSheet.create({
  btnContainer: {
    marginHorizontal: 15,
  },
});
