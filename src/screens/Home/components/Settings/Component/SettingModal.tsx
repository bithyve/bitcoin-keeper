import { CommonActions, useNavigation } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import KeeperModal from 'src/components/KeeperModal';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import { wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import BackupModalContent from 'src/screens/AppSettings/BackupModal';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

const SettingModal = ({ isUaiFlow, confirmPass }) => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { settings, common } = translations;

  const { primaryMnemonic }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const [confirmPassVisible, setConfirmPassVisible] = useState(isUaiFlow);
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  useEffect(() => {
    if (confirmPass) {
      setConfirmPassVisible(true);
    }
  }, [confirmPass]);

  return (
    <Box>
      <KeeperModal
        visible={confirmPassVisible}
        closeOnOverlayClick={false}
        close={() => setConfirmPassVisible(false)}
        title="Confirm Passcode"
        subTitleWidth={wp(240)}
        subTitle="To back up the app recovery key"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        Content={() => (
          <PasscodeVerifyModal
            useBiometrics
            close={() => {
              setConfirmPassVisible(false);
            }}
            onSuccess={() => {
              setConfirmPassVisible(false);
              setBackupModalVisible(true);
            }}
          />
        )}
      />
      <KeeperModal
        visible={backupModalVisible}
        close={() => setBackupModalVisible(false)}
        title={settings.RKBackupTitle}
        subTitle={settings.RKBackupSubTitle}
        subTitleWidth={wp(300)}
        showCloseIcon={false}
        dismissible
        closeOnOverlayClick
        modalBackground={`${colorMode}.primaryBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.modalGreenTitle`}
        secondaryButtonText={common.cancel}
        secondaryCallback={() => setBackupModalVisible(false)}
        secButtonTextColor={`${colorMode}.greenText`}
        buttonText={common.backupNow}
        buttonCallback={() => {
          setBackupModalVisible(false);
          navigation.dispatch(
            CommonActions.navigate('ExportSeed', {
              seed: primaryMnemonic,
              next: true,
            })
          );
        }}
        Content={BackupModalContent}
      />
    </Box>
  );
};

export default SettingModal;
