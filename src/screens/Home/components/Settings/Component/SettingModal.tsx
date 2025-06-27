import { CommonActions, useNavigation } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import ConfirmCredentialModal from 'src/components/ConfirmCredentialModal';
import KeeperModal from 'src/components/KeeperModal';
import { wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import BackupModalContent from 'src/screens/AppSettings/BackupModal';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

const SettingModal = ({ isUaiFlow, confirmPass, setConfirmPass }) => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { settings, common, signer: signerText } = translations;

  const { primaryMnemonic }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [backupModalVisible, setBackupModalVisible] = useState(false);

  useEffect(() => {
    if (confirmPass || isUaiFlow) {
      navigation.setParams({ isUaiFlow: false });
      setConfirmPassVisible(true);
    }
  }, [confirmPass, isUaiFlow]);

  return (
    <Box>
      <KeeperModal
        visible={confirmPassVisible}
        closeOnOverlayClick={false}
        close={() => {
          setConfirmPassVisible(false);
          setConfirmPass(false);
        }}
        title={common.confirmPassCode}
        subTitleWidth={wp(240)}
        subTitle={signerText.RKBackupPassSubTitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <ConfirmCredentialModal
            useBiometrics={true}
            close={() => {
              setConfirmPassVisible(false);
              setConfirmPass(false);
            }}
            success={() => {
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
        Content={() => <BackupModalContent />}
      />
    </Box>
  );
};

export default SettingModal;
