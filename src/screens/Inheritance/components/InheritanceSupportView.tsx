/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-unused-vars */
import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';

import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import Inheritance from 'src/assets/images/inheritance_Inner.svg';

type Props = {
  title?: string;
  subtitle?: string;
};

function InheritanceSupportView({ title = '', subtitle = '' }: Props) {
  const { colorMode } = useColorMode();
  function GradientIcon({ height, Icon }) {
    return (
      <Box
        backgroundColor={`${colorMode}.pantoneGreen`}
        style={{
          ...styles.gradientIcon,
          height: hp(height),
          width: hp(height),
          borderRadius: height,
        }}
      >
        <Icon />
      </Box>
    );
  }
  return (
    <Box style={styles.topContainer}>
      <Box style={styles.headerIconWrapper}>
        <GradientIcon Icon={Inheritance} height={50} />
      </Box>
      <Box style={styles.headerTitleWrapper}>
        <Text color={`${colorMode}.primaryText`} style={styles.title}>
          {title}
        </Text>
        <Text color={`${colorMode}.textColor2`} style={styles.subtitle}>
          {subtitle}
        </Text>
      </Box>
    </Box>
  );
}
const styles = StyleSheet.create({
  topContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    marginHorizontal: 10,
    marginBottom: 20
  },
  headerIconWrapper: {
    width: '20%'
  },
  headerTitleWrapper: {
    width: '80%'
  },
  title: {
    fontSize: 16,
    letterSpacing: 0.96,
  },
  subtitle: {
    fontSize: 13,
    letterSpacing: 1.3,
  },
  gradientIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default InheritanceSupportView;
