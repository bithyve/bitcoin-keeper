import { Box, useColorMode } from 'native-base';

import React from 'react';
import { StyleSheet } from 'react-native';
import { windowWidth, hp, wp } from 'src/constants/responsive';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import Text from './KeeperText';

HexaToastMessages.defaultProps = {
  Image: null,
  error: false,
};
function HexaToastMessages({
  Image,
  error,
  ToastBody,
}: {
  Image?: any;
  error?: boolean;
  ToastBody?: any;
}) {
  const { colorMode } = useColorMode();
  return (
    <Box backgroundColor={`${colorMode}.accent`} style={styles.toast} testID="toast_message">
      {error ? <ToastErrorIcon /> : Image ? <Box>{Image}</Box> : null}
      <Text
        color={`${colorMode}.textBlack`}
        style={[
          styles.toastMsgText,
          { marginLeft: Image ? wp(15) : wp(5), marginRight: wp(5), flex: -1 },
        ]}
      >
        {ToastBody}
      </Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    borderRadius: 10,
    alignItems: 'center',
    width: windowWidth * 0.9,
    paddingLeft: 15,
    bottom: hp(40),
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
  toastMsgText: {
    marginLeft: 5,
    fontSize: 14,
    width: windowWidth * 0.8,
  },
});

export default HexaToastMessages;
