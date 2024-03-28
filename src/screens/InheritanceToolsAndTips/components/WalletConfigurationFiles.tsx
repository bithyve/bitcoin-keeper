import React, { useEffect, useState } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import moment from 'moment';
import Text from 'src/components/KeeperText';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import InheritanceHeader from '../InheritanceHeader';
import DashedButton from 'src/components/DashedButton';
import WalletConfigFilesIcon from 'src/assets/images/wallet-config-files.svg';
import GenerateAllVaultsFilePDF from 'src/utils/GenerateAllVaultsFilePDF';
import { useNavigation } from '@react-navigation/native';
import useVault from 'src/hooks/useVault';
import useToastMessage from 'src/hooks/useToastMessage';

import { genrateOutputDescriptors } from 'src/utils/service-utilities/utils';
import DownArrow from 'src/assets/images/files.svg';

function WalletConfigurationFiles() {
  const [fingerPrints, setFingerPrints] = useState(null);

  const navigtaion = useNavigation();
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();

  const { allVaults, activeVault } = useVault({
    includeArchived: false,
    getFirst: true,
    getHiddenWallets: false,
  });
  const allVault = [allVaults].filter((item) => item !== null);
  useEffect(() => {
    let VaultArray = [];
    if (allVault) {
      allVault[0]?.map((vault: any) => {
        const descriptorString = genrateOutputDescriptors(vault);
        //WORK IN PROGRESS
        VaultArray.push({ name: vault.presentationData.name, file: descriptorString });
      });
      setFingerPrints(VaultArray);
    }
  }, []);

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <ScrollView contentContainerStyle={styles.marginLeft}>
        <Text style={styles.heading}>Wallet Configuration Files</Text>
        <Text style={styles.description}>Download for all vaults</Text>
        <Text style={styles.commonTextStyle}>
          For multi-key wallets or vaults, it is important to have the configuration files along
          with the minimum number of keys needed.
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
            icon={<DownArrow />}
            description={`Configuration files as on ${moment().format('DD MMMM YYYY')}`}
            callback={() => {
              if (fingerPrints.length) {
                GenerateAllVaultsFilePDF(fingerPrints).then((res) => {
                  if (res) {
                    navigtaion.navigate('PreviewPDF', { source: res });
                  }
                });
              } else {
                showToast('No vaults found');
              }
            }}
            name="View Wallet Configuration Files"
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text bold color={`${colorMode}.white`}>
            Note:
          </Text>
          <Text color={`${colorMode}.white`}>
            When there is a new vault or change in a vault the configuration file needs to be
            downloaded again.
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
  marginLeft: {
    marginLeft: wp(10),
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
