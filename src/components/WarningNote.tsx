import { Box, useColorMode } from 'native-base';
import React from 'react';
import WarningIcon from 'src/assets/images/warning-exclamation-light.svg';
import CircleIconWrapper from './CircleIconWrapper';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import Text from './KeeperText';

const WarningNote = ({ noteText }) => {
  const { colorMode } = useColorMode();
  return (
    <Box
      style={styles.container}
      backgroundColor={`${colorMode}.errorToastBackground`}
      borderColor={`${colorMode}.alertRed`}
    >
      <Box style={styles.contentContainer}>
        <CircleIconWrapper
          icon={<WarningIcon />}
          width={wp(30)}
          backgroundColor={`${colorMode}.alertRed`}
        />
        <Text color={`${colorMode}.secondaryText`} fontSize={13}>
          {noteText}
        </Text>
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderWidth: 0.5,
  },
  contentContainer: {
    width: '85%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(12),
    paddingVertical: hp(17),
    gap: wp(10),
  },
});

export default WarningNote;
