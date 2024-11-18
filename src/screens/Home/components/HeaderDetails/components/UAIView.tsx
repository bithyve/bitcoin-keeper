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
      <Box style={styles.ctaWrapper}>
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
          <TouchableOpacity onPress={primaryCallback} testID="btn_uaiPrimary">
            <Box style={styles.addNowCTAWrapper} backgroundColor={`${colorMode}.modalGreenButton`}>
              <Text style={styles.addNowCTAText} bold color={`${colorMode}.buttonText`}>
                {primaryCallbackText.toUpperCase()}
              </Text>
            </Box>
          </TouchableOpacity>
        )}
      </Box>
    </Box>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    paddingLeft: 15,
  },
  uaiMessageWrapper: {
    width: '60%',
  },
  uaiMessageText: {
    fontSize: 12,
    width: '100%',
  },
  uaiSubtitle: {
    fontSize: 14,
    width: '100%',
  },
  ctaWrapper: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  skipWrapper: {
    alignItems: 'center',
  },
  skipText: {
    fontSize: 10,
  },
  addNowCTAWrapper: {
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  addNowCTAText: {
    fontSize: 10,
  },
});
export default UAIView;
