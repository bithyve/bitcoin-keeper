import React from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import KeeperHeader from 'src/components/KeeperHeader';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp } from 'src/constants/responsive';
import AddCard from 'src/components/AddCard';

function WalletConfigurationFiles({}) {
  const { colorMode } = useColorMode();

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <KeeperHeader />
      <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
        <Text style={styles.heading}>Wallet Configuration Files</Text>
        <Text style={styles.description}>Download for all vaults</Text>
        <Text style={styles.commonTextStyle}>
          For multisig wallets or vaults, it is mportant to have the configuration files along with
          the minimum number of keys needed.
        </Text>
        <Text style={styles.commonTextStyle}>
          For multisig wallets or vaults, it is mportant to have the configuration files along with
          the minimum number of keys needed.
        </Text>
        <Box style={styles.addContainer}>
          <Text color={`${colorMode}.white`}>Configuration files as on 21st March 2024</Text>
          <AddCard
            name="Download Document"
            nameColor={`${colorMode}.white`}
            borderColor={`${colorMode}.white`}
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text bold color={`${colorMode}.white`}>
            Note:
          </Text>
          <Text color={`${colorMode}.white`}>
            When there is anew vault or change in a vault the configuration file needs to be
            downloaded again
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
    gap: 10,
    alignItems: 'center',
  },
  leftTextStyle: {
    textAlign: 'left',
    marginTop: hp(40),
    color: Colors.white,
  },
});

export default WalletConfigurationFiles;
