import { CommonActions, useNavigation } from '@react-navigation/native';
import { NetworkType, SignerType, VaultType } from 'src/core/wallets/enums';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { VaultScheme, VaultSigner } from 'src/core/wallets/interfaces/vault';
import config, { APP_STAGE } from 'src/core/config';

import AppClient from 'src/hardware/ledger';
import QRCode from 'react-native-qrcode-svg';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { addNewVault } from 'src/store/sagaActions/wallets';
import { useDispatch } from 'react-redux';

const delay = (ms) => new Promise((success) => setTimeout(success, ms));

const ShowAddressScreen = ({ transport }) => {
  const [error, setError] = useState(null);
  const [address, setAddress] = useState(null);

  const unmounted = useRef(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const _fetchAddress = async () => {
    if (unmounted.current) return;
    await fetchAddress(false);
  };

  useEffect(() => {
    _fetchAddress();
    return () => {
      unmounted.current = true;
    };
  }, []);

  const createVault = useCallback((signers: VaultSigner[], scheme: VaultScheme) => {
    try {
      const newVaultInfo = {
        vaultType: VaultType.DEFAULT,
        vaultScheme: scheme,
        vaultSigners: signers,
        vaultDetails: {
          name: 'Vault',
          description: 'Secure your sats',
        },
      };
      dispatch(addNewVault(newVaultInfo));
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }, []);

  const fetchAddress = async (verify) => {
    try {
      const app = new AppClient(transport);
      const path = "m/44'/1'/0'"; // HD derivation path
      const xpub = await app.getExtendedPubkey(path, true);
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
        },
      };
      const signer2: VaultSigner = {
        signerId: '73DC8582',
        type: SignerType.LEDGER,
        signerName: 'Nano X (Mock)',
        xpub: 'tpubDFAUqbtRiCbeKgCG3rSjDPVPwbb41hk2DSHvrnejZF9WDyCieGejSRBxNepzJscga2Lr8yPMMhUhJMWHnhBMjJ8VptpZyC1xXBK73ZxYBFf',
        xpubInfo: {
          derivationPath: `m/48'/1'/966713'/1'`,
        },
      };
      const scheme: VaultScheme = { m: 1, n: 2 };
      const isVaultCreated = createVault([signer, signer2], scheme);
      if (isVaultCreated) navigation.dispatch(CommonActions.navigate('NewHome'));
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
          <Text style={styles.loading}>Fetching your xpub at path "m/44'/1'/0'" ...</Text>
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
