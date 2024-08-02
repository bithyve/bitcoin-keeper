import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, VStack, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { VaultSigner } from 'src/services/wallets/interfaces/vault';
import config, { KEEPER_WEBSITE_BASE_URL } from 'src/utils/service-utilities/config';
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
import { CommonActions, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useAppSelector } from 'src/store/hooks';
import { updatePSBTEnvelops } from 'src/store/reducers/send_and_receive';
import { captureError } from 'src/services/sentry';
import { SerializedPSBTEnvelop } from 'src/services/wallets/interfaces';
import useVault from 'src/hooks/useVault';
import { SignerType } from 'src/services/wallets/enums';
import { healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import Text from 'src/components/KeeperText';
import crypto from 'crypto';
import { createCipheriv, createDecipheriv } from 'src/utils/service-utilities/utils';
import useSignerFromKey from 'src/hooks/useSignerFromKey';
import { getPsbtForHwi } from 'src/hardware';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';

function ScanAndInstruct({ onBarCodeRead }) {
  const { colorMode } = useColorMode();
  const [channelCreated, setChannelCreated] = useState(false);

  const [isFocused, setIsFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
      };
    }, [])
  );

  const callback = (data) => {
    onBarCodeRead(data);
    setChannelCreated(true);
  };
  return !channelCreated && isFocused ? (
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
        {'\u2022 Please sign the transaction from the Keeper Desktop App'}
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
  const serializedPSBTEnvelops: SerializedPSBTEnvelop[] = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelops
  );
  const { serializedPSBT } = serializedPSBTEnvelops.filter(
    (envelop) => vaultKey.xfp === envelop.xfp
  )[0];

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
      const data = await getPsbtForHwi(serializedPSBT, activeVault);
      channel.emit(BITBOX_SIGN, {
        data: createCipheriv(JSON.stringify(data), decryptionKey.current),
        room,
      });
    });
    channel.on(TREZOR_SIGN, async ({ room }) => {
      try {
        const data = await getPsbtForHwi(serializedPSBT, activeVault);
        channel.emit(TREZOR_SIGN, {
          data: createCipheriv(JSON.stringify(data), decryptionKey.current),
          room,
        });
      } catch (err) {
        captureError(err);
      }
    });
    channel.on(LEDGER_SIGN, async ({ room }) => {
      try {
        const data = await getPsbtForHwi(serializedPSBT, activeVault);
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
          const { signedSerializedPSBT } = decrypted;
          dispatch(updatePSBTEnvelops({ signedSerializedPSBT, xfp: vaultKey.xfp }));
          navgation.dispatch(
            CommonActions.navigate({ name: 'SignTransactionScreen', merge: true })
          );
          dispatch(
            healthCheckStatusUpdate([
              {
                signerId: data.signer.masterFingerprint,
                status: hcStatusType.HEALTH_CHECK_SIGNING,
              },
            ])
          );
        } else if (signer.type === SignerType.BITBOX02) {
          const { signedSerializedPSBT } = decrypted;
          dispatch(updatePSBTEnvelops({ signedSerializedPSBT, xfp: vaultKey.xfp }));
          navgation.dispatch(
            CommonActions.navigate({ name: 'SignTransactionScreen', merge: true })
          );
          dispatch(
            healthCheckStatusUpdate([
              {
                signerId: data.signer.masterFingerprint,
                status: hcStatusType.HEALTH_CHECK_SIGNING,
              },
            ])
          );
        } else if (signer.type === SignerType.LEDGER) {
          const { signedSerializedPSBT } = decrypted;
          dispatch(updatePSBTEnvelops({ signedSerializedPSBT, xfp: vaultKey.xfp }));
          navgation.dispatch(
            CommonActions.navigate({ name: 'SignTransactionScreen', merge: true })
          );
          dispatch(
            healthCheckStatusUpdate([
              {
                signerId: data.signer.masterFingerprint,
                status: hcStatusType.HEALTH_CHECK_SIGNING,
              },
            ])
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
        title="Sign with Keeper Desktop App"
        subtitle={`Please download the Bitcoin Keeper desktop app from our website (${KEEPER_WEBSITE_BASE_URL}) to sign with this signer.`}
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
