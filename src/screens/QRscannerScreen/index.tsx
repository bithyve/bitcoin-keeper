import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import QRscanner from 'src/components/QRscanner';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButtonWhiteIcon from 'src/assets/images/svgs/backWhite.svg';
import { useNavigation, useRoute } from '@react-navigation/native';

const QRscannerScreen = ({ route }) => {
  const navigation = useNavigation();
  const [qrData, setQrData] = useState();
  const processQR  = route.params?.processQR

  useEffect(() => {
    if (qrData) {
      if(processQR) processQR(qrData)
      navigation.goBack();
    }
  }, [qrData]);

  return (
    <SafeAreaView style={styles.contentContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <BackButtonWhiteIcon />
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={styles.text}>Scan a QR</Text>
        <Text style={styles.subText}>Lorem ipsum dolor sit amet</Text>
      </View>
      <QRscanner qrData={qrData} setQrData={setQrData} />
    </SafeAreaView>
  );
};

export default QRscannerScreen;

const styles = StyleSheet.create({
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
    fontSize: 20,
    color: '#FAFCFC',
  },
  subText: {
    fontSize: 12,
    color: '#FAFCFC',
  },
  textContainer: {
    margin: 20,
    marginBottom: 100,
  },
});
