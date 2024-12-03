import { Box, useColorMode } from 'native-base';
import React from 'react';
import ConciergeScreenWrapper from './components/ConciergeScreenWrapper';
import ConciergeHeader from './components/ConciergeHeader';
import ContentWrapper from 'src/components/ContentWrapper';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import TicketHistory from './components/TicketHistory';
import Buttons from 'src/components/Buttons';
import PenLight from 'src/assets/images/pen-light.svg';
import PenDark from 'src/assets/images/pen-dark.svg';
import { CommonActions, useNavigation } from '@react-navigation/native';

const TechnicalSupport = () => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const isDarkMode = colorMode === 'dark';
  return (
    <ConciergeScreenWrapper backgroundcolor={`${colorMode}.pantoneGreen`} barStyle="light-content">
      <ConciergeHeader title={'Technical Support'} />
      <ContentWrapper backgroundColor={`${colorMode}.primaryBackground`}>
        <TicketHistory />
        <Box style={styles.helpButton}>
          <Buttons
            primaryText="Ask the team"
            primaryCallback={() => {
              navigation.dispatch(CommonActions.navigate({ name: 'CreateTicket' }));
            }}
            RightIcon={isDarkMode ? PenLight : PenDark}
            width={wp(150)}
          />
        </Box>
      </ContentWrapper>
    </ConciergeScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: wp(25),
    paddingVertical: hp(25),
    gap: hp(20),
  },
  helpButton: {
    position: 'absolute',
    bottom: '8%',
    right: wp(29),
  },
});

export default TechnicalSupport;
