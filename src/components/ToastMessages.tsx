import { Box } from 'native-base';

import React from 'react';
import { StyleSheet } from 'react-native';
import { windowWidth, windowHeight, hp } from 'src/common/data/responsiveness/responsive';

HexaToastMessages.defaultProps = {
  Image: null,
  error: false,
};
console.log('windowHeight', windowHeight)
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
    bottom: windowHeight > 800 ? hp(40) : hp(25),
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
