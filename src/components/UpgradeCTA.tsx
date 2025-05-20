import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from './KeeperText';
import UpgradeIcon from 'src/assets/images/upgradeIcon.svg';
import { hp } from 'src/constants/responsive';

type UpgradeCTAProps = {
  title: string;
  backgroundColor: string;
  onPress: () => void;
};

export const UpgradeCTA = ({ title, backgroundColor, onPress }: UpgradeCTAProps) => {
  const { colorMode } = useColorMode();
  return (
    <TouchableOpacity onPress={onPress}>
      <Box backgroundColor={backgroundColor} style={styles.btnCtr}>
        <UpgradeIcon />
        <Text color={`${colorMode}.whiteSecButtonText`} medium fontSize={14}>
          {title}
        </Text>
      </Box>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btnCtr: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(10),
    borderRadius: 5,
    flexDirection: 'row',
    gap: 10,
  },
});
