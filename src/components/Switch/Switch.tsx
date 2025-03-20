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
  const isDarkMode = colorMode === 'dark';

  const backgroundColor = value
    ? `${colorMode}.pantoneGreen`
    : isDarkMode
    ? `#383838`
    : `${colorMode}.textColor2`;
  const dotColor = `${colorMode}.fadedGray`;

  return (
    <TouchableOpacity testID={testID} onPress={() => onValueChange(!value)} disabled={loading}>
      <Box style={[styles.container]} backgroundColor={backgroundColor}>
        <Box
          height={windowHeight > 600 ? 6 : 5}
          width={windowHeight > 600 ? 10 : 8}
          borderRadius={8}
          justifyContent="center"
          alignItems="center"
        >
          <Box
            height={windowHeight > 600 ? 4 : 3.5}
            width={windowHeight > 600 ? 4 : 3.5}
            borderRadius={8}
            backgroundColor={dotColor}
            alignSelf={value ? 'flex-end' : 'flex-start'}
            mx={1}
          />
        </Box>
      </Box>
    </TouchableOpacity>
  );
}

export default Switch;
