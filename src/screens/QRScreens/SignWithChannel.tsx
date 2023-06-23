import React, { useContext, useEffect } from 'react';

import { Box } from 'native-base';
import HeaderTitle from 'src/components/HeaderTitle';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet } from 'react-native';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import config from 'src/core/config';
import { RNCamera } from 'react-native-camera';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { io } from 'src/core/services/channel';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import {
  BITBOX_SIGN,
  CREATE_CHANNEL,
  LEDGER_SIGN,
  SIGNED_TX,
  TREZOR_SIGN,
} from 'src/core/services/channel/constants';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { useAppSelector } from 'src/store/hooks';
import { updatePSBTEnvelops } from 'src/store/reducers/send_and_receive';
import { getTxForTrezor } from 'src/hardware/trezor';
import { captureError } from 'src/core/services/sentry';
import { SerializedPSBTEnvelop } from 'src/core/wallets/interfaces';
import { getSignedSerializedPSBTForBitbox02, getTxForBitBox02 } from 'src/hardware/bitbox';
import useVault from 'src/hooks/useVault';
import { SignerType } from 'src/core/wallets/enums';
import { signWithLedgerChannel } from 'src/hardware/ledger';
import { healthCheckSigner } from 'src/store/sagaActions/bhr';

function SignWithChannel() {
  const { params } = useRoute();
  const { signer } = params as { signer: VaultSigner };
  const { useQuery } = useContext(RealmWrapperContext);
  const { activeVault } = useVault();
  const { isMultiSig: isMultisig } = activeVault;
  const serializedPSBTEnvelops: SerializedPSBTEnvelop[] = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelops
  );
  const { serializedPSBT, signingPayload } = serializedPSBTEnvelops.filter(
    (envelop) => signer.signerId === envelop.signerId
  )[0];
  const channel = io(config.CHANNEL_URL);
  let channelCreated = false;
  const { publicId }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const dispatch = useDispatch();
  const navgation = useNavigation();

  const onBarCodeRead = ({ data }) => {
    if (!channelCreated) {
      channel.emit(CREATE_CHANNEL, { room: `${publicId}${data}`, network: config.NETWORK_TYPE });
      channelCreated = true;
    }
  };

  useEffect(() => {
    channel.on(BITBOX_SIGN, async ({ room }) => {
      const data = await getTxForBitBox02(
        serializedPSBT,
        signingPayload,
        signer,
        isMultisig,
        activeVault
      );
      channel.emit(BITBOX_SIGN, { data, room });
    });
    channel.on(TREZOR_SIGN, ({ room }) => {
      try {
        const data = getTxForTrezor(serializedPSBT, signingPayload, signer, activeVault);
        channel.emit(TREZOR_SIGN, { data, room });
      } catch (err) {
        captureError(err);
      }
    });
    channel.on(LEDGER_SIGN, ({ room }) => {
      try {
        const data = { serializedPSBT, vault: activeVault };
        channel.emit(LEDGER_SIGN, { data, room });
      } catch (err) {
        captureError(err);
      }
    });
    channel.on(SIGNED_TX, ({ data }) => {
      try {
        if (signer.type === SignerType.TREZOR) {
          const { serializedTx: txHex } = data;
          dispatch(updatePSBTEnvelops({ txHex, signerId: signer.signerId }));
          dispatch(healthCheckSigner([signer]));
          navgation.dispatch(CommonActions.navigate('SignTransactionScreen'));
        } else if (signer.type === SignerType.BITBOX02) {
          const { signedSerializedPSBT } = getSignedSerializedPSBTForBitbox02(
            serializedPSBT,
            data,
            signingPayload
          );
          dispatch(updatePSBTEnvelops({ signedSerializedPSBT, signerId: signer.signerId }));
          dispatch(healthCheckSigner([signer]));
          navgation.dispatch(CommonActions.navigate('SignTransactionScreen'));
        } else if (signer.type === SignerType.LEDGER) {
          const { signedSerializedPSBT } = signWithLedgerChannel(
            serializedPSBT,
            signingPayload,
            data
          );
          dispatch(updatePSBTEnvelops({ signedSerializedPSBT, signerId: signer.signerId }));
          dispatch(healthCheckSigner([signer]));
          navgation.dispatch(CommonActions.navigate('SignTransactionScreen'));
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
    <ScreenWrapper>
      <HeaderTitle
        title="Sign with Keeper Hardware Interface"
        subtitle={`Please visit ${config.KEEPER_HWI} to sign with the device`}
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
});
