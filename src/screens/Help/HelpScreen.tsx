import React from 'react';
import { Box, useColorMode } from '@gluestack-ui/themed-native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import { hp, wp } from 'src/constants/responsive';
// Use the previous concierge icon as the help icon
import ConciergeNeedHelpIcon from 'src/assets/images/conciergeNeedHelp.svg';

const HelpScreen = () => {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.container} backgroundColor={`${colorMode}.primaryBackground`}>
      <Box style={styles.iconWrapper}>
        <CircleIconWrapper
          width={wp(60)}
          icon={<ConciergeNeedHelpIcon />}
          backgroundColor={`${colorMode}.separator`}
        />
      </Box>
      <Text style={styles.title} color={`${colorMode}.primaryText`} fontSize={22} medium>
        Help & Support
      </Text>
      <Text style={styles.description} color={`${colorMode}.secondaryText`} fontSize={15}>
        Find answers to your questions, get support, and learn more about using Keeper.
      </Text>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconWrapper: {
    marginBottom: hp(24),
  },
  title: {
    marginTop: hp(8),
    marginBottom: hp(8),
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginTop: hp(4),
    maxWidth: wp(300),
  },
});

export default HelpScreen;
