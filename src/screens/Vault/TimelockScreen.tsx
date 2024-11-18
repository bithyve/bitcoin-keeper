import Text from 'src/components/KeeperText';
import { Box, Input, useColorMode } from 'native-base';
import React, { useState } from 'react';
import { hp, windowHeight, wp } from 'src/constants/responsive';

import AppNumPad from 'src/components/AppNumPad';
import Buttons from 'src/components/Buttons';
import Fonts from 'src/constants/Fonts';
import KeeperHeader from 'src/components/KeeperHeader';
import { Keyboard, StyleSheet } from 'react-native';
import Note from 'src/components/Note/Note';
import ScreenWrapper from 'src/components/ScreenWrapper';

function TimelockScreen() {
  const { colorMode } = useColorMode();
  const [amount, setAmount] = useState('');

  return (
    <Box flex={1} position="relative">
      <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
        <Box marginX={3}>
          <Box width={wp(320)}>
            <KeeperHeader
              title="Timelock vault"
              subtitle="Provide number of blocks from the current block"
            />
            <Box
              style={{
                marginVertical: hp(35),
              }}
            >
              <Input
                placeholder=""
                placeholderTextColor={`${colorMode}.greenText`}
                style={styles.inputField}
                borderWidth="0"
                value={amount}
                onFocus={() => Keyboard.dismiss()}
                backgroundColor={`${colorMode}.primaryBackground`}
              />
              <Text
                color={`${colorMode}.textColor2`}
                bold
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
          color={`${colorMode}.greenText`}
          height={windowHeight >= 850 ? 80 : 60}
          darkDeleteIcon
        />
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  inputField: {
    color: '#073E39',
    opacity: 0.5,
    fontFamily: Fonts.InterBold,
    fontSize: 13,
    letterSpacing: 2.6,
    height: hp(50),
  },
});
export default TimelockScreen;
