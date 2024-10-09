import React from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { StyleSheet } from 'react-native';

function CountrySwitchCard(props) {
  const { colorMode } = useColorMode();
  return (
    <Box
      backgroundColor={`${colorMode}.backgroundColor2`}
      flexDirection="row"
      py={4}
      px={3}
      {...props}
    >
      <Box flex={1.5}>
        <Text color={`${colorMode}.primaryText`} style={styles.titleText}>
          {props.title}
        </Text>
        <Text color={`${colorMode}.GreyText`} style={styles.descriptionText}>
          {props.description}
        </Text>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  titleText: {
    fontSize: 13,
    letterSpacing: 0.13,
  },
  descriptionText: {
    fontSize: 12,
    letterSpacing: 0.12,
  },
});

export default CountrySwitchCard;
