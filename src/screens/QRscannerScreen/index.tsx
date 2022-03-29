import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import QRscanner from 'src/components/QRscanner';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButtonWhiteIcon from 'src/assets/images/svgs/backWhite.svg';
import { useNavigation } from '@react-navigation/native';

const QRscannerScreen = () => {
  const navigatoin = useNavigation();
  const [qrData, setQrData] = useState();

  useEffect(() => {
    if (qrData) {
      Alert.alert(qrData); // remove alert after logic is integrated
      //logc with qrData here
      navigatoin.goBack();
    }
  }, [qrData]);

  return (
    <SafeAreaView style={styles.contentContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigatoin.goBack()}>
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
