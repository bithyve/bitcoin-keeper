import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { View, Box, useColorMode } from 'native-base';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import ActivityIndicatorView from './AppActivityIndicator/ActivityIndicatorView';

function Buttons({
  primaryText = '',
  secondaryText = '',
  primaryCallback = () => {},
  secondaryCallback = () => {},
  primaryDisable = false,
  secondaryDisable = false,
  primaryLoading = false,
  paddingHorizontal = wp(40),
  activeOpacity = 0.5,
}) {
  const { colorMode } = useColorMode();
  const onPrimaryInteraction = () => {
    primaryCallback();
  };

  if (primaryLoading) {
    return <ActivityIndicatorView visible={primaryLoading} />;
  }
  const getPrimaryButton = () => (
    <TouchableOpacity
      onPress={onPrimaryInteraction}
      disabled={primaryDisable}
      activeOpacity={activeOpacity}
      testID="btn_primaryText"
    >
      <Box
        style={[styles.createBtn, { opacity: primaryDisable ? 0.5 : 1, paddingHorizontal }]}
        backgroundColor={`${colorMode}.greenButtonBackground`}
      >
        <Text numberOfLines={1} style={styles.btnText} color={`${colorMode}.buttonText`} bold>
          {primaryText}
        </Text>
      </Box>
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      {secondaryText !== '' && (
        <TouchableOpacity
          style={[
            styles.cancelBtn,
            {
              opacity: secondaryDisable ? 0.5 : 1,
              marginRight: primaryText ? wp(20) : 0,
            },
          ]}
          onPress={secondaryCallback}
          disabled={secondaryDisable}
          activeOpacity={0.5}
          testID="btn_secondaryText"
        >
          <Text numberOfLines={1} medium style={styles.btnText} color={`${colorMode}.greenText`}>
            {secondaryText}
          </Text>
        </TouchableOpacity>
      )}
      {primaryText ? getPrimaryButton() : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  createBtn: {
    paddingVertical: hp(15),
    borderRadius: 10,
  },
  cancelBtn: {
    borderRadius: 10,
  },
  btnText: {
    fontSize: 14,
    letterSpacing: 0.84,
  },
});
export default Buttons;
