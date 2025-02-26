import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
// import {
//   SignerException,
//   SignerPolicy,
//   SignerRestriction,
//   VerificationType,
// } from 'src/models/interfaces/AssistedKeys';
import { hp, windowHeight, wp } from 'src/constants/responsive';
// import { updateSignerPolicy } from 'src/store/sagaActions/wallets';
import Buttons from 'src/components/Buttons';
import { CommonActions } from '@react-navigation/native';
import Clipboard from '@react-native-community/clipboard';
// import idx from 'idx';
import { useDispatch } from 'react-redux';
import ScreenWrapper from 'src/components/ScreenWrapper';
// import { numberWithCommas } from 'src/utils/utilities';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import KeeperModal from 'src/components/KeeperModal';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
// import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import DeleteIcon from 'src/assets/images/deleteBlack.svg';
// import useVault from 'src/hooks/useVault';
import TickIcon from 'src/assets/images/tick_icon.svg';
import { useAppSelector } from 'src/store/hooks';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { setSignerPolicyError } from 'src/store/reducers/wallets';
import WalletHeader from 'src/components/WalletHeader';
import ServerKeyPolicyCard from './components/ServerKeyPolicyCard';
import InfoIcon from 'src/assets/images/info_icon.svg';
import InfoDarkIcon from 'src/assets/images/info-Dark-icon.svg';

function ChoosePolicyNew({ navigation, route }) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { signingServer, common, vault: vaultTranslation } = translations;

  const [validationModal, showValidationModal] = useState(false);
  const [otp, setOtp] = useState('');

  const { maxTransaction, timelimit, delayTime } = route.params;

  const [spendingLimit, setSpendingLimit] = useState(null);
  const [timeLimit, setTimeLimit] = useState(null);
  const [signingDelay, setSigningDelay] = useState(null);

  useEffect(() => {
    if (maxTransaction !== undefined) {
      setSpendingLimit(maxTransaction);
      setTimeLimit(timelimit);
    }
    if (delayTime !== undefined) {
      setSigningDelay(delayTime);
    }
  }, [route.params]);

  // const existingRestrictions = idx(currentSigner, (_) => _.signerPolicy.restrictions);
  // const existingExceptions = idx(currentSigner, (_) => _.signerPolicy.exceptions);

  // const existingMaxTransactionRestriction = idx(
  //   existingRestrictions,
  //   (_) => _.maxTransactionAmount
  // );
  // const existingMaxTransactionException = idx(existingExceptions, (_) => _.transactionAmount);

  // const [maxTransaction, setMaxTransaction] = useState(
  //   existingMaxTransactionRestriction ? `${existingMaxTransactionRestriction}` : '10000000'
  // );
  // const [minTransaction, setMinTransaction] = useState(
  //   existingMaxTransactionException ? `${existingMaxTransactionException}` : '1000000'
  // );
  // const { activeVault } = useVault({ vaultId });
  const dispatch = useDispatch();
  const policyError = useAppSelector((state) => state.wallet?.signerPolicyError);
  const [isLoading, setIsLoading] = useState(false);

  // const onNext = () => {
  //   if (isUpdate) {
  //     showValidationModal(true);
  //   } else {
  //     const maxAmount = Number(maxTransaction);
  //     const restrictions: SignerRestriction = {
  //       none: maxAmount === 0,
  //       maxTransactionAmount: maxAmount === 0 ? null : maxAmount,
  //     };

  //     const minAmount = Number(minTransaction);
  //     const exceptions: SignerException = {
  //       none: minAmount === 0,
  //       transactionAmount: minAmount === 0 ? null : minAmount,
  //     };

  //     const policy: SignerPolicy = {
  //       verification: {
  //         method: VerificationType.TWO_FA,
  //       },
  //       restrictions,
  //       exceptions,
  //     };

  //     navigation.dispatch(
  //       CommonActions.navigate({ name: 'SetupSigningServer', params: { policy, addSignerFlow } })
  //     );
  //   }
  // };

  // const confirmChangePolicy = async () => {
  //   const maxAmount = Number(maxTransaction);
  //   const restrictions: SignerRestriction = {
  //     none: maxAmount === 0,
  //     maxTransactionAmount: maxAmount === 0 ? null : maxAmount,
  //   };

  //   const minAmount = Number(minTransaction);
  //   const exceptions: SignerException = {
  //     none: minAmount === 0,
  //     transactionAmount: minAmount === 0 ? null : minAmount,
  //   };
  //   const updates = {
  //     restrictions,
  //     exceptions,
  //   };
  //   const verificationToken = Number(otp);
  //   setIsLoading(true);
  //   dispatch(
  //     updateSignerPolicy(route.params.signer, route.params.vaultKey, updates, verificationToken)
  //   );
  // };

  const onConfirm = () => {
    navigation.dispatch(CommonActions.navigate({ name: 'SetupSigningServer' }));
  };

  useEffect(() => {
    if (validationModal) {
      if (policyError !== 'failure' && policyError !== 'idle') {
        setIsLoading(false);
        dispatch(setSignerPolicyError('idle'));
        showToast('Policy updated successfully', <TickIcon />, IToastCategory.SIGNING_DEVICE);
        showValidationModal(false);
        navigation.goBack();
      } else {
        setIsLoading(false);
        dispatch(setSignerPolicyError('idle'));
        showValidationModal(false);
        // resetFields();
        showToast('2FA token is either invalid or has expired');
      }
    }
  }, [policyError]);

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
      <Box width={'100%'}>
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
          <Text style={styles.cvvInputInfoText} color={`${colorMode}.greenText`}>
            {vaultTranslation.cvvSigningServerInfo}
          </Text>
          <Box mt={10} alignSelf="flex-end" mr={2}>
            <Box>{/* <CustomGreenButton onPress={confirmChangePolicy} value="Confirm" /> */}</Box>
          </Box>
        </Box>
        <KeyPadView
          onPressNumber={onPressNumber}
          onDeletePressed={onDeletePressed}
          keyColor={`${colorMode}.primaryText`}
          ClearIcon={<DeleteIcon />}
        />
      </Box>
    );
  }, [otp]);

  // const resetFields = () => {
  //   setMaxTransaction(
  //     existingMaxTransactionRestriction ? `${existingMaxTransactionRestriction}` : '10000000'
  //   );
  //   setMinTransaction(
  //     existingMaxTransactionException ? `${existingMaxTransactionException}` : '1000000'
  //   );
  //   setOtp('');
  // };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <ActivityIndicatorView visible={isLoading} />
      <WalletHeader
        title={signingServer.choosePolicy}
        rightComponent={
          <TouchableOpacity>{isDarkMode ? <InfoDarkIcon /> : <InfoIcon />}</TouchableOpacity>
        }
      />
      <Text style={styles.desc}>{signingServer.choosePolicySubTitle}</Text>
      <Box style={styles.fieldContainer}>
        <ServerKeyPolicyCard
          signingServer={signingServer}
          navigation={navigation}
          maxTransaction={spendingLimit}
          timelimit={timeLimit}
          delayTime={signingDelay}
        />
      </Box>

      <Box style={styles.btnWrapper}>
        <Buttons primaryText={common.confirm} primaryCallback={() => onConfirm()} fullWidth />
      </Box>
      <KeeperModal
        visible={validationModal}
        close={() => {
          showValidationModal(false);
          // resetFields();
        }}
        title="Confirm OTP to change policy"
        subTitle="To complete setting up the signer"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={otpContent}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  btnWrapper: {
    paddingTop: hp(windowHeight > 700 ? 18 : 0),
    paddingHorizontal: '3%',
    paddingBottom: hp(20),
  },
  cvvInputInfoText: {
    fontSize: 14,
    width: '100%',
    marginTop: 2,
  },
  fieldContainer: {
    paddingVertical: wp(10),
    flex: 1,
  },
  desc: {
    marginVertical: hp(15),
  },
});

export default ChoosePolicyNew;
