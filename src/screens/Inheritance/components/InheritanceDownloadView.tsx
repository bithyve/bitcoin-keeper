import React from 'react';
import { Box, Pressable } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import DownloadIcon from 'src/assets/images/download.svg';
import ViewIcon from 'src/assets/images/icon_show.svg';
import { hp } from 'src/common/data/responsiveness/responsive';
import TickIcon from 'src/assets/images/icon_tick.svg';

function InheritanceDownloadView(props) {
  return (
    <Box style={styles.wrapper}>
      <Box style={styles.iconWrapper}>{props.icon}</Box>
      <Box style={styles.titleWrapper}>
        <Text color="light.textWallet" style={styles.titleText}>
          {props.title}
        </Text>
        <Text color="light.secondaryText" style={styles.subTitleText}>
          {props.subTitle}
        </Text>
      </Box>
      <Box style={styles.btnWrapper}>
        {props.isDownload ? (
          <Box style={styles.downloadBtnWrapper}>
            <TouchableOpacity style={styles.downloadBtn} onPress={props.previewPDF}>
              <ViewIcon />
              {/* <Text style={styles.downloadBtnText}>&nbsp;&nbsp;Download</Text> */}
            </TouchableOpacity>
            <TouchableOpacity style={styles.downloadBtn} onPress={props.downloadPDF}>
              <DownloadIcon />
              {/* <Text style={styles.downloadBtnText}>&nbsp;&nbsp;Download</Text> */}
            </TouchableOpacity>
          </Box>
        ) : (
          <Box>
            {props.isSetupDone ? (
              <Pressable style={styles.successTickBtn} onPress={props.onPress}>
                <TickIcon />
              </Pressable>

            ) : (
              <TouchableOpacity style={styles.setupBtn} onPress={props.onPress}>
                <Text style={styles.setupBtnText}>&nbsp;&nbsp;Setup</Text>
              </TouchableOpacity>
            )}
          </Box>
        )}
      </Box>
    </Box >
  );
}
const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#FDF7F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: hp(15),
  },
  downloadBtnWrapper: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  downloadBtn: {
    width: '45%',
    padding: 5,
    paddingVertical: 10,
    backgroundColor: '#E3BE96',
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
    alignSelf: 'center'
  },
  setupBtn: {
    flexDirection: 'row',
    backgroundColor: '#E3BE96',
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  setupBtnText: {
    color: '#725436',
    fontSize: 12,
  },
  iconWrapper: {
    width: '13%',
  },
  titleWrapper: {
    width: '57%',
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
