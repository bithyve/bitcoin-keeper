import Text from 'src/components/KeeperText';
import { Box, Input, useColorMode } from 'native-base';
import { Keyboard, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import {
  SignerException,
  SignerPolicy,
  SignerRestriction,
  VerificationType,
} from 'src/services/interfaces';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import { updateSignerPolicy } from 'src/store/sagaActions/wallets';

import AppNumPad from 'src/components/AppNumPad';
import Buttons from 'src/components/Buttons';
import { CommonActions } from '@react-navigation/native';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import idx from 'idx';
import { numberWithCommas } from 'src/utils/utilities';
import { useDispatch } from 'react-redux';

function ChoosePolicyNew({ navigation, route }) {
  const { colorMode } = useColorMode();
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

      navigation.dispatch(
        CommonActions.navigate({ name: 'SetupSigningServer', params: { policy } })
      );
    }
  };

  function Field({ title, subTitle, value, onPress }) {
    return (
      <Box style={styles.fieldWrapper}>
        <Box width={'60%'}>
          <Text style={styles.titleText}>{title}</Text>
          <Text color="light.GreyText" style={styles.subTitleText}>
            {subTitle}
          </Text>
        </Box>

        <Box width='40%' ml={3} >
          <Input
            backgroundColor={`${colorMode}.seashellWhite`}
            onPressIn={onPress}
            style={styles.textInput}
            value={value}
            showSoftInputOnFocus={false}
            onFocus={() => Keyboard.dismiss()}
            selection={{
              start: 0,
              end: 0,
            }}
          />
        </Box>
      </Box >
    );
  }

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title="Choose Policy" subtitle="For the signing server" />
      <Box
        style={{
          paddingHorizontal: wp(15),
          flex: 1,
        }}
      >
        <Field
          title="Max no-check amount"
          subTitle="The Signing Server will sign a transaction of this amount or lower, even w/o a 2FA verification code"
          onPress={() => setSelectedPolicy('min')}
          value={numberWithCommas(minTransaction)}
        />
        <Field
          title="Max allowed amount"
          subTitle="If the transaction amount is more than this amount, the Signing Server will not sign it. You will have to use other devices for it"
          onPress={() => setSelectedPolicy('max')}
          value={numberWithCommas(maxTransaction)}
        />
      </Box>
      <Box style={styles.btnWrapper}>
        <Buttons primaryText="Next" primaryCallback={onNext} />
      </Box>
      <Box>
        <AppNumPad
          setValue={selectedPolicy === 'max' ? setMaxTransaction : setMinTransaction}
          clear={() => { }}
          color={`${colorMode}.greenText`}
          height={windowHeight > 600 ? 50 : 80}
          darkDeleteIcon
        />
      </Box>
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  textInput: {
    borderRadius: 10,
    // padding: 15,
    fontSize: 18,
    letterSpacing: 0.23,
  },
  fieldWrapper: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginTop: windowHeight > 600 ? hp(25) : hp(40),
  },
  titleText: {
    fontSize: 13,
    letterSpacing: 0.96,
  },
  subTitleText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  btnWrapper: {
    marginVertical: hp(windowHeight > 700 ? 25 : 0),
  },
  keypadWrapper: {
    position: 'absolute',
    bottom: 0,
  },
});
export default ChoosePolicyNew;
