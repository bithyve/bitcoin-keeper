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
const PinInputsView = ({
  passCode,
  passcodeFlag,
  backgroundColor,
  textColor,
  borderColor = 'transparent',
}: Props) => {
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

  const getBackgroundColor = () => {
    return backgroundColor ? 'rgba(253,247,240, 1)' : 'rgba(253,247,240, 0.2)'
  }

  const getTextColor = () => {
    return textColor ? 'light.textBlack' : 'light.white';
  }
  return (
    <Box alignSelf={'baseline'}>
      <Box
        flexDirection={'row'}
        width={'auto'}
        style={{
          marginTop: hp(5),
          marginBottom: hp(25),
        }}
      >
        <View
          style={{
            ...styles.passcodeBox,
            backgroundColor: getBackgroundColor(),
            borderColor: borderColor,
          }}
        >
          <Box>
            {passCode.length == 1 ? (
              <Text
                color={getTextColor()}
                fontWeight={'300'}
                fontSize={RFValue(20)}
                fontFamily={'body'}
              >
                {passCode[0]}
              </Text>
            ) : passCode.length >= 2 ? (
              <DotView height={3} width={3} color={textColor ? 'black' : 'white'} />
            ) : passCode.length == 0 && passcodeFlag == true ? (
              <Text color={getTextColor()} style={styles.cursorText}>
                {'|'}
              </Text>
            ) : (
              ''
            )}
          </Box>
        </View>
        <View
          style={{
            ...styles.passcodeBox,
            backgroundColor: getBackgroundColor(),
            borderColor: borderColor,
          }}
        >
          <Box>
            {passCode.length == 2 ? (
              <Text
                color={getTextColor()}
                fontWeight={'300'}
                fontSize={RFValue(20)}
                fontFamily={'body'}
              >
                {passCode[1]}
              </Text>
            ) : passCode.length >= 2 ? (
              <DotView height={3} width={3} color={textColor ? 'black' : 'white'} />
            ) : passCode.length == 1 ? (
              <Text color={getTextColor()} style={styles.cursorText}>
                {'|'}
              </Text>
            ) : (
              ''
            )}
          </Box>
        </View>
        <View
          style={{
            ...styles.passcodeBox,
            backgroundColor: getBackgroundColor(),
            borderColor: borderColor,
          }}
        >
          <Box>
            {passCode.length == 3 ? (
              <Text
                color={getTextColor()}
                fontWeight={'300'}
                fontSize={RFValue(20)}
                fontFamily={'body'}
              >
                {passCode[2]}
              </Text>
            ) : passCode.length >= 3 ? (
              <DotView height={3} width={3} color={textColor ? 'black' : 'white'} />
            ) : passCode.length == 2 ? (
              <Text color={getTextColor()} style={styles.cursorText}>
                {'|'}
              </Text>
            ) : (
              ''
            )}
          </Box>
        </View>
        <View
          style={{
            ...styles.passcodeBox,
            backgroundColor: getBackgroundColor(),
            borderColor: borderColor,
          }}
        >
          <Box>
            {passCode.length == 4 && !hide ? (
              <Text
                color={getTextColor()}
                fontWeight={'300'}
                fontSize={RFValue(20)}
                fontFamily={'body'}
              >
                {passCode[3]}
              </Text>
            ) : passCode.length >= 4 && hide ? (
              <DotView height={3} width={3} color={textColor ? 'black' : 'white'} />
            ) : passCode.length == 3 ? (
              <Text color={getTextColor()} style={styles.cursorText}>
                {'|'}
              </Text>
            ) : (
              ''
            )}
          </Box>
        </View>
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
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
