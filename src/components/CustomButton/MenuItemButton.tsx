import { StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';
import ArrowIcon from 'src/assets/images/icon_arrow.svg';
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
        backgroundColor={`${colorMode}.seashellWhite`}
      >
        <Box style={styles.iconWrapper}>{props.icon}</Box>
        <Box style={styles.titleWrapper}>
          <Text color={`${colorMode}.primaryText`} style={styles.addAmountText}>
            {props.title}
          </Text>
          <Text color={`${colorMode}.GreyText`} style={styles.addAmountSubTitleText}>
            {props.subTitle}
          </Text>
        </Box>
        <Box style={styles.arrowWrapper}>
          <ArrowIcon />
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
    width: '100%',
    borderRadius: 10,
    // justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  iconWrapper: {
    width: '15%',
  },
  titleWrapper: {
    flexDirection: 'column',
    width: '80%',
  },
  arrowWrapper: {
    width: '5%',
  },
  addAmountText: {
    fontWeight: '400',
    fontSize: 14,
    letterSpacing: 1.12,
  },
  addAmountSubTitleText: {
    fontWeight: '400',
    fontSize: 11,
    letterSpacing: 0.6,
  },
});

export default MenuItemButton;
