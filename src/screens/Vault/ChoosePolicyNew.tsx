import Text from 'src/components/KeeperText';
import { Box, Input, useColorMode } from 'native-base';
import { Keyboard, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useCallback, useContext, useState } from 'react';
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
import Clipboard from '@react-native-community/clipboard';
import idx from 'idx';
import { useDispatch } from 'react-redux';

import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { numberWithCommas } from 'src/utils/utilities';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import KeeperModal from 'src/components/KeeperModal';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import useToastMessage from 'src/hooks/useToastMessage';
import DeleteIcon from 'src/assets/images/deleteBlack.svg';

function ChoosePolicyNew({ navigation, route }) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { signingServer, common, vault: vaultTranslation } = translations;

  const [selectedPolicy, setSelectedPolicy] = useState('max');
  const [validationModal, showValidationModal] = useState(false);
  const [otp, setOtp] = useState('');

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
      showValidationModal(true);
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
  const confirmChangePolicy = async () => {
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
    const updates = {
      restrictions,
      exceptions,
    };
    const verificationToken = otp; // TODO: integrate OTP modal to supply verification token
    dispatch(updateSignerPolicy(route.params.signer, updates, verificationToken));
    navigation.dispatch(
      CommonActions.navigate({ name: 'VaultDetails', params: { vaultTransferSuccessful: null } })
    );
  }
  const otpContent = useCallback(() => {
    const onPressNumber = (text) => {
      let tmpPasscode = otp;
      if (otp.length < 6) {
        if (text !== 'x') {
          tmpPasscode += text;
          setOtp(tmpPasscode);
        }
      }
      if (otp && text === 'x') {
        setOtp(otp.slice(0, -1));
      }
    };

    const onDeletePressed = () => {
      setOtp(otp.slice(0, otp.length - 1));
    };

    return (
      <Box width={hp(300)}>
        <Box>
          <TouchableOpacity
            onPress={async () => {
              const clipBoardData = await Clipboard.getString();
              if (clipBoardData.match(/^\d{6}$/)) {
                setOtp(clipBoardData);
              } else {
                showToast('Invalid OTP');
              }
            }}
          >
            <CVVInputsView passCode={otp} passcodeFlag={false} backgroundColor textColor />
          </TouchableOpacity>
          <Text style={styles.cvvInputInfoText} color="light.greenText">
            {vaultTranslation.cvvSigningServerInfo}
          </Text>
          <Box mt={10} alignSelf="flex-end" mr={2}>
            <Box>
              <CustomGreenButton onPress={confirmChangePolicy} value="Confirm" />
            </Box>
          </Box>
        </Box>
        <KeyPadView
          onPressNumber={onPressNumber}
          onDeletePressed={onDeletePressed}
          keyColor="light.primaryText"
          ClearIcon={<DeleteIcon />}
        />
      </Box>
    );
  }, [otp]);
  function Field({ title, subTitle, value, onPress }) {
    return (
      <Box style={styles.fieldWrapper}>
        <Box width={'60%'}>
          <Text style={styles.titleText}>{title}</Text>
          <Text color="light.GreyText" style={styles.subTitleText}>
            {subTitle}
          </Text>
        </Box>

        <Box width="40%" ml={3}>
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
      </Box>
    );
  }

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={signingServer.choosePolicy}
        subtitle={signingServer.choosePolicySubTitle}
      />
      <Box
        style={{
          paddingHorizontal: wp(15),
          flex: 1,
        }}
      >
        <Field
          title={signingServer.maxNoCheckAmt}
          subTitle={signingServer.maxNoCheckAmtSubTitle}
          onPress={() => setSelectedPolicy('min')}
          value={numberWithCommas(minTransaction)}
        />
        <Field
          title={signingServer.maxAllowedAmt}
          subTitle={signingServer.maxAllowedAmtSubTitle}
          onPress={() => setSelectedPolicy('max')}
          value={numberWithCommas(maxTransaction)}
        />
      </Box>
      <Box style={styles.btnWrapper}>
        <Buttons primaryText={common.next} primaryCallback={onNext} />
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
      <KeeperModal
        visible={validationModal}
        close={() => {
          showValidationModal(false);
        }}
        title="Confirm OTP to change policy"
        subTitle="To complete setting up the signing server"
        textColor="light.primaryText"
        Content={otpContent}
      />
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
  cvvInputInfoText: {
    fontSize: 13,
    letterSpacing: 0.65,
    width: '100%',
    marginTop: 2,
  },
});
export default ChoosePolicyNew;
