import React, { useContext } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useVault from 'src/hooks/useVault';
import Text from 'src/components/KeeperText';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import useToastMessage from 'src/hooks/useToastMessage';

import InheritanceHeader from '../InheritanceHeader';
import LetterOfattorneyIcon from 'src/assets/images/letterOfAttorney.svg';
import DashedButton from 'src/components/DashedButton';
import GenerateLetterToAtternyPDFInheritanceTool from 'src/utils/GenerateLetterToAtternyPDFInheritanceTool';
import DownArrow from 'src/assets/images/down_arrow.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function LetterOfAttorney() {
  const { allVaults } = useVault({
    includeArchived: false,
    getFirst: true,
    getHiddenWallets: false,
  });
  const fingerPrints = allVaults[0]?.signers.map((signer) => signer.masterFingerprint);
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <ScrollView contentContainerStyle={styles.marginLeft}>
        <Text style={styles.heading}>{inheritancePlanning.letterOfAttorneyTitle}</Text>
        <Text style={styles.description}>{inheritancePlanning.letterOfAttorneyDescp}</Text>
        <Text style={styles.commonTextStyle}>{inheritancePlanning.letterOfAttorneyP1}</Text>
        <Text style={styles.commonTextStyle}>{inheritancePlanning.letterOfAttorneyP2}</Text>
        <Box style={styles.circleStyle}>
          <LetterOfattorneyIcon />
        </Box>
        <Box mt={5}>
          <DashedButton
            icon={<DownArrow />}
            description={inheritancePlanning.letterOfAttorneyCtaDescp}
            callback={() => {
              if (fingerPrints) {
                GenerateLetterToAtternyPDFInheritanceTool(fingerPrints).then((res) => {
                  if (res) {
                    navigation.navigate('PreviewPDF', { source: res });
                  }
                });
              } else {
                showToast('No vaults found');
              }
            }}
            name={inheritancePlanning.letterOfAttorneyCtaTitle}
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text bold color={`${colorMode}.white`}>
            Note:
          </Text>
          <Text color={`${colorMode}.white`}>{inheritancePlanning.letterOfAttorneyNotes}</Text>
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
    marginTop: hp(40),
    color: Colors.white,
  },
  addContainer: {
    marginTop: hp(100),
    gap: 10,
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

export default LetterOfAttorney;
