import React, { useState } from 'react';
import { Keyboard } from 'react-native';
import { Box, Input, Text } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
// components, interfaces
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import ScreenWrapper from 'src/components/ScreenWrapper';
// asserts
import IconRecieve from 'src/assets/images/svgs/icon_received_lg.svg';
import Fonts from 'src/common/Fonts';
import InfoBox from 'src/components/InfoBox';
import Buttons from 'src/components/Buttons';
import AppNumPad from 'src/components/AppNumPad';

const TimelockScreen = ({ }) => {

  const navigation = useNavigation();
  const [amount, setAmount] = useState('');

  return (
    <Box
      flex={1}
      position={'relative'}
    >
      <ScreenWrapper>
        <Box marginX={3} >
          <Box width={wp(320)}>
            <HeaderTitle
              onPressHandler={() => navigation.goBack()}
              title={'Timelock Vault'}
              subtitle={'Provide number of blocks from the current block'}
            />
            <Box
              style={{
                marginVertical: hp(35),
              }}>
              <Input
                placeholder={''}
                placeholderTextColor={'light.greenText'}
                style={styles.inputField}
                borderWidth={'0'}
                value={amount}
                onFocus={() => Keyboard.dismiss()}
                backgroundColor={'light.lightYellow'}
              />
              <Text
                color={'light.time'}
                fontWeight={300}
                letterSpacing={2.8}
                fontSize={13}
                marginTop={hp(40)}
                marginLeft={wp(20)}
              >
                Estimated time ~20 min
              </Text>
            </Box>
          </Box>

          <Box width={wp(285)}>
            <InfoBox
              title={'Note'}
              desciption={'Times estimated here are approximates based on ~10 mins every block as an average'}
              width={300}
            />
          </Box>
          <Box marginTop={hp(20)}>
            <Buttons
              primaryText='Next'
              primaryCallback={() => console.log('next')}
            />
          </Box>
        </Box >
      </ScreenWrapper>
      <Box
        position={'absolute'}
        bottom={0}
      >
        <AppNumPad
          setValue={setAmount}
          ok={() => {
            console.log('ok');
          }}
          clear={() => { }}
          color={'#073E39'}
          height={windowHeight >= 850 ? 80 : 60}
          darkDeleteIcon={true}
        />
      </Box>
    </Box>
  );
};

const styles = ScaledSheet.create({
  inputField: {
    color: '#073E39',
    opacity: 0.5,
    fontFamily: Fonts.RobotoCondensedBold,
    fontSize: RFValue(13),
    letterSpacing: 2.6,
    height: hp(50),
  },
});
export default TimelockScreen;
