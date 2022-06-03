import { Platform, StyleSheet, Text } from 'react-native';

import { CKTapCard } from 'coinkite-tap-protocol-js';
import { CommonActions } from '@react-navigation/native';
import NfcManager from 'react-native-nfc-manager';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React from 'react';
import { RealmContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { SafeAreaView } from 'react-native-safe-area-context';
import realm from 'src/storage/realm/realm';

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
  await NfcManager.setAlertMessage('Adding Tapsigner');
  // await card.first_look();
  const status = await card.first_look();
  // await card.certificate_check();
  // if (card._certs_checked) {
  //   await NfcManager.setAlertMessage('Card is Legit');
  // }
  if (!status.path) {
    await card.setup('123123');
  }
  return {
    type: 'Tapsigner',
    signerName: 'GTap',
    signerId: card.card_ident,
    path: card.path,
    xpub: await card.get_xpub('123123'),
  };
};

const AddTapsigner = ({ navigation }) => {
  const [visible, setVisible] = React.useState('');
  const card = React.useRef(new CKTapCard()).current;
  const { useRealm } = RealmContext;
  const realm = useRealm();

  // Needs cleaning and re-architecting this
  const callback = async () => {
    const _addSigner = () => addTapsigner(card);
    const tapsigner = await card.nfcWrapper(_addSigner);
    realm.write(() => {
      realm.create(RealmSchema.VaultSigner, tapsigner);
    });
    navigation.dispatch(CommonActions.goBack());
  };

  React.useEffect(() => {
    platformWrapper({ setVisible, callback })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
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
