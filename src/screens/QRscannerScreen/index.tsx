import React, { useState, useEffect } from 'react';

import { View, TouchableOpacity } from 'react-native';
import { Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import { RFValue } from 'react-native-responsive-fontsize';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import QRscanner from 'src/components/QRscanner';
import BackButtonWhiteIcon from 'src/assets/images/svgs/backWhite.svg';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

const QRscannerScreen = ({ route }) => {
  const navigation = useNavigation();
  const [qrData, setQrData] = useState();
  const processQR = route.params?.processQR

  useEffect(() => {
    if (qrData) {
      if (processQR) processQR(qrData)
      navigation.goBack();
    }
  }, [qrData]);

  return (
    <SafeAreaView style={styles.contentContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <BackButtonWhiteIcon />
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={styles.text}
          numberOfLines={1}
          color={'light.white'}
          fontFamily={'body'}
          fontWeight={'200'}>Scan a QR</Text>
        <Text
          style={styles.subText}
          numberOfLines={1}
          color={'light.white'}
          fontFamily={'body'}
          fontWeight={'100'}
        ></Text>
      </View>
      <QRscanner qrData={qrData} setQrData={setQrData} />
    </SafeAreaView>
  );
};

const styles = ScaledSheet.create({
  backButton: {
    color: 'white',
    margin: 20,
  },
  contentContainer: {
    justifyContent: 'space-between',
    backgroundColor: '#2F2F2F',
    flex: 1,
  },
  text: {
    fontSize: RFValue(22),
    lineHeight: '23@s',
    letterSpacing: '0.7@s',
    marginTop: hp(1),
  },
  subText: {
    fontSize: RFValue(12),
    lineHeight: '17@s',
    letterSpacing: '0.5@s',
    width: wp('60%'),
  },
  textContainer: {
    margin: 20,
    marginBottom: 100,
  },
});

export default QRscannerScreen;