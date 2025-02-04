import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';

import { Box, useColorMode } from 'native-base';
import Buttons from 'src/components/Buttons';
import KeeperHeader from 'src/components/KeeperHeader';
import React, { useEffect } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { SignerType, XpubTypes, RKInteractionMode } from 'src/services/wallets/enums';
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
import { healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import useSignerFromKey from 'src/hooks/useSignerFromKey';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import WalletCopiableData from 'src/components/WalletCopiableData';
import idx from 'idx';
import { getKeyExpression } from 'src/utils/service-utilities/utils';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import useSignerMap from 'src/hooks/useSignerMap';
import { getKeyUID, isHexadecimal } from 'src/utils/utilities';
import { hp, windowWidth } from 'src/constants/responsive';
import ShareWithNfc from '../NFCChannel/ShareWithNfc';
import DisplayQR from '../QRScreens/DisplayQR';
import { SendConfirmationRouteParams, tnxDetailsProps } from '../Send/SendConfirmation';
import { fetchKeyExpression } from '../WalletDetails/CosignerDetails';

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
    isMultisig,
  }: {
    vaultKey: VaultSigner;
    vaultId: string;
    isRemoteKey: boolean;
    serializedPSBTEnvelopFromProps?: string;
    isMultisig?: boolean;
    sendConfirmationRouteParams?: SendConfirmationRouteParams;
    tnxDetails: tnxDetailsProps;
  } = route.params as any;

  const serializedPSBTEnvelop = isRemoteKey
    ? serializedPSBTEnvelopFromProps
    : serializedPSBTEnvelops.filter((envelop) => vaultKey.xfp === envelop.xfp)[0];
  const { serializedPSBT } = serializedPSBTEnvelop;
  const { activeVault } = useVault({ vaultId });
  const isSingleSig = isRemoteKey ? !isMultisig : activeVault.scheme.n === 1;
  const { signer } = isRemoteKey
    ? { signer: signerMap[getKeyUID(vaultKey)] }
    : useSignerFromKey(vaultKey);
  const [details, setDetails] = React.useState('');
  const { showToast } = useToastMessage();

  useEffect(() => {
    if (!details) {
      setTimeout(() => {
        try {
          const keyDescriptor = fetchKeyExpression(signer);
          setDetails(keyDescriptor);
        } catch (error) {
          showToast(
            "We're sorry, but we have trouble retrieving the key information",
            <ToastErrorIcon />
          );
        }
      }, 200);
    }
  }, []);

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
        if (isRemoteKey) {
          navigation.dispatch(
            CommonActions.navigate({
              name: 'ShowPSBT',
              params: {
                data: signedSerializedPSBT,
                encodeToBytes: false,
                title: 'Signed PSBT',
                subtitle: 'Please scan until all the QR data has been retrieved',
                type: SignerType.KEEPER, // signer used as external key
              },
            })
          );
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
      <Box style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <DisplayQR
            qrContents={serializedPSBT}
            toBytes={encodeToBytes}
            type="base64"
            signerType={signer.type}
          />
          <Box style={styles.fingerprint}>
            <WalletCopiableData data={serializedPSBT} dataType="psbt" />
          </Box>
          <Box style={styles.optionsContainer}>
            {[SignerType.KEEPER, SignerType.MY_KEEPER].includes(signer.type) || true ? (
              <ShareWithNfc
                data={serializedPSBT}
                isPSBTSharing
                signer={signer}
                remoteShare
                xfp={vaultKey.xfp}
              />
            ) : null}
          </Box>
        </ScrollView>
      </Box>
      <Box style={styles.bottom}>
        <Buttons
          primaryText="Receive Transaction"
          primaryCallback={navigateToQrScan}
          secondaryText={isRemoteKey ? null : 'Vault Details'}
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
    justifyContent: 'center',
  },
  bottom: {
    marginTop: '5%',
  },
  fingerprint: {
    alignItems: 'center',
  },
  optionsContainer: {
    alignSelf: 'center',
    paddingHorizontal: '5%',
    marginTop: hp(10),
    justifyContent: 'center',
    alignItems: 'center',
    width: windowWidth * 0.8,
  },
});
