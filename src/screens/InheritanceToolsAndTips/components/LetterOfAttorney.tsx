import React from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useVault from 'src/hooks/useVault';
import Text from 'src/components/KeeperText';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp } from 'src/constants/responsive';
import InheritanceHeader from '../InheritanceHeader';
import LetterOfattorneyIcon from 'src/assets/images/letterOfAttorney.svg';
import DashedButton from 'src/components/DashedButton';
import GenerateLetterToAtternyPDFInheritanceTool from 'src/utils/GenerateLetterToAtternyPDFInheritanceTool';
import DownArrow from 'src/assets/images/down_arrow.svg';

function LetterOfAttorney() {
  const { allVaults } = useVault({
    includeArchived: false,
    getFirst: true,
    getHiddenWallets: false,
  });
  const fingerPrints = allVaults[0]?.signers.map((signer) => signer.masterFingerprint);
  const { colorMode } = useColorMode();
  const navigation = useNavigation();

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <ScrollView>
        <Text style={styles.heading}>Letter to the Attorney</Text>
        <Text style={styles.description}>A pre-filled letter template</Text>
        <Text style={styles.commonTextStyle}>
          This pre-filled letter uses key fingerprints that uniquely identify the keys used in the
          app without revealing any other information about the setup.
        </Text>
        <Text style={styles.commonTextStyle}>
          The information contained here could be used by the attorney or estate planner to create
          the will or other estate planning documents.
        </Text>
        <Box style={styles.circleStyle}>
          <LetterOfattorneyIcon />
        </Box>
        <Box mt={5}>
          <DashedButton
            icon={<DownArrow />}
            description="Pre-filled template for estate planner"
            callback={() => {
              GenerateLetterToAtternyPDFInheritanceTool(fingerPrints).then((res) => {
                if (res) {
                  navigation.navigate('PreviewPDF', { source: res });
                }
              });
            }}
            name="View Letter to the Attorney"
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text bold color={`${colorMode}.white`}>
            Note:
          </Text>
          <Text color={`${colorMode}.white`}>
            The key fingerprint information here does not leak any details about your balance.
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
