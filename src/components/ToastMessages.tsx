import { Box } from 'native-base';

import React from 'react';
import { StyleSheet } from 'react-native';
import { windowWidth } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';

HexaToastMessages.defaultProps = {
  Image: null,
  error: false,
};

function HexaToastMessages({
  title,
  Image,
  error,
  width,
}: {
  title: string;
  width: number | string;
  Image?: any;
  error?: boolean;
}) {
  return (
    <Box backgroundColor={error ? 'error.500' : 'light.accent'} style={styles.toast}>
      {Image && <Box>{Image}</Box>}
      <Text
        color={error ? 'error.200' : null}
        style={{ marginLeft: Image ? 3 : 0, width }}
        numberOfLines={2}
      >
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
    width: windowWidth * 0.8,
    paddingLeft: 15,
    height: 70,
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
