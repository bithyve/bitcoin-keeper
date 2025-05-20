import React, { useContext, useState } from 'react';
import { Box, useColorMode } from 'native-base';

import BackupHealthCheckList from 'src/components/Backup/BackupHealthCheckList';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperModal from 'src/components/KeeperModal';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import WalletHeader from 'src/components/WalletHeader';

function WalletBackHistoryScreen({ route }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { seed } = translations;
  const isUaiFlow = route.params?.isUaiFlow || false;
  const [isLearnMore, setIsLearnMore] = useState(false);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={seed.backupPhrase} />
      <Box style={styles.healthCheckContainer}>
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

const styles = StyleSheet.create({
  healthCheckContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: hp(20),
    paddingHorizontal: wp(10),
  },
});
export default WalletBackHistoryScreen;
