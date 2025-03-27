import { StyleSheet } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { SignerStorage, SignerType } from 'src/services/wallets/enums';
import { getColdcardDetails, getConfigDetails } from 'src/hardware/coldcard';

import { Box, useColorMode } from 'native-base';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import React, { useState } from 'react';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/services/sentry';
import { generateSignerFromMetaData } from 'src/hardware';
import { useDispatch } from 'react-redux';
import useNfcModal from 'src/hooks/useNfcModal';
import ScreenWrapper from 'src/components/ScreenWrapper';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import HWError from 'src/hardware/HWErrorState';
import useAsync from 'src/hooks/useAsync';
import NfcManager from 'react-native-nfc-manager';
import DeviceInfo from 'react-native-device-info';
import { healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import MockWrapper from 'src/screens/Vault/MockWrapper';
import { setSigningDevices } from 'src/store/reducers/bhr';
import { Signer } from 'src/services/wallets/interfaces/vault';
import useConfigRecovery from 'src/hooks/useConfigReocvery';
import useUnkownSigners from 'src/hooks/useUnkownSigners';
import { InteracationMode } from '../Vault/HardwareModalMap';
import useCanaryWalletSetup from 'src/hooks/UseCanaryWalletSetup';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import WalletHeader from 'src/components/WalletHeader';
import { hp, wp } from 'src/constants/responsive';
import ColdCardIllustration from 'src/assets/images/ColdCardSetup.svg';
import HealthCheckIllustration from 'src/assets/images/health-check-illustration.svg';
import HealthCheckIllustrationDark from 'src/assets/images/health-check-illustration-dark.svg';
import Instruction from 'src/components/Instruction';
import KeeperModal from 'src/components/KeeperModal';
import { TouchableOpacity } from 'react-native-gesture-handler';
import InfoIconDark from 'src/assets/images/info-Dark-icon.svg';
import InfoIcon from 'src/assets/images/info_icon.svg';

const getTitle = (mode) => {
  switch (mode) {
    case InteracationMode.CONFIG_RECOVERY:
      return 'Recover Using Configuration';
    case InteracationMode.VAULT_ADDITION:
      return 'Setting up Coldcard';
    case InteracationMode.HEALTH_CHECK || InteracationMode.IDENTIFICATION:
      return 'Health Check Coldcard';
  }
};

function SetupColdCard({ route }) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {
    mode,
    signer,
    isMultisig,
    addSignerFlow = false,
    Illustration,
    Instructions,
  }: {
    mode: InteracationMode;
    signer: Signer;
    isMultisig: boolean;
    addSignerFlow?: boolean;
    Illustration?: any;
    Instructions?: any;
    isHealthcheck?: boolean;
  } = route.params;
  const { nfcVisible, withNfcModal, closeNfc } = useNfcModal();
  const { showToast } = useToastMessage();
  const { initateRecovery } = useConfigRecovery();
  const { mapUnknownSigner } = useUnkownSigners();
  const { start } = useAsync();
  const isConfigRecovery = mode === InteracationMode.CONFIG_RECOVERY;
  const { createCreateCanaryWallet } = useCanaryWalletSetup({});
  const isDarkMode = colorMode === 'dark';
  const [infoModal, setInfoModal] = useState(false);

  const startNfcRead = () => {
    NfcManager.isSupported().then((supported) => {
      if (supported) {
        if (mode === InteracationMode.HEALTH_CHECK) verifyColdCardWithProgress();
        else if (mode === InteracationMode.CONFIG_RECOVERY) recoverConfigforCC();
        else if (mode === InteracationMode.IDENTIFICATION) verifyColdCardWithProgress();
        else if (mode === InteracationMode.CANARY_ADDITION) addColdCardWithProgress();
        else {
          addColdCardWithProgress();
        }
      } else if (!DeviceInfo.isEmulator()) {
        showToast('NFC not supported on this device', <ToastErrorIcon />);
      }
    });
  };

  const handleNFCError = (error) => {
    if (error instanceof HWError) {
      showToast(error.message, <ToastErrorIcon />);
    } else if (error.toString() !== 'Error') {
      captureError(error);
    }
  };

  const addColdCardWithProgress = async () => {
    await start(() => addColdCard(mode));
  };

  const verifyColdCardWithProgress = async () => {
    await start(() => verifyColdCard(mode));
  };

  const recoverConfigforCC = async () => {
    const config = await withNfcModal(async () => getConfigDetails());
    initateRecovery(config);
  };

  const addColdCard = async (mode) => {
    try {
      const ccDetails = await withNfcModal(async () => getColdcardDetails(isMultisig));
      const { xpub, derivationPath, masterFingerprint, xpubDetails } = ccDetails;
      const { signer: coldcard } = generateSignerFromMetaData({
        xpub,
        derivationPath,
        masterFingerprint,
        isMultisig,
        signerType: SignerType.COLDCARD,
        storageType: SignerStorage.COLD,
        xpubDetails,
      });

      if (mode === InteracationMode.RECOVERY) {
        dispatch(setSigningDevices(coldcard));
        navigation.dispatch(
          CommonActions.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' })
        );
      } else if (mode === InteracationMode.CANARY_ADDITION) {
        dispatch(setSigningDevices(coldcard));
        createCreateCanaryWallet(coldcard);
      } else {
        dispatch(addSigningDevice([coldcard]));
        const navigationState = addSignerFlow
          ? {
              name: 'Home',
              params: { selectedOption: 'Keys', addedSigner: coldcard },
            }
          : {
              name: 'AddSigningDevice',
              merge: true,
              params: { addedSigner: coldcard },
            };
        navigation.dispatch(CommonActions.navigate(navigationState));
      }
    } catch (error) {
      handleNFCError(error);
    }
  };
  const verifyColdCard = async (mode) => {
    try {
      const ccDetails = await withNfcModal(async () => getColdcardDetails(isMultisig));
      const { masterFingerprint } = ccDetails;
      const ColdCardVerified = () => {
        dispatch(
          healthCheckStatusUpdate([
            {
              signerId: signer.masterFingerprint,
              status: hcStatusType.HEALTH_CHECK_SUCCESSFULL,
            },
          ])
        );
        navigation.dispatch(CommonActions.goBack());
        showToast('ColdCard verified successfully', <TickIcon />);
      };
      const showVerificationError = () => {
        dispatch(
          healthCheckStatusUpdate([
            {
              signerId: signer.masterFingerprint,
              status: hcStatusType.HEALTH_CHECK_FAILED,
            },
          ])
        );
        showToast('Something went wrong!', <ToastErrorIcon />);
      };
      if (mode === InteracationMode.IDENTIFICATION) {
        const mapped = mapUnknownSigner({ masterFingerprint, type: SignerType.COLDCARD });
        if (mapped) {
          ColdCardVerified();
        } else {
          showVerificationError();
        }
      } else {
        if (masterFingerprint === signer.masterFingerprint) {
          ColdCardVerified();
        } else {
          showVerificationError();
        }
      }
    } catch (error) {
      if (error instanceof HWError) {
        showToast(error.message, <ToastErrorIcon />);
      } else if (error.toString() === 'Error') {
        // ignore if user cancels NFC interaction
      } else captureError(error);
    }
  };

  const instructions = isConfigRecovery
    ? '\nExport the wallet config by going to Settings > Multisig Wallets > <Your Wallet> > Descriptors > Export > Press 3 to share via NFC'
    : mode === InteracationMode.CANARY_ADDITION
    ? '\nExport the Coldcard data by going to Advanced/Tools > Export Wallet > Generic JSON. From there choose the account number (default 0) and transfer over NFC.'
    : '\nExport the Coldcard data by going to Advanced/Tools > Export Wallet > Generic JSON. From there choose 0 for the account number and transfer over NFC.';
  const instructions2 =
    mode === InteracationMode.VAULT_ADDITION
      ? 'Make sure you remember the account you had chosen (This is important for recovering your wallet).'
      : '';
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <MockWrapper
        signerType={SignerType.COLDCARD}
        addSignerFlow={addSignerFlow}
        signerXfp={signer?.masterFingerprint}
        mode={mode}
      >
        <WalletHeader
          title={getTitle(mode)}
          rightComponent={
            InteracationMode.VAULT_ADDITION ? (
              <TouchableOpacity style={styles.infoIcon} onPress={() => setInfoModal(true)}>
                {isDarkMode ? <InfoIconDark /> : <InfoIcon />}
              </TouchableOpacity>
            ) : null
          }
        />
        <Box flex={1} marginTop={hp(30)}>
          <Box backgroundColor={`${colorMode}.boxSecondaryBackground`} style={styles.container}>
            <Text fontSize={14} color={`${colorMode}.secondaryText`}>
              {instructions}
            </Text>
            <Box style={styles.illustration}>
              {mode === InteracationMode.HEALTH_CHECK ? (
                colorMode === 'light' ? (
                  <HealthCheckIllustration />
                ) : (
                  <HealthCheckIllustrationDark />
                )
              ) : (
                <ColdCardIllustration />
              )}
            </Box>
            <Text fontSize={14} color={`${colorMode}.secondaryText`}>
              {instructions2}
            </Text>
          </Box>
        </Box>
        <Buttons
          fullWidth
          primaryCallback={startNfcRead}
          primaryText="Start NFC"
          primaryDisable={nfcVisible}
        />
        <NfcPrompt visible={nfcVisible} close={closeNfc} />
      </MockWrapper>
      <KeeperModal
        visible={infoModal}
        close={() => {
          setInfoModal(false);
        }}
        title={getTitle(mode)}
        subTitle={`Get your Coldcard ready before proceeding.`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <Box>
            <Box style={styles.illustrations}>{Illustration}</Box>

            {Instructions?.map((instruction) => (
              <Instruction text={instruction} key={instruction} />
            ))}
          </Box>
        )}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp(20),
    paddingTop: hp(5),
    paddingBottom: hp(20),
    borderRadius: 15,
  },
  illustration: {
    alignSelf: 'center',
    marginVertical: hp(40),
  },
  infoIcon: {
    marginRight: wp(10),
  },
  illustrations: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(20),
  },
});

export default SetupColdCard;
