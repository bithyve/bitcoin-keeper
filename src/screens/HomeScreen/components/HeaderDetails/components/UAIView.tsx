import React from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { hp } from 'src/constants/responsive';
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
    <Box style={styles.wrapper} backgroundColor={`${colorMode}.seashellWhite`}>
      <Box style={styles.uaiMessageWrapper} testID="btn_uaiTitleText">
        <Text style={styles.uaiTitleText} color={`${colorMode}.primaryText`}>
          {title}
        </Text>
        <Text numberOfLines={2} style={styles.uaiMessageText} color={`${colorMode}.primaryText`}>
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
          {secondaryCallbackText}
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
              {primaryCallbackText}
            </Text>
          </Box>
        </TouchableOpacity>
      )}
    </Box>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    marginVertical: hp(20),
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },
  uaiMessageWrapper: {
    width: '60%',
  },
  uaiTitleText: {
    fontSize: 12,
    width: '100%',
    fontFamily: Fonts.FiraSansCondensedBold,
    letterSpacing: 0,
  },
  uaiMessageText: {
    fontSize: 14,
    width: '100%',
    fontFamily: Fonts.FiraSansCondensedMedium,
    letterSpacing: 0.24,
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
    borderRadius: 20,
  },
  addNowCTAText: {
    fontSize: 11,
    fontFamily: Fonts.FiraSansCondensedMedium,
  },
});
export default UAIView;
