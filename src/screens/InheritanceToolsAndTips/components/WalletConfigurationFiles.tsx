import React, { useContext, useEffect, useState } from 'react';
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

import { generateOutputDescriptors } from 'src/utils/service-utilities/utils';
import DownArrow from 'src/assets/images/files.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function WalletConfigurationFiles() {
  const [fingerPrints, setFingerPrints] = useState(null);
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;

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
        const descriptorString = generateOutputDescriptors(vault);
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
        <Text style={styles.heading} color={`${colorMode}.headerWhite`}>
          {inheritancePlanning.walletConfigFilesTitle}
        </Text>
        <Text style={styles.description} color={`${colorMode}.headerWhite`}>
          {inheritancePlanning.walletConfigFilesDescpMain}
        </Text>
        <Text style={styles.commonTextStyle} color={`${colorMode}.headerWhite`}>
          {inheritancePlanning.walletConfigFilesParagraph1}
        </Text>
        <Text style={styles.commonTextStyle} color={`${colorMode}.headerWhite`}>
          {inheritancePlanning.walletConfigFilesParagraph2}
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
            name={inheritancePlanning.walletConfigFilesTitle}
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text bold color={`${colorMode}.headerWhite`}>
            Note:
          </Text>
          <Text color={`${colorMode}.headerWhite`}>
            {inheritancePlanning.walletConfigFilesNote}
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
    fontWeight: '500',
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
