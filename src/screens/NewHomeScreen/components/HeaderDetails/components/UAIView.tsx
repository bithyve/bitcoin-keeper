import React from 'react';
import { Box } from 'native-base';
import Text from 'src/components/KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { hp } from 'src/common/data/responsiveness/responsive';

function UAIView({
  title,
  primaryCallbackText,
  primaryCallback,
  secondaryCallbackText,
  secondaryCallback,
}) {
  return (
    <Box style={styles.wrapper}>
      <Box style={styles.uaiMessageWrapper} testID='btn_uaiTitleText'>
        <Text style={styles.uaiMessageText}>{title}</Text>
      </Box>
      <TouchableOpacity style={styles.skipWrapper} onPress={secondaryCallback} testID='btn_uaiSkip'>
        <Text style={styles.skipText} color="light.learnMoreBorder">
          {secondaryCallbackText}
        </Text>
      </TouchableOpacity>
      {primaryCallbackText && primaryCallback && (
        <TouchableOpacity style={styles.addNowWrapper} onPress={primaryCallback} testID='btn_uaiPrimary'>
          <Box style={styles.addNowCTAWrapper} backgroundColor="light.greenText">
            <Text style={styles.addNowCTAText} color="light.white">
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
    marginTop: hp(20),
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  uaiMessageWrapper: {
    width: '60%',
  },
  uaiMessageText: {
    color: '#24312E',
    fontSize: 12,
    fontWeight: 'bold',
    width: 170,
  },
  skipWrapper: {
    width: '20%',
    alignItems: 'center',
  },
  skipText: {
    fontWeight: '500',
    fontSize: 12,
  },
  addNowWrapper: {
    width: '20%',
  },
  addNowCTAWrapper: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  addNowCTAText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
export default UAIView;
