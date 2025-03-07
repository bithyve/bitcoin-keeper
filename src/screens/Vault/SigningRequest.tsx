import { Box, ScrollView } from 'native-base';
import React, { useEffect, useMemo, useState } from 'react';
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
import SigningRequestCard from './components/SigningRequestCard';

function formatTxId(txid) {
  return txid.length > 15 ? `${txid.substring(0, 15)}...` : txid;
}

function SigningRequest() {
  const delayedTransactions = useAppSelector((state) => state.storage.delayedTransactions) || {};
  const dispatch = useDispatch();

  const signingRequests = useMemo(() => {
    return Object.keys(delayedTransactions).map((txid) => {
      const delayedTx = delayedTransactions[txid];
      return {
        id: txid,
        title: formatTxId(txid),
        dateTime: formatDateTime(delayedTx.timestamp),
        amount: delayedTx.outgoing,
        timeRemaining: formatRemainingTime(delayedTx.delayUntil - Date.now()),
      };
    });
  }, [delayedTransactions]);

  useEffect(() => {
    if (delayedTransactions && Object.keys(delayedTransactions).length > 0) {
      dispatch(fetchSignedDelayedTransaction());
    }
  }, []);

  return (
    <ScreenWrapper>
      <WalletHeader title="Signing Requests" />
      <ScrollView contentContainerStyle={styles.container}>
        <Box gap={hp(20)}>
          {signingRequests.length > 0 ? (
            signingRequests.map((request) => (
              <SigningRequestCard
                key={request.id}
                title={request.title}
                dateTime={request.dateTime}
                amount={request.amount}
                timeRemaining={request.timeRemaining}
                // buttonText={request.buttonText}
                // onCancel={() => {}}
              />
            ))
          ) : (
            <Text style={styles.noRequestsText}>There are no signing requests.</Text>
          )}
        </Box>
      </ScrollView>
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
