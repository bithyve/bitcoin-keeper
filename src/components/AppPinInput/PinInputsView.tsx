import React, { useEffect, useState } from 'react';
import { Box, Text } from 'native-base';

import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import DotView from 'src/components/DotView';

const PinInputsView = ({ passCode, passcodeFlag }) => {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    if (passCode.length == 4) {
      setTimeout(() => {
        setHide(true);
      }, 2000);
    } else {
      setHide(false);
    }
    console.log('passCode', passCode);
  }, [passCode]);

  return (
    <Box alignSelf={'baseline'}>
      <Box flexDirection={'row'} marginTop={hp('4.5%')} marginBottom={hp('1.5%')} width={'auto'}>
        <Box
          height={wp('13%')}
          width={wp('13%')}
          borderRadius={7}
          ml={5}
          alignItems={'center'}
          justifyContent={'center'}
          backgroundColor={'rgba(253,247,240, 0.2)'}
        >
          <Box>
            {passCode.length == 1 ? (
              <Text color={'light.white'} fontWeight={'300'} fontSize={RFValue(20)}>
                {passCode[0]}
              </Text>
            ) : passCode.length >= 2 ? (
              <DotView height={3} width={3} color={'white'} />
            ) : passCode.length == 0 && passcodeFlag == true ? (
              <Text color={'light.white'} fontWeight={'300'} fontSize={RFValue(13)}>
                {'|'}
              </Text>
            ) : (
              ''
            )}
          </Box>
        </Box>
        <Box
          height={wp('13%')}
          width={wp('13%')}
          borderRadius={7}
          ml={5}
          alignItems={'center'}
          justifyContent={'center'}
          backgroundColor={'rgba(253,247,240, 0.2)'}
        >
          <Box>
            {passCode.length == 2 ? (
              <Text color={'light.white'} fontWeight={'300'} fontSize={RFValue(20)}>
                {passCode[1]}
              </Text>
            ) : passCode.length >= 2 ? (
              <DotView height={3} width={3} color={'white'} />
            ) : passCode.length == 1 ? (
              <Text color={'light.white'} fontWeight={'300'} fontSize={RFValue(13)}>
                {'|'}
              </Text>
            ) : (
              ''
            )}
          </Box>
        </Box>
        <Box
          height={wp('13%')}
          width={wp('13%')}
          borderRadius={7}
          ml={5}
          alignItems={'center'}
          justifyContent={'center'}
          backgroundColor={'rgba(253,247,240, 0.2)'}
        >
          <Box>
            {passCode.length == 3 ? (
              <Text color={'light.white'} fontWeight={'300'} fontSize={RFValue(20)}>
                {passCode[2]}
              </Text>
            ) : passCode.length >= 3 ? (
              <DotView height={3} width={3} color={'white'} />
            ) : passCode.length == 2 ? (
              <Text color={'light.white'} fontWeight={'300'} fontSize={RFValue(13)}>
                {'|'}
              </Text>
            ) : (
              ''
            )}
          </Box>
        </Box>
        <Box
          height={wp('13%')}
          width={wp('13%')}
          borderRadius={7}
          ml={5}
          alignItems={'center'}
          justifyContent={'center'}
          backgroundColor={'rgba(253,247,240, 0.2)'}
        >
          <Box>
            {passCode.length == 4 && !hide ? (
              <Text color={'light.white'} fontWeight={'300'} fontSize={RFValue(20)}>
                {passCode[3]}
              </Text>
            ) : passCode.length >= 4 && hide ? (
              <DotView height={3} width={3} color={'white'} />
            ) : passCode.length == 3 ? (
              <Text color={'light.white'} fontWeight={'300'} fontSize={RFValue(13)}>
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
