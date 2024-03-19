import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Box, useColorMode, View } from 'native-base';
import React, { useContext } from 'react';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import { QRreader } from 'react-native-qr-decode-image-camera';

import Colors from 'src/theme/Colors';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Note from 'src/components/Note/Note';
import { RNCamera } from 'react-native-camera';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import UploadImage from 'src/components/UploadImage';
import useToastMessage from 'src/hooks/useToastMessage';
import CameraUnauthorized from 'src/components/CameraUnauthorized';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { WalletType } from 'src/services/wallets/enums';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useQuery } from '@realm/react';
import WalletUtilities from 'src/services/wallets/operations/utils';

function ImportWalletScreen() {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();

  const { translations } = useContext(LocalizationContext);
  const { common, importWallet, wallet } = translations;
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet).map(getJSONFromRealmObject) || [];

  const handleChooseImage = () => {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: {
        skipBackup: true,
      },
      mediaType: 'photo',
    } as ImageLibraryOptions;

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        showToast('Camera device has been canceled', <ToastErrorIcon />);
      } else if (response.errorCode === 'camera_unavailable') {
        showToast('Camera not available on device', <ToastErrorIcon />);
      } else if (response.errorCode === 'permission') {
        showToast('Permission not satisfied', <ToastErrorIcon />);
      } else if (response.errorCode === 'others') {
        showToast(response.errorMessage, <ToastErrorIcon />);
      } else {
        QRreader(response.assets[0].uri)
          .then((data) => {
            initiateWalletImport(data);
          })
          .catch((err) => {
            showToast('Invalid or No related QR code');
          });
      }
    });
  };

  const initiateWalletImport = (data: string) => {
    try {
      const importedKey = data.trim();
      const importedKeyDetails = WalletUtilities.getImportedKeyDetails(importedKey);
      navigation.navigate('ImportWalletDetails', {
        importedKey,
        importedKeyDetails,
        type: WalletType.IMPORTED,
        name: `Wallet ${wallets.length + 1}`,
        description: importedKeyDetails.watchOnly ? 'Watch Only' : 'Imported Wallet',
      });
    } catch (err) {
      showToast('Invalid Import Key');
    }
  };

  // TODO: add learn more modal
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.scrollViewWrapper}
      >
        <KeeperHeader
          title={wallet.ImportWallet}
          subtitle={importWallet.usingWalletConfigurationFile}
          learnMore
          learnBackgroundColor={`${colorMode}.BrownNeedHelp`}
          learnTextColor={`${colorMode}.white`}
        />
        <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
          <Box>
            <Box style={styles.qrcontainer}>
              <RNCamera
                style={styles.cameraView}
                captureAudio={false}
                onBarCodeRead={(data) => {
                  initiateWalletImport(data.data);
                }}
                notAuthorizedView={<CameraUnauthorized />}
              />
            </Box>
            {/* Upload Image */}

            <UploadImage onPress={handleChooseImage} />

            {/* Note */}
            <Box style={styles.noteWrapper} backgroundColor={`${colorMode}.primaryBackground`}>
              <Note
                title={common.note}
                subtitle={importWallet.IWNoteDescription}
                subtitleColor="GreyText"
              />
            </Box>

            <View style={styles.dotContainer}>
              {[1, 2, 3].map((item, index) => (
                <View
                  key={item.toString()}
                  style={index === 0 ? styles.selectedDot : styles.unSelectedDot}
                />
              ))}
            </View>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 12,
    letterSpacing: 0.24,
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: 0.2,
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
