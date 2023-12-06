import React, { useContext } from 'react';
import { Box, useColorMode } from 'native-base';

import BackupHealthCheckList from 'src/components/Backup/BackupHealthCheckList';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';

function WalletBackHistoryScreen() {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { BackupWallet } = translations;

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title={BackupWallet.myWalletBackupTitle} />
      <Box mx={wp(5)}>
        <BackupHealthCheckList />
      </Box>
    </ScreenWrapper>
  );
}
export default WalletBackHistoryScreen;
