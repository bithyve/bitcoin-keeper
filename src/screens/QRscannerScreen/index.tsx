import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import QRscanner from 'src/components/QRscanner';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButtonIcon from 'src/assets/Images/svgs/back.svg';

const QRscannerScreen = () => {
  return (
    <SafeAreaView style={styles.contentContainer}>
      <TouchableOpacity style={styles.backButton}>
        <BackButtonIcon />
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={styles.text}>Scan a QR</Text>
        <Text style={styles.subText}>Lorem ipsum dolor sit amet</Text>
      </View>
      <QRscanner />
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
