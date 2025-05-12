import { Box, ScrollView } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import QRScanner from 'src/components/QRScanner';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { hp } from 'src/constants/responsive';

const ContactScanQr = () => {
  return (
    <ScreenWrapper>
      <WalletHeader
        title="Scan QR"
        subTitle="Please scan until all the QR data has been retrieved "
      />
      <Box style={styles.container}>
        <ScrollView
          automaticallyAdjustKeyboardInsets={true}
          contentContainerStyle={{
            alignItems: 'center',
            paddingTop: hp(10),
          }}
          style={styles.flex1}
          showsVerticalScrollIndicator={false}
        >
          <QRScanner onScanCompleted={() => {}} />
        </ScrollView>
      </Box>
    </ScreenWrapper>
  );
};

export default ContactScanQr;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  flex1: {
    flex: 1,
  },
});
