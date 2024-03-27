import React from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { StyleSheet } from 'react-native';

function InheritanceHeaderView(props) {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.wrapper}>
      <Box style={styles.iconWrapper}>{props.icon}</Box>
      <Box style={styles.titleWrapper}>
        <Text color={`${colorMode}.textWallet`} style={styles.titleText}>
          {props.title}
        </Text>
        <Text color={`${colorMode}.secondaryText`} style={styles.subTitleText}>
          {props.subTitle}
        </Text>
      </Box>
    </Box>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    flexDirection: 'row',
    borderRadius: 10,
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  iconWrapper: {
    width: '20%',
  },
  titleWrapper: {
    width: '80%',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.8,
  },
  subTitleText: {
    fontSize: 12,
    letterSpacing: 0.8,
  },
});
export default InheritanceHeaderView;
