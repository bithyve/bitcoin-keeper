import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';

import { Box } from 'native-base';
import Buttons from 'src/components/Buttons';
import HeaderTitle from 'src/components/HeaderTitle';
import React from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { SignerType } from 'src/core/wallets/enums';
import { Alert, StyleSheet } from 'react-native';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { updatePSBTSignatures } from 'src/store/sagaActions/send_and_receive';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { Psbt } from 'bitcoinjs-lib';
import { captureError } from 'src/core/services/sentry';
import usePlan from 'src/hooks/usePlan';
import { updateInputsForSeedSigner } from 'src/hardware/seedsigner';
import DisplayQR from '../QRScreens/DisplayQR';

function SignWithQR() {
  const serializedPSBTEnvelops = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelops
  );
  const { serializedPSBT } = serializedPSBTEnvelops[0];
  const route = useRoute();
  const { signer }: { signer: VaultSigner } = route.params as any;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { subscriptionScheme } = usePlan();
  const isMultisig = subscriptionScheme.n !== 1;

  const signTransaction = (signedSerializedPSBT) => {
    try {
      Psbt.fromBase64(signedSerializedPSBT); // will throw if not a psbt
      if (!isMultisig && signer.type === SignerType.SEEDSIGNER) {
        const { signedPsbt } = updateInputsForSeedSigner({ serializedPSBT, signedSerializedPSBT });
        dispatch(
          updatePSBTSignatures({ signedSerializedPSBT: signedPsbt, signerId: signer.signerId })
        );
      } else {
        dispatch(updatePSBTSignatures({ signedSerializedPSBT, signerId: signer.signerId }));
      }
      navigation.dispatch(CommonActions.navigate('SignTransactionScreen'));
    } catch (err) {
      captureError(err);
      Alert.alert('Invalid QR, please scan the signed PSBT!');
      navigation.dispatch(CommonActions.navigate('SignTransactionScreen'));
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
        },
      })
    );

  const encodeToBytes = signer.type === SignerType.PASSPORT;
  const navigateToVaultRegistration = () =>
    navigation.dispatch(CommonActions.navigate('RegisterWithQR'));
  return (
    <ScreenWrapper>
      <HeaderTitle title="Sign Transaction" subtitle="Scan the QR with the signing device" />
      <Box style={styles.center}>
        <DisplayQR qrContents={serializedPSBT} toBytes={encodeToBytes} type="base64" />
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
    flex: 1,
    alignItems: 'center',
    marginTop: '20%',
  },
  bottom: {
    padding: '3%',
  },
});
