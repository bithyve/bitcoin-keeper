import React from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { hp, wp } from 'src/constants/responsive';

function UAIView({ title, subTitle, icon, primaryCallback }) {
  const { colorMode } = useColorMode();

  return (
    <Box style={styles.container}>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={primaryCallback}
        testID="btn_uaiPrimary"
      >
        <Box style={styles.contentContainer}>
          <Box style={styles.iconCtr} backgroundColor={`${colorMode}.pantoneGreen`}>
            {icon}
          </Box>
          <Box style={styles.messageContainer} testID="btn_uaiTitleText">
            <Text style={styles.titleText} color={`${colorMode}.black`} medium numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.subtitleText} color={`${colorMode}.primaryText`} numberOfLines={2}>
              {subTitle}
            </Text>
          </Box>
        </Box>
      </TouchableOpacity>
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
    paddingHorizontal: wp(20),
    paddingVertical: hp(10),
    width: '100%',
  },
  messageContainer: {
    flex: 1,
    marginRight: wp(10),
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 15,
    marginBottom: hp(4),
  },
  subtitleText: {
    fontSize: 12,
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
  iconCtr: {
    height: hp(39),
    width: wp(39),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    marginRight: wp(15),
  },
});

export default UAIView;
