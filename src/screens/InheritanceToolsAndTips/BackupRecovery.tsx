import { ScrollView } from 'native-base';
import React, { useContext } from 'react';
import OptionCard from 'src/components/OptionCard';
import MrkIcon from 'src/assets/images/icon_mrk.svg';
import CloudUser from 'src/assets/images/cloud_user.svg';
import File from 'src/assets/images/files.svg';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { updateLastVisitedTimestamp } from 'src/store/reducers/storage';
import { getTimeDifferenceInWords } from 'src/utils/utilities';
import {
  BACKUP_AND_RECOVERY_FILES,
  MASTER_RECOVERY_KEY,
  PERSONAL_CLOUD_BACKUP,
  WALLET_CONFIG_FILES,
} from 'src/services/channel/constants';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function BackupRecovery({ navigation }) {
  const dispatch = useAppDispatch();
  const { inheritanceToolVisitedHistory } = useAppSelector((state) => state.storage);
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const navigate = (path, value) => {
    navigation.navigate(path);
    dispatch(updateLastVisitedTimestamp({ option: value }));
  };

  return (
    <ScrollView>
      <OptionCard
        preTitle={`${getTimeDifferenceInWords(inheritanceToolVisitedHistory[MASTER_RECOVERY_KEY])}`}
        title={inheritancePlanning.masterKeyTitle}
        description={inheritancePlanning.masterKeyDescp}
        LeftIcon={<MrkIcon />}
        callback={() => navigate('MasterRecoveryKey', MASTER_RECOVERY_KEY)}
      />
      <OptionCard
        preTitle={`${
          inheritanceToolVisitedHistory[PERSONAL_CLOUD_BACKUP] === undefined
            ? 'Never accessed'
            : `${getTimeDifferenceInWords(inheritanceToolVisitedHistory[PERSONAL_CLOUD_BACKUP])}`
        }`}
        title={inheritancePlanning.personalCloudTitle}
        description={inheritancePlanning.personalCloudDescp}
        LeftIcon={<CloudUser />}
        callback={() => navigate('PersonalCloudBackup', PERSONAL_CLOUD_BACKUP)}
      />
      <OptionCard
        preTitle={`${getTimeDifferenceInWords(inheritanceToolVisitedHistory[WALLET_CONFIG_FILES])}`}
        title={inheritancePlanning.walletConfigFilesTitle}
        description={inheritancePlanning.wallerConfigFilesDescp}
        LeftIcon={<File />}
        callback={() => {
          navigate('WalletConfigurationFiles', WALLET_CONFIG_FILES);
        }}
      />

      <OptionCard
        preTitle={`${getTimeDifferenceInWords(
          inheritanceToolVisitedHistory[BACKUP_AND_RECOVERY_FILES]
        )}`}
        title={inheritancePlanning.backupRecoveryTips}
        description={inheritancePlanning.backupRecoveryDescp}
        LeftIcon={<VaultGreenIcon />}
        callback={() => {
          navigate('BackupAndRecoveryTips', BACKUP_AND_RECOVERY_FILES);
        }}
      />
    </ScrollView>
  );
}

export default BackupRecovery;
