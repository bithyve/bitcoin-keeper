import { Box, ScrollView, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import ConciergeHeader from './components/ConciergeHeader';
import ConciergeScreenWrapper from './components/ConciergeScreenWrapper';
import ContentWrapper from '../../components/ContentWrapper';
import { hp, wp } from 'src/constants/responsive';
import ReachOutArrowLight from 'src/assets/images/reach-out-arrow-light.svg';
import ReachOutArrowDark from 'src/assets/images/reach-out-arrow-dark.svg';

import Text from 'src/components/KeeperText';

const TicketNote = ({ note }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  return (
    <Box style={styles.noteContainer}>
      {isDarkMode ? <ReachOutArrowDark /> : <ReachOutArrowLight />}
      <Text color={`${colorMode}.noteText`}>{note}</Text>
    </Box>
  );
};

const TicketDetails = () => {
  const { colorMode } = useColorMode();

  return (
    <ConciergeScreenWrapper backgroundcolor={`${colorMode}.pantoneGreen`} barStyle="light-content">
      <ConciergeHeader title={'Support Team'} />
      <ContentWrapper backgroundColor={`${colorMode}.primaryBackground`}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Box style={styles.contentContainer}>
            <Box></Box>
            <Box style={styles.note}>
              <TicketNote
                note={
                  'Our Tech Team will reach out to you within 48-72 hours when the issue gets fixed'
                }
              />
            </Box>
          </Box>
        </ScrollView>
      </ContentWrapper>
    </ConciergeScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flex: 1,
    paddingHorizontal: wp(25),
    paddingVertical: hp(25),
    gap: hp(20),
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  note: {},
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(10),
    width: '90%',
  },
});

export default TicketDetails;
