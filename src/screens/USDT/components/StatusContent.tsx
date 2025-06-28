import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';
import { TransactionStatusEnum } from '../UsdtTransactionDetail';

const StatusContent = ({ status }) => {
  const { colorMode } = useColorMode();
  const containerbackgroundColor =
    status === TransactionStatusEnum.PROCESSING
      ? Colors.lightindigoblue
      : status === TransactionStatusEnum.CONFIRMING
      ? Colors.lightOrange
      : Colors.PaleTropicalTeal;

  const textColor =
    status === TransactionStatusEnum.PROCESSING
      ? Colors.indigoblue
      : status === TransactionStatusEnum.CONFIRMING
      ? Colors.darkOrange
      : Colors.TropicalTeal;
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
