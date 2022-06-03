import { Platform, StyleSheet, Text } from 'react-native';

import { CKTapCard } from 'coinkite-tap-protocol-js';
import NfcManager from 'react-native-nfc-manager';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const platformWrapper = ({ setVisible, callback }) => {
  return Platform.select({
    android: async () => {
      setVisible(true);
      await callback();
      setVisible(false);
    },
    ios: () => callback(),
  });
};

const addTapsigner = async (card) => {
  await NfcManager.setAlertMessage('Checking card status');
  await card.first_look();
  // const status = await card.first_look();
  // await card.certificate_check();
  // if (card._certs_checked) {
  //   await NfcManager.setAlertMessage('Card is Legit');
  // }
  // if (status.path) {
  //   await NfcManager.setAlertMessage('Card is picked');
  // } else {
  //   await card.setup('123123');
  // }
  return { id: card.card_ident, path: card.path, xpub: await card.get_xpub('123123') };
};

const AddTapsigner = () => {
  const [status, setStatus] = React.useState('');
  const [visible, setVisible] = React.useState('');
  const card = React.useRef(new CKTapCard()).current;

  const callback = async () => {
    const _addSigner = () => addTapsigner(card);
    const tapsigner = await card.nfcWrapper(_addSigner);
    setStatus(tapsigner);
  };

  React.useEffect(() => {
    platformWrapper({ setVisible, callback })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text>{JSON.stringify(status)}</Text>
      <NfcPrompt visible={visible} />
    </SafeAreaView>
  );
};

export default AddTapsigner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
