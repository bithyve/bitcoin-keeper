import React from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';

function UAIView({
  title,
  subTitle,
  primaryCallbackText,
  primaryCallback,
  secondaryCallbackText,
  secondaryCallback,
}) {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.wrapper}>
      <Box style={styles.uaiMessageWrapper} testID="btn_uaiTitleText">
        <Text style={styles.uaiMessageText} color={`${colorMode}.BrownNeedHelp`} bold>
          {title}
        </Text>
        <Text
          style={styles.uaiSubtitle}
          color={`${colorMode}.primaryText`}
          numberOfLines={2}
          medium
        >
          {subTitle}
        </Text>
      </Box>
      <TouchableOpacity
        style={styles.skipWrapper}
        onPress={secondaryCallback}
        testID="btn_uaiSkip"
        disabled={!secondaryCallbackText}
      >
        <Text style={styles.skipText} bold color={`${colorMode}.learnMoreBorder`}>
          {secondaryCallbackText.toUpperCase()}
        </Text>
      </TouchableOpacity>
      {primaryCallbackText && primaryCallback && (
        <TouchableOpacity
          style={styles.addNowWrapper}
          onPress={primaryCallback}
          testID="btn_uaiPrimary"
        >
          <Box style={styles.addNowCTAWrapper} backgroundColor={`${colorMode}.modalGreenButton`}>
            <Text style={styles.addNowCTAText} bold color={`${colorMode}.buttonText`}>
              {primaryCallbackText.toUpperCase()}
            </Text>
          </Box>
        </TouchableOpacity>
      )}
    </Box>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  uaiMessageWrapper: {
    width: '60%',
  },
  uaiMessageText: {
    fontSize: 12,
    width: '100%',
    letterSpacing: 0.12,
  },
  uaiSubtitle: {
    fontSize: 14,
    letterSpacing: 0.14,
    width: '100%',
  },
  skipWrapper: {
    width: '16%',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 10,
    letterSpacing: 0.4,
  },
  addNowWrapper: {
    width: '26%',
  },
  addNowCTAWrapper: {
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 3,
  },
  addNowCTAText: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
});
export default UAIView;
