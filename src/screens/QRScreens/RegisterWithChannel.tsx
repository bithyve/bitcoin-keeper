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
import { captureError } from 'src/services/sentry';
import { updateKeyDetails } from 'src/store/sagaActions/wallets';
import { useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import useVault from 'src/hooks/useVault';
import Text from 'src/components/KeeperText';
import crypto from 'crypto';
import {
  createCipherGcm,
  createDecipherGcm,
  genrateOutputDescriptors,
} from 'src/utils/service-utilities/utils';
import useSignerFromKey from 'src/hooks/useSignerFromKey';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import { healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
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
    <VStack>
      <Text numberOfLines={2} color={`${colorMode}.greenText`} style={styles.instructions}>
        {'\u2022 Please resigter the vault from the Keeper Desktop App'}
      </Text>
      <Text numberOfLines={4} color={`${colorMode}.greenText`} style={styles.instructions}>
        {
          '\u2022 If the web interface does not update, please make sure to stay on the same internet connection and rescan the QR code.'
        }
      </Text>
      <ActivityIndicator style={{ alignSelf: 'flex-start', padding: '2%' }} />
    </VStack>
  );
}

function RegisterWithChannel() {
  const { params } = useRoute();
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { vaultKey, vaultId, signerType } = params as {
    vaultKey: VaultSigner;
    vaultId: string;
    signerType: string;
  };
  const { signer } = useSignerFromKey(vaultKey);

  const [channel] = useState(io(config.CHANNEL_URL));
  const decryptionKey = useRef();

  const dispatch = useDispatch();

  const { activeVault: vault } = useVault({ vaultId });
  const descriptorString = genrateOutputDescriptors(vault).split('\n')[0];
  const firstExtAdd = vault.specs.addresses.external[0]; // for cross validation from desktop app.

  const onBarCodeRead = (data) => {
    decryptionKey.current = data;
    const sha = crypto.createHash('sha256');
    sha.update(data);
    const room = sha.digest().toString('hex');
    const requestBody = {
      action: EMIT_MODES.REGISTER_MULTISIG,
      signerType,
      descriptorString,
      firstExtAdd,
    };
    const requestData = createCipherGcm(JSON.stringify(requestBody), decryptionKey.current);
    channel.emit(JOIN_CHANNEL, { room, network: config.NETWORK_TYPE, requestData });
  };

  useEffect(() => {
    channel.on(CHANNEL_MESSAGE, async ({ data }) => {
      try {
        const { data: decrypted } = createDecipherGcm(data, decryptionKey.current);
        const resAdd = decrypted.responseData.data.address;
        if (resAdd != firstExtAdd) return;
        dispatch(
          updateKeyDetails(vaultKey, 'registered', {
            registered: true,
            vaultId: vault.id,
          })
        );
        dispatch(
          healthCheckStatusUpdate([
            {
              signerId: signer.masterFingerprint,
              status: hcStatusType.HEALTH_CHECK_REGISTRATION,
            },
          ])
        );
        navigation.goBack();
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
        title="Register with Keeper Desktop App"
        subtitle={`Please download the Bitcoin Keeper desktop app from our website (${KEEPER_WEBSITE_BASE_URL}) to register this signer.`}
      />
      <Box style={styles.qrcontainer}>
        <ScanAndInstruct onBarCodeRead={onBarCodeRead} />
      </Box>
    </ScreenWrapper>
  );
}

export default RegisterWithChannel;

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
