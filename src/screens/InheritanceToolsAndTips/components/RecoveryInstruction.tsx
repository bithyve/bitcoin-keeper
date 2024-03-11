import React from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp } from 'src/constants/responsive';
import AddCard from 'src/components/AddCard';
import InheritanceHeader from '../InheritanceHeader';

import DownloadIcon from 'src/assets/images/download-icon.svg';

function RecoveryInstruction({}) {
  const { colorMode } = useColorMode();

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <ScrollView>
        <Text style={styles.heading}>Recovery Instructions</Text>
        <Text style={styles.description}>For the heir or beneficiary</Text>
        <Text style={styles.commonTextStyle}>
          Recovery Instructions is a document containing information and steps to be used by the
          heir to recover the funds.
        </Text>
        <Text style={styles.commonTextStyle}>
          The document contains no sensitive information. It can be kept along with all the keys or
          separately.
        </Text>
        <Box style={styles.addContainer}>
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
            Test the recovery using the instructions provided to ensure everything is in place
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

export default RecoveryInstruction;
