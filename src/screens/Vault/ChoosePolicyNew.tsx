import { Box, Input, Text } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';
import {
  SignerException,
  SignerPolicy,
  SignerRestriction,
  VerificationType,
} from 'src/core/services/interfaces';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import { registerWithSigningServer, updateSignerPolicy } from 'src/store/sagaActions/wallets';

import AppNumPad from 'src/components/AppNumPad';
import Buttons from 'src/components/Buttons';
import { CommonActions } from '@react-navigation/native';
import Fonts from 'src/common/Fonts';
import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Keyboard, StyleSheet } from 'react-native';
import idx from 'idx';
import { useDispatch } from 'react-redux';
import { numberWithCommas } from 'src/common/utilities';

const ChoosePolicyNew = ({ navigation, route }) => {
  const [selectedPolicy, setSelectedPolicy] = useState('max');

  const isUpdate = route.params.update;
  const existingRestrictions: SignerRestriction = route.params.restrictions;
  const existingMaxTransactionRestriction = idx(
    existingRestrictions,
    (_) => _.maxTransactionAmount
  );
  const existingExceptions: SignerException = route.params.exceptions;
  const existingMaxTransactionException = idx(existingExceptions, (_) => _.transactionAmount);

  const [maxTransaction, setMaxTransaction] = useState(
    existingMaxTransactionRestriction ? `${existingMaxTransactionRestriction}` : '10000000'
  );
  const [minTransaction, setMinTransaction] = useState(
    existingMaxTransactionException ? `${existingMaxTransactionException}` : '1000000'
  );

  const dispatch = useDispatch();

  const onNext = () => {
    const maxAmount = Number(maxTransaction);
    const restrictions: SignerRestriction = {
      none: maxAmount === 0,
      maxTransactionAmount: maxAmount === 0 ? null : maxAmount,
    };

    const minAmount = Number(minTransaction);
    const exceptions: SignerException = {
      none: minAmount === 0,
      transactionAmount: minAmount === 0 ? null : minAmount,
    };

    if (isUpdate) {
      const updates = {
        restrictions,
        exceptions,
      };
      dispatch(updateSignerPolicy(route.params.signer, updates));
      navigation.dispatch(
        CommonActions.navigate({ name: 'VaultDetails', params: { vaultTransferSuccessful: null } })
      );
    } else {
      const policy: SignerPolicy = {
        verification: {
          method: VerificationType.TWO_FA,
        },
        restrictions,
        exceptions,
      };

      dispatch(registerWithSigningServer(policy));
      navigation.dispatch(
        CommonActions.navigate({ name: 'SetupSigningServer', params: { policy } })
      );
    }
  };

  const Field = ({ title, subTitle, value, onPress }) => {
    return (
      <Box flexDirection={'row'} alignItems={'center'} marginTop={hp(40)}>
        <Box width={wp(175)}>
          <Text fontWeight={200} fontSize={13} letterSpacing={0.96}>
            {title}
          </Text>
          <Text color={'light.GreyText'} fontWeight={200} fontSize={10} letterSpacing={0.5}>
            {subTitle}
          </Text>
        </Box>

        <Box>
          <Box
            style={{
              marginLeft: wp(25),
              width: wp(100),
            }}
          >
            <Input
              onPressIn={onPress}
              style={styles.textInput}
              value={value}
              showSoftInputOnFocus={false}
              onFocus={() => Keyboard.dismiss()}
            />
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
          />

          <Box
            style={{
              paddingHorizontal: wp(15),
            }}
          >
            <Field
              title={'Max no-check amount'}
              subTitle={
                'The Signing Server will sign a transaction of this amount or lower, even w/o a 2FA verification code'
              }
              onPress={() => setSelectedPolicy('min')}
              value={numberWithCommas(minTransaction)}
            />
            <Field
              title={'Max allowed amount'}
              subTitle={
                'If the transaction amount is more than this amount, the Signing Server will not sign it. You will have to use other devices for it'
              }
              onPress={() => setSelectedPolicy('max')}
              value={numberWithCommas(maxTransaction)}
            />
          </Box>

          <Box marginTop={hp(windowHeight > 700 ? 40 : 0)}>
            <Buttons primaryText="Next" primaryCallback={onNext} />
          </Box>
        </Box>
      </ScreenWrapper>

      <Box position={'absolute'} bottom={0}>
        <AppNumPad
          setValue={selectedPolicy === 'max' ? setMaxTransaction : setMinTransaction}
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
const styles = StyleSheet.create({
  textInput: {
    backgroundColor: '#FDF7F0',
    borderRadius: 10,
    padding: 15,
    fontSize: 20,
    letterSpacing: 0.23,
    fontFamily: Fonts.RobotoCondensedRegular,
  },
});
export default ChoosePolicyNew;
