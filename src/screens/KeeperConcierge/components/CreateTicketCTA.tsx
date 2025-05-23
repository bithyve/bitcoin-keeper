import { Box, useColorMode } from 'native-base';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import PenLight from 'src/assets/images/pen-light.svg';
import PenDark from 'src/assets/images/pen-dark.svg';
import { windowWidth } from 'src/constants/responsive';
import { useAppSelector } from 'src/store/hooks';

type CreateTicketCTAProps = {
  onPress: () => void;
};

export const CreateTicketCTA = ({ onPress }: CreateTicketCTAProps) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const [display, setDisplay] = useState(false);
  const { tickets, conciergeLoading, conciergeUserFailed, conciergeUserSuccess } = useAppSelector(
    (state) => state?.concierge
  );

  useEffect(() => {
    if (conciergeLoading || conciergeUserFailed) return;
    setDisplay(true);
    // setDisplay(calculateTicketsLeft(tickets, planDetails)); // to be used later
  }, [tickets, conciergeUserFailed, conciergeUserSuccess, conciergeLoading]);

  return (
    <>
      {display && (
        <Box style={[styles.helpButton]}>
          <Buttons
            primaryText="Ask the team"
            primaryCallback={onPress}
            RightIcon={isDarkMode ? PenLight : PenDark}
            width={windowWidth * 0.88}
          />
        </Box>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  helpButton: {
    marginHorizontal: '3%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
