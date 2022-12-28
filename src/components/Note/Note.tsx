import { Box, useColorMode, Text } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import { customTheme } from 'src/common/themes';

type Props = {
  title?: string;
  subtitle: string;
  subtitleColor?: string;
  width?: string | number;
};

function Note({ title = 'Note', subtitle, subtitleColor = 'lightBlack', width = '100%' }: Props) {
  const { colorMode } = useColorMode();

  return (
    <Box style={styles.container}>
      <Box opacity={1}>
        <Text color={`${colorMode}.lightBlack`} style={styles.title}>
          {title}
        </Text>
      </Box>
      <Box>
        <Text width={width} color={`${colorMode}.${subtitleColor}`} style={styles.subTitle}>
          {subtitle}
        </Text>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  title: {
    fontSize: 14,
    letterSpacing: 1.12,
  },
  subTitle: {
    fontSize: 12,
    letterSpacing: 0.6,
  },
});

export default Note;
