import { StyleSheet } from 'react-native';
import React from 'react';
import { Box, HStack, Pressable, useColorMode, VStack } from 'native-base';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import { windowWidth } from 'src/constants/responsive';
import Text from './KeeperText';

function OptionCTA({ icon, title, subtitle, callback }) {
  const { colorMode } = useColorMode();
  return (
    <Pressable onPress={() => callback()}>
      <Box style={styles.container} backgroundColor={`${colorMode}.seashellWhite`}>
        <HStack style={styles.main}>
          <HStack style={styles.main}>
            <Box>{icon}</Box>
            <VStack style={styles.textContainer}>
              <Text style={styles.title} bold>
                {title}
              </Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </VStack>
          </HStack>
          <Box>
            <RightArrowIcon />
          </Box>
        </HStack>
      </Box>
    </Pressable>
  );
}

export default OptionCTA;

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 15,
    width: windowWidth * 0.85,
    marginTop: 5,
    minHeight: 60,
  },
  main: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    marginRight: '10%',
    paddingVertical: '2%',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    lineHeight: 14,
  },
  subtitle: {
    fontSize: 13,
  },
});
