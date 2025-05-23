import { DimensionValue, StyleSheet } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';
import { hp, wp } from 'src/constants/responsive';
import Text from './KeeperText';
import openLink from 'src/utils/OpenLink';

export function Instruction({
  text,
  textWidth = wp(285),
  textColor,
}: {
  text: string;
  textWidth?: DimensionValue;
  textColor?: string;
}) {
  const { colorMode } = useColorMode();
  const styles = getStyles(textWidth);
  return (
    <Box style={styles.bulletContainer}>
      <Box
        style={styles.bullet}
        backgroundColor={textColor ? textColor : `${colorMode}.black`}
      ></Box>
      <Text color={textColor ? textColor : `${colorMode}.secondaryText`} style={styles.infoText}>
        {typeof text === 'string'
          ? text.split(/\b(https?:\/\/[^\s]+)\b/).map((part) => {
              if (part.match(/^https?:\/\//)) {
                return (
                  <Text
                    color={`${colorMode}.greenWhiteText`}
                    bold
                    style={styles.linkText}
                    onPress={() => openLink(part)}
                  >
                    {part.replace('https://', '').replace('http://', '')}
                  </Text>
                );
              }
              return part;
            })
          : text}
      </Text>
    </Box>
  );
}

export default Instruction;

const getStyles = (textWidth: DimensionValue) =>
  StyleSheet.create({
    bulletContainer: {
      paddingTop: 4,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'center',
      gap: 12,
    },
    bullet: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 7,
      height: 7,
      borderRadius: 10 / 2,
      marginTop: 11,
    },
    infoText: {
      padding: 3,
      fontSize: 14,
      width: textWidth,
    },
    linkText: {
      letterSpacing: 0.65,
      fontSize: 13,
      textDecorationStyle: 'solid',
      textDecorationLine: 'underline',
    },
  });
