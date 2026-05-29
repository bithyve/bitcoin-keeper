import { Box, useColorMode } from '@gluestack-ui/themed-native-base';

import React from 'react';
import { StyleSheet } from 'react-native';
import { windowWidth, hp, wp } from 'src/constants/responsive';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import Text from './KeeperText';

const TOAST_MESSAGE_TEST_ID = 'toast_message';
const TOAST_MESSAGE_TEXT_TEST_ID = 'toast_message_text';

function HexaToastMessages({
  Image = null,
  error = false,
  ToastBody,
}: {
  Image?: any;
  error?: boolean;
  ToastBody?: any;
}) {
  const { colorMode } = useColorMode();
  return (
    <Box
      backgroundColor={`${colorMode}.warmbeige`}
      style={styles.toast}
      testID={TOAST_MESSAGE_TEST_ID}
      nativeID={TOAST_MESSAGE_TEST_ID}
      accessibilityLabel={TOAST_MESSAGE_TEST_ID}
      collapsable={false}
    >
      {error ? <ToastErrorIcon /> : Image ? <Box>{Image}</Box> : null}
      <Text
        testID={TOAST_MESSAGE_TEXT_TEST_ID}
        nativeID={TOAST_MESSAGE_TEXT_TEST_ID}
        color={`${colorMode}.primaryBackground`}
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
    borderWidth: 0,
    overflow: 'hidden',
    alignItems: 'center',
    width: windowWidth * 0.9,
    paddingLeft: 15,
    bottom: hp(40),
    minHeight: hp(70),
    fontSize: 13,
  },
  toastMsgText: {
    marginLeft: 5,
    fontSize: 14,
    width: windowWidth * 0.8,
  },
});

export default HexaToastMessages;
