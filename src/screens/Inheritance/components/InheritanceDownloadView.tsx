import React from 'react';
import { Box, useColorMode, Pressable } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import ViewIcon from 'src/assets/images/icon_show.svg';
import { hp } from 'src/constants/responsive';
import TickIcon from 'src/assets/images/icon_tick.svg';

function InheritanceDownloadView(props) {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.wrapper} backgroundColor={`${colorMode}.seashellWhite`}>
      <Box style={styles.iconWrapper}>{props.icon}</Box>
      <Box style={styles.titleWrapper}>
        <Text color={`${colorMode}.primaryText`} style={styles.titleText}>
          {props.title}
        </Text>
        <Text color={`${colorMode}.secondaryText`} style={styles.subTitleText}>
          {props.subTitle}
        </Text>
      </Box>
      <Box style={styles.btnWrapper}>
        {props.isDownload ? (
          <TouchableOpacity onPress={props.previewPDF}>
            <Box style={styles.downloadBtn} backgroundColor={`${colorMode}.yellowButtonBackground`}>
              <Text style={styles.setupBtnText} color={`${colorMode}.yellowButtonTextColor`}>
                View&nbsp;
              </Text>
              <ViewIcon />
            </Box>
          </TouchableOpacity>
        ) : props.disableCallback ? null : (
          <Box>
            {props.isSetupDone ? (
              <Pressable style={styles.successTickBtn} onPress={props.onPress}>
                <TickIcon />
              </Pressable>
            ) : (
              <TouchableOpacity onPress={props.onPress}>
                <Box
                  style={styles.setupBtn}
                  backgroundColor={`${colorMode}.yellowButtonBackground`}
                >
                  <Text style={styles.setupBtnText} color={`${colorMode}.yellowButtonTextColor`}>
                    &nbsp;&nbsp;Setup
                  </Text>
                </Box>
              </TouchableOpacity>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    flexDirection: 'row',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: hp(15),
  },
  downloadBtn: {
    flexDirection: 'row',
    width: '100%',
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  successTickBtn: {
    width: '45%',
    padding: 5,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  setupBtn: {
    flexDirection: 'row',
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  setupBtnText: {
    fontSize: 14,
  },
  iconWrapper: {
    width: '13%',
  },
  titleWrapper: {
    width: '57%',
    flex: 1,
  },
  btnWrapper: {
    width: '30%',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.8,
  },
  subTitleText: {
    fontSize: 12,
    letterSpacing: 0.8,
    width: '96%',
  },
});
export default InheritanceDownloadView;
