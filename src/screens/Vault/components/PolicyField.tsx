import Text from 'src/components/KeeperText';
import { Box, Input, useColorMode } from 'native-base';
import React from 'react';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import { StyleSheet } from 'react-native';

interface PolicyFieldProps {
  title?: string;
  subTitle?: string;
  value: string;
  onPress: () => void;
  onChangeText: (text: string) => void;
}

const PolicyField: React.FC<PolicyFieldProps> = ({
  title,
  subTitle,
  value,
  onPress,
  onChangeText,
}) => {
  const { colorMode } = useColorMode();

  return (
    <Box style={styles.fieldWrapper} borderColor={`${colorMode}.separator`} borderWidth={1}>
      {title && <Text style={styles.titleText}>{title}</Text>}
      {subTitle && (
        <Text color={`${colorMode}.GreyText`} style={styles.subTitleText}>
          {subTitle}
        </Text>
      )}
      <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.textInput}>
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
            keyboardType="numeric"
            onChangeText={onChangeText}
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
};

const styles = StyleSheet.create({
  textInput: {
    height: hp(50),
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: wp(10),
    paddingRight: wp(17),
  },
  fieldWrapper: {
    width: '100%',
    marginTop: windowHeight > 600 ? hp(25) : hp(40),
    borderRadius: 10,
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
