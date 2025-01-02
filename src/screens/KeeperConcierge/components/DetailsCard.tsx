import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import DetailsWrapper from './DetailsWrapper';
import { hp } from 'src/constants/responsive';

const keyToTitleMap = {
  timeZone: 'Time Zone',
  experience: 'Experience',
  language: 'Language',
  sessionDuration: 'Session Duration',
  totalSession: 'Total Session',
  lastSessionRequest: 'Last Session Request',
};

const DetailsItem = ({ title, value }) => {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.detailsItemContainer}>
      <Box style={styles.leftContainer}>
        <Text color={`${colorMode}.pitchBlackText`} medium fontSize={13} numberOfLines={1}>
          {title}
        </Text>
      </Box>
      <Box style={styles.rightContainer}>
        <Text color={`${colorMode}.greenishGreyText`} medium fontSize={13} numberOfLines={1}>
          {value || '-'}
        </Text>
      </Box>
    </Box>
  );
};

const DetailsCard = ({ title, advisorDetails }) => {
  const { colorMode } = useColorMode();
  const details = advisorDetails || {};

  return (
    <Box>
      <Text style={styles.title} color={`${colorMode}.pitchBlackText`} medium fontSize={16}>
        {title}
      </Text>
      <DetailsWrapper>
        {Object.keys(details).map((key, index) => (
          <DetailsItem key={index} title={keyToTitleMap[key]} value={details[key]} />
        ))}
      </DetailsWrapper>
    </Box>
  );
};

const styles = StyleSheet.create({
  detailsItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
  },
  leftContainer: {
    width: '50%',
  },
  rightContainer: {
    width: '40%',
  },
  title: {
    marginBottom: hp(10),
  },
});

export default DetailsCard;
