import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  container: {
    borderRadius: wp(5),
  },
});

type Props = {
  value: boolean;
  onValueChange: Function;
  loading?: boolean;
};

function Switch({ value, onValueChange, loading }: Props) {
  const { colorMode } = useColorMode();
  return (
    <TouchableOpacity onPress={() => onValueChange(!value)} disabled={loading}>
      <Box style={styles.container} backgroundColor={value ? `${colorMode}.greenButtonBackground` : `${colorMode}.textColor2`}>
        <Box height={8} width={12} borderRadius={10} justifyContent="center" alignItems="center">
          {value ? (
            <Box
              height={6}
              width={6}
              borderRadius={15}
              backgroundColor={`${colorMode}.fadedGray`}
              alignSelf="flex-end"
              mx={1}
            />
          ) : (
            <Box
              height={6}
              width={6}
              borderRadius={15}
              backgroundColor={`${colorMode}.fadedGray`}
              alignSelf="flex-start"
              mx={1}
            />
          )}
        </Box>
      </Box>
    </TouchableOpacity>
  );
}

export default Switch;
