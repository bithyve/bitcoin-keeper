import React from 'react';
import { StyleSheet, TouchableOpacity, Vibration } from 'react-native';
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
  width = null,
  fullWidth = false,
}) {
  const { colorMode } = useColorMode();

  const onPrimaryInteraction = () => {
    primaryCallback();
  };

  const onSecondaryInteraction = () => {
    secondaryCallback();
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
      style={{
        width: fullWidth ? '100%' : width,
      }}
    >
      <Box
        style={[
          styles.createBtn,
          {
            opacity: primaryDisable ? 0.5 : 1,
            paddingHorizontal: width ? 0 : paddingHorizontal,
            width,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
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
          onPress={onSecondaryInteraction}
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
