import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { CKTapCard } from 'cktap-protocol-react-native';
import NfcManager from 'react-native-nfc-manager';
import { SafeAreaView } from 'react-native-safe-area-context';

// Just testing things out here.
const TestingScreen = () => {
  const [status, setStatus] = useState('');
  const card = useRef(new CKTapCard()).current;

  const addTapsigner = async () => {
    await NfcManager.setAlertMessage('Checking card status');
    const status = await card.first_look();
    await card.certificate_check();
    if (card._certs_checked) {
      await NfcManager.setAlertMessage('Card is Legit');
    }
    if (status.path) {
      await NfcManager.setAlertMessage('Card is picked');
    } else {
      await card.setup('123123');
    }
    return card.get_xpub('123123');
  };

  useEffect(() => {
    card.nfcWrapper(addTapsigner).then((res: any) => {
      setStatus(card);
      console.log(res);
    });
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <Text>{JSON.stringify(status)}</Text>
    </SafeAreaView>
  );
};

export default TestingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
