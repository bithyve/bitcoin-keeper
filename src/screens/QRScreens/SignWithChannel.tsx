import React, { useEffect, useRef, useState } from 'react';
import { Box, VStack, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { VaultSigner } from 'src/services/wallets/interfaces/vault';
import config, { KEEPER_WEBSITE_BASE_URL } from 'src/utils/service-utilities/config';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { io } from 'src/services/channel';
import { CHANNEL_MESSAGE, EMIT_MODES, JOIN_CHANNEL } from 'src/services/channel/constants';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { useAppSelector } from 'src/store/hooks';
import { updatePSBTEnvelops } from 'src/store/reducers/send_and_receive';
import { captureError } from 'src/services/sentry';
import { SerializedPSBTEnvelop } from 'src/services/wallets/interfaces';
import useVault from 'src/hooks/useVault';
import { SignerType } from 'src/services/wallets/enums';
import { healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import Text from 'src/components/KeeperText';
import crypto from 'crypto';
import { createCipherGcm, createDecipherGcm } from 'src/utils/service-utilities/utils';
import useSignerFromKey from 'src/hooks/useSignerFromKey';
import { getPsbtForHwi } from 'src/hardware';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import QRScanner from 'src/components/QRScanner';

function ScanAndInstruct({ onBarCodeRead }) {
  const { colorMode } = useColorMode();
  const [channelCreated, setChannelCreated] = useState(false);

  const callback = (data) => {
    onBarCodeRead(data);
    setChannelCreated(true);
  };
  return !channelCreated ? (
    <QRScanner onScanCompleted={callback} />
  ) : (
    <VStack marginTop={'40%'}>
      <Text numberOfLines={2} color={`${colorMode}.greenText`} style={styles.instructions}>
        {'Please continue signing the transaction from the Keeper Desktop App'}
      </Text>
      <ActivityIndicator style={{ marginTop: hp(20), alignSelf: 'center', padding: '2%' }} />
    </VStack>
  );
}

function SignWithChannel() {
  const { colorMode } = useColorMode();
  const { params } = useRoute();
  const {
    vaultKey,
    vaultId = '',
    signerType,
    isRemoteKey = false,
    serializedPSBTEnvelopFromProps,
    isMultisig,
  } = params as {
    vaultKey: VaultSigner;
    vaultId: string;
    signerType: string;
    isRemoteKey?: boolean;
    serializedPSBTEnvelopFromProps?: any;
    isMultisig?: boolean;
  };
  const { signer } = useSignerFromKey(vaultKey);
  const { activeVault } = useVault({ vaultId });
  const serializedPSBTEnvelops: SerializedPSBTEnvelop[] = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelops
  );

  const { serializedPSBT } = isRemoteKey
    ? serializedPSBTEnvelopFromProps
    : serializedPSBTEnvelops.filter((envelop) => vaultKey.xfp === envelop.xfp)[0];

  const [channel] = useState(io(config.CHANNEL_URL));
  const decryptionKey = useRef();

  const dispatch = useDispatch();
  const navgation = useNavigation();

  const onBarCodeRead = async (data) => {
    decryptionKey.current = data;
    const sha = crypto.createHash('sha256');
    sha.update(data);
    const room = sha.digest().toString('hex');
    const psbt = await getPsbtForHwi(serializedPSBT, activeVault);
    const requestBody = {
      action: EMIT_MODES.SIGN_TX,
      signerType,
      psbt,
    };
    const requestData = createCipherGcm(JSON.stringify(requestBody), decryptionKey.current);
    channel.emit(JOIN_CHANNEL, { room, network: config.NETWORK_TYPE, requestData });
  };

  useEffect(() => {
    let channelConnectionInterval = setInterval(() => {
      if (!channel.connect) {
        channel.connect();
      }
    }, 10000);

    channel.on(CHANNEL_MESSAGE, async ({ data }) => {
      try {
        const { data: decrypted } = createDecipherGcm(data, decryptionKey.current);
        onSignedTnx(decrypted.responseData);
      } catch (error) {
        console.log('🚀 ~ channel.on ~ error:', error);
      }
    });
    const onSignedTnx = (data) => {
      try {
        const signedSerializedPSBT = data.data.signedSerializedPSBT;
        dispatch(
          healthCheckStatusUpdate([
            {
              signerId: signer.masterFingerprint,
              status: hcStatusType.HEALTH_CHECK_SIGNING,
            },
          ])
        );
        if (isRemoteKey) {
          navgation.dispatch(
            CommonActions.navigate({
              name: 'ShowQR',
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
        navgation.dispatch(CommonActions.navigate({ name: 'SignTransactionScreen', merge: true }));
      } catch (error) {
        captureError(error);
      }
    };
    return () => {
      channel.disconnect();
      clearInterval(channelConnectionInterval);
    };
  }, [channel]);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Sign with Keeper Desktop App"
        subtitle={`Please download the Bitcoin Keeper desktop app from our website: ${KEEPER_WEBSITE_BASE_URL}/desktop to sign with this signer.`}
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
  noteWrapper: {
    width: '100%',
    bottom: 0,
    position: 'absolute',
    padding: 20,
  },
  instructions: {
    width: windowWidth * 0.75,
    padding: '2%',
    letterSpacing: 0.65,
    fontSize: 13,
    textAlign: 'center',
  },
});
