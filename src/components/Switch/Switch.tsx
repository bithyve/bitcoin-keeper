import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { windowHeight } from 'src/constants/responsive';

const styles = StyleSheet.create({
  container: {
    borderRadius: wp(5),
  },
});

type Props = {
  value: boolean;
  onValueChange: Function;
  loading?: boolean;
  testID?: string;
};

function Switch({ value, onValueChange, loading, testID }: Props) {
  const { colorMode } = useColorMode();
  return (
    <TouchableOpacity testID={testID} onPress={() => onValueChange(!value)} disabled={loading}>
      <Box
        style={styles.container}
        backgroundColor={value ? `${colorMode}.greenButtonBackground` : `${colorMode}.textColor2`}
      >
        <Box
          height={windowHeight > 600 ? 8 : 6}
          width={windowHeight > 600 ? 12 : 10}
          borderRadius={10}
          justifyContent="center"
          alignItems="center"
        >
          {value ? (
            <Box
              height={windowHeight > 600 ? 6 : 5}
              width={windowHeight > 600 ? 6 : 5}
              borderRadius={15}
              backgroundColor={`${colorMode}.fadedGray`}
              alignSelf="flex-end"
              mx={1}
            />
          ) : (
            <Box
              height={windowHeight > 600 ? 6 : 5}
              width={windowHeight > 600 ? 6 : 5}
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
