import { Box } from 'native-base';

import React from 'react';
import { StyleSheet } from 'react-native';
import { windowWidth } from 'src/common/data/responsiveness/responsive';

HexaToastMessages.defaultProps = {
  Image: null,
  error: false,
};

function HexaToastMessages({
  Image,
  error,
  ToastBody
}: {
  Image?: any;
  error?: boolean;
  ToastBody?: any
}) {
  return (
    <Box backgroundColor={error ? 'error.500' : 'light.accent'} style={styles.toast}>
      {Image && <Box>{Image}</Box>}
      {ToastBody}
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
