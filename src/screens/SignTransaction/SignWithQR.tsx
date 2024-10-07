import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';

import { Box, useColorMode } from 'native-base';
import Buttons from 'src/components/Buttons';
import KeeperHeader from 'src/components/KeeperHeader';
import React, { useEffect } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { RKInteractionMode, SignerType, XpubTypes } from 'src/services/wallets/enums';
import { Alert, ScrollView, StyleSheet } from 'react-native';
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
import { healthCheckSigner, healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import useSignerFromKey from 'src/hooks/useSignerFromKey';
import DisplayQR from '../QRScreens/DisplayQR';
import ShareWithNfc from '../NFCChannel/ShareWithNfc';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import WalletFingerprint from 'src/components/WalletFingerPrint';
import idx from 'idx';
import { getKeyExpression } from 'src/utils/service-utilities/utils';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import useSignerMap from 'src/hooks/useSignerMap';

function SignWithQR() {
  const { colorMode } = useColorMode();
  const { signerMap } = useSignerMap();
  const serializedPSBTEnvelops = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelops
  );
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    vaultKey,
    vaultId = '',
    isRemoteKey,
    serializedPSBTEnvelopFromProps,
  }: {
    vaultKey: VaultSigner;
    vaultId: string;
    isRemoteKey: boolean;
    serializedPSBTEnvelopFromProps?: string;
  } = route.params as any;

  const serializedPSBTEnvelop = isRemoteKey
    ? serializedPSBTEnvelopFromProps
    : serializedPSBTEnvelops.filter((envelop) => vaultKey.xfp === envelop.xfp)[0];
  const { serializedPSBT } = serializedPSBTEnvelop;
  const { activeVault } = useVault({ vaultId });
  const isSingleSig = isRemoteKey ? false : activeVault.scheme.n === 1; // TODO Need scheme or isMultisig prop aswell
  const { signer } = isRemoteKey
    ? { signer: signerMap[vaultKey.masterFingerprint] }
    : useSignerFromKey(vaultKey);
  const [details, setDetails] = React.useState('');
  const { showToast } = useToastMessage();

  const fetchKeyExpression = (type: XpubTypes) => {
    try {
      if (signer.masterFingerprint && signer.signerXpubs[type] && signer.signerXpubs[type]?.[0]) {
        const keyDescriptor = getKeyExpression(
          signer.masterFingerprint,
          idx(signer, (_) => _.signerXpubs[type][0].derivationPath.replaceAll('h', "'")),
          idx(signer, (_) => _.signerXpubs[type][0].xpub),
          false
        );
        return keyDescriptor;
      } else {
        throw new Error(`Missing key details for ${type} type.`);
      }
    } catch (error) {
      throw new Error(`Missing key details for ${type} type.`);
    }
  };

  useEffect(() => {
    if (!details) {
      setTimeout(() => {
        try {
          const keyDescriptor = fetchKeyExpression(XpubTypes.P2WSH);
          setDetails(keyDescriptor);
        } catch (error) {
          captureError(error);
          try {
            const keyDescriptor = fetchKeyExpression(XpubTypes.P2WPKH);
            setDetails(keyDescriptor);
          } catch (error) {
            showToast(
              `We're sorry, but we have trouble retrieving the key information`,
              <ToastErrorIcon />
            );
          }
        }
      }, 200);
    }
  }, []);

  const signTransaction = (signedSerializedPSBT, resetQR) => {
    try {
      Psbt.fromBase64(signedSerializedPSBT); // will throw if not a psbt
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
          dispatch(updatePSBTEnvelops({ xfp: vaultKey.xfp, signedSerializedPSBT }));
        }
      } else {
        if (isRemoteKey) {
          navigation.replace('RemoteSharing', {
            isPSBTSharing: true,
            signerData: {},
            signer: signer,
            psbt: signedSerializedPSBT,
            mode: RKInteractionMode.SHARE_SIGNED_PSBT,
            vaultKey: vaultKey,
            vaultId: vaultId,
          });
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
      dispatch(
        healthCheckStatusUpdate([
          {
            signerId: signer.masterFingerprint,
            status: hcStatusType.HEALTH_CHECK_SIGNING,
          },
        ])
      );
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
          title: 'Scan Signed Transaction',
          subtitle: 'Please scan until all the QR data has been retrieved',
          onQrScan: signTransaction,
          type: signer.type,
          isPSBT: true,
        },
      })
    );

  const encodeToBytes = signer.type === SignerType.PASSPORT;
  const navigateToVaultRegistration = () =>
    navigation.dispatch(CommonActions.navigate('RegisterWithQR', { vaultKey, vaultId }));
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title="Sign Transaction" subtitle="Scan the QR with the signer" />
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Box style={styles.center}>
          <DisplayQR qrContents={serializedPSBT} toBytes={encodeToBytes} type="base64" />
          <Box style={styles.fingerprint}>{<WalletFingerprint fingerprint={details} />}</Box>
          {[SignerType.KEEPER, SignerType.MY_KEEPER].includes(signer.type) || true ? (
            <ShareWithNfc
              data={serializedPSBT}
              isPSBTSharing
              psbt={serializedPSBT} // TODO: check this
              serializedPSBTEnvelop={serializedPSBTEnvelop}
              signer={signer}
              vaultKey={vaultKey} // required for signing
              vaultId={vaultId} // required for signing
            />
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
      </ScrollView>
    </ScreenWrapper>
  );
}

export default SignWithQR;

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    marginTop: '10%',
    flex: 1,
  },
  bottom: {
    marginTop: '5%',
  },
  fingerprint: {
    alignItems: 'center',
    marginHorizontal: '7%',
  },
});
