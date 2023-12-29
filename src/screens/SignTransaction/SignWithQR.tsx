import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';

import { Box } from 'native-base';
import Buttons from 'src/components/Buttons';
import KeeperHeader from 'src/components/KeeperHeader';
import React from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { SignerType } from 'src/core/wallets/enums';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { Psbt } from 'bitcoinjs-lib';
import { captureError } from 'src/services/sentry';
import { updateInputsForSeedSigner } from 'src/hardware/seedsigner';
import { updatePSBTEnvelops } from 'src/store/reducers/send_and_receive';
import useVault from 'src/hooks/useVault';
import { getTxHexFromKeystonePSBT } from 'src/hardware/keystone';
import { updateKeyDetails } from 'src/store/sagaActions/wallets';
import { healthCheckSigner } from 'src/store/sagaActions/bhr';
import DisplayQR from '../QRScreens/DisplayQR';
import ShareWithNfc from '../NFCChannel/ShareWithNfc';
import useSignerFromKey from 'src/hooks/useSignerFromKey';

function SignWithQR() {
  const serializedPSBTEnvelops = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelops
  );
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    vaultKey,
    collaborativeWalletId = '',
  }: { vaultKey: VaultSigner; collaborativeWalletId: string } = route.params as any;
  const { serializedPSBT } = serializedPSBTEnvelops.filter(
    (envelop) => vaultKey.xfp === envelop.signerId
  )[0];
  const { activeVault } = useVault(collaborativeWalletId);
  const isSingleSig = activeVault.scheme.n === 1;
  const { signer } = useSignerFromKey(vaultKey);

  const signTransaction = (signedSerializedPSBT, resetQR) => {
    try {
      Psbt.fromBase64(signedSerializedPSBT); // will throw if not a psbt
      if (isSingleSig) {
        if (signer.type === SignerType.SEEDSIGNER) {
          const { signedPsbt } = updateInputsForSeedSigner({
            serializedPSBT,
            signedSerializedPSBT,
          });
          dispatch(
            updatePSBTEnvelops({ signedSerializedPSBT: signedPsbt, signerId: vaultKey.xfp })
          );
        } else if (signer.type === SignerType.KEYSTONE) {
          const tx = getTxHexFromKeystonePSBT(serializedPSBT, signedSerializedPSBT);
          dispatch(updatePSBTEnvelops({ signerId: vaultKey.xfp, txHex: tx.toHex() }));
        } else {
          dispatch(updatePSBTEnvelops({ signerId: vaultKey.xfp, signedSerializedPSBT }));
        }
      } else {
        dispatch(updatePSBTEnvelops({ signedSerializedPSBT, signerId: vaultKey.xfp }));
        dispatch(
          updateKeyDetails(vaultKey, 'registered', {
            registered: true,
            vaultId: activeVault.id,
          })
        );
      }
      dispatch(healthCheckSigner([signer]));
      navigation.dispatch(CommonActions.navigate({ name: 'SignTransactionScreen', merge: true }));
    } catch (err) {
      resetQR();
      captureError(err);
      Alert.alert('Invalid QR, please scan the signed PSBT!');
      navigation.dispatch(CommonActions.navigate({ name: 'SignTransactionScreen', merge: true }));
    }
  };

  const navigateToQrScan = () =>
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ScanQR',
        params: {
          title: `Scan Signed Transaction`,
          subtitle: 'Please scan until all the QR data has been retrieved',
          onQrScan: signTransaction,
          type: signer.type,
        },
      })
    );

  const encodeToBytes = signer.type === SignerType.PASSPORT;
  const navigateToVaultRegistration = () =>
    navigation.dispatch(CommonActions.navigate('RegisterWithQR', { vaultKey }));
  return (
    <ScreenWrapper>
      <KeeperHeader title="Sign Transaction" subtitle="Scan the QR with the signing device" />
      <Box style={styles.center}>
        <DisplayQR qrContents={serializedPSBT} toBytes={encodeToBytes} type="base64" />
        {signer.type === SignerType.KEEPER ? (
          <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
            <ShareWithNfc data={serializedPSBT} />
          </ScrollView>
        ) : null}
      </Box>
      <Box style={styles.bottom}>
        <Buttons
          primaryText="Scan PSBT"
          primaryCallback={navigateToQrScan}
          secondaryText="Vault Details"
          secondaryCallback={navigateToVaultRegistration}
        />
      </Box>
    </ScreenWrapper>
  );
}

export default SignWithQR;

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    marginTop: '10%',
    flex: 1,
  },
  bottom: {
    marginHorizontal: '5%',
  },
});
