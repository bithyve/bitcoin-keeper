import { Box, useColorMode } from 'native-base';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import DotView from 'src/components/DotView';

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
  const { colorMode } = useColorMode();
  const [hide, setHide] = useState(false);

  useEffect(() => {
    if (passCode?.length === 4) {
      setTimeout(() => {
        setHide(true);
      }, 2000);
    } else {
      setHide(false);
    }
  }, [passCode]);

  const getBackgroundColor = () =>
    backgroundColor ? 'rgba(253,247,240, 1)' : 'rgba(253,247,240, 0.2)';

  const getTextColor = () => `${colorMode}.textBlack`;

  const getDotColor = () => `${colorMode}.textBlack`;

  const getPin = (num: number) => {
    if (passCode?.length === num && !hide) {
      return (
        <Text color={getTextColor()} bold fontSize={20}>
          {passCode[num - 1]}
        </Text>
      );
    }
    if (passCode?.length >= num) {
      return <DotView height={3} width={3} color={getDotColor()} />;
    }
    if (passCode?.length === num - 1) {
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
      <Box
        borderColor={borderColor}
        style={{
          ...styles.passcodeBox,
          backgroundColor: getBackgroundColor(),
        }}
      >
        <Box>{getPin(1)}</Box>
      </Box>
      <Box
        borderColor={borderColor}
        style={{
          ...styles.passcodeBox,
          backgroundColor: getBackgroundColor(),
        }}
      >
        <Box>{getPin(2)}</Box>
      </Box>
      <Box
        borderColor={borderColor}
        style={{
          ...styles.passcodeBox,
          backgroundColor: getBackgroundColor(),
        }}
      >
        <Box>{getPin(3)}</Box>
      </Box>
      <Box
        borderColor={borderColor}
        style={{
          ...styles.passcodeBox,
          backgroundColor: getBackgroundColor(),
        }}
      >
        <Box>{getPin(4)}</Box>
      </Box>
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
    fontSize: 13,
  },
});
export default PinInputsView;
