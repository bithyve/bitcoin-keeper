import React from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import KeeperHeader from 'src/components/KeeperHeader';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp } from 'src/constants/responsive';
import AddCard from 'src/components/AddCard';

function PersonalCloudBackup({}) {
  const { colorMode } = useColorMode();

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <KeeperHeader />
      <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
        <Text style={styles.heading}>Personal Cloud Backup</Text>
        <Text style={styles.description}>Use your iCloud or Google Drive</Text>
        <Text style={styles.commonTextStyle}>
          Wallet configuration files for vaults can alternatively be stored on the users personal
          cloud. This ensures that the user has access to them even if they do not have the Keeper
          app.
        </Text>
        <Text style={styles.commonTextStyle}>
          These files are also encrypted with the Mater Recovery Key which needs to be backed up
          properly.
        </Text>
        <Box style={styles.addContainer}>
          <AddCard
            name="Backup configuration file"
            nameColor={`${colorMode}.white`}
            borderColor={`${colorMode}.white`}
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text bold color={`${colorMode}.white`}>
            Note:
          </Text>
          <Text color={`${colorMode}.white`}>
            This action needs to be performed regularly as configuration details change
          </Text>
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 25,
    marginTop: 20,
  },
  walletType: {
    justifyContent: 'space-between',
    gap: 10,
  },
  heading: {
    fontSize: 18,
    color: Colors.white,
  },
  description: {
    fontSize: 14,
    color: Colors.white,
  },
  commonTextStyle: {
    textAlign: 'center',
    marginTop: hp(40),
    color: Colors.white,
  },
  addContainer: {
    marginTop: hp(40),
  },
  leftTextStyle: {
    textAlign: 'left',
    marginTop: hp(40),
    color: Colors.white,
  },
});

export default PersonalCloudBackup;
