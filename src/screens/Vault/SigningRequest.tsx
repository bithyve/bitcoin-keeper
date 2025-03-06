import { Box, ScrollView } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { hp } from 'src/constants/responsive';
import { useAppSelector } from 'src/store/hooks';
import { DelayedTransaction } from 'src/models/interfaces/AssistedKeys';
import SigningRequestCard from './components/SigningRequestCard';
import { formatDateTime, formatRemainingTime } from 'src/utils/utilities';
import Text from 'src/components/KeeperText';

function SigningRequest() {
  const delayedTransactions = useAppSelector((state) => state.storage.delayedTransactions) || {};
  const signingRequests = [];
  function formatTxId(txid) {
    return txid.length > 15 ? txid.substring(0, 15) + '...' : txid;
  }

  for (const txid in delayedTransactions) {
    const delayedTx: DelayedTransaction = delayedTransactions[txid];

    signingRequests.push({
      id: txid,
      title: formatTxId(txid),
      dateTime: formatDateTime(delayedTx.timestamp),
      amount: delayedTx.outgoing,
      timeRemaining: formatRemainingTime(delayedTx.delayUntil - Date.now()),
    });
  }

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
