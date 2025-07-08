import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import { GasFreeTransferStatus } from 'src/services/wallets/operations/dollars/GasFree';
import Colors from 'src/theme/Colors';

const StatusContent = ({ status }) => {
  const { colorMode } = useColorMode();
  const containerbackgroundColor =
    status === GasFreeTransferStatus.SUCCEED
      ? Colors.PaleTropicalTeal
      : status === GasFreeTransferStatus.CONFIRMING
      ? Colors.lightOrange
      : Colors.lightindigoblue;

  const textColor =
    status === GasFreeTransferStatus.SUCCEED
      ? Colors.TropicalTeal
      : status === GasFreeTransferStatus.CONFIRMING
      ? Colors.darkOrange
      : Colors.indigoblue;
  return (
    <Box
      backgroundColor={containerbackgroundColor}
      borderColor={`${colorMode}.separator`}
      style={styles.container}
    >
      <Text fontSize={12} color={textColor}>
        {status}
      </Text>
    </Box>
  );
};

export default StatusContent;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 30,
    width: wp(80),
    height: hp(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(10),
  },
});
