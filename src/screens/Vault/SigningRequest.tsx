import { Box, ScrollView } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { hp } from 'src/constants/responsive';
import { useAppSelector } from 'src/store/hooks';
import { DelayedTransaction } from 'src/models/interfaces/AssistedKeys';
import SigningRequestCard from './components/SigningRequestCard';

function SigningRequest() {
  const delayedTransactions = useAppSelector((state) => state.storage.delayedTransactions) || {};
  const signingRequests = [];
  for (const txid in delayedTransactions) {
    const delayedTx: DelayedTransaction = delayedTransactions[txid];
    signingRequests.push({
      id: txid,
      title: 'Server Key Signing Request',
      dateTime: delayedTx.timestamp,
      amount: delayedTx.outgoing,
      timeRemaining: delayedTx.delayUntil - Date.now(),
    });
  }

  return (
    <ScreenWrapper>
      <WalletHeader title="Signing Requests" />
      <ScrollView contentContainerStyle={styles.container}>
        <Box gap={hp(20)}>
          {signingRequests.map((request) => (
            <SigningRequestCard
              key={request.id}
              title={request.title}
              dateTime={request.dateTime}
              amount={request.amount}
              timeRemaining={request.timeRemaining}
              // buttonText={request.buttonText}
              // onCancel={() => {}}
            />
          ))}
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
});
