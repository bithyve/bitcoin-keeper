import React, { useContext } from 'react';
import { Box, Text } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { LocalizationContext } from 'src/common/content/LocContext';
import Illustration from 'src/assets/images/illustration.svg';
import CustomGreenButton from '../CustomButton/CustomGreenButton';

function BackupSuccessful(props) {
  const { translations } = useContext(LocalizationContext);
  const { BackupWallet } = translations;

  return (
    <Box style={styles.wrapper}>
      <TouchableOpacity onPress={() => props.closeBottomSheet()}>
        <Box style={styles.closeBtnWrapper}>
          <Text style={styles.closeText}>X</Text>
        </Box>
      </TouchableOpacity>
      <Box style={styles.paragraphWrapper}>
        <Text fontSize={19} color="light.primaryText" fontFamily="heading">
          {props.title}
        </Text>
        <Text fontSize={13} color="light.primaryText" fontFamily="body">
          {props.subTitle}
        </Text>
      </Box>
      <Box style={styles.illustrationWrapper}>
        <Illustration />
      </Box>
      <Box style={styles.paragraphWrapper}>
        <Text>{props.paragraph}</Text>
      </Box>
      <Box style={styles.buttonWrapper}>
        <CustomGreenButton
          onPress={() => {
            props.confirmBtnPress();
          }}
          value={BackupWallet.home}
        />
      </Box>
    </Box>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#F7F2EC',
    borderRadius: 5,
  },
  closeBtnWrapper: {
    margin: 15,
    backgroundColor: '#E3BE96',
    borderRadius: 35,
    height: 35,
    width: 35,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  closeText: {
    fontSize: 18,
    color: '#FFF',
  },
  illustrationWrapper: {
    alignItems: 'center',
    marginVertical: 15,
  },
  paragraphWrapper: {
    padding: 30,
  },
  buttonWrapper: {
    alignItems: 'flex-end',
    paddingHorizontal: 25,
    marginBottom: 25,
  },
});
export default BackupSuccessful;
