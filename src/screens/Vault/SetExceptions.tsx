import { Box, Input, Text } from 'native-base';
import React, { useCallback, useEffect, useState } from 'react';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';

import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Keyboard, Pressable, StyleSheet, TextInput } from 'react-native';
import Fonts from 'src/common/Fonts';
import Buttons from 'src/components/Buttons';
import AppNumPad from 'src/components/AppNumPad';
import { SignerException, SignerPolicy, VerificationType } from 'src/core/services/interfaces';
import { CommonActions } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { registerWithSigningServer, updateSignerPolicy } from 'src/store/sagaActions/wallets';
import idx from 'idx';

const SetExceptions = ({ navigation, route }) => {
  const isUpdate = route.params.update;
  const existingExceptions: SignerException = route.params.exceptions;
  const existingMaxTransaction = idx(existingExceptions, (_) => _.transactionAmount);

  const [selectedPolicy, setSelectedPolicy] = useState(
    existingMaxTransaction ? 'Max Transaction amount' : 'No Restrictions'
  );
  const [maxTransaction, setMaxTransaction] = useState(
    existingMaxTransaction ? `${existingMaxTransaction}` : '0'
  );
  const dispatch = useDispatch();

  useEffect(() => {
    selectedPolicy == 'No Restrictions' && setMaxTransaction('0');
  }, [selectedPolicy]);

  const setupSignerPolicy = () => {
    const maxAmount = Number(maxTransaction); // in sats
    const exceptions: SignerException = {
      none: maxAmount === 0,
      transactionAmount: maxAmount === 0 ? null : maxAmount,
    };

    if (isUpdate) {
      const updates = {
        restrictions: route.params.restrictions,
        exceptions,
      };
      dispatch(updateSignerPolicy(route.params.signer, updates));
      navigation.dispatch(CommonActions.navigate({ name: 'VaultDetails' }));
    } else {
      const policy: SignerPolicy = {
        verification: {
          method: VerificationType.TWO_FA,
        },
        restrictions: route.params.restrictions,
        exceptions,
      };

      dispatch(registerWithSigningServer(policy));
      navigation.dispatch(
        CommonActions.navigate({ name: 'SetupSigningServer', params: { policy } })
      );
    }
  };

  const CheckOption = ({
    title,
    subTitle,
    isChecked = title == selectedPolicy,
    showInput = false,
    onPress = () => {},
  }) => {
    return (
      <Box
        flexDirection={'row'}
        alignItems={'center'}
        marginTop={hp(40)}
        opacity={title == selectedPolicy ? 1 : 0.5}
      >
        <Pressable onPress={onPress}>
          <Box
            height={hp(27)}
            width={wp(27)}
            marginRight={wp(15)}
            borderRadius={hp(20)}
            borderWidth={1}
            borderColor={'light.brown'}
            backgroundColor={isChecked && 'light.brown'}
          />
        </Pressable>
        <Box>
          <Text fontWeight={200} fontSize={14} letterSpacing={0.96} color={'light.lightBlack'}>
            {title}
          </Text>
          <Text color={'light.GreyText'} fontWeight={200} fontSize={11} letterSpacing={0.5}>
            {subTitle}
          </Text>
        </Box>
        {showInput && (
          <Box>
            <Box marginLeft={wp(20)} width={wp(90)}>
              <Input
                onFocus={() => Keyboard.dismiss()}
                style={styles.textInput}
                value={maxTransaction}
                isDisabled={!isChecked}
              />
            </Box>
          </Box>
        )}
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
            title="Set Exceptions"
            subtitle="for the signing server"
            paddingTop={hp(20)}
            showToggler={false}
          />
          {/* {check options } */}
          <Box
            style={{
              paddingHorizontal: wp(15),
            }}
          >
            <CheckOption
              title={'No Exceptions'}
              subTitle={'Lorem ipsum dolor sit amet,'}
              onPress={() => setSelectedPolicy('No Restrictions')}
            />
            <CheckOption
              title={'Max Transaction amount'}
              subTitle={'Lorem ipsum dolor sit amet,'}
              showInput={true}
              onPress={() => setSelectedPolicy('Max Transaction amount')}
            />
          </Box>
          {/* {button} */}
          <Box marginTop={hp(80)}>
            <Buttons primaryText="Next" primaryCallback={setupSignerPolicy} />
          </Box>
        </Box>
      </ScreenWrapper>
      {/* {keypad} */}
      <Box position={'absolute'} bottom={10}>
        <AppNumPad
          setValue={selectedPolicy === 'Max Transaction amount' ? setMaxTransaction : () => {}}
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
export default SetExceptions;
