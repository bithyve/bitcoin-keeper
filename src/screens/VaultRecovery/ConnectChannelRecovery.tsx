import { ActivityIndicator, StyleSheet } from 'react-native';
import { Box, VStack, useColorMode } from 'native-base';
import React, { useContext, useEffect, useRef, useState } from 'react';

import HeaderTitle from 'src/components/HeaderTitle';
import { RNCamera } from 'react-native-camera';
import ScreenWrapper from 'src/components/ScreenWrapper';
import Note from 'src/components/Note/Note';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { io } from 'src/services/channel';
import {
  BITBOX_SETUP,
  CREATE_CHANNEL,
  LEDGER_SETUP,
  TREZOR_SETUP,
} from 'src/services/channel/constants';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { getBitbox02Details } from 'src/hardware/bitbox';
import { generateSignerFromMetaData } from 'src/hardware';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import { useDispatch } from 'react-redux';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import HWError from 'src/hardware/HWErrorState';
import { captureError } from 'src/services/sentry';
import config from 'src/core/config';
import { getTrezorDetails } from 'src/hardware/trezor';
import { setSigningDevices } from 'src/store/reducers/bhr';
import { useAppSelector } from 'src/store/hooks';
import { getLedgerDetailsFromChannel } from 'src/hardware/ledger';
import MockWrapper from 'src/screens/Vault/MockWrapper';
import { checkSigningDevice } from '../Vault/AddSigningDevice';
import Text from 'src/components/KeeperText';

function ConnectChannelRecovery() {
  const route = useRoute();
  const { colorMode } = useColorMode();
  const { title = '', subtitle = '', type: signerType } = route.params as any;
  const channel = useRef(io(config.CHANNEL_URL)).current;
  const [channelCreated, setChannelCreated] = useState(false);

  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();

  const { signingDevices } = useAppSelector((state) => state.bhr);
  const isMultisig = signingDevices.length >= 1;

  const id = Math.random();
  const onBarCodeRead = ({ data }) => {
    if (!channelCreated) {
      channel.emit(CREATE_CHANNEL, { room: `${id}${data}`, network: config.NETWORK_TYPE });
      setChannelCreated(true);
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
        dispatch(setSigningDevices(bitbox02));
        navigation.dispatch(
          CommonActions.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' })
        );
        showToast(`${bitbox02.signerName} added successfully`, <TickIcon />);
        const exsists = await checkSigningDevice(bitbox02.signerId);
        if (exsists) showToast('Warning: Signer already added', <ToastErrorIcon />);
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
        dispatch(setSigningDevices(trezor));
        navigation.dispatch(
          CommonActions.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' })
        );
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
        dispatch(setSigningDevices(ledger));
        navigation.dispatch(
          CommonActions.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' })
        );
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

    return () => {
      channel.disconnect();
    };
  }, [channel]);

  return (
    <ScreenWrapper>
      <MockWrapper signerType={signerType}>
        <Box flex={1}>
          <HeaderTitle title={title} subtitle={subtitle} paddingLeft={wp(20)} />
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
                <Text
                  numberOfLines={2}
                  color={`${colorMode}.greenText`}
                  style={styles.instructions}
                >
                  {'\u2022 Please check health from the Keeper web interface...'}
                </Text>
                <Text
                  numberOfLines={3}
                  color={`${colorMode}.greenText`}
                  style={styles.instructions}
                >
                  {
                    '\u2022 If the web interface does not update, please check be sure to stay on the same internet connection and rescan the QR code.'
                  }
                </Text>
                <ActivityIndicator style={{ alignSelf: 'flex-start', padding: '2%' }} />
              </VStack>
            )}
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

export default ConnectChannelRecovery;

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
