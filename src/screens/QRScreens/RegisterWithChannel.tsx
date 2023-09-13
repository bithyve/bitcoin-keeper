import React, { useEffect } from 'react';

import { Box } from 'native-base';
import HeaderTitle from 'src/components/HeaderTitle';
import { RealmSchema } from 'src/storage/realm/enum';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet } from 'react-native';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getWalletConfigForBitBox02 } from 'src/hardware/bitbox';
import config from 'src/core/config';
import { RNCamera } from 'react-native-camera';
import { hp, wp } from 'src/constants/responsive';
import { io } from 'src/services/channel';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { BITBOX_REGISTER, CREATE_CHANNEL, LEDGER_REGISTER } from 'src/services/channel/constants';
import { captureError } from 'src/services/sentry';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import { useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import useVault from 'src/hooks/useVault';
import { useQuery } from '@realm/react';

function RegisterWithChannel() {
  const { params } = useRoute();
  const { signer } = params as { signer: VaultSigner };
  const channel = io(config.CHANNEL_URL);
  let channelCreated = false;
  const { publicId }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const dispatch = useDispatch();
  const navgation = useNavigation();

  const { activeVault: vault } = useVault();

  const onBarCodeRead = ({ data }) => {
    if (!channelCreated) {
      channel.emit(CREATE_CHANNEL, { room: `${publicId}${data}`, network: config.NETWORK_TYPE });
      channelCreated = true;
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
        dispatch(updateSignerDetails(signer, 'registered', true));
        navgation.goBack();
      } catch (error) {
        captureError(error);
      }
    });
    return () => {
      channel.disconnect();
    };
  }, [channel]);

  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Register with Keeper Hardware Interface"
        subtitle={`Please visit ${config.KEEPER_HWI} on your Chrome browser to register with the device`}
      />
      <Box style={styles.qrcontainer}>
        <RNCamera
          autoFocus="on"
          style={styles.cameraView}
          captureAudio={false}
          onBarCodeRead={onBarCodeRead}
          useNativeZoom
        />
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
});
