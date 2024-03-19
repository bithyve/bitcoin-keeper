import React, { useEffect } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp } from 'src/constants/responsive';
import InheritanceHeader from '../InheritanceHeader';
import DashedButton from 'src/components/DashedButton';
import WalletConfigFilesIcon from 'src/assets/images/wallet-config-files.svg';
import GenerateAllVaultsFilePDF from 'src/utils/GenerateAllVaultsFilePDF';
import { useNavigation } from '@react-navigation/native';
import { Vault } from 'src/services/wallets/interfaces/vault';
import useVault from 'src/hooks/useVault';
import { genrateOutputDescriptors } from 'src/utils/service-utilities/utils';

function WalletConfigurationFiles() {
  const navigtaion = useNavigation();
  const { colorMode } = useColorMode();

  const { allVaults, activeVault } = useVault({
    includeArchived: false,
    getFirst: true,
    getHiddenWallets: false,
  });
  const allVault = [allVaults].filter((item) => item !== null);

  useEffect(() => {
    allVault.map((vault: any) => {
      console.log('vault', vault[0]);
      const descriptorString = genrateOutputDescriptors(vault[0]);
      //WORK IN PROGRESS
      console.log('descriptorStringdescriptorStringdescriptorString', descriptorString);
    });
  }, []);

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <ScrollView>
        <Text style={styles.heading}>Wallet Configuration Files</Text>
        <Text style={styles.description}>Download for all vaults</Text>
        <Text style={styles.commonTextStyle}>
          For multisig wallets or vaults, it is mportant to have the configuration files along with
          the minimum number of keys needed.
        </Text>
        <Text style={styles.commonTextStyle}>
          The wallet configuration file, also known as Output Descriptor or the BSMS file is an
          important item for vault recovery. Please store it carefully.
        </Text>
        <Box style={styles.circleStyle}>
          <WalletConfigFilesIcon />
        </Box>
        <Box mt={5} alignItems={'center'}>
          <DashedButton
            description="Configuration files as on 21st March 2024"
            callback={() => {
              GenerateAllVaultsFilePDF().then((res) => {
                if (res) {
                  navigtaion.navigate('PreviewPDF', { source: res });
                }
              });
            }}
            name="View Document"
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
    marginTop: hp(20),
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
  circleStyle: {
    alignItems: 'center',
    marginTop: hp(20),
  },
});

export default WalletConfigurationFiles;
