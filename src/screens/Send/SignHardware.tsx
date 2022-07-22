import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';

import Buttons from 'src/components/Buttons';
import NFC from 'src/core/services/nfc';
import { NfcTech } from 'react-native-nfc-manager';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import SigningController from './SigningController';
import { TxPriority } from 'src/core/wallets/enums';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { sendPhaseThree } from 'src/store/sagaActions/send_and_receive';
import { useDispatch } from 'react-redux';

const SignHardware = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { useQuery } = useContext(RealmWrapperContext);
  const defaultVault: Vault = useQuery(RealmSchema.Vault).map(getJSONFromRealmObject)[0];
  const [nfcVisible, setNfcVisible] = React.useState(false);

  const receiveAndBroadCast = async () => {
    setNfcVisible(true);
    const signedPSBT = await NFC.read(NfcTech.NfcV);
    setNfcVisible(false);
    const payload = {
      name: '',
      signature: '',
      psbt: '',
    };

    signedPSBT.forEach((record) => {
      if (record.data === 'Partly signed PSBT') {
        payload.name = record.data;
      }
      //   signature is of length 64 but 44 when base64 encoded
      else if (record.data.length === 44) {
        payload.signature = record.data;
      } else {
        payload.psbt = record.data;
      }
    });
    dispatch(
      sendPhaseThree({
        wallet: defaultVault,
        txnPriority: TxPriority.LOW,
        serializedPSBTEnvelop: { serializedPSBT: payload.psbt },
      })
    );
    navigation.dispatch(CommonActions.navigate({ name: 'VaultDetails' }));
  };
  return (
    <View style={styles.container}>
      <Buttons
        primaryDisable
        secondaryText="Receive from CC and Broadcast"
        secondaryCallback={receiveAndBroadCast}
      />
      <SigningController nfcVisible={nfcVisible} setNfcVisible={setNfcVisible} />
    </View>
  );
};

export default SignHardware;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 50,
  },
});
