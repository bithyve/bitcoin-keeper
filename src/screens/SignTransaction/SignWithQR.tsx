import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';

import { Box, useColorMode } from 'native-base';
import Buttons from 'src/components/Buttons';
import React, { useContext } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { SignerType } from 'src/services/wallets/enums';
import { Alert, Dimensions, ScrollView, StyleSheet } from 'react-native';
import { VaultSigner } from 'src/services/wallets/interfaces/vault';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { Psbt } from 'bitcoinjs-lib';
import { captureError } from 'src/services/sentry';
import { updateInputsForSeedSigner } from 'src/hardware/seedsigner';
import { updatePSBTEnvelops } from 'src/store/reducers/send_and_receive';
import useVault from 'src/hooks/useVault';
import { getTxHexFromKeystonePSBT } from 'src/hardware/keystone';
import { updateKeyDetails } from 'src/store/sagaActions/wallets';
import { healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import useSignerFromKey from 'src/hooks/useSignerFromKey';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import WalletCopiableData from 'src/components/WalletCopiableData';
import useSignerMap from 'src/hooks/useSignerMap';
import { getKeyUID, isHexadecimal } from 'src/utils/utilities';
import DisplayQR from '../QRScreens/DisplayQR';
import { SendConfirmationRouteParams, tnxDetailsProps } from '../Send/SendConfirmation';
import KeeperQRCode from 'src/components/KeeperQRCode';
import WalletHeader from 'src/components/WalletHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import WalletUtilities from 'src/services/wallets/operations/utils';
const { width } = Dimensions.get('window');

function SignWithQR() {
  const { colorMode } = useColorMode();
  const { signerMap } = useSignerMap();
  const serializedPSBTEnvelops = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelops
  );
  const { translations } = useContext(LocalizationContext);
  const { transactions, wallet: walletText } = translations;
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    vaultKey,
    vaultId = '',
    isRemoteKey,
    serializedPSBTEnvelopFromProps,
    isMultisig,
    signTransaction: signTransactionParent,
  }: {
    vaultKey: VaultSigner;
    vaultId: string;
    isRemoteKey: boolean;
    serializedPSBTEnvelopFromProps?: string;
    isMultisig?: boolean;
    sendConfirmationRouteParams?: SendConfirmationRouteParams;
    tnxDetails: tnxDetailsProps;
    signTransaction: ({ signedSerializedPSBT }: { signedSerializedPSBT: string }) => void;
  } = route.params as any;

  const { bitcoinNetworkType } = useAppSelector((state) => state.settings);

  const serializedPSBTEnvelop = isRemoteKey
    ? serializedPSBTEnvelopFromProps
    : serializedPSBTEnvelops.filter((envelop) => vaultKey.xfp === envelop.xfp)[0];
  const { serializedPSBT } = serializedPSBTEnvelop;
  const { activeVault } = useVault({ vaultId });
  const isSingleSig = isRemoteKey ? !isMultisig : !activeVault.isMultiSig;
  const { signer } = isRemoteKey
    ? { signer: signerMap[getKeyUID(vaultKey)] }
    : useSignerFromKey(vaultKey);

  const signTransaction = (signedSerializedPSBT) => {
    try {
      if (!isHexadecimal(signedSerializedPSBT)) {
        Psbt.fromBase64(signedSerializedPSBT); // will throw if not a psbt
      }
      dispatch(
        healthCheckStatusUpdate([
          {
            signerId: signer.masterFingerprint,
            status: hcStatusType.HEALTH_CHECK_SIGNING,
          },
        ])
      );
      if (isSingleSig) {
        if (signer.type === SignerType.SEEDSIGNER) {
          const { signedPsbt } = updateInputsForSeedSigner({
            serializedPSBT,
            signedSerializedPSBT,
          });
          dispatch(updatePSBTEnvelops({ signedSerializedPSBT: signedPsbt, xfp: vaultKey.xfp }));
        } else if (signer.type === SignerType.KEYSTONE) {
          const tx = getTxHexFromKeystonePSBT(serializedPSBT, signedSerializedPSBT);
          dispatch(updatePSBTEnvelops({ xfp: vaultKey.xfp, txHex: tx.toHex() }));
        } else {
          if (isHexadecimal(signedSerializedPSBT)) {
            dispatch(updatePSBTEnvelops({ xfp: vaultKey.xfp, txHex: signedSerializedPSBT }));
          } else {
            dispatch(updatePSBTEnvelops({ xfp: vaultKey.xfp, signedSerializedPSBT }));
          }
        }
      } else {
        const PSBT = Psbt.fromBase64(signedSerializedPSBT, {
          network: WalletUtilities.getNetworkByType(bitcoinNetworkType),
        });

        const originalPSBT = Psbt.fromBase64(serializedPSBT, {
          network: WalletUtilities.getNetworkByType(bitcoinNetworkType),
        });

        PSBT.data.inputs.forEach((input, index) => {
          if (!input.bip32Derivation || input.bip32Derivation.length === 0) {
            const originalInput = originalPSBT.data.inputs[index];
            if (originalInput.bip32Derivation && originalInput.bip32Derivation.length > 0) {
              input.bip32Derivation = originalInput.bip32Derivation;
            }
          }
        });

        signedSerializedPSBT = PSBT.toBase64();

        if (isRemoteKey) {
          signTransactionParent({ signedSerializedPSBT });
          navigation.goBack();
          return;
        }

        dispatch(updatePSBTEnvelops({ signedSerializedPSBT, xfp: vaultKey.xfp }));
        dispatch(
          updateKeyDetails(vaultKey, 'registered', {
            registered: true,
            vaultId: activeVault.id,
          })
        );
      }
      navigation.dispatch(CommonActions.navigate({ name: 'SignTransactionScreen', merge: true }));
    } catch (err) {
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
          title: transactions.scanSignedTransaction,
          subtitle: walletText.ScanQRData,
          onQrScan: signTransaction,
          type: signer.type,
          isPSBT: true,
          importOptions: false,
          isSingning: true,
        },
      })
    );

  const encodeToBytes = signer.type === SignerType.PASSPORT;
  const navigateToVaultRegistration = () =>
    navigation.dispatch(CommonActions.navigate('RegisterWithQR', { vaultKey, vaultId }));
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={walletText.SignTransaction} subTitle={walletText.scanQrWithSigner} />
      <Box style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {signer.type === SignerType.SPECTER ? (
            <KeeperQRCode qrData={`sign ${serializedPSBT}`} size={width * 0.85} ecl="L" />
          ) : (
            <DisplayQR
              qrContents={serializedPSBT}
              toBytes={encodeToBytes}
              type="base64"
              signerType={signer.type}
            />
          )}
          <Box style={styles.fingerprint}>
            <WalletCopiableData data={serializedPSBT} dataType="psbt" />
          </Box>
        </ScrollView>
      </Box>
      <Box style={styles.bottom}>
        <Buttons
          primaryText={walletText.scanTransaction}
          primaryCallback={navigateToQrScan}
          secondaryText={isRemoteKey ? null : walletText.vaultDetails}
          secondaryCallback={navigateToVaultRegistration}
        />
      </Box>
    </ScreenWrapper>
  );
}

export default SignWithQR;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: '10%',
    flexGrow: 1,
  },
  bottom: {
    marginVertical: '3%',
  },
  fingerprint: {
    alignItems: 'center',
  },
});
