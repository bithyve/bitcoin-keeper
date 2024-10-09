import QRCode from 'react-native-qrcode-svg';
import React from 'react';
import { StyleSheet } from 'react-native';

import { Box, useColorMode } from 'native-base';

function KeeperQRCode({
  qrData,
  size,
  ecl = 'L',
  logoBackgroundColor,
}: {
  qrData: any;
  size: number;
  ecl?: 'L' | 'M' | 'Q' | 'H';
  logoBackgroundColor?: string;
}) {
  const { colorMode } = useColorMode();

  return (
    <Box style={styles.qrWrapper} borderColor={`${colorMode}.qrBorderColor`}>
      <QRCode
        value={qrData}
        {...(logoBackgroundColor ? { logoBackgroundColor } : {})}
        size={size}
        ecl={ecl}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  qrWrapper: {
    borderWidth: 10,
  },
});

export default KeeperQRCode;
