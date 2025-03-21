import { ActivityIndicator, StyleSheet } from 'react-native';
import { Box, ScrollView, VStack, useColorMode } from 'native-base';
import React, { useContext, useEffect, useRef, useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import Note from 'src/components/Note/Note';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { io } from 'src/services/channel';
import { CHANNEL_MESSAGE, EMIT_MODES, JOIN_CHANNEL } from 'src/services/channel/constants';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import HWError from 'src/hardware/HWErrorState';
import { captureError } from 'src/services/sentry';
import config from 'src/utils/service-utilities/config';
import MockWrapper from 'src/screens/Vault/MockWrapper';
import { setSigningDevices } from 'src/store/reducers/bhr';
import Text from 'src/components/KeeperText';
import crypto from 'crypto';
import {
  createCipherGcm,
  createDecipherGcm,
  generateOutputDescriptors,
  generateVaultAddressDescriptors,
} from 'src/utils/service-utilities/utils';
import useUnkownSigners from 'src/hooks/useUnkownSigners';
import { InteracationMode } from '../Vault/HardwareModalMap';
import { setupUSBSigner } from 'src/hardware/signerSetup';
import useCanaryWalletSetup from 'src/hooks/UseCanaryWalletSetup';
import { healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import useVault from 'src/hooks/useVault';
import { updateKeyDetails } from 'src/store/sagaActions/wallets';
import ReceiveAddress from '../Recieve/ReceiveAddress';
import ReceiveQR from '../Recieve/ReceiveQR';
import QRScanner from 'src/components/QRScanner';
import { getUSBSignerDetails } from 'src/hardware/usbSigner';
import { VaultType } from 'src/services/wallets/enums';
import WalletOperations from 'src/services/wallets/operations';
import { getKeyUID } from 'src/utils/utilities';
import BackgroundTimer from 'react-native-background-timer';
import WalletHeader from 'src/components/WalletHeader';

function ScanAndInstruct({ onBarCodeRead, mode, receivingAddress }) {
  const { colorMode } = useColorMode();
  const [channelCreated, setChannelCreated] = useState(false);

  const callback = (data) => {
    let success = onBarCodeRead(data);
    if (success) {
      setChannelCreated(true);
    }
  };

  return !channelCreated ? (
    <QRScanner onScanCompleted={callback} />
  ) : (
    <VStack>
      {mode === InteracationMode.ADDRESS_VERIFICATION ? (
        <Box style={styles.addressContainer}>
          <ReceiveQR qrValue={receivingAddress} />
          <ReceiveAddress address={receivingAddress} />
        </Box>
      ) : (
        <VStack marginTop={'40%'}>
          <Text numberOfLines={2} color={`${colorMode}.greenText`} style={styles.instructions}>
            {`Please continue on the Keeper Desktop App`}
          </Text>
          <ActivityIndicator style={{ marginTop: hp(20), alignSelf: 'center', padding: '2%' }} />
        </VStack>
      )}
    </VStack>
  );
}

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
    addSignerFlow = false,
    vaultId,
    accountNumber = null,
    receiveAddressIndex = null,
  } = route.params as any;

  const [channel] = useState(io(config.CHANNEL_URL));
  const decryptionKey = useRef();
  const { createCreateCanaryWallet } = useCanaryWalletSetup({});
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { mapUnknownSigner } = useUnkownSigners();

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();

  const [newTitle, setNewTitle] = useState<string | null>(null);
  const [newSubtitle, setNewSubtitle] = useState<string | null>(null);
  const [newNote, setNewNote] = useState<string | null>(null);

  let descriptorString = null;
  let miniscriptPolicy = null;
  let addressIndex = null;
  let walletName = null;
  let hmac = null;
  let receivingAddress;
  let room;

  if (mode === InteracationMode.ADDRESS_VERIFICATION) {
    const { activeVault: vault } = useVault({ vaultId });
    if (vault.type === VaultType.MINISCRIPT) {
      miniscriptPolicy = generateOutputDescriptors(vault);
      addressIndex = receiveAddressIndex;
      walletName = vault.presentationData.name;
      receivingAddress = WalletOperations.getExternalInternalAddressAtIdx(
        vault,
        receiveAddressIndex
      );
      const vaultKey = vault.signers.find((s) => getKeyUID(s) === getKeyUID(signer));
      const currentHmac = vaultKey.registeredVaults.find((info) => info.vaultId === vaultId)?.hmac;
      if (currentHmac) {
        hmac = currentHmac;
      }
    } else {
      const resp = generateVaultAddressDescriptors(vault, receiveAddressIndex);
      descriptorString = resp.descriptorString;
      receivingAddress = resp.receivingAddress;
    }
  }

  const onBarCodeRead = (data) => {
    try {
      decryptionKey.current = data;
      const sha = crypto.createHash('sha256');
      sha.update(data);
      room = sha.digest().toString('hex');
      const requestBody: RequestBody = {
        action:
          mode === InteracationMode.ADDRESS_VERIFICATION
            ? EMIT_MODES.VERIFY_ADDRESS
            : mode == EMIT_MODES.HEALTH_CHECK
            ? EMIT_MODES.HEALTH_CHECK
            : EMIT_MODES.ADD_DEVICE,
        signerType,
      };
      if (mode === InteracationMode.ADDRESS_VERIFICATION) {
        requestBody.descriptorString = descriptorString;
        requestBody.miniscriptPolicy = miniscriptPolicy;
        requestBody.addressIndex = addressIndex;
        requestBody.walletName = walletName;
        requestBody.hmac = hmac;
        requestBody.receivingAddress = receivingAddress;
      } else {
        requestBody.accountNumber = accountNumber;
      }
      const requestData = createCipherGcm(JSON.stringify(requestBody), decryptionKey.current);
      channel.emit(JOIN_CHANNEL, {
        room,
        network: config.NETWORK_TYPE,
        requestData,
      });
      if (mode === InteracationMode.ADDRESS_VERIFICATION) {
        setNewTitle(`Verify Address on ${signer.signerName}`);
        setNewSubtitle(
          'Please follow the instructions on the desktop app. Make sure the address you see here matches the one on your hardware device screen.'
        );
        setNewNote(
          'Only use the address from Keeper mobile app if it matches the address displayed on your device'
        );
      }
      return true;
    } catch (error) {
      console.log('Error in onBarCodeRead:', error);
      if (error.message && error.message.includes('TypeError: invalid key length 1')) {
        showToast(
          'QR scanned is invalid, please make sure to scan the QR from the Keeper Desktop app.',
          <ToastErrorIcon />
        );
      } else {
        showToast('Failed to connect to the Desktop App, please try again', <ToastErrorIcon />);
      }
      return false;
      // throw error;
    }
  };

  useEffect(() => {
    const signerSetup = (signerType, signerData) => {
      try {
        const { signer } = setupUSBSigner(signerType, signerData, isMultisig);
        if (mode === InteracationMode.RECOVERY) {
          dispatch(setSigningDevices(signer));
          navigation.dispatch(
            CommonActions.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' })
          );
        } else if (mode === InteracationMode.CANARY_ADDITION) {
          dispatch(addSigningDevice([signer]));
          createCreateCanaryWallet(signer);
        } else {
          dispatch(addSigningDevice([signer]));
          const navigationState = addSignerFlow
            ? {
                name: 'Home',
                params: { selectedOption: 'Keys', addedSigner: signer },
              }
            : {
                name: 'AddSigningDevice',
                merge: true,
                params: { addedSigner: signer },
              };
          navigation.dispatch(CommonActions.navigate(navigationState));
        }
      } catch (error) {
        if (error instanceof HWError) {
          showToast(error.message, <ToastErrorIcon />);
        } else if (error.toString() === 'Error') {
          // ignore if user cancels NFC interaction
        } else captureError(error);
      }
    };

    const handleVerification = async (signerData, signerType) => {
      const handleSuccess = () => {
        dispatch(
          healthCheckStatusUpdate([
            {
              signerId: signerData.mfp,
              status: hcStatusType.HEALTH_CHECK_SUCCESSFULL,
            },
          ])
        );
        navigation.dispatch(CommonActions.goBack());
        showToast(`${signer.signerName} verified successfully`, <TickIcon />);
      };

      const handleFailure = () => {
        navigation.dispatch(CommonActions.goBack());
        dispatch(
          healthCheckStatusUpdate([
            { signerId: signerData.mfp, status: hcStatusType.HEALTH_CHECK_FAILED },
          ])
        );
        showToast(`${signer.signerName} verification failed`, <ToastErrorIcon />);
      };

      try {
        let { masterFingerprint } = getUSBSignerDetails(signerData, isMultisig);

        if (mode === InteracationMode.IDENTIFICATION) {
          const mapped = mapUnknownSigner({ masterFingerprint, type: signerType });
          if (mapped) {
            handleSuccess();
          } else {
            handleFailure();
          }
        } else {
          if (masterFingerprint === signer.masterFingerprint) {
            handleSuccess();
          } else {
            handleFailure();
          }
        }
      } catch (error) {
        if (error instanceof HWError) {
          showToast(error.message, <ToastErrorIcon />);
        } else if (error.toString() === 'Error') {
          // ignore if user cancels NFC interaction
        } else {
          captureError(error);
        }
      }
    };
    let appStateSubscription: any;

    const startBackgroundListener = () => {
      BackgroundTimer.start();

      channel.connect();
      channel.on(CHANNEL_MESSAGE, async ({ data }) => {
        try {
          const { data: decrypted } = createDecipherGcm(data, decryptionKey.current);
          const responseData = decrypted.responseData.data;
          if (mode == EMIT_MODES.HEALTH_CHECK) {
            await handleVerification(responseData, signerType);
          } else if (mode == InteracationMode.ADDRESS_VERIFICATION) {
            const resAdd = responseData.address;
            const hmac = responseData.hmac;
            if (resAdd != receivingAddress) return;
            dispatch(
              updateKeyDetails(signer, 'registered', {
                registered: true,
                hmac,
                vaultId,
              })
            );
            dispatch(
              healthCheckStatusUpdate([
                {
                  signerId: signer.masterFingerprint,
                  status: hcStatusType.HEALTH_CHECK_VERIFICATION,
                },
              ])
            );
            navigation.goBack();
            showToast(`Address verified successfully`, <TickIcon />);
          } else {
            signerSetup(signerType, responseData);
          }
        } catch (error) {
          console.log('🚀 ~ channel.on ~ error:', error);
        }
      });
    };

    startBackgroundListener();

    return () => {
      BackgroundTimer.stop();
      channel.disconnect();
      appStateSubscription?.remove();
    };
  }, []);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <MockWrapper
        signerType={signerType}
        addSignerFlow={addSignerFlow}
        mode={mode}
        signerXfp={signer?.masterFingerprint}
      >
        <WalletHeader title={newTitle ?? title} subTitle={newSubtitle ?? subtitle} />
        <ScrollView contentContainerStyle={styles.container} scrollEnabled={false}>
          <ScanAndInstruct
            onBarCodeRead={onBarCodeRead}
            mode={mode}
            receivingAddress={receivingAddress}
          />
        </ScrollView>
        <Box style={styles.noteWrapper}>
          <Note
            title={common.note}
            subtitle={
              newNote ?? 'Make sure that the QR is well aligned, focused and visible as a whole'
            }
            subtitleColor="GreyText"
          />
        </Box>
      </MockWrapper>
    </ScreenWrapper>
  );
}

export default ConnectChannel;

type RequestBody = {
  action: string;
  signerType: string;
  descriptorString?: string;
  miniscriptPolicy?: string;
  addressIndex?: number;
  walletName?: string;
  hmac?: string;
  receivingAddress?: string;
  accountNumber?: number;
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 25,
    alignItems: 'center',
  },
  noteWrapper: {
    marginHorizontal: '5%',
  },
  instructions: {
    width: windowWidth * 0.75,
    padding: '2%',
    letterSpacing: 0.65,
    fontSize: 13,
    textAlign: 'center',
  },
  addressContainer: {
    marginHorizontal: wp(20),
  },
});
