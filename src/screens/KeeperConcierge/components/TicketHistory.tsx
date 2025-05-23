import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import EmptyIllustrationLight from 'src/assets/images/empty-ticket-illustration-light.svg';
import EmptyIllustrationDark from 'src/assets/images/empty-ticket-illustration-dark.svg';
import TicketList from './TicketList';
import { CTACardDotted } from 'src/components/CTACardDotted';
import OnBoardCallActive from 'src/assets/images/onboardCallActive.svg';
import OnBoardCallInActive from 'src/assets/images/onboardCallInactive.svg';
import usePlan from 'src/hooks/usePlan';
import { useAppSelector } from 'src/store/hooks';
import useIsSmallDevices from 'src/hooks/useSmallDevices';
import { CreateTicketCTA } from './CreateTicketCTA';
import { CommonActions } from '@react-navigation/native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
const HistoryTitle = () => {
  const { colorMode } = useColorMode();
  const isSmaller = useIsSmallDevices();
  const { translations } = useContext(LocalizationContext);
  const { concierge } = translations;
  return (
    <Box style={[styles.historyTitle]}>
      <Text color={`${colorMode}.GreyText`} fontSize={13}>
        {concierge.ticketHistory}
      </Text>
    </Box>
  );
};

const EmptyState = () => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const isSmaller = useIsSmallDevices();
  const { translations } = useContext(LocalizationContext);
  const { concierge } = translations;
  return (
    <Box style={styles.emptyStateContainer}>
      <Box style={styles.emptyTextContainer}>
        <Text color={`${colorMode}.primaryText`} medium fontSize={14}>
          {concierge.noConversations}
        </Text>
        <Text color={`${colorMode}.secondaryText`} fontSize={13} style={styles.centerdText}>
          {concierge.keeperConciergeTeamHelp}
        </Text>
      </Box>
      {isDarkMode ? (
        <EmptyIllustrationDark
          width={isSmaller ? wp(150) : wp(177)}
          height={isSmaller ? wp(100) : wp(140)}
        />
      ) : (
        <EmptyIllustrationLight
          width={isSmaller ? wp(150) : wp(177)}
          height={isSmaller ? wp(100) : wp(140)}
        />
      )}
    </Box>
  );
};

const TicketHistory = ({ onPressCTA, screenName, tags, navigation }) => {
  const { tickets, onboardCallScheduled } = useAppSelector((state) => state.concierge);
  const { isOnL3 } = usePlan();
  const { translations } = useContext(LocalizationContext);
  const { concierge } = translations;

  return (
    <Box style={styles.container}>
      <HistoryTitle />
      <Box flex={1}>{tickets.length ? <TicketList /> : <EmptyState />}</Box>
      {!onboardCallScheduled && (
        <Box style={{ marginHorizontal: wp(22), marginBottom: hp(15) }}>
          <CTACardDotted
            title={concierge.scheduleOnboardingCall}
            subTitle={concierge.scheduleCallWithExpert}
            icon={isOnL3 ? <OnBoardCallActive /> : <OnBoardCallInActive />}
            isActive={isOnL3}
            onPress={() => isOnL3 && onPressCTA()}
          />
        </Box>
      )}
      <CreateTicketCTA
        onPress={() =>
          navigation.dispatch(
            CommonActions.navigate({
              name: 'CreateTicket',
              params: {
                screenName,
                tags,
              },
            })
          )
        }
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: hp(10),
    flex: 1,
  },
  historyTitle: {
    paddingHorizontal: wp(22),
  },
  emptyStateContainer: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: hp(20),
    marginTop: hp(50),
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
