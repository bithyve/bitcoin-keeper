import React, { useEffect, useRef, useState } from 'react';
import { Box, VStack, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import { RealmSchema } from 'src/storage/realm/enum';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getWalletConfigForBitBox02 } from 'src/hardware/bitbox';
import config from 'src/core/config';
import { RNCamera } from 'react-native-camera';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { io } from 'src/services/channel';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import {
  BITBOX_REGISTER,
  CREATE_CHANNEL,
  LEDGER_REGISTER,
  REGISTRATION_SUCCESS,
} from 'src/services/channel/constants';
import { captureError } from 'src/services/sentry';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import { useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import useVault from 'src/hooks/useVault';
import { useQuery } from '@realm/react';
import Text from 'src/components/KeeperText';
import { SignerType } from 'src/core/wallets/enums';

function RegisterWithChannel() {
  const { params } = useRoute();
  const { colorMode } = useColorMode();
  const { signer } = params as { signer: VaultSigner };
  const channel = useRef(io(config.CHANNEL_URL)).current;
  const [channelCreated, setChannelCreated] = useState(false);
  const { publicId }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const dispatch = useDispatch();
  const navgation = useNavigation();

  const { activeVault: vault } = useVault();

  const onBarCodeRead = ({ data }) => {
    if (!channelCreated) {
      channel.emit(CREATE_CHANNEL, { room: `${publicId}${data}`, network: config.NETWORK_TYPE });
      setChannelCreated(true);
    }
  };

  useEffect(() => {
    channel.on(BITBOX_REGISTER, async ({ room }) => {
      try {
        const walletConfig = getWalletConfigForBitBox02({ vault });
        channel.emit(BITBOX_REGISTER, { data: walletConfig, room });
        dispatch(updateSignerDetails(signer, 'registered', true));
        navgation.goBack();
      } catch (error) {
        captureError(error);
      }
    });
    channel.on(LEDGER_REGISTER, async ({ room }) => {
      try {
        channel.emit(LEDGER_REGISTER, { data: { vault }, room });
      } catch (error) {
        captureError(error);
      }
    });
    channel.on(REGISTRATION_SUCCESS, async ({ data }) => {
      const { signerType, policy } = data;
      switch (signerType) {
        case SignerType.LEDGER:
          dispatch(
            updateSignerDetails(signer, 'deviceInfo', { registeredWallet: policy.policyHmac })
          );
          dispatch(updateSignerDetails(signer, 'registered', true));
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
        {!channelCreated ? (
          <RNCamera
            autoFocus="on"
            style={styles.cameraView}
            captureAudio={false}
            onBarCodeRead={onBarCodeRead}
            useNativeZoom
          />
        ) : (
          <VStack>
            <Text numberOfLines={2} color={`${colorMode}.greenText`} style={styles.instructions}>
              {'\u2022 Please resigter the vault from the Keeper web interface...'}
            </Text>
            <Text numberOfLines={3} color={`${colorMode}.greenText`} style={styles.instructions}>
              {
                '\u2022 If the web interface does not update, please check be sure to stay on the same internet connection and rescan the QR code.'
              }
            </Text>
            <ActivityIndicator style={{ alignSelf: 'flex-start', padding: '2%' }} />
          </VStack>
        )}
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
