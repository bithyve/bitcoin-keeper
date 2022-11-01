import React, { useEffect, useState } from 'react';
import { Box, Text } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';

import { hp } from 'src/common/data/responsiveness/responsive';
import DotView from 'src/components/DotView';
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

  return (
    <Box alignSelf={'baseline'}>
      <Box flexDirection={'row'} width={'auto'}
        style={{
          marginTop: hp(5),
          marginBottom: hp(25)
        }}>
        <Box
          size={hp(48)}
          borderRadius={7}
          ml={5}
          alignItems={'center'}
          justifyContent={'center'}
          backgroundColor={backgroundColor ? 'rgba(253,247,240, 1)' : 'rgba(253,247,240, 0.2)'}
          borderColor={borderColor}
          borderWidth={'1'}
        >
          <Box>
            {passCode.length == 1 ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(20)}
                fontFamily={'body'}
              >
                {passCode[0]}
              </Text>
            ) : passCode.length >= 2 ? (
              <DotView height={3} width={3} color={textColor ? 'black' : 'white'} />
            ) : passCode.length == 0 && passcodeFlag == true ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(13)}
              >
                {'|'}
              </Text>
            ) : (
              ''
            )}
          </Box>
        </Box>
        <Box
          size={hp(48)}
          borderRadius={7}
          ml={5}
          alignItems={'center'}
          justifyContent={'center'}
          backgroundColor={backgroundColor ? 'rgba(253,247,240, 1)' : 'rgba(253,247,240, 0.2)'}
          borderColor={borderColor}
          borderWidth={'1'}
        >
          <Box>
            {passCode.length == 2 ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(20)}
                fontFamily={'body'}
              >
                {passCode[1]}
              </Text>
            ) : passCode.length >= 2 ? (
              <DotView height={3} width={3} color={textColor ? 'black' : 'white'} />
            ) : passCode.length == 1 ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(13)}
              >
                {'|'}
              </Text>
            ) : (
              ''
            )}
          </Box>
        </Box>
        <Box
          size={hp(48)}
          borderRadius={7}
          ml={5}
          alignItems={'center'}
          justifyContent={'center'}
          backgroundColor={backgroundColor ? 'rgba(253,247,240, 1)' : 'rgba(253,247,240, 0.2)'}
          borderColor={borderColor}
          borderWidth={'1'}
        >
          <Box>
            {passCode.length == 3 ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(20)}
                fontFamily={'body'}
              >
                {passCode[2]}
              </Text>
            ) : passCode.length >= 3 ? (
              <DotView height={3} width={3} color={textColor ? 'black' : 'white'} />
            ) : passCode.length == 2 ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(13)}
              >
                {'|'}
              </Text>
            ) : (
              ''
            )}
          </Box>
        </Box>
        <Box
          size={hp(48)}
          borderRadius={7}
          ml={5}
          alignItems={'center'}
          justifyContent={'center'}
          backgroundColor={backgroundColor ? 'rgba(253,247,240, 1)' : 'rgba(253,247,240, 0.2)'}
          borderColor={borderColor}
          borderWidth={'1'}
        >
          <Box>
            {passCode.length == 4 && !hide ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(20)}
                fontFamily={'body'}
              >
                {passCode[3]}
              </Text>
            ) : passCode.length >= 4 && hide ? (
              <DotView height={3} width={3} color={textColor ? 'black' : 'white'} />
            ) : passCode.length == 3 ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(13)}
              >
                {'|'}
              </Text>
            ) : (
              ''
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
export default PinInputsView;
