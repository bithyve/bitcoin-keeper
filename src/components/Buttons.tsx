import React from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
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
  paddingVertical = hp(15),
  activeOpacity = 0.5,
  width = null,
  fullWidth = false,
  primaryBackgroundColor = null,
  primaryTextColor = null,
  secondaryTextColor = null,
  SecondaryIcon = null,
  LeftIcon = null,
  RightIcon = null,
  borderRadius = 10,
  primaryFontWeight = 'bold',
  disableNoOverlay = false,
  primaryBorderColor = null,
  border = 1,
}) {
  const { colorMode } = useColorMode();

  const onPrimaryInteraction = () => {
    if (!primaryDisable && !disableNoOverlay) {
      primaryCallback();
    }
  };

  const onSecondaryInteraction = () => {
    if (!secondaryDisable && !disableNoOverlay) {
      secondaryCallback();
    }
  };

  const getPrimaryButton = () => (
    <TouchableOpacity
      onPress={onPrimaryInteraction}
      disabled={primaryDisable || disableNoOverlay || primaryLoading}
      activeOpacity={activeOpacity}
      testID="btn_primaryText"
      style={{
        width: secondaryText ? (primaryLoading ? '100%' : width) : fullWidth ? '100%' : width,
      }}
    >
      <Box
        style={[
          styles.createBtn,
          {
            opacity: primaryDisable ? 0.5 : 1,
            paddingHorizontal: width ? 0 : paddingHorizontal,
            paddingVertical,
            width,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 8,
            borderRadius: borderRadius,
            borderWidth: border,
            borderColor: primaryBorderColor || 'transparent',
          },
        ]}
        backgroundColor={primaryBackgroundColor || `${colorMode}.greenButtonBackground`}
      >
        {primaryLoading ? (
          <ActivityIndicator
            testID="activityIndicator"
            size={hp(20)}
            animating
            color={primaryTextColor || `${colorMode}.buttonText`}
          />
        ) : (
          <>
            {LeftIcon && <LeftIcon />}
            <Text
              numberOfLines={1}
              style={styles.btnText}
              color={primaryTextColor || `${colorMode}.buttonText`}
              fontWeight={primaryFontWeight}
            >
              {primaryText}
            </Text>
            {RightIcon && <RightIcon />}
          </>
        )}
      </Box>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {secondaryText !== '' && !primaryLoading && (
        <TouchableOpacity
          style={[
            styles.cancelBtn,
            {
              opacity: secondaryDisable ? 0.5 : 1,
              marginRight: primaryText ? wp(20) : 0,
              borderRadius: borderRadius,
            },
          ]}
          onPress={onSecondaryInteraction}
          disabled={secondaryDisable || disableNoOverlay}
          activeOpacity={0.5}
          testID="btn_secondaryText"
        >
          <Box>{SecondaryIcon && SecondaryIcon}</Box>
          <Text
            numberOfLines={1}
            medium
            style={styles.btnText}
            color={secondaryTextColor || `${colorMode}.greenText`}
          >
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
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  btnText: {
    fontSize: 14,
  },
});

export default Buttons;
