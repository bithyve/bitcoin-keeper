import { Box, ScrollView } from 'native-base';
import React from 'react';
import OptionCard from 'src/components/OptionCard';
import WalletGreenIcon from 'src/assets/images/wallet_green.svg';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';
import { hp } from 'src/constants/responsive';

function BackupRecovery({ navigation }) {
  // const { wallets } = useWallets({ getAll: true });

  const navigate = (path) => {
    navigation.navigate(path);
  };

  const handleCollaaborativeWalletCreation = () => {
    navigation.navigate('SetupCollaborativeWallet');
  };

  return (
    <ScrollView>
      <OptionCard
        preTitle="Never accessed"
        title="Master Recovery Key"
        description="Backup 12-word phrase"
        LeftIcon={<WalletGreenIcon />}
        callback={() => navigate('MasterRecoveryKey')}
      />
      <OptionCard
        preTitle="Never accessed"
        title="Personal Cloud Backup"
        description="Use your iCloud or Google Drive"
        LeftIcon={<VaultGreenIcon />}
        callback={() => navigate('PersonalCloudBackup')}
      />
      <OptionCard
        preTitle="Never accessed"
        title="Wallet Configuration Files"
        description="Manual download (advanced)"
        LeftIcon={<VaultGreenIcon />}
        callback={() => {
          navigate('WalletConfigurationFiles');
        }}
      />

      <Box mt={hp(40)}>
        <OptionCard
          preTitle="Never accessed"
          title="Backup and Recovery Tips"
          description="Suggestions for secure backup"
          LeftIcon={<VaultGreenIcon />}
          callback={() => {
            navigate('BackupAndRecoveryTips');
          }}
        />
      </Box>
    </ScrollView>
  );
}

export default BackupRecovery;
