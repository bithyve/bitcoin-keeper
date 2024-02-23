import React from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Fonts from 'src/constants/Fonts';

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
        <Text style={styles.uaiMessageText} color={`${colorMode}.RussetBrown`}>
          {title}
        </Text>
        <Text style={styles.uaiSubtitle} color={`${colorMode}.primaryText`} numberOfLines={2}>
          {subTitle}
        </Text>
      </Box>
      <TouchableOpacity
        style={styles.skipWrapper}
        onPress={secondaryCallback}
        testID="btn_uaiSkip"
        disabled={!secondaryCallbackText}
      >
        <Text style={styles.skipText} color={`${colorMode}.learnMoreBorder`}>
          {secondaryCallbackText.toUpperCase()}
        </Text>
      </TouchableOpacity>
      {primaryCallbackText && primaryCallback && (
        <TouchableOpacity
          style={styles.addNowWrapper}
          onPress={primaryCallback}
          testID="btn_uaiPrimary"
        >
          <Box style={styles.addNowCTAWrapper} backgroundColor={`${colorMode}.greenText`}>
            <Text style={styles.addNowCTAText} color={`${colorMode}.white`}>
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
    fontFamily: Fonts.FiraSansCondensedBold,
    letterSpacing: 0.12,
  },
  uaiSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.FiraSansCondensedMedium,
    letterSpacing: 0.14,
    width: '100%',
  },
  skipWrapper: {
    width: '16%',
    alignItems: 'center',
  },
  skipText: {
    fontFamily: Fonts.FiraSansCondensedMedium,
    fontSize: 12,
  },
  addNowWrapper: {
    width: '24%',
  },
  addNowCTAWrapper: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  addNowCTAText: {
    fontSize: 11,
    fontFamily: Fonts.FiraSansCondensedMedium,
  },
});
export default UAIView;
