import { Box, Input, Text } from 'native-base';
import React, { useState } from 'react';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';

import AppNumPad from 'src/components/AppNumPad';
import Buttons from 'src/components/Buttons';
// asserts
import Fonts from 'src/common/Fonts';
// components, interfaces
import HeaderTitle from 'src/components/HeaderTitle';
import { Keyboard } from 'react-native';
import Note from 'src/components/Note/Note';
import { ScaledSheet } from 'react-native-size-matters';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';

function TimelockScreen() {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');

  return (
    <Box flex={1} position="relative">
      <ScreenWrapper>
        <Box marginX={3}>
          <Box width={wp(320)}>
            <HeaderTitle
              onPressHandler={() => navigation.goBack()}
              title="Timelock Vault"
              subtitle="Provide number of blocks from the current block"
            />
            <Box
              style={{
                marginVertical: hp(35),
              }}
            >
              <Input
                placeholder=""
                placeholderTextColor="light.greenText"
                style={styles.inputField}
                borderWidth="0"
                value={amount}
                onFocus={() => Keyboard.dismiss()}
                backgroundColor="light.primaryBackground"
              />
              <Text
                color="light.textColor2"
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
            <Note
              title="Note"
              subtitle="Times estimated here are approximates based on ~10 mins every block as an average"
              subtitleColor="GreyText"
            />
          </Box>
          <Box marginTop={hp(20)}>
            <Buttons primaryText="Next" primaryCallback={() => console.log('next')} />
          </Box>
        </Box>
      </ScreenWrapper>
      <Box position="absolute" bottom={0}>
        <AppNumPad
          setValue={setAmount}
          clear={() => {}}
          color="#073E39"
          height={windowHeight >= 850 ? 80 : 60}
          darkDeleteIcon
        />
      </Box>
    </Box>
  );
}

const styles = ScaledSheet.create({
  inputField: {
    color: '#073E39',
    opacity: 0.5,
    fontFamily: Fonts.RobotoCondensedBold,
    fontSize: 13,
    letterSpacing: 2.6,
    height: hp(50),
  },
});
export default TimelockScreen;
