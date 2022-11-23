import { Box } from 'native-base';
import DisplayQR from './DisplayQR';
import HeaderTitle from 'src/components/HeaderTitle';
import React from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet } from 'react-native';

const RegisterWithQR = () => {
  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Register Signing Device"
        subtitle="Register the vault with any of the QR based signing devices"
      />
      <Box style={styles.center}>
        <DisplayQR />
      </Box>
    </ScreenWrapper>
  );
};

export default RegisterWithQR;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    marginTop: '20%',
  },
});
