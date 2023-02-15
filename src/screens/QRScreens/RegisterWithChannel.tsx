import React, { useContext, useEffect } from 'react';

import { Box } from 'native-base';
import HeaderTitle from 'src/components/HeaderTitle';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet } from 'react-native';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getWalletConfigForBitBox02 } from 'src/hardware/bitbox';
import config from 'src/core/config';
import { RNCamera } from 'react-native-camera';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { io } from 'src/core/services/channel';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { BITBOX_REGISTER, CREATE_CHANNEL } from 'src/core/services/channel/constants';
import { captureError } from 'src/core/services/sentry';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import { useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';

function RegisterWithChannel() {
  const { params } = useRoute();
  const { signer } = params as { signer: VaultSigner };
  const channel = io(config.CHANNEL_URL); // TODO: update url once hosted
  let channelCreated = false;
  const { useQuery } = useContext(RealmWrapperContext);
  const { publicId }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const dispatch = useDispatch();
  const navgation = useNavigation();

  const vault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];

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
    return () => {
      channel.disconnect();
    };
  }, [channel]);

  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Register with Keeper Hardware Interface"
        subtitle={`Please visit ${config.KEEPER_HWI} to register with the device`}
      />
      <Box style={styles.qrcontainer}>
        <RNCamera
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
