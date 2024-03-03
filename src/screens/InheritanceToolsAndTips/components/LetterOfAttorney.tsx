import React from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import KeeperHeader from 'src/components/KeeperHeader';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp } from 'src/constants/responsive';
import AddCard from 'src/components/AddCard';

function LetterOfAttorney({}) {
  const { colorMode } = useColorMode();

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <KeeperHeader />
      <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
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
        <Box style={styles.addContainer}>
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
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

export default LetterOfAttorney;
