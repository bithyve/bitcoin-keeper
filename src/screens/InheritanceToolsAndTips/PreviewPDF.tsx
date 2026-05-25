import { Dimensions, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import Pdf from 'react-native-pdf';
import { Box, useColorMode } from '@gluestack-ui/themed-native-base';
import Share from 'react-native-share';
import ReactNativeBlobUtil from 'react-native-blob-util';

import DownloadIcon from 'src/assets/images/download.svg';
import ScreenWrapper from 'src/components/ScreenWrapper';
import Text from 'src/components/KeeperText';
import WalletHeader from 'src/components/WalletHeader';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function PreviewPDF({ route }: any) {
  const { colorMode } = useColorMode();
  const { source } = route.params;
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const DownloadPDF = async () => {
    if (Platform.OS === 'android') {
      try {
        await ReactNativeBlobUtil.android.actionViewIntent(source, 'application/pdf');
      } catch (err) {
        console.log('err:', err);
      }
    } else {
      Share.open({
        url: source,
        type: 'application/pdf',
        excludedActivityTypes: [
          'copyToPasteBoard',
          'markupAsPDF',
          'addToReadingList',
          'assignToContact',
          'mail',
          'default',
          'message',
          'postToFacebook',
          'print',
          'saveToCameraRoll',
        ],
      }).catch((err) => {
        console.log('err:', err);
      });
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader
        rightComponent={
          <TouchableOpacity
            onPress={() => DownloadPDF()}
            style={{ alignSelf: 'flex-end', marginBottom: 5 }}
          >
            <Box style={styles.downloadBtn} backgroundColor={`${colorMode}.DarkSlateGray`}>
              <DownloadIcon />
              <Text style={styles.downloadBtnText} color={`${colorMode}.secondaryCreamWhite`}>
                &nbsp;&nbsp;{common.Download}
              </Text>
            </Box>
          </TouchableOpacity>
        }
      />

      <Box style={styles.container}>
        {Platform.OS == 'android' ? (
          <Pdf trustAllCerts={false} source={{ uri: source }} style={styles.pdf} />
        ) : (
          <Box style={styles.infoContainer}>
            <Text>Preview is unavailable</Text>
            <Text>Download the pdf to view</Text>
          </Box>
        )}
      </Box>
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  container: {
    marginTop: hp(20),
    flex: 1,
    alignItems: 'center',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  downloadBtn: {
    flexDirection: 'row',
    padding: 5,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  downloadBtnText: {
    fontSize: 14,
  },
  infoContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PreviewPDF;
