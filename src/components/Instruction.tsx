import { DimensionValue, StyleSheet } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';
import { hp, wp } from 'src/constants/responsive';
import Text from './KeeperText';
import { TouchableOpacity } from 'react-native';
import openLink from 'src/utils/OpenLink';

export function Instruction({
  text,
  textWidth = wp(285),
}: {
  text: string;
  textWidth?: DimensionValue;
}) {
  const { colorMode } = useColorMode();
  const styles = getStyles(textWidth);
  return (
    <Box style={styles.bulletContainer}>
      <Box style={styles.bullet} backgroundColor={`${colorMode}.black`}></Box>
      <Text color={`${colorMode}.secondaryText`} style={styles.infoText}>
        {typeof text === 'string'
          ? text.split(/\b(https?:\/\/[^\s]+)\b/).map((part) => {
              if (part.match(/^https?:\/\//)) {
                return (
                  <TouchableOpacity onPress={() => openLink(part)} style={styles.linkContainer}>
                    <Text color={`${colorMode}.greenWhiteText`} style={styles.linkText} bold>
                      {part.replace('https://', '').replace('http://', '')}
                    </Text>
                  </TouchableOpacity>
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
      letterSpacing: 0.65,
      padding: 3,
      fontSize: 13,
      width: textWidth,
    },
    linkContainer: {
      justifyContent: 'flex-end',
      verticalAlign: 'bottom',
      marginTop: hp(-2),
      paddingLeft: wp(3),
    },
    linkText: {
      letterSpacing: 0.65,
      fontSize: 13,
      textDecorationStyle: 'solid',
      textDecorationLine: 'underline',
    },
  });
