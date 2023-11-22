import { ActivityIndicator, StyleSheet } from 'react-native';
import { Box, ScrollView, VStack, useColorMode } from 'native-base';
import React, { useContext, useEffect, useRef, useState } from 'react';
import KeeperHeader from 'src/components/KeeperHeader';
import { RNCamera } from 'react-native-camera';
import ScreenWrapper from 'src/components/ScreenWrapper';
import Note from 'src/components/Note/Note';
import { windowWidth } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { io } from 'src/services/channel';
import {
  BITBOX_HEALTHCHECK,
  BITBOX_SETUP,
  JOIN_CHANNEL,
  LEDGER_HEALTHCHECK,
  LEDGER_SETUP,
  TREZOR_HEALTHCHECK,
  TREZOR_SETUP,
} from 'src/services/channel/constants';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { getBitbox02Details } from 'src/hardware/bitbox';
import { generateSignerFromMetaData } from 'src/hardware';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import { useDispatch } from 'react-redux';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import HWError from 'src/hardware/HWErrorState';
import { captureError } from 'src/services/sentry';
import config from 'src/core/config';
import { getTrezorDetails } from 'src/hardware/trezor';
import { getLedgerDetailsFromChannel } from 'src/hardware/ledger';
import { healthCheckSigner } from 'src/store/sagaActions/bhr';
import { checkSigningDevice } from '../Vault/AddSigningDevice';
import MockWrapper from 'src/screens/Vault/MockWrapper';
import { InteracationMode } from '../Vault/HardwareModalMap';
import { setSigningDevices } from 'src/store/reducers/bhr';
import Text from 'src/components/KeeperText';
import crypto from 'crypto';
import { createDecipheriv } from 'src/core/utils';

const ScanAndInstruct = ({ onBarCodeRead, mode }) => {
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
        {`\u2022 Please ${
          mode === InteracationMode.HEALTH_CHECK ? 'do a health check' : 'share the xPub'
        } from the Keeper web interface...`}
      </Text>
      <Text numberOfLines={3} color={`${colorMode}.greenText`} style={styles.instructions}>
        {
          '\u2022 If the web interface does not update, please check be sure to stay on the same internet connection and rescan the QR code.'
        }
      </Text>
      <ActivityIndicator style={{ alignSelf: 'flex-start', padding: '2%' }} />
    </VStack>
  );
};

function ConnectChannel() {
  const { colorMode } = useColorMode();
  const route = useRoute();
  const {
    title = '',
    subtitle = '',
    type: signerType,
    signer,
    mode,
    isMultisig,
  } = route.params as any;

  const [channel] = useState(io(config.CHANNEL_URL));
  const decryptionKey = useRef();

  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();

  const onBarCodeRead = ({ data }) => {
    decryptionKey.current = data;
    let sha = crypto.createHash('sha256');
    sha.update(data);
    const room = sha.digest().toString('hex');
    channel.emit(JOIN_CHANNEL, { room, network: config.NETWORK_TYPE });
  };

  useEffect(() => {
    channel.on(BITBOX_SETUP, async (data) => {
      try {
        const decrypted = createDecipheriv(data, decryptionKey.current);
        const { xpub, derivationPath, xfp, xpubDetails } = getBitbox02Details(
          decrypted,
          isMultisig
        );
        const bitbox02 = generateSignerFromMetaData({
          xpub,
          derivationPath,
          xfp,
          isMultisig,
          signerType: SignerType.BITBOX02,
          storageType: SignerStorage.COLD,
          xpubDetails,
        });

        if (mode === InteracationMode.RECOVERY) {
          dispatch(setSigningDevices(bitbox02));
          navigation.dispatch(
            CommonActions.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' })
          );
        } else {
          dispatch(addSigningDevice(bitbox02));
          navigation.dispatch(
            CommonActions.navigate({ name: 'AddSigningDevice', merge: true, params: {} })
          );
        }

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
        const decrypted = createDecipheriv(data, decryptionKey.current);
        const { xpub, derivationPath, xfp, xpubDetails } = getTrezorDetails(decrypted, isMultisig);
        const trezor = generateSignerFromMetaData({
          xpub,
          derivationPath,
          xfp,
          isMultisig,
          signerType: SignerType.TREZOR,
          storageType: SignerStorage.COLD,
          xpubDetails,
        });
        if (mode === InteracationMode.RECOVERY) {
          dispatch(setSigningDevices(trezor));
          navigation.dispatch(
            CommonActions.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' })
          );
        } else {
          dispatch(addSigningDevice(trezor));
          navigation.dispatch(
            CommonActions.navigate({ name: 'AddSigningDevice', merge: true, params: {} })
          );
        }
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
        const decrypted = createDecipheriv(data, decryptionKey.current);
        const { xpub, derivationPath, xfp, xpubDetails } = getLedgerDetailsFromChannel(
          decrypted,
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
        if (mode === InteracationMode.RECOVERY) {
          dispatch(setSigningDevices(ledger));
          navigation.dispatch(
            CommonActions.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' })
          );
        } else {
          dispatch(addSigningDevice(ledger));
          navigation.dispatch(
            CommonActions.navigate({ name: 'AddSigningDevice', merge: true, params: {} })
          );
        }

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
        const decrypted = createDecipheriv(data, decryptionKey.current);
        const { xpub } = getLedgerDetailsFromChannel(decrypted, isMultisig);
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
        const decrypted = createDecipheriv(data, decryptionKey.current);
        const { xpub } = getTrezorDetails(decrypted, isMultisig);
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
        const decrypted = createDecipheriv(data, decryptionKey.current);
        const { xpub } = getTrezorDetails(decrypted, isMultisig);
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
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <MockWrapper signerType={signerType}>
        <KeeperHeader title={title} subtitle={subtitle} />
        <ScrollView contentContainerStyle={styles.container} scrollEnabled={false}>
          <ScanAndInstruct onBarCodeRead={onBarCodeRead} mode={mode} />
        </ScrollView>
        <Box style={styles.noteWrapper}>
          <Note
            title={common.note}
            subtitle="Make sure that the QR is well aligned, focused and visible as a whole"
            subtitleColor="GreyText"
          />
        </Box>
      </MockWrapper>
    </ScreenWrapper>
  );
}

export default ConnectChannel;

const styles = StyleSheet.create({
  container: {
    marginVertical: 25,
    alignItems: 'center',
  },
  cameraView: {
    height: windowWidth * 0.7,
    width: windowWidth * 0.8,
  },
  noteWrapper: {
    marginHorizontal: '5%',
  },
  instructions: {
    width: windowWidth * 0.8,
    padding: '2%',
    letterSpacing: 0.65,
    fontSize: 13,
  },
});
