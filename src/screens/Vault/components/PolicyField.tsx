import Text from 'src/components/KeeperText';
import { Box, Input, useColorMode } from 'native-base';
import React from 'react';
import BTC from 'src/assets/images/btc.svg';
import Colors from 'src/theme/Colors';
import { hp, windowHeight } from 'src/constants/responsive';
import { StyleSheet } from 'react-native';

function PolicyField({ title, subTitle, value, onPress }) {
  const { colorMode } = useColorMode();

  return (
    <Box style={styles.fieldWrapper}>
      <Text style={styles.titleText}>{title}</Text>
      <Text color={`${colorMode}.policySubtitle`} style={styles.subTitleText}>
        {subTitle}
      </Text>
      <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.textInput}>
        <Box style={styles.alignCenter}>
          <BTC style={{ color: Colors.SlateGreen }} />
          <Box
            style={styles.horizontalSeparator}
            backgroundColor={`${colorMode}.dropdownSeparator`}
          />
        </Box>
        <Box style={styles.w70}>
          <Input
            fontSize={13}
            color={value ? `${colorMode}.black` : `${colorMode}.SlateGreen`}
            backgroundColor={`${colorMode}.seashellWhite`}
            placeholder="Enter Amount"
            placeholderTextColor={`${colorMode}.greenText`}
            fontWeight={300}
            opacity={value ? 1 : 0.5}
            letterSpacing={1.04}
            borderWidth="0"
            value={value}
            showSoftInputOnFocus={false}
            onFocus={onPress}
            selection={{ start: value.length }}
          />
        </Box>
        <Box style={styles.alignCenter}>
          <Box
            style={styles.horizontalSeparator}
            backgroundColor={`${colorMode}.dropdownSeparator`}
          />
          <Text color={`${colorMode}.SlateGreen`} bold fontSize={13}>
            sats
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  textInput: {
    height: hp(50),
    marginTop: hp(10),
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  fieldWrapper: {
    width: '100%',
    marginTop: windowHeight > 600 ? hp(25) : hp(40),
  },
  titleText: {
    fontSize: 14,
    letterSpacing: 0.14,
  },
  subTitleText: {
    fontSize: 12,
    letterSpacing: 0.12,
  },
  alignCenter: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  horizontalSeparator: {
    width: 2,
    height: hp(20),
    borderRadius: 10,
  },
  w70: {
    width: '70%',
  },
});

export default PolicyField;
