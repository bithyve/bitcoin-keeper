import React from 'react';
import { Box, useColorMode } from 'native-base';
import Text from './KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { windowWidth, wp } from 'src/constants/responsive';

function UAIEmptyState() {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.uaiEmptyStateContainer} backgroundColor={`${colorMode}.lightSeashell`}>
      <Text fontSize={12} bold color={`${colorMode}.seashellWhite`}>
        You’re all caught up!
      </Text>
      <Box style={styles.rateKeeperContainer}>
        <Text color={`${colorMode}.seashellWhite`} bold style={styles.rateKeeperText}>
          Enjoying our app? Rate Keeper on the App Store
        </Text>
        <TouchableOpacity>
          <Box backgroundColor={`${colorMode}.primaryGreenBackground`} style={styles.appStoreBtn}>
            <Text fontSize={10} bold color={`${colorMode}.Warmbeige`}>
              App Store
            </Text>
          </Box>
        </TouchableOpacity>
      </Box>
    </Box>
  );
}

export default UAIEmptyState;

const styles = StyleSheet.create({
  uaiEmptyStateContainer: {
    borderRadius: 16,
    width: windowWidth * 0.95,
    height: 90,
    justifyContent: 'center',
    paddingHorizontal: 15,
    gap: 5,
  },
  rateKeeperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
  },
  rateKeeperText: {
    width: wp(180),
    fontSize: 14,
  },
  appStoreBtn: {
    width: wp(60),
    alignItems: 'center',
    justifyContent: 'center',
    padding: 7,
    borderRadius: 8,
  },
});
