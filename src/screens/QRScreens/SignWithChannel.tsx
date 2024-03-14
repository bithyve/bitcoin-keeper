import React, { useEffect, useRef, useState } from 'react';
import { Box, VStack, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { VaultSigner } from 'src/services/wallets/interfaces/vault';
import config from 'src/utils/service-utilities/config';
import { RNCamera } from 'react-native-camera';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { io } from 'src/services/channel';
import {
  BITBOX_SIGN,
  JOIN_CHANNEL,
  LEDGER_SIGN,
  SIGNED_TX,
  TREZOR_SIGN,
} from 'src/services/channel/constants';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { useAppSelector } from 'src/store/hooks';
import { updatePSBTEnvelops } from 'src/store/reducers/send_and_receive';
import { getTxForTrezor } from 'src/hardware/trezor';
import { captureError } from 'src/services/sentry';
import { SerializedPSBTEnvelop } from 'src/services/wallets/interfaces';
import { getSignedSerializedPSBTForBitbox02, getTxForBitBox02 } from 'src/hardware/bitbox';
import useVault from 'src/hooks/useVault';
import { SignerType } from 'src/services/wallets/enums';
import { signWithLedgerChannel } from 'src/hardware/ledger';
import { healthCheckSigner } from 'src/store/sagaActions/bhr';
import Text from 'src/components/KeeperText';
import crypto from 'crypto';
import { createCipheriv, createDecipheriv } from 'src/utils/service-utilities/utils';
import useToastMessage from 'src/hooks/useToastMessage';
import useSignerFromKey from 'src/hooks/useSignerFromKey';

function ScanAndInstruct({ onBarCodeRead }) {
  const { colorMode } = useColorMode();
  const [channelCreated, setChannelCreated] = useState(false);

  const callback = (data) => {
    onBarCodeRead(data);
    setChannelCreated(true);
  };
  return !channelCreated ? (
    <RNCamera
      autoFocus="on"
      style={styles.cameraView}
      captureAudio={false}
      onBarCodeRead={callback}
      useNativeZoom
    />
  ) : (
    <VStack>
      <Text numberOfLines={2} color={`${colorMode}.greenText`} style={styles.instructions}>
        {'\u2022 Please sign the transaction from the Keeper web interface'}
      </Text>
      <Text numberOfLines={3} color={`${colorMode}.greenText`} style={styles.instructions}>
        {
          '\u2022 If the web interface does not update, please make sure to stay on the same internet connection and rescan the QR code.'
        }
      </Text>
      <ActivityIndicator style={{ alignSelf: 'flex-start', padding: '2%' }} />
    </VStack>
  );
}

function SignWithChannel() {
  const { colorMode } = useColorMode();
  const { params } = useRoute();
  const { vaultKey, vaultId = '' } = params as {
    vaultKey: VaultSigner;
    vaultId: string;
  };
  const { signer } = useSignerFromKey(vaultKey);
  const { activeVault } = useVault({ vaultId });
  const { isMultiSig: isMultisig } = activeVault;
  const serializedPSBTEnvelops: SerializedPSBTEnvelop[] = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelops
  );
  const { serializedPSBT, signingPayload } = serializedPSBTEnvelops.filter(
    (envelop) => vaultKey.xfp === envelop.xfp
  )[0];
  const { showToast } = useToastMessage();

  const [channel] = useState(io(config.CHANNEL_URL));
  const decryptionKey = useRef();

  const dispatch = useDispatch();
  const navgation = useNavigation();

  const onBarCodeRead = ({ data }) => {
    decryptionKey.current = data;
    const sha = crypto.createHash('sha256');
    sha.update(data);
    const room = sha.digest().toString('hex');
    channel.emit(JOIN_CHANNEL, { room, network: config.NETWORK_TYPE });
  };

  useEffect(() => {
    channel.on(BITBOX_SIGN, async ({ room }) => {
      const data = await getTxForBitBox02(
        serializedPSBT,
        signingPayload,
        vaultKey,
        isMultisig,
        activeVault,
        signer
      );
      channel.emit(BITBOX_SIGN, {
        data: createCipheriv(JSON.stringify(data), decryptionKey.current),
        room,
      });
    });
    channel.on(TREZOR_SIGN, ({ room }) => {
      try {
        const data = getTxForTrezor(serializedPSBT, signingPayload, vaultKey, activeVault);
        channel.emit(TREZOR_SIGN, {
          data: createCipheriv(JSON.stringify(data), decryptionKey.current),
          room,
        });
      } catch (err) {
        captureError(err);
      }
    });
    channel.on(LEDGER_SIGN, ({ room }) => {
      try {
        const registerationInfo = vaultKey.registeredVaults.find(
          (info) => info.vaultId === activeVault.id
        )?.registrationInfo;
        if (!registerationInfo) {
          showToast('Please register the wallet before signing', null, 1000);
          return;
        }
        const hmac = JSON.parse(registerationInfo)?.registeredWallet;
        if (!hmac) {
          showToast('Please register the wallet before signing', null, 1000);
          return;
        }
        const data = {
          serializedPSBT,
          vault: activeVault,
          registeredWallet: activeVault.isMultiSig ? hmac : undefined,
        };
        channel.emit(LEDGER_SIGN, {
          data: createCipheriv(JSON.stringify(data), decryptionKey.current),
          room,
        });
      } catch (err) {
        captureError(err);
      }
    });
    channel.on(SIGNED_TX, ({ data }) => {
      try {
        const decrypted = createDecipheriv(data, decryptionKey.current);
        if (signer.type === SignerType.TREZOR) {
          const { serializedTx: txHex } = decrypted;
          dispatch(updatePSBTEnvelops({ txHex, xfp: vaultKey.xfp }));
          dispatch(healthCheckSigner([signer]));
          navgation.dispatch(
            CommonActions.navigate({ name: 'SignTransactionScreen', merge: true })
          );
        } else if (signer.type === SignerType.BITBOX02) {
          const { signedSerializedPSBT } = getSignedSerializedPSBTForBitbox02(
            serializedPSBT,
            decrypted,
            signingPayload
          );
          dispatch(updatePSBTEnvelops({ signedSerializedPSBT, xfp: vaultKey.xfp }));
          dispatch(healthCheckSigner([signer]));
          navgation.dispatch(
            CommonActions.navigate({ name: 'SignTransactionScreen', merge: true })
          );
        } else if (signer.type === SignerType.LEDGER) {
          const { signedSerializedPSBT } = signWithLedgerChannel(
            serializedPSBT,
            signingPayload,
            decrypted
          );
          dispatch(updatePSBTEnvelops({ signedSerializedPSBT, xfp: vaultKey.xfp }));
          dispatch(healthCheckSigner([signer]));
          navgation.dispatch(
            CommonActions.navigate({ name: 'SignTransactionScreen', merge: true })
          );
        }
      } catch (error) {
        captureError(error);
      }
    });
    return () => {
      channel.disconnect();
    };
  }, [channel]);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Sign with Keeper Hardware Interface"
        subtitle={`Please visit ${config.KEEPER_HWI} on your Chrome browser to sign with the device`}
      />
      <Box style={styles.qrcontainer}>
        <ScanAndInstruct onBarCodeRead={onBarCodeRead} />
      </Box>
    </ScreenWrapper>
  );
}

export default SignWithChannel;

const styles = StyleSheet.create({
  qrcontainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 25,
    alignItems: 'center',
  },
  cameraView: {
    height: hp(280),
    width: wp(375),
  },
  noteWrapper: {
    width: '100%',
    bottom: 0,
    position: 'absolute',
    padding: 20,
  },
  instructions: {
    width: windowWidth * 0.8,
    padding: '2%',
    letterSpacing: 0.65,
    fontSize: 13,
  },
});
