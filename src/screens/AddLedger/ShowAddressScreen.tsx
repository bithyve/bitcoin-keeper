import { CommonActions, useNavigation } from '@react-navigation/native';
import { NetworkType, SignerType } from 'src/core/wallets/enums';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import config, { APP_STAGE } from 'src/core/config';

import AppClient from 'src/hardware/ledger';
import QRCode from 'react-native-qrcode-svg';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { generateMockExtendedKey } from 'src/core/wallets/factories/VaultFactory';
import { useDispatch } from 'react-redux';

const ShowAddressScreen = ({ transport }) => {
  const [error, setError] = useState(null);
  const [address, setAddress] = useState(null);

  const unmounted = useRef(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const _fetchAddress = async () => {
    if (unmounted.current) return;
    await fetchAddress();
  };

  useEffect(() => {
    _fetchAddress();
    return () => {
      unmounted.current = true;
    };
  }, []);

  const fetchAddress = async () => {
    try {
      // m / purpose' / coin_type' / account' / script_type' / change / address_index bip-48
      const app = new AppClient(transport);
      const path = "m/48'/1'/0'/1'"; // HD derivation path
      const xpub = await app.getExtendedPubkey(path);
      const masterfp = await app.getMasterFingerprint();
      if (unmounted.current) return;
      setAddress(xpub);
      const networkType =
        config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET;
      const network = WalletUtilities.getNetworkByType(networkType);

      const signer: VaultSigner = {
        signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
        type: SignerType.LEDGER,
        signerName: 'Nano X',
        xpub,
        xpubInfo: {
          derivationPath: path,
          xfp: masterfp,
        },
        lastHealthCheck: new Date(),
      };
      // const {
      //   xpub: xpub2,
      //   masterFingerprint: xfp,
      //   derivationPath,
      // } = generateMockExtendedKey(EntityKind.VAULT);
      dispatch(addSigningDevice(signer));
      navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
    } catch (error) {
      // in this case, user is likely not on Ethereum app
      if (unmounted) return;
      setError(error);
      return null;
    }
  };

  return (
    <View style={styles.ShowAddressScreen}>
      {!address ? (
        <>
          <Text style={styles.loading}>Fetching your xpub at path m/48'/1'/0'/1' ...</Text>
          {error ? (
            <Text style={styles.error}>
              A problem occurred, make sure to open the Bitcoin application on your Ledger Nano X. (
              {String((error && error.message) || error)})
            </Text>
          ) : null}
        </>
      ) : (
        <>
          <Text style={styles.title}>Ledger Live Bitcoin Account 1</Text>
          <QRCode value={address} size={300} />
          <Text style={styles.address}>{address}</Text>
        </>
      )}
    </View>
  );
};

export default ShowAddressScreen;

const styles = StyleSheet.create({
  ShowAddressScreen: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: '#c00',
    fontSize: 16,
  },
  loading: {
    color: '#999',
    fontSize: 16,
  },
  title: {
    fontSize: 22,
    marginBottom: 16,
  },
  address: {
    marginTop: 16,
    color: '#555',
    fontSize: 14,
  },
});
