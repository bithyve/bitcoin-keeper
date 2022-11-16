import { Box, useColorMode, Text } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import { customTheme } from 'src/common/themes';

const { fonts } = customTheme;

type Props = {
  title: string;
  subtitle: string;
  subtitleColor?: string;
  width?: string | number;
};

const Note = ({ title, subtitle, subtitleColor = 'lightBlack', width = '100%' }: Props) => {
  const { colorMode } = useColorMode();

  return (
    <Box style={styles.container}>
      <Box opacity={1}>
        <Text color={`${colorMode}.lightBlack`} style={styles.title}>
          {title}
        </Text>
      </Box>
      <Box>
        <Text
          width={width} // width from props
          color={`${colorMode}.${subtitleColor}`}
          style={styles.subTitle}
        >
          {subtitle}
        </Text>
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  title: {
    fontSize: 14,
    letterSpacing: 1.12,
    fontWeight: '400',
    fontFamily: fonts.body,
  },
  subTitle: {
    fontSize: 12,
    letterSpacing: 0.6,
    fontWeight: '400',
    fontFamily: fonts.body,
  },
});

export default Note;
