import { Box } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';
import { StatusEnum } from './Constant';

const SwapStatusContent = ({ status }) => {
  const containerBackgroundColor =
    status === StatusEnum.Confirming
      ? Colors.lightOrange
      : status === StatusEnum.Processing
      ? Colors.lightindigoblue
      : status === StatusEnum.Success
      ? Colors.PaleTropicalTeal
      : Colors.lightRed;

  const textColor =
    status === StatusEnum.Confirming
      ? Colors.darkOrange
      : status === StatusEnum.Processing
      ? Colors.indigoblue
      : status === StatusEnum.Success
      ? Colors.TropicalTeal
      : Colors.CrimsonRed;
  return (
    <Box backgroundColor={containerBackgroundColor} style={styles.container}>
      <Text fontSize={12} color={textColor}>
        {status}
      </Text>
    </Box>
  );
};

export default SwapStatusContent;

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    width: wp(80),
    height: hp(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(10),
  },
});
