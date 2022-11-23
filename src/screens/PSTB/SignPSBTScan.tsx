import { StyleSheet } from 'react-native';
import { Box } from 'native-base';
import React, { useContext } from 'react';
import { RNCamera } from 'react-native-camera';
// components
import HeaderTitle from 'src/components/HeaderTitle';
import Note from 'src/components/Note/Note';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { LocalizationContext } from 'src/common/content/LocContext';

const SignPSBTScan = () => {

  const { translations } = useContext(LocalizationContext);
  const common = translations['common'];

  return (
    <ScreenWrapper>
      <HeaderTitle
        title={'Sign PSBT'}
        subtitle={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'}
        paddingTop={hp(15)}
        paddingLeft={10}
      />
      <Box style={styles.qrcontainer}>
        <RNCamera
          style={styles.cameraView}
          captureAudio={false}
          onBarCodeRead={(data) => {
            console.log(data); // camera read this string
          }}
        />
      </Box>

      <Box style={styles.Note}>
        <Note
          title={common.note}
          subtitle={
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis'
          }
          subtitleColor={'GreyText'}
        />
      </Box>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  cameraView: {
    height: hp(355),
    width: wp(355),
  },
  qrcontainer: {
    overflow: 'hidden',
    borderRadius: 10,
    marginTop: hp(58),
  },
  Note: {
    position: 'absolute',
    bottom: hp(40),
    width: '90%',
    marginLeft: 30
  }
});
export default SignPSBTScan;
