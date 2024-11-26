import React from 'react';
import { Box, useColorMode } from 'native-base';
import { Linking, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { windowWidth, wp } from 'src/constants/responsive';
import Text from './KeeperText';

const appStoreLink = 'itms-apps://itunes.apple.com/us/app/apple-store/id1545535925?mt=8';
const playStoreLink = 'https://play.google.com/store/apps/details?id=io.hexawallet.bitcoinkeeper';

function UAIEmptyState() {
  const { colorMode } = useColorMode();

  const openAppInStore = () => {
    const url = Platform.OS == 'ios' ? appStoreLink : playStoreLink;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.error('Something wrong!');
      }
    });
  };

  return (
    <Box style={styles.uaiEmptyStateContainer} backgroundColor={`${colorMode}.lightSeashell`}>
      <Text fontSize={12} bold color={`${colorMode}.seashellWhite`}>
        You’re all caught up!
      </Text>
      <Box style={styles.rateKeeperContainer}>
        <Text color={`${colorMode}.seashellWhite`} bold style={styles.rateKeeperText}>
          Enjoying our app? Rate Keeper on the {Platform.OS == 'ios' ? 'App' : 'Play'} Store
        </Text>
        <TouchableOpacity onPress={openAppInStore}>
          <Box backgroundColor={`${colorMode}.primaryGreenBackground`} style={styles.appStoreBtn}>
            <Text fontSize={10} bold color={`${colorMode}.whiteText`}>
              {Platform.OS == 'ios' ? 'App' : 'Play'} Store
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
    position: 'absolute',
    right: 0,
    bottom: -20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
});
