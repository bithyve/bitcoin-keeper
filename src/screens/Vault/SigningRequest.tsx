import { Box, ScrollView } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { hp } from 'src/constants/responsive';
import SigningRequestCard from './components/SigningRequestCard';

const SigningRequest = () => {
  const signingRequests = [
    {
      id: 1,
      title: 'Bank Payment',
      dateTime: '30 Aug 24 . 2:00 AM',
      amount: '0.0000014',
      timeRemaining: '2 Days Remains',
      buttonText: 'Cancel',
    },
    {
      id: 2,
      title: 'Fee Payment',
      dateTime: '30 Aug 24 . 2:00 AM',
      amount: '0.0000014',
      timeRemaining: '2 Days Remains',
      buttonText: 'Cancel',
    },
  ];

  return (
    <ScreenWrapper>
      <WalletHeader title="Signing Request" />
      <ScrollView contentContainerStyle={styles.container}>
        <Box gap={hp(20)}>
          {signingRequests.map((request) => (
            <SigningRequestCard
              key={request.id}
              title={request.title}
              dateTime={request.dateTime}
              amount={request.amount}
              timeRemaining={request.timeRemaining}
              buttonText={request.buttonText}
              onCancel={() => {}}
            />
          ))}
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
};

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
