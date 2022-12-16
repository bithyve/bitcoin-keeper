import { Box, Text } from 'native-base';

import React from 'react';
import { StyleSheet } from 'react-native';
import { windowWidth } from 'src/common/data/responsiveness/responsive';

HexaToastMessages.defaultProps = {
  Image: null,
  error: false,
};

function HexaToastMessages({
  title,
  Image,
  error,
}: {
  title: string;
  Image?: any;
  error?: boolean;
}) {
  return (
    <Box bg={error ? 'error.500' : 'light.yellow1'} style={styles.toast}>
      {Image && <Box marginLeft={5}>{Image}</Box>}
      <Text marginLeft={Image ? 3 : 0} color={error ? 'error.200' : null}>
        {title}
      </Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    borderRadius: 10,
    alignItems: 'center',
    height: 70,
    width: windowWidth * 0.8,
    fontSize: 13,
    elevation: 6,
    shadowOpacity: 0.6,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },
});

export default HexaToastMessages;
