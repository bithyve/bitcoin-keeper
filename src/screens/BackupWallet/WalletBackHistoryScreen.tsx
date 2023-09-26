import React, { useState, useEffect, useContext } from 'react';
import { Box } from 'native-base';

import BackupHealthCheckList from 'src/components/Backup/BackupHealthCheckList';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';

function WalletBackHistoryScreen({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { BackupWallet } = translations;

  return (
    <ScreenWrapper>
      <HeaderTitle title={BackupWallet.myWalletBackupTitle} />
      <Box mx={wp(5)}>
        <BackupHealthCheckList />
      </Box>
    </ScreenWrapper>
  );
}
export default WalletBackHistoryScreen;
