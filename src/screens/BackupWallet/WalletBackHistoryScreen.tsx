import React, { useContext, useState } from 'react';
import { Box, useColorMode } from 'native-base';

import BackupHealthCheckList from 'src/components/Backup/BackupHealthCheckList';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperModal from 'src/components/KeeperModal';

function WalletBackHistoryScreen({ route }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const [isLearnMore, setIsLearnMore] = useState(false);
  const { BackupWallet } = translations;
  const isUaiFlow = route.params?.isUaiFlow || false;

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={BackupWallet.myWalletBackupTitle}
        learnMore
        learnMorePressed={() => {
          setIsLearnMore(true);
        }}
      />
      <Box mx={wp(5)}>
        <BackupHealthCheckList isUaiFlow={isUaiFlow} />
      </Box>
      <KeeperModal
        visible={isLearnMore}
        close={() => {
          setIsLearnMore(false);
        }}
      />
    </ScreenWrapper>
  );
}
export default WalletBackHistoryScreen;
