import React, { useState, useEffect, useContext } from 'react';
import { Box } from 'native-base';

import BackupHealthCheckList from 'src/components/CloudBackup/BackupHealthCheckList';
import { LocalizationContext } from 'src/common/content/LocContext';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';

const WalletBackHistoryScreen = ({ navigation }) => {
  const { translations } = useContext(LocalizationContext);
  const BackupWallet = translations['BackupWallet'];

  return (
    <ScreenWrapper>
      <HeaderTitle title={BackupWallet.myWalletBackupTitle} paddingTop={5} />
      <Box mx={wp(5)}>
        <BackupHealthCheckList />
      </Box>
    </ScreenWrapper>
  );
};
export default WalletBackHistoryScreen;
