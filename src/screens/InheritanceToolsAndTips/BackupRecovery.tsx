import { Box, ScrollView } from 'native-base';
import React from 'react';
import OptionCard from 'src/components/OptionCard';
import WalletGreenIcon from 'src/assets/images/wallet_green.svg';
import MrkIcon from 'src/assets/images/icon_mrk.svg';
import CloudUser from 'src/assets/images/cloud_user.svg';
import File from 'src/assets/images/files.svg';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';
import { hp } from 'src/constants/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { updateLastVisitedTimestamp } from 'src/store/reducers/storage';
import { getTimeDifferenceInWords } from 'src/utils/utilities';
import {
  BACKUP_AND_RECOVERY_FILES,
  MASTER_RECOVERY_KEY,
  PERSONAL_CLOUD_BACKUP,
  WALLET_CONFIG_FILES,
} from 'src/services/channel/constants';

function BackupRecovery({ navigation }) {
  // const { wallets } = useWallets({ getAll: true });
  const dispatch = useAppDispatch();
  const { inheritanceToolVisitedHistory } = useAppSelector((state) => state.storage);

  const navigate = (path, value) => {
    navigation.navigate(path);
    dispatch(updateLastVisitedTimestamp({ option: value }));
  };

  const handleCollaaborativeWalletCreation = () => {
    navigation.navigate('SetupCollaborativeWallet');
  };

  return (
    <ScrollView>
      <OptionCard
        preTitle={`${
          inheritanceToolVisitedHistory[MASTER_RECOVERY_KEY] === undefined
            ? 'Never accessed'
            : `${getTimeDifferenceInWords(inheritanceToolVisitedHistory[MASTER_RECOVERY_KEY])}`
        }`}
        title="Master Recovery Key"
        description="Backup 12-word seed phrase"
        LeftIcon={<MrkIcon />}
        callback={() => navigate('MasterRecoveryKey', MASTER_RECOVERY_KEY)}
      />
      <OptionCard
        //-----For Futhure use----
        // preTitle={`${
        //   inheritanceToolVisitedHistory[PERSONAL_CLOUD_BACKUP] === undefined
        //     ? 'Never accessed'
        //     : `${getTimeDifferenceInWords(inheritanceToolVisitedHistory[PERSONAL_CLOUD_BACKUP])}`
        // }`}
        disabled
        preTitle={'Coming soon'}
        title="Personal Cloud Backup"
        description="Use your iCloud or Google Drive"
        LeftIcon={<CloudUser />}
        callback={() => navigate('PersonalCloudBackup', PERSONAL_CLOUD_BACKUP)}
      />
      <OptionCard
        preTitle={`${
          inheritanceToolVisitedHistory[WALLET_CONFIG_FILES] === undefined
            ? 'Never accessed'
            : `${getTimeDifferenceInWords(inheritanceToolVisitedHistory[WALLET_CONFIG_FILES])}`
        }`}
        title="Wallet Configuration Files"
        description="Manual download (advanced)"
        LeftIcon={<File />}
        callback={() => {
          navigate('WalletConfigurationFiles', WALLET_CONFIG_FILES);
        }}
      />

      <Box mt={hp(40)}>
        <OptionCard
          preTitle={`${
            inheritanceToolVisitedHistory[BACKUP_AND_RECOVERY_FILES] === undefined
              ? 'Never accessed'
              : `${getTimeDifferenceInWords(
                  inheritanceToolVisitedHistory[BACKUP_AND_RECOVERY_FILES]
                )}`
          }`}
          title="Backup and Recovery Tips"
          description="Suggestions for secure backup"
          LeftIcon={<VaultGreenIcon />}
          callback={() => {
            navigate('BackupAndRecoveryTips', BACKUP_AND_RECOVERY_FILES);
          }}
        />
      </Box>
    </ScrollView>
  );
}

export default BackupRecovery;
