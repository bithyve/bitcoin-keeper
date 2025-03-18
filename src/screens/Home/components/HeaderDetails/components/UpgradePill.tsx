import React, { useContext } from 'react';
import { Box, HStack, Pressable, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import UpgradeWhite from 'src/assets/images/upgrade-circle-arrow-white.svg';
import { StyleSheet } from 'react-native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { CommonActions, useNavigation } from '@react-navigation/native';

const UpgradePill = () => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  return (
    <Box>
      <Pressable onPress={() => navigation.dispatch(CommonActions.navigate('ChoosePlan'))}>
        <Box
          style={styles.statusContainer}
          backgroundColor={`${colorMode}.appStatusButtonBackground`}
          borderColor={`${colorMode}.greyBorder`}
        >
          <HStack style={styles.contentContainer}>
            <Text color={`${colorMode}.appStatusTextColor`} style={styles.textStyle}>
              {common.upgrade}
            </Text>
            <UpgradeWhite />
          </HStack>
        </Box>
      </Pressable>
    </Box>
  );
};

const styles = StyleSheet.create({
  statusContainer: {
    height: 29,
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2.5,
  },
  textStyle: {
    fontSize: 12,
    lineHeight: 17,
  },
});

export default UpgradePill;
