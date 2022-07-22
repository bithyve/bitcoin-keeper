import { Alert, Dimensions, Platform, StyleSheet, TextInput, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Ndef, NfcTech } from 'react-native-nfc-manager';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { SignerType, TxPriority } from 'src/core/wallets/enums';

import { CKTapCard } from 'cktap-protocol-react-native';
import KeeperModal from 'src/components/KeeperModal';
import NFC from 'src/core/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { cloneDeep } from 'lodash';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { sendPhaseThree } from 'src/store/sagaActions/send_and_receive';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';

const { width } = Dimensions.get('screen');

const InputCvc = ({ textRef }) => {
  return (
    <TextInput
      style={styles.input}
      secureTextEntry={true}
      onChangeText={(text) => {
        textRef.current = text;
      }}
    />
  );
};

const SigningController = ({ nfcVisible, setNfcVisible }) => {
  const navigation = useNavigation();
  const serializedPSBTEnvelop = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelop
  );
  const [cvcModalVisible, setCvcModalVisible] = React.useState(false);

  const textRef = useRef(null);
  const dispatch = useDispatch();

  const { useQuery } = useContext(RealmWrapperContext);
  const defaultVault: Vault = useQuery(RealmSchema.Vault).map(getJSONFromRealmObject)[0];
  const card = React.useRef(new CKTapCard()).current;

  const withModal = (callback) => {
    return Platform.select({
      android: async () => {
        setNfcVisible(true);
        const resp = await card.nfcWrapper(callback);
        setNfcVisible(false);
        return resp;
      },
      ios: async () => card.nfcWrapper(callback),
    });
  };

  const signTransaction = useCallback(async () => {
    if (serializedPSBTEnvelop) {
      const copySerializedPSBTEnvelop = cloneDeep(serializedPSBTEnvelop);
      const { signerType, inputsToSign } = copySerializedPSBTEnvelop.signingDataHW[0];
      switch (signerType) {
        case SignerType.TAPSIGNER: {
          setCvcModalVisible(false);
          withModal(async () => {
            try {
              const status = await card.first_look();
              if (status.path) {
                for (let i = 0; i < inputsToSign.length; i++) {
                  const input = inputsToSign[i];
                  const digest = Buffer.from(input.digest, 'hex');
                  const subpath = input.subPath;
                  const signature = await card.sign_digest(textRef.current, 0, digest, subpath);
                  input.signature = signature.slice(1).toString('hex');
                }
                dispatch(
                  sendPhaseThree({
                    wallet: defaultVault,
                    txnPriority: TxPriority.LOW,
                    serializedPSBTEnvelop: copySerializedPSBTEnvelop,
                  })
                );
                navigation.dispatch(CommonActions.navigate({ name: 'VaultDetails' }));
              } else {
                Alert.alert('Please setup card before signing!');
              }
            } catch (e) {
              console.log(e);
            }
          })().catch(console.log);
        }
        case SignerType.COLDCARD: {
          try {
            setNfcVisible(true);
            const enc = Ndef.encodeMessage([Ndef.textRecord(serializedPSBTEnvelop.serializedPSBT)]);
            const { data } = await NFC.send([NfcTech.Ndef], enc);
            setNfcVisible(false);
          } catch (error) {
            setNfcVisible(false);
            console.log({ error });
          }
        }
        default: {
          break;
        }
      }
    }
  }, [serializedPSBTEnvelop]);

  useEffect(() => {
    if (serializedPSBTEnvelop) {
      const { signerType } = serializedPSBTEnvelop.signingDataHW[0];
      if (signerType === SignerType.TAPSIGNER) {
        setCvcModalVisible(true);
      } else if (signerType === SignerType.COLDCARD) {
        signTransaction();
      }
    }
  }, [serializedPSBTEnvelop]);

  return (
    <View>
      <KeeperModal
        visible={cvcModalVisible}
        close={() => setCvcModalVisible(false)}
        title={'Enter CVC'}
        subTitle={'Please enter the 6-32 digit CVC of the TapSigner'}
        modalBackground={['#00836A', '#073E39']}
        buttonBackground={['#FFFFFF', '#80A8A1']}
        buttonText={'SIGN'}
        buttonTextColor={'#073E39'}
        buttonCallback={signTransaction}
        textColor={'#FFF'}
        Content={() => InputCvc({ textRef })}
      />
      <NfcPrompt visible={nfcVisible} />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    paddingHorizontal: 20,
    marginVertical: '3%',
    width: width * 0.7,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#f0e7dd',
    letterSpacing: 5,
  },
});

export default SigningController;
