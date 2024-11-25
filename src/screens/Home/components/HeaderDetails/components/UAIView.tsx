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
    <Box style={styles.container}>
      <Box style={styles.contentContainer}>
        <Box style={styles.messageContainer} testID="btn_uaiTitleText">
          <Text
            style={styles.titleText}
            color={`${colorMode}.BrownNeedHelp`}
            bold
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text
            style={styles.subtitleText}
            color={`${colorMode}.primaryText`}
            numberOfLines={2}
            medium
          >
            {subTitle}
          </Text>
        </Box>

        <Box style={styles.actionsContainer}>
          {secondaryCallbackText && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={secondaryCallback}
              testID="btn_uaiSkip"
            >
              <Text style={styles.secondaryButtonText} bold color={`${colorMode}.learnMoreBorder`}>
                {secondaryCallbackText.toUpperCase()}
              </Text>
            </TouchableOpacity>
          )}

          {primaryCallbackText && primaryCallback && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={primaryCallback}
              testID="btn_uaiPrimary"
            >
              <Box
                style={styles.primaryButtonInner}
                backgroundColor={`${colorMode}.modalGreenButton`}
              >
                <Text style={styles.primaryButtonText} bold color={`${colorMode}.buttonText`}>
                  {primaryCallbackText.toUpperCase()}
                </Text>
              </Box>
            </TouchableOpacity>
          )}
        </Box>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 60,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: '100%',
  },
  messageContainer: {
    flex: 1,
    marginRight: 15,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 12,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 25,
    gap: 18,
    flexShrink: 0,
  },
  secondaryButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 10,
  },
  primaryButton: {
    flexShrink: 0,
  },
  primaryButtonInner: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 10,
  },
});

export default UAIView;
