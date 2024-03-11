import React from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import KeeperHeader from 'src/components/KeeperHeader';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp } from 'src/constants/responsive';
import AddCard from 'src/components/AddCard';
import InheritanceHeader from '../InheritanceHeader';
import DownloadIcon from 'src/assets/images/download-icon.svg';

function PrintableTemplates({}) {
  const { colorMode } = useColorMode();

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <ScrollView>
        <Text style={styles.heading}>Printable Templates</Text>
        <Text style={styles.commonTextStyle}>{'Recovery Phrase Template\n12 or 24 words'}</Text>
        <Text style={styles.commonTextStyle}>
          This is a simple template that can be printed out on a small piece of paper (ideally
          acid-free).
        </Text>
        <Text style={styles.commonTextStyle}>
          12 or 24 words recovery phrase can then be written down on them with an archival type pen
          and the sheet laminated at home.
        </Text>
        <Box style={styles.addContainer}>
          <Text color={`${colorMode}.white`}>All Descriptors on 21st March 2024</Text>
          <AddCard
            name="Download Document"
            nameColor={`${colorMode}.white`}
            borderColor={`${colorMode}.white`}
            icon={<DownloadIcon />}
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text bold color={`${colorMode}.white`}>
            Note:
          </Text>
          <Text color={`${colorMode}.white`}>
            You can add additional information on the template
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
});

export default PrintableTemplates;
