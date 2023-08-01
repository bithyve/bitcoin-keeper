import { StyleSheet } from 'react-native';
import React from 'react';
import { Box, HStack, Pressable, VStack } from 'native-base';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import { windowWidth } from 'src/common/data/responsiveness/responsive';
import Text from './KeeperText';

function OptionCTA({ icon, title, subtitle, callback }) {
  return (
    <Pressable onPress={() => callback()}>
      <Box style={styles.container}>
        <HStack style={styles.main}>
          <HStack style={styles.main}>
            <Box style={styles.icon}>{icon}</Box>
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
    backgroundColor: '#FDF7F0',
    padding: 15,
    width: windowWidth * 0.8,
    marginTop: 5,
  },
  main: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    marginRight: 15,
  },
  textContainer: {
    marginRight: '15%',
  },
  title: {
    fontSize: 14,
    lineHeight: 14,
  },
  subtitle: {
    fontSize: 13,
  },
});
