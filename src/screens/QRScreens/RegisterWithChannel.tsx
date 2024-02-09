import React, { useEffect, useRef, useState } from 'react';
import { Box, VStack, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { getWalletConfigForBitBox02 } from 'src/hardware/bitbox';
import config from 'src/core/config';
import { RNCamera } from 'react-native-camera';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { io } from 'src/services/channel';
import {
  BITBOX_REGISTER,
  JOIN_CHANNEL,
  LEDGER_REGISTER,
  REGISTRATION_SUCCESS,
} from 'src/services/channel/constants';
import { captureError } from 'src/services/sentry';
import { updateKeyDetails } from 'src/store/sagaActions/wallets';
import { useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import useVault from 'src/hooks/useVault';
import Text from 'src/components/KeeperText';
import { SignerType } from 'src/core/wallets/enums';
import crypto from 'crypto';
import { createCipheriv, createDecipheriv } from 'src/core/utils';
import useSignerFromKey from 'src/hooks/useSignerFromKey';

const ScanAndInstruct = ({ onBarCodeRead }) => {
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
        {'\u2022 Please resigter the vault from the Keeper web interface'}
      </Text>
      <Text numberOfLines={3} color={`${colorMode}.greenText`} style={styles.instructions}>
        {
          '\u2022 If the web interface does not update, please make sure to stay on the same internet connection and rescan the QR code.'
        }
      </Text>
      <ActivityIndicator style={{ alignSelf: 'flex-start', padding: '2%' }} />
    </VStack>
  );
};

function RegisterWithChannel() {
  const { params } = useRoute();
  const { vaultKey, vaultId } = params as { vaultKey: VaultSigner; vaultId: string };
  const { signer } = useSignerFromKey(vaultKey);

  const [channel] = useState(io(config.CHANNEL_URL));
  const decryptionKey = useRef();

  const dispatch = useDispatch();
  const navgation = useNavigation();

  const { activeVault: vault } = useVault({ vaultId });

  const onBarCodeRead = ({ data }) => {
    decryptionKey.current = data;
    let sha = crypto.createHash('sha256');
    sha.update(data);
    const room = sha.digest().toString('hex');
    channel.emit(JOIN_CHANNEL, { room, network: config.NETWORK_TYPE });
  };

  useEffect(() => {
    channel.on(BITBOX_REGISTER, async ({ room }) => {
      try {
        const walletConfig = getWalletConfigForBitBox02({ vault, signer });
        channel.emit(BITBOX_REGISTER, {
          data: createCipheriv(JSON.stringify(walletConfig), decryptionKey.current),
          room,
        });
        dispatch(
          updateKeyDetails(vaultKey, 'registered', {
            registered: true,
            vaultId: vault.id,
          })
        );
        navgation.goBack();
      } catch (error) {
        captureError(error);
      }
    });
    channel.on(LEDGER_REGISTER, async ({ room }) => {
      try {
        channel.emit(LEDGER_REGISTER, {
          data: createCipheriv(JSON.stringify({ vault }), decryptionKey.current),
          room,
        });
      } catch (error) {
        captureError(error);
      }
    });
    channel.on(REGISTRATION_SUCCESS, async ({ data }) => {
      const decrypted = createDecipheriv(data, decryptionKey.current);
      const { signerType, policy } = decrypted;
      switch (signerType) {
        case SignerType.LEDGER:
          dispatch(
            updateKeyDetails(vaultKey, 'registered', {
              registered: true,
              vaultId: vault.id,
              registrationInfo: JSON.stringify({ registeredWallet: policy.policyHmac }),
            })
          );
          navgation.goBack();
      }
    });
    return () => {
      channel.disconnect();
    };
  }, [channel]);

  return (
    <ScreenWrapper>
      <KeeperHeader
        title="Register with Keeper Hardware Interface"
        subtitle={`Please visit ${config.KEEPER_HWI} on your Chrome browser to register with the device`}
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
