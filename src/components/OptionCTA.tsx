import { StyleSheet } from 'react-native';
import React from 'react';
import { Box, Pressable, useColorMode } from 'native-base';
import { wp, hp } from 'src/constants/responsive';
import Text from './KeeperText';

function OptionCTA({ icon, title, callback }) {
  const { colorMode } = useColorMode();
  return (
    <Pressable testID={`btn_${title}`} onPress={() => callback()}>
      <Box style={styles.mainContainer}>
        <Box
          style={styles.container}
          backgroundColor={`${colorMode}.seashellWhite`}
          borderColor={`${colorMode}.greyBorder`}
        >
          <Box style={styles.iconContainer}>{icon}</Box>
        </Box>
        <Text style={styles.title} bold>
          {title}
        </Text>
      </Box>
    </Pressable>
  );
}

export default OptionCTA;

const styles = StyleSheet.create({
  mainContainer: {
    width: wp(90),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    borderWidth: 0.5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: wp(26),
    paddingRight: wp(25.2),
    paddingTop: hp(16),
    paddingBottom: hp(16.2),
  },
  title: {
    marginTop: hp(10),
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
