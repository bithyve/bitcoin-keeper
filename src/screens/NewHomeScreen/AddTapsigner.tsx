import { Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text, VStack } from 'native-base';

import { CKTapCard } from 'coinkite-tap-protocol-js';
import { CommonActions } from '@react-navigation/native';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React from 'react';
import { RealmContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { SafeAreaView } from 'react-native-safe-area-context';

const Setup = ({ status, cvc, setCVC, setup, associate }) => {
  if (!status) return null;
  if (status.error) {
    return (
      <Text
        color={'warning.700'}
        fontSize={18}
        fontFamily={'body'}
        fontWeight={'300'}
        letterSpacing={1}
        textAlign={'center'}
      >
        {`${status.error}`}
      </Text>
    );
  }
  return !status.path ? (
    <VStack>
      <TextInput
        value={cvc}
        onChangeText={setCVC}
        style={styles.input}
        keyboardType={'number-pad'}
        placeholder={'cvc'}
      />
      <TouchableOpacity style={styles.status} onPress={setup}>
        <Text
          color={'light.lightBlack'}
          fontSize={20}
          fontFamily={'body'}
          fontWeight={'200'}
          letterSpacing={1}
        >
          {`Setup and associate`}
        </Text>
      </TouchableOpacity>
    </VStack>
  ) : (
    <>
      <TextInput
        value={cvc}
        onChangeText={setCVC}
        style={styles.input}
        keyboardType={'number-pad'}
        placeholder={'cvc'}
      />
      <TouchableOpacity style={styles.status} onPress={associate}>
        <Text
          color={'light.lightBlack'}
          fontSize={20}
          fontFamily={'body'}
          fontWeight={'200'}
          letterSpacing={1}
        >
          {`Associate`}
        </Text>
      </TouchableOpacity>
    </>
  );
};

const CardStatus = ({ status, checkStatus }) => {
  return !status ? (
    <TouchableOpacity style={styles.status} onPress={checkStatus}>
      <Text
        color={'light.lightBlack'}
        fontSize={20}
        fontFamily={'body'}
        fontWeight={'200'}
        letterSpacing={1}
      >
        Card Status
      </Text>
    </TouchableOpacity>
  ) : (
    <>
      <Text
        color={status._certs_checked ? 'success.600' : 'warning.700'}
        fontSize={18}
        fontFamily={'body'}
        fontWeight={'300'}
        letterSpacing={1}
        textAlign={'center'}
      >
        {status._certs_checked ? 'Card is Legit' : 'Card is Fake'}
      </Text>
      <Text
        fontSize={16}
        fontFamily={'body'}
        fontWeight={'200'}
        letterSpacing={1}
        textAlign={'center'}
      >
        {status.path ? 'Card has been picked\nReady to use!' : 'Card is yet to be set up'}
      </Text>
      <Text
        fontSize={18}
        fontFamily={'body'}
        fontWeight={'400'}
        letterSpacing={1}
        textAlign={'center'}
      >
        {`Card Ident: ${status.card_ident}`}
      </Text>
    </>
  );
};

const AddTapsigner = ({ navigation }) => {
  const [visible, setVisible] = React.useState(false);
  const [cvc, setCVC] = React.useState('');
  const [status, setStatus] = React.useState();
  const card = React.useRef(new CKTapCard()).current;
  const { useRealm } = RealmContext;
  const realm = useRealm();
  const withModal = (callback) => {
    return Platform.select({
      android: async () => {
        setVisible(true);
        const resp = await callback();
        setVisible(false);
        return resp;
      },
      ios: async () => callback(),
    });
  };

  const wrapper = async (callback) => {
    return await card.nfcWrapper(callback);
  };

  const _checkStatus = async () => {
    const status = await wrapper(async () => {
      await card.first_look();
      await card.certificate_check();
      return card;
    });
    setStatus(status);
  };

  const checkStatus = async () => {
    withModal(_checkStatus)();
  };

  const _setup = async () => {
    try {
      const tapsigner = await wrapper(async () => {
        await card.first_look();
        await card.setup(cvc);
        return card.first_look();
      });
      setStatus(tapsigner);
    } catch (e) {
      console.log(e);
      setStatus(e);
    }
  };

  const setup = () => {
    withModal(_setup)();
  };

  const associate = async () => {
    const xpub = await withModal(() => wrapper(async () => card.get_xpub(cvc)))();
    realm.write(() => {
      realm.create(RealmSchema.VaultSigner, {
        type: 'Tapsigner',
        signerName: 'GTap',
        signerId: card.card_ident,
        path: card.path,
        xpub,
      });
    });
    navigation.dispatch(CommonActions.goBack());
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text>{JSON.stringify(status)}</Text>
      <CardStatus status={status} checkStatus={checkStatus} />
      <Setup status={status} cvc={cvc} setCVC={setCVC} setup={setup} associate={associate} />
      <NfcPrompt visible={visible} />
    </SafeAreaView>
  );
};

export default AddTapsigner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  status: {
    alignItems: 'center',

    padding: 5,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    width: '60%',
    alignSelf: 'center',
  },
  input: {
    padding: 0,
    height: 30,
    width: '50%',
    textAlign: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
  },
});
