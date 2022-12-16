import { Box, Text } from 'native-base';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import DotView from 'src/components/DotView';
import { RFValue } from 'react-native-responsive-fontsize';

export interface Props {
  passCode?: string;
  passcodeFlag?: boolean;
  backgroundColor?: boolean;
  textColor?: boolean;
  borderColor?: string;
}
function PinInputsView({
  passCode,
  passcodeFlag,
  backgroundColor,
  textColor,
  borderColor = 'transparent',
}: Props) {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    if (passCode.length == 4) {
      setTimeout(() => {
        setHide(true);
      }, 2000);
    } else {
      setHide(false);
    }
  }, [passCode]);

  const getBackgroundColor = () =>
    backgroundColor ? 'rgba(253,247,240, 1)' : 'rgba(253,247,240, 0.2)';

  const getTextColor = () => (textColor ? 'light.textBlack' : 'light.white');

  const getDotColor = () => (textColor ? 'black' : 'white');

  const getPin = (num: number) => {
    if (passCode.length == num && !hide) {
      return (
        <Text color={getTextColor()} fontWeight="300" fontSize={RFValue(20)} fontFamily="body">
          {passCode[num - 1]}
        </Text>
      );
    }
    if (passCode.length >= num) {
      return <DotView height={3} width={3} color={getDotColor()} />;
    }
    if (passCode.length == num - 1) {
      return (
        <Text color={getTextColor()} style={styles.cursorText}>
          |
        </Text>
      );
    }
    return '';
  };

  return (
    <Box style={styles.container}>
      <View
        style={{
          ...styles.passcodeBox,
          backgroundColor: getBackgroundColor(),
          borderColor,
        }}
      >
        <Box>{getPin(1)}</Box>
      </View>
      <View
        style={{
          ...styles.passcodeBox,
          backgroundColor: getBackgroundColor(),
          borderColor,
        }}
      >
        <Box>{getPin(2)}</Box>
      </View>
      <View
        style={{
          ...styles.passcodeBox,
          backgroundColor: getBackgroundColor(),
          borderColor,
        }}
      >
        <Box>{getPin(3)}</Box>
      </View>
      <View
        style={{
          ...styles.passcodeBox,
          backgroundColor: getBackgroundColor(),
          borderColor,
        }}
      >
        <Box>{getPin(4)}</Box>
      </View>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: hp(5),
    marginBottom: hp(25),
    flexDirection: 'row',
    width: 'auto',
    alignSelf: 'baseline',
  },
  passcodeBox: {
    marginLeft: wp(15),
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    height: hp(48),
    width: hp(48),
  },
  cursorText: {
    fontWeight: '600',
    fontSize: RFValue(13),
  },
});
export default PinInputsView;
