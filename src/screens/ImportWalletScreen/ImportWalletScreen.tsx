import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
// libraries
import { Box, View } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import { QRreader } from 'react-native-qr-decode-image-camera';

import Colors from 'src/theme/Colors';
import Fonts from 'src/common/Fonts';
import HeaderTitle from 'src/components/HeaderTitle';
import { LocalizationContext } from 'src/common/content/LocContext';
import Note from 'src/components/Note/Note';
import { RNCamera } from 'react-native-camera';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { ScaledSheet } from 'react-native-size-matters';
import ScreenWrapper from 'src/components/ScreenWrapper';
// components
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import UploadImage from 'src/components/UploadImage';
import useToastMessage from 'src/hooks/useToastMessage';
import CameraUnauthorized from 'src/components/CameraUnauthorized';

function ImportWalletScreen({ route }) {
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const { useQuery } = useContext(RealmWrapperContext);

  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { home } = translations;

  const handleChooseImage = () => {
    // const options = {
    //   quality: 1.0,
    //   maxWidth: 500,
    //   maxHeight: 500,
    //   storageOptions: {
    //     skipBackup: true,
    //   },
    //   mediaType: 'photo',
    // } as ImageLibraryOptions;

    // launchImageLibrary(options, async (response) => {
    //   if (response.didCancel) {
    //     showToast('Camera device has been cancled');
    //   } else if (response.errorCode === 'camera_unavailable') {
    //     showToast('Camera not available on device');
    //   } else if (response.errorCode === 'permission') {
    //     showToast('Permission not satisfied');
    //   } else if (response.errorCode === 'others') {
    //     showToast(response.errorMessage);
    //   } else {
    //     QRreader(response.assets[0].uri)
    //       .then((data) => {
    //         handleTextChange(data);
    //       })
    //       .catch((err) => {
    //         showToast('Invalid or No related QR code');
    //       });
    //   }
    // });

    navigation.navigate('ImportWalletDetails');
  };

  return (
    <ScreenWrapper backgroundColor="light.mainBackground">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.scrollViewWrapper}
      >
        <HeaderTitle
          title={home.ImportWallet}
          subtitle="Name and description for the wallet"
          headerTitleColor={Colors.TropicalRainForest}
          paddingTop={hp(5)}
        />
        <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
          <Box>
            <Box style={styles.qrcontainer}>
              <RNCamera
                style={styles.cameraView}
                captureAudio={false}
                onBarCodeRead={(data) => {
                  // handleTextChange(data.data);
                }}
                notAuthorizedView={<CameraUnauthorized />}
              />
            </Box>
            {/* Upload Image */}

            <UploadImage onPress={handleChooseImage} />

            {/* Note */}
            <Box style={styles.noteWrapper} backgroundColor="light.secondaryBackground">
              <Note
                title={common.note}
                subtitle={'Make sure that the QR is well aligned, focused and visible as a whole'}
                subtitleColor="GreyText"
              />
            </Box>

            <View style={styles.dotContainer}>
              {[1, 2, 3].map((item, index) => {
                return (
                  <View
                    key={index}
                    style={0 == index ? styles.selectedDot : styles.unSelectedDot}
                  />
                );
              })}
            </View>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = ScaledSheet.create({
  linearGradient: {
    borderRadius: 6,
    marginTop: hp(3),
  },
  cardContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 12,
    letterSpacing: '0.24@s',
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: '0.20@s',
  },
  qrContainer: {
    alignSelf: 'center',
    marginVertical: hp(40),
    flex: 1,
  },
  scrollViewWrapper: {
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    marginTop: hp(10),
    marginHorizontal: hp(5),
    width: '98%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  textInput: {
    width: '100%',
    backgroundColor: Colors.Isabelline,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 15,
    fontFamily: Fonts.RobotoCondensedRegular,
    opacity: 0.5,
  },
  cameraView: {
    height: hp(250),
    width: wp(375),
  },
  qrcontainer: {
    overflow: 'hidden',
    borderRadius: 10,
    marginVertical: hp(25),
    alignItems: 'center',
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(100),
    width: wp(330),
    borderRadius: hp(10),
    marginHorizontal: wp(12),
    paddingHorizontal: wp(25),
    marginTop: hp(5),
  },
  buttonBackground: {
    backgroundColor: '#FAC48B',
    width: 40,
    height: 40,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteWrapper: {
    marginTop: hp(35),
    // position: 'absolute',
    // bottom: windowHeight > 680 ? hp(20) : hp(8),
    width: '100%',
  },
  sendToWalletWrapper: {
    marginTop: windowHeight > 680 ? hp(20) : hp(10),
  },
  dotContainer: {
    flexDirection: 'row',
    marginTop: hp(30),
  },
  selectedDot: {
    width: 25,
    height: 5,
    borderRadius: 5,
    backgroundColor: Colors.DimGray,
    marginEnd: 5,
  },
  unSelectedDot: {
    width: 6,
    height: 5,
    borderRadius: 5,
    backgroundColor: Colors.GrayX11,
    marginEnd: 5,
  },
});
export default ImportWalletScreen;
