import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';

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
    flex: 1
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
