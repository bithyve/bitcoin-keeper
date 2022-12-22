import React, { useEffect, useState } from 'react';
import { Box } from 'native-base';
import Text from 'src/components/KeeperText';

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
  length?: number;
}
function CVVInputsView({ passCode, passcodeFlag, backgroundColor, textColor, length = 6 }: Props) {
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

  const getBackgroundColor = () =>
    backgroundColor ? 'rgba(253,247,240, 1)' : 'rgba(253,247,240, 0.2)';

  const getTextColor = () => (textColor ? 'light.textBlack' : 'light.white');

  const getDotColor = () => (textColor ? 'black' : 'white');

  const getPin = (num: number) => {
    if (passCode.length == num && !hide) {
      return (
        <Text color={getTextColor()} fontWeight="300" fontSize={20} fontFamily="body">
          {passCode[num - 1]}
        </Text>
      );
    }
    if (passCode.length >= num) {
      return <DotView height={3} width={3} color={getDotColor()} />;
    }
    if (passCode.length == num - 1) {
      return <Text color={getTextColor()}>|</Text>;
    }
    return '';
  };

  return (
    <Box alignSelf="baseline">
      <Box flexDirection="row" mt={hp('2%')} marginBottom={hp('2.5%')} width="auto">
        <Box
          height={wp('9%')}
          width={wp('9%')}
          borderRadius={7}
          ml={4}
          alignItems="center"
          justifyContent="center"
          backgroundColor={getBackgroundColor()}
        >
          <Box>{getPin(1)}</Box>
        </Box>
        <Box
          height={wp('9%')}
          width={wp('9%')}
          borderRadius={7}
          ml={4}
          alignItems="center"
          justifyContent="center"
          backgroundColor={getBackgroundColor()}
        >
          <Box>{getPin(2)}</Box>
        </Box>
        <Box
          height={wp('9%')}
          width={wp('9%')}
          borderRadius={7}
          ml={4}
          alignItems="center"
          justifyContent="center"
          backgroundColor={getBackgroundColor()}
        >
          <Box>{getPin(3)}</Box>
        </Box>
        <Box
          height={wp('9%')}
          width={wp('9%')}
          borderRadius={7}
          ml={4}
          alignItems="center"
          justifyContent="center"
          backgroundColor={getBackgroundColor()}
        >
          <Box>{getPin(4)}</Box>
        </Box>
        {length === 6 && (
          <>
            <Box
              height={wp('9%')}
              width={wp('9%')}
              borderRadius={7}
              ml={4}
              alignItems="center"
              justifyContent="center"
              backgroundColor={getBackgroundColor()}
            >
              <Box>{getPin(5)}</Box>
            </Box>
            <Box
              height={wp('9%')}
              width={wp('9%')}
              borderRadius={7}
              ml={4}
              alignItems="center"
              justifyContent="center"
              backgroundColor={getBackgroundColor()}
            >
              <Box>{getPin(6)}</Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
export default CVVInputsView;
