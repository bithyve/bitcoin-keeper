import React from 'react';
import { Box, HStack, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';

import { useNavigation } from '@react-navigation/native';
import { hp } from 'src/constants/responsive';

function UpgradeSubscription({ type }) {
  const navigation = useNavigation();
  const { colorMode } = useColorMode();

  return (
    <HStack style={styles.container} justifyContent={'space-around'}>
      <Text>Available to {type} users</Text>
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={() => {
          navigation.navigate('ChoosePlan');
        }}
        testID="choosePlan"
      >
        <Box
          borderColor={`${colorMode}.BrownNeedHelp`}
          backgroundColor={`${colorMode}.BrownNeedHelp`}
          style={styles.learnMoreContainer}
        >
          <Text color={`${colorMode}.white`} medium style={styles.learnMoreText}>
            Upgrade
          </Text>
        </Box>
      </TouchableOpacity>
    </HStack>
  );
}

const styles = StyleSheet.create({
  learnMoreContainer: {
    flexDirection: 'row',
    gap: 3,
    borderWidth: 0.5,
    borderRadius: 5,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  learnMoreText: {
    fontSize: 12,
    letterSpacing: 0.24,
    alignSelf: 'center',
  },
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEE7E0',
    height: hp(30),
  },
});

export default UpgradeSubscription;
