import { StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { hp } from 'src/constants/responsive';

function MenuItemButton(props) {
  const { colorMode } = useColorMode();
  return (
    <TouchableOpacity
      testID={`btn_${props.title}`}
      activeOpacity={0.5}
      style={styles.addAmountContainer}
      onPress={props.onPress}
    >
      <Box
        style={[styles.addAmountWrapper01, { height: props.height ? props.height : hp(70) }]}
        backgroundColor={`${colorMode}.pantoneGreenLight`}
        borderColor={`${colorMode}.primaryGreenBackground`}
      >
        <Box>{props.icon}</Box>
        <Box>
          <Text semiBold color={`${colorMode}.textGreen`} style={styles.addAmountText}>
            {props.title}
          </Text>
          <Text color={`${colorMode}.secondaryText`} style={styles.addAmountSubTitleText}>
            {props.subTitle}
          </Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  addAmountContainer: {
    marginTop: hp(8),
  },
  addAmountWrapper01: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    paddingHorizontal: 15,
    borderStyle: 'dashed',
  },
  addAmountText: {
    fontSize: 13,
    letterSpacing: 0.26,
    lineHeight: 20,
  },
  addAmountSubTitleText: {
    fontSize: 12,
    letterSpacing: 0.12,
    lineHeight: 14,
  },
});

export default MenuItemButton;
