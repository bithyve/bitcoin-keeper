import React, { useEffect, useState } from 'react';
import { Box, Text } from 'native-base';

import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import DotView from 'src/components/DotView';
export interface Props {
  passCode?: string;
  passcodeFlag?: boolean;
  backgroundColor?: boolean;
  textColor?: boolean;
}
const CVVInputsView = ({ passCode, passcodeFlag, backgroundColor, textColor }: Props) => {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    if (passCode.length <= 6) {
      setTimeout(() => {
        setHide(true);
      }, 2000);
    } else {
      setHide(false);
    }
  }, [passCode]);

  return (
    <Box alignSelf={'baseline'}>
      <Box flexDirection={'row'} mt={hp('2%')} marginBottom={hp('2.5%')} width={'auto'}>
        <Box
          height={wp('9%')}
          width={wp('9%')}
          borderRadius={7}
          ml={5}
          alignItems={'center'}
          justifyContent={'center'}
          backgroundColor={backgroundColor ? 'rgba(253,247,240, 1)' : 'rgba(253,247,240, 0.2)'}
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
          height={wp('9%')}
          width={wp('9%')}
          borderRadius={7}
          ml={5}
          alignItems={'center'}
          justifyContent={'center'}
          backgroundColor={backgroundColor ? 'rgba(253,247,240, 1)' : 'rgba(253,247,240, 0.2)'}
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
            ) : passCode.length >= 3 ? (
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
          height={wp('9%')}
          width={wp('9%')}
          borderRadius={7}
          ml={5}
          alignItems={'center'}
          justifyContent={'center'}
          backgroundColor={backgroundColor ? 'rgba(253,247,240, 1)' : 'rgba(253,247,240, 0.2)'}
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
            ) : passCode.length >= 4 ? (
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
          height={wp('9%')}
          width={wp('9%')}
          borderRadius={7}
          ml={5}
          alignItems={'center'}
          justifyContent={'center'}
          backgroundColor={backgroundColor ? 'rgba(253,247,240, 1)' : 'rgba(253,247,240, 0.2)'}
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
        <Box
          height={wp('9%')}
          width={wp('9%')}
          borderRadius={7}
          ml={5}
          alignItems={'center'}
          justifyContent={'center'}
          backgroundColor={backgroundColor ? 'rgba(253,247,240, 1)' : 'rgba(253,247,240, 0.2)'}
        >
          <Box>
            {passCode.length == 5 && !hide ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(20)}
                fontFamily={'body'}
              >
                {passCode[4]}
              </Text>
            ) : passCode.length >= 5 && hide ? (
              <DotView height={3} width={3} color={textColor ? 'black' : 'white'} />
            ) : passCode.length == 4 ? (
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
          height={wp('9%')}
          width={wp('9%')}
          borderRadius={7}
          ml={5}
          alignItems={'center'}
          justifyContent={'center'}
          backgroundColor={backgroundColor ? 'rgba(253,247,240, 1)' : 'rgba(253,247,240, 0.2)'}
        >
          <Box>
            {passCode.length == 6 && !hide ? (
              <Text
                color={textColor ? 'light.textBlack' : 'light.white'}
                fontWeight={'300'}
                fontSize={RFValue(20)}
                fontFamily={'body'}
              >
                {passCode[5]}
              </Text>
            ) : passCode.length >= 6 && hide ? (
              <DotView height={3} width={3} color={textColor ? 'black' : 'white'} />
            ) : passCode.length == 5 ? (
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
export default CVVInputsView;
