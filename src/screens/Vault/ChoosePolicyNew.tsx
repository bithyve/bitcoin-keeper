import { Box, Input, Text } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';

import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet } from 'react-native';
import Fonts from 'src/common/Fonts';
import Buttons from 'src/components/Buttons';
import AppNumPad from 'src/components/AppNumPad';

const ChoosePolicyNew = ({ navigation, route }) => {
  const [selectedPolicy, setSelectedPolicy] = useState('max');

  const [maxTransaction, setMaxTransaction] = useState('');
  const [minTransaction, setMinTransaction] = useState('');

  const onNext = () => {
    console.log({ max: Number(maxTransaction), min: Number(minTransaction) });
  };

  const Field = ({ title, subTitle, value, onPress }) => {
    return (
      <Box flexDirection={'row'} alignItems={'center'} marginTop={hp(40)}>
        <Box width={'55%'}>
          <Text fontWeight={200} fontSize={13} letterSpacing={0.96}>
            {title}
          </Text>
          <Text color={'light.GreyText'} fontWeight={200} fontSize={10} letterSpacing={0.5}>
            {subTitle}
          </Text>
        </Box>

        <Box>
          <Box marginLeft={wp(20)} width={wp(100)}>
            <Input onPressIn={onPress} style={styles.textInput} value={value} />
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box flex={1} position={'relative'}>
      <ScreenWrapper barStyle="dark-content">
        <Box
          style={{
            paddingLeft: wp(10),
          }}
        >
          <HeaderTitle
            title="Choose Policy"
            subtitle="for the signing server"
            paddingTop={hp(20)}
            showToggler={false}
          />

          <Box
            style={{
              paddingHorizontal: wp(15),
            }}
          >
            <Field
              title={'Max Transaction amount'}
              subTitle={
                'Signing server will not sign is ten amount is more than this. You will have to use other signing devices'
              }
              onPress={() => setSelectedPolicy('max')}
              value={maxTransaction}
            />
            <Field
              title={'Minimum transaction amount'}
              subTitle={
                'Minimum Signing Server will not need a 2FA to sign and broadcast this amount'
              }
              onPress={() => setSelectedPolicy('min')}
              value={minTransaction}
            />
          </Box>

          <Box marginTop={hp(40)} marginBottom={hp(40)}>
            <Buttons primaryText="Next" primaryCallback={onNext} />
          </Box>
        </Box>
      </ScreenWrapper>

      <Box position={'absolute'} bottom={10}>
        <AppNumPad
          setValue={selectedPolicy === 'max' ? setMaxTransaction : setMinTransaction}
          ok={() => {
            console.log('ok');
          }}
          clear={() => {}}
          color={'#073E39'}
          height={windowHeight >= 850 ? 80 : 60}
          darkDeleteIcon={true}
        />
      </Box>
    </Box>
  );
};
const styles = StyleSheet.create({
  textInput: {
    width: wp(98),
    backgroundColor: '#FDF7F0',
    borderRadius: 10,
    padding: 15,
    fontSize: 20,
    letterSpacing: 0.23,
    fontFamily: Fonts.RobotoCondensedRegular,
  },
});
export default ChoosePolicyNew;
