import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import EmptyIllustrationLight from 'src/assets/images/empty-ticket-illustration-light.svg';
import EmptyIllustrationDark from 'src/assets/images/empty-ticket-illustration-dark.svg';
import TicketList from './TicketList';

const HistoryTitle = () => {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.historyTitle}>
      <Text color={`${colorMode}.GreyText`} fontSize={13}>
        Your Ticket History
      </Text>
    </Box>
  );
};

const EmptyState = () => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  return (
    <Box style={styles.emptyStateContainer}>
      <Box style={styles.emptyTextContainer}>
        <Text color={`${colorMode}.primaryText`} medium fontSize={14}>
          No Issues Encountered
        </Text>
        <Text color={`${colorMode}.secondaryText`} fontSize={13} style={styles.centerdText}>
          If you face have any issue, feel free to reach out to our Tech team to troubleshoot your
          problem!
        </Text>
      </Box>
      {isDarkMode ? <EmptyIllustrationDark /> : <EmptyIllustrationLight />}
    </Box>
  );
};

const TicketHistory = () => {
  const isEmpty = false;
  return (
    <Box style={styles.container}>
      <HistoryTitle />
      {isEmpty ? <EmptyState /> : <TicketList />}
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  historyTitle: {
    marginLeft: wp(24),
    marginTop: hp(22),
    marginBottom: hp(11),
  },
  emptyStateContainer: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: hp(50),
  },
  emptyTextContainer: {
    width: wp(270),
    gap: hp(2.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerdText: {
    textAlign: 'center',
  },
});

export default TicketHistory;
