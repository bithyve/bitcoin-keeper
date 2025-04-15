import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { hp } from 'src/constants/responsive';
import { useAppSelector } from 'src/store/hooks';
import { DelayedTransaction } from 'src/models/interfaces/AssistedKeys';
import { formatDateTime, formatRemainingTime } from 'src/utils/utilities';
import Text from 'src/components/KeeperText';
import { useDispatch } from 'react-redux';
import { fetchSignedDelayedTransaction } from 'src/store/sagaActions/storage';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Clipboard from '@react-native-clipboard/clipboard';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import Buttons from 'src/components/Buttons';
import useToastMessage from 'src/hooks/useToastMessage';
import SigningServer from 'src/services/backend/SigningServer';
import { deleteDelayedTransaction } from 'src/store/reducers/storage';
import SigningRequestCard from './components/SigningRequestCard';

function formatTxId(txid) {
  return txid.length > 15 ? `${txid.substring(0, 15)}...` : txid;
}

function SigningRequest() {
  const { colorMode } = useColorMode();
  const delayedTransactions = useAppSelector((state) => state.storage.delayedTransactions) || {};
  const dispatch = useDispatch();
  const [validationModal, showValidationModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [requestToCancel, setRequestToCancel] = useState('');
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { showToast } = useToastMessage();

  const signingRequests = useMemo(() => {
    const cronBuffer = 10 * 60 * 1000; // 10 minutes additional buffer(cron runs every 10 minutes)

    return Object.keys(delayedTransactions).map((txid) => {
      const delayedTx: DelayedTransaction = delayedTransactions[txid];
      const timeReamining = delayedTx.signedPSBT
        ? 0
        : delayedTx.delayUntil + cronBuffer - Date.now();
      return {
        id: txid,
        title: formatTxId(txid),
        dateTime: formatDateTime(delayedTx.timestamp),
        amount: delayedTx.outgoing,
        timeRemaining: formatRemainingTime(timeReamining),
      };
    });
  }, [delayedTransactions]);

  useEffect(() => {
    if (delayedTransactions && Object.keys(delayedTransactions).length > 0) {
      dispatch(fetchSignedDelayedTransaction());
    }
  }, []);

  const cancelRequest = async () => {
    try {
      const txid = requestToCancel;
      const { signerId, signedPSBT } = delayedTransactions[txid] as DelayedTransaction;
      if (signedPSBT) {
        showToast('This request has already been signed');
        showValidationModal(false);
        setOtp('');
        return;
      }

      const verificationToken = otp;

      const { canceled } = await SigningServer.cancelDelayedTransaction(
        signerId,
        txid,
        verificationToken
      );

      if (canceled) {
        showToast('Signing request has been cancelled');
        dispatch(deleteDelayedTransaction(txid));
      } else showToast('Failed to cancel the signing request');

      showValidationModal(false);
      setOtp('');
    } catch (err) {
      showValidationModal(false);
      showToast(`${err.message}`);
      setOtp('');
    }
  };

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
      <Box style={styles.otpContainer}>
        <Box>
          <TouchableOpacity
            onPress={async () => {
              const clipBoardData = await Clipboard.getString();
              if (clipBoardData.match(/^\d{6}$/)) {
                setOtp(clipBoardData);
              } else {
                showToast('Invalid OTP');
                setOtp('');
              }
            }}
            testID="otpClipboardButton"
          >
            <CVVInputsView
              passCode={otp}
              passcodeFlag={false}
              backgroundColor
              textColor
              height={hp(46)}
              width={hp(46)}
              marginTop={hp(0)}
              marginBottom={hp(40)}
              inputGap={2}
              customStyle={styles.CVVInputsView}
            />
          </TouchableOpacity>
        </Box>
        <KeyPadView
          onPressNumber={onPressNumber}
          onDeletePressed={onDeletePressed}
          keyColor={`${colorMode}.primaryText`}
        />
        <Box mt={10} alignSelf="flex-end">
          <Box>
            <Buttons
              primaryCallback={() => {
                if (requestToCancel) {
                  cancelRequest();
                } else {
                  showToast('Please select a Signing Request');
                }
              }}
              fullWidth
              primaryText="Confirm"
            />
          </Box>
        </Box>
      </Box>
    );
  }, [otp, requestToCancel, delayedTransactions]);

  return (
    <ScreenWrapper>
      <WalletHeader title="Signing Requests" />
      <ScrollView contentContainerStyle={styles.container}>
        <Box gap={hp(20)}>
          {signingRequests.length > 0 ? (
            signingRequests.map((request) => (
              <SigningRequestCard
                key={request.id}
                requestId={request.id}
                title={request.title}
                dateTime={request.dateTime}
                amount={request.amount}
                timeRemaining={request.timeRemaining}
                onCancel={(reqId) => {
                  showValidationModal(true);
                  setRequestToCancel(reqId);
                }}
              />
            ))
          ) : (
            <Text style={styles.noRequestsText}>There are no signing requests.</Text>
          )}
        </Box>
      </ScrollView>
      <KeeperModal
        visible={validationModal}
        close={() => {
          showValidationModal(false);
          setOtp('');
        }}
        title={common.confirm2FACodeTitle}
        subTitle={common.confirm2FACodeSubtitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={otpContent}
      />
    </ScreenWrapper>
  );
}

export default SigningRequest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: hp(15),
  },
  otpContainer: {
    width: '100%',
  },
  CVVInputsView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRequestsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
});
