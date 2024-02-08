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

function Note({ title = 'Note', subtitle, subtitleColor = 'GreyText', width = '100%' }: Props) {
  const { colorMode } = useColorMode();

  return (
    <Box style={styles.container}>
      <Box>
        <Text testID="text_note_title" color={`${colorMode}.headerText`} style={styles.title}>
          {title}
        </Text>
      </Box>
      <Box>
        <Text
          testID="text_note_subtitle"
          width={width}
          color={`${colorMode}.${subtitleColor}`}
          style={styles.subTitle}
        >
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
