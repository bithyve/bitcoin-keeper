import QRCode from 'react-native-qrcode-svg';
import React from 'react';
import { StyleSheet } from 'react-native';

import { Box, useColorMode } from 'native-base';
import KeeperIcon from 'src/assets/images/app-icon.png';

function KeeperQRCode({
  qrData,
  size,
  ecl = 'L',
  logoBackgroundColor,
  showLogo = false,
}: {
  qrData: any;
  size: number;
  ecl?: 'L' | 'M' | 'Q' | 'H';
  logoBackgroundColor?: string;
  showLogo?: boolean;
}) {
  const { colorMode } = useColorMode();

  return (
    <Box style={styles.qrWrapper} borderColor={`${colorMode}.qrBorderColor`}>
      <QRCode
        value={qrData}
        {...(logoBackgroundColor ? { logoBackgroundColor } : {})}
        size={size}
        ecl={ecl}
        logo={KeeperIcon}
        logoSize={showLogo ? size * 0.2 : 0}
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
