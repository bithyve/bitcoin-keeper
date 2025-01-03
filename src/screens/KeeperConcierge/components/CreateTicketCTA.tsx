import { CommonActions, useNavigation } from '@react-navigation/native';
import { Box, useColorMode } from 'native-base';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import PenLight from 'src/assets/images/pen-light.svg';
import PenDark from 'src/assets/images/pen-dark.svg';
import { wp } from 'src/constants/responsive';
import { useSelector } from 'react-redux';
import { calculateTicketsLeft } from 'src/utils/utilities';
import usePlan from 'src/hooks/usePlan';

type CreateTicketCTAProps = {
  onPress: () => void;
};

export const CreateTicketCTA = ({ onPress }: CreateTicketCTAProps) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const [display, setDisplay] = useState(false);
  const { tickets, conciergeLoading, conciergeUserFailed, conciergeUserSuccess } = useSelector(
    (state) => state?.concierge
  );
  const planDetails = usePlan();

  useEffect(() => {
    if (conciergeLoading || conciergeUserFailed) return;
    setDisplay(calculateTicketsLeft(tickets, planDetails));
  }, [tickets, conciergeUserFailed, conciergeUserSuccess, conciergeLoading]);

  return (
    <>
      {display && (
        <Box style={styles.helpButton}>
          <Buttons
            primaryText="Ask the team"
            primaryCallback={onPress}
            RightIcon={isDarkMode ? PenLight : PenDark}
            width={wp(150)}
          />
        </Box>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  helpButton: {
    position: 'absolute',
    bottom: '8%',
    right: wp(29),
  },
});
