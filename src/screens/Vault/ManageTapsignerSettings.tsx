import { Box, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useRef, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Signer } from 'src/services/wallets/interfaces/vault';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import OptionCard from 'src/components/OptionCard';

import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { ScrollView } from 'react-native-gesture-handler';
import { InteracationMode } from './HardwareModalMap';
import KeeperModal from 'src/components/KeeperModal';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';
import Text from 'src/components/KeeperText';
import Buttons from 'src/components/Buttons';
import TAPSIGNERICONLIGHT from 'src/assets/images/tapsigner_light.svg';
import useTapsignerModal from 'src/hooks/useTapsignerModal';
import { CKTapCard } from 'cktap-protocol-react-native';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import NFC from 'src/services/nfc';
import { getCardInfo, handleTapsignerError } from 'src/hardware/tapsigner';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { getAccountFromSigner } from 'src/utils/utilities';

function ManageTapsignerSettings({ route }: any) {
  const { colorMode } = useColorMode();
  const {
    signer: signerFromParam,
  }: {
    signer: Signer;
  } = route.params;

  const signer: Signer = signerFromParam;

  const { translations } = useContext(LocalizationContext);
  const { signer: signerTranslations, common } = translations;

  const [backupsModalVisible, setBackupsModalVisible] = useState(false);
  const [tapsignerBackupsCount, setTapsignerBackupsCount] = useState(null);
  const card = useRef(new CKTapCard()).current;
  const { withModal, nfcVisible, closeNfc } = useTapsignerModal(card);
  const { showToast } = useToastMessage();

  const navigation: any = useNavigation();

  const navigateToUnlockTapsigner = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'UnlockTapsigner',
      })
    );
  };

  const onChangeTapsignerPin = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ChangeTapsignerPin',
        params: {
          signer: signer,
        },
      })
    );
  };

  const onSaveTapsignerBackup = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'TapsignerAction',
        params: {
          mode: InteracationMode.BACKUP_SIGNER,
          signer: signer,
          accountNumber: getAccountFromSigner(signer),
        },
      })
    );
  };

  const getTapsignerBackupsCount = useCallback(async () => {
    try {
      const { backupsCount } = await withModal(async () => getCardInfo(card))();

      if (backupsCount === 0 || backupsCount) {
        if (Platform.OS === 'ios') NFC.showiOSMessage(`TAPSIGNER information retrieved`);
        closeNfc();
        card.endNfcSession();
        setTapsignerBackupsCount(backupsCount);
        setBackupsModalVisible(true);
      } else {
        if (Platform.OS === 'ios')
          NFC.showiOSErrorMessage(`Error while checking TAPSIGNER information. Please try again`);
        else showToast(`Error while checking TAPSIGNER information. Please try again`);
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

  function StatusModalContent() {
    return (
      <Box>
        <Box
          padding={hp(20)}
          borderRadius={7}
          backgroundColor={`${colorMode}.secondaryBackground`}
          flexDirection="row"
        >
          <HexagonIcon
            width={wp(43)}
            height={hp(38)}
            backgroundColor={colorMode === 'light' ? Colors.primaryGreen : Colors.GreenishGrey}
            icon={<TAPSIGNERICONLIGHT />}
          />
          <Box marginLeft={wp(12)}>
            <Text color={`${colorMode}.greenText`} fontSize={15}>
              TAPSIGNER
            </Text>
            <Text fontSize={13}>
              {tapsignerBackupsCount
                ? `${signerTranslations.BackupExported} ${tapsignerBackupsCount} ${
                    tapsignerBackupsCount > 1 ? common.times : common.time
                  }`
                : signerTranslations.NoBackupExported}
            </Text>
          </Box>
        </Box>
        <Box marginTop={hp(25)} marginBottom={hp(40)}>
          <Text style={styles.bottomText}>
            {signerTranslations.TapsignerBackupDetailsModalBottomText}
          </Text>
        </Box>
        <Buttons
          fullWidth
          primaryText={common.Okay}
          primaryCallback={() => {
            setBackupsModalVisible(false);
          }}
        />
      </Box>
    );
  }

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title={signerTranslations.manageTapsigner} />
      <ScrollView
        contentContainerStyle={styles.contentContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        <OptionCard
          title={signerTranslations.saveBackup}
          description={signerTranslations.saveBackupDesc}
          callback={onSaveTapsignerBackup}
        />
        <OptionCard
          title={signerTranslations.changePIN}
          description={signerTranslations.changeCardPIN}
          callback={onChangeTapsignerPin}
        />
        <OptionCard
          title={signerTranslations.unlockCardRateLimit}
          description={signerTranslations.runUnlockCard}
          callback={navigateToUnlockTapsigner}
        />
        <OptionCard
          title={signerTranslations.BackupDetails}
          description={signerTranslations.BackupDetailsSubtitle}
          callback={getTapsignerBackupsCount}
        />
      </ScrollView>
      <NfcPrompt visible={nfcVisible} close={closeNfc} />
      <KeeperModal
        visible={backupsModalVisible}
        close={() => setBackupsModalVisible(false)}
        title={signerTranslations.TapsignerBackupDetails}
        subTitle={signerTranslations.TapsignerBackupDetailsSubtitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={StatusModalContent}
      />
    </ScreenWrapper>
  );
}

export default ManageTapsignerSettings;

const styles = StyleSheet.create({
  contentContainerStyle: {
    paddingTop: hp(10),
    paddingHorizontal: wp(10),
  },
  bottomText: {
    fontSize: 14,
    textAlign: 'left',
    marginLeft: wp(10),
  },
});
