import { StyleSheet } from 'react-native';
import { Box } from 'native-base';
import React, { useContext, useEffect } from 'react';

import HeaderTitle from 'src/components/HeaderTitle';
import { RNCamera } from 'react-native-camera';
import ScreenWrapper from 'src/components/ScreenWrapper';
import Note from 'src/components/Note/Note';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { LocalizationContext } from 'src/common/content/LocContext';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { io } from 'src/core/services/channel';
import {
  BITBOX_HEALTHCHECK,
  BITBOX_SETUP,
  CREATE_CHANNEL,
  LEDGER_HEALTHCHECK,
  LEDGER_SETUP,
  TREZOR_HEALTHCHECK,
  TREZOR_SETUP,
} from 'src/core/services/channel/constants';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { getBitbox02Details } from 'src/hardware/bitbox';
import usePlan from 'src/hooks/usePlan';
import { generateSignerFromMetaData } from 'src/hardware';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import { useDispatch } from 'react-redux';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import HWError from 'src/hardware/HWErrorState';
import { captureError } from 'src/core/services/sentry';
import config from 'src/core/config';
import { getTrezorDetails } from 'src/hardware/trezor';
import { getLedgerDetailsFromChannel } from 'src/hardware/ledger';
import { checkSigningDevice } from '../Vault/AddSigningDevice';
import MockWrapper from '../Vault/MockWrapper';
import { healthCheckSigner } from 'src/store/sagaActions/bhr';

function ConnectChannel() {
  const route = useRoute();
  const { title = '', subtitle = '', type: signerType, signer } = route.params as any;
  const channel = io(config.CHANNEL_URL);
  let channelCreated = false;

  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { useQuery } = useContext(RealmWrapperContext);
  const { publicId }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();

  const { subscriptionScheme } = usePlan();
  const isMultisig = subscriptionScheme.n !== 1;

  const onBarCodeRead = ({ data }) => {
    if (!channelCreated) {
      channel.emit(CREATE_CHANNEL, { room: `${publicId}${data}`, network: config.NETWORK_TYPE });
      channelCreated = true;
    }
  };

  useEffect(() => {
    channel.on(BITBOX_SETUP, async (data) => {
      try {
        const { xpub, derivationPath, xfp, xpubDetails } = getBitbox02Details(data, isMultisig);
        const bitbox02 = generateSignerFromMetaData({
          xpub,
          derivationPath,
          xfp,
          isMultisig,
          signerType: SignerType.BITBOX02,
          storageType: SignerStorage.COLD,
          xpubDetails,
        });
        dispatch(addSigningDevice(bitbox02));
        navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
        showToast(`${bitbox02.signerName} added successfully`, <TickIcon />);
        const exsists = await checkSigningDevice(bitbox02.signerId);
        if (exsists)
          showToast('Warning: Vault with this signer already exisits', <ToastErrorIcon />);
      } catch (error) {
        if (error instanceof HWError) {
          showToast(error.message, <ToastErrorIcon />, 3000);
        } else if (error.toString() === 'Error') {
          // ignore if user cancels NFC interaction
        } else captureError(error);
      }
    });
    channel.on(TREZOR_SETUP, async (data) => {
      try {
        const { xpub, derivationPath, xfp, xpubDetails } = getTrezorDetails(data, isMultisig);
        const trezor = generateSignerFromMetaData({
          xpub,
          derivationPath,
          xfp,
          isMultisig,
          signerType: SignerType.TREZOR,
          storageType: SignerStorage.COLD,
          xpubDetails,
        });
        dispatch(addSigningDevice(trezor));
        navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
        showToast(`${trezor.signerName} added successfully`, <TickIcon />);
        const exsists = await checkSigningDevice(trezor.signerId);
        if (exsists)
          showToast('Warning: Vault with this signer already exisits', <ToastErrorIcon />);
      } catch (error) {
        if (error instanceof HWError) {
          showToast(error.message, <ToastErrorIcon />, 3000);
        } else if (error.toString() === 'Error') {
          // ignore if user cancels NFC interaction
        } else captureError(error);
      }
    });

    channel.on(LEDGER_SETUP, async (data) => {
      try {
        const { xpub, derivationPath, xfp, xpubDetails } = getLedgerDetailsFromChannel(
          data,
          isMultisig
        );
        const ledger = generateSignerFromMetaData({
          xpub,
          derivationPath,
          xfp,
          isMultisig,
          signerType: SignerType.LEDGER,
          storageType: SignerStorage.COLD,
          xpubDetails,
        });
        dispatch(addSigningDevice(ledger));
        navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
        showToast(`${ledger.signerName} added successfully`, <TickIcon />);
        const exsists = await checkSigningDevice(ledger.signerId);
        if (exsists)
          showToast('Warning: Vault with this signer already exisits', <ToastErrorIcon />);
      } catch (error) {
        if (error instanceof HWError) {
          showToast(error.message, <ToastErrorIcon />, 3000);
        } else if (error.toString() === 'Error') {
          // ignore if user cancels NFC interaction
        } else captureError(error);
      }
    });

    channel.on(LEDGER_HEALTHCHECK, async (data) => {
      try {
        const { xpub } = getLedgerDetailsFromChannel(data, isMultisig);
        if (signer.xpub === xpub) {
          dispatch(healthCheckSigner([signer]));
          navigation.dispatch(CommonActions.goBack());
          showToast(`${signer.signerName} verified successfully`, <TickIcon />);
        } else {
          navigation.dispatch(CommonActions.goBack());
          showToast(`${signer.signerName} verification failed`, <ToastErrorIcon />);
        }
      } catch (error) {
        if (error instanceof HWError) {
          showToast(error.message, <ToastErrorIcon />, 3000);
        } else if (error.toString() === 'Error') {
          // ignore if user cancels NFC interaction
        } else captureError(error);
      }
    });
    channel.on(TREZOR_HEALTHCHECK, async (data) => {
      try {
        const { xpub } = getTrezorDetails(data, isMultisig);
        if (signer.xpub === xpub) {
          dispatch(healthCheckSigner([signer]));
          navigation.dispatch(CommonActions.goBack());
          showToast(`${signer.signerName} verified successfully`, <TickIcon />);
        } else {
          navigation.dispatch(CommonActions.goBack());
          showToast(`${signer.signerName} verification failed`, <ToastErrorIcon />);
        }
      } catch (error) {
        if (error instanceof HWError) {
          showToast(error.message, <ToastErrorIcon />, 3000);
        } else if (error.toString() === 'Error') {
          // ignore if user cancels NFC interaction
        } else captureError(error);
      }
    });
    channel.on(BITBOX_HEALTHCHECK, async (data) => {
      try {
        const { xpub } = getTrezorDetails(data, isMultisig);
        if (signer.xpub === xpub) {
          dispatch(healthCheckSigner([signer]));
          navigation.dispatch(CommonActions.goBack());
          showToast(`${signer.signerName} verified successfully`, <TickIcon />);
        } else {
          navigation.dispatch(CommonActions.goBack());
          showToast(`${signer.signerName} verification failed`, <ToastErrorIcon />);
        }
      } catch (error) {
        if (error instanceof HWError) {
          showToast(error.message, <ToastErrorIcon />, 3000);
        } else if (error.toString() === 'Error') {
          // ignore if user cancels NFC interaction
        } else captureError(error);
      }
    });

    return () => {
      channel.disconnect();
    };
  }, [channel]);

  return (
    <ScreenWrapper>
      <MockWrapper signerType={signerType}>
        <Box flex={1}>
          <HeaderTitle title={title} subtitle={subtitle} />
          <Box style={styles.qrcontainer}>
            <RNCamera
              autoFocus="on"
              style={styles.cameraView}
              captureAudio={false}
              onBarCodeRead={onBarCodeRead}
              useNativeZoom
            />
          </Box>
          <Box style={styles.noteWrapper}>
            <Note
              title={common.note}
              subtitle="Make sure that the QR is well aligned, focused and visible as a whole"
              subtitleColor="GreyText"
            />
          </Box>
        </Box>
      </MockWrapper>
    </ScreenWrapper>
  );
}

export default ConnectChannel;

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
