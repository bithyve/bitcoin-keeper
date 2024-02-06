// /* eslint-disable no-case-declarations */

/* eslint-disable no-case-declarations */
import React, { useCallback, useContext, useEffect, useState } from 'react';
import * as bip39 from 'bip39';
import moment from 'moment';
import { ActivityIndicator, Alert, Clipboard, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, useColorMode, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { EntityKind, SignerStorage, SignerType, XpubTypes } from 'src/core/wallets/enums';
import {
  generateCosignerMapIds,
  generateMobileKey,
  generateSeedWordsKey,
} from 'src/core/wallets/factories/VaultFactory';
import { hp, wp } from 'src/constants/responsive';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import Text from 'src/components/KeeperText';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import ColdCardSetupImage from 'src/assets/images/ColdCardSetup.svg';
import DeleteIcon from 'src/assets/images/deleteBlack.svg';
import JadeSVG from 'src/assets/images/illustration_jade.svg';
import RecoverImage from 'src/assets/images/recover_white.svg';

import KeeperModal from 'src/components/KeeperModal';

import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import KeystoneSetupImage from 'src/assets/images/keystone_illustration.svg';
import LedgerImage from 'src/assets/images/ledger_image.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import MobileKeyIllustration from 'src/assets/images/mobileKey_illustration.svg';
import PassportSVG from 'src/assets/images/illustration_passport.svg';
import SeedSignerSetupImage from 'src/assets/images/seedsigner_setup.svg';
import SpecterSetupImage from 'src/assets/images/illustration_spectre.svg';
import KeeperSetupImage from 'src/assets/images/illustration_ksd.svg';
import SeedWordsIllustration from 'src/assets/images/illustration_seed_words.svg';
import SigningServerIllustration from 'src/assets/images/signingServer_illustration.svg';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import OtherSDSetup from 'src/assets/images/illustration_othersd.svg';
import BitboxImage from 'src/assets/images/bitboxSetup.svg';
import TrezorSetup from 'src/assets/images/trezor_setup.svg';
import { Signer, VaultSigner, XpubDetailsType } from 'src/core/wallets/interfaces/vault';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/services/sentry';
import config from 'src/core/config';
import { generateSignerFromMetaData, getSignerNameFromType } from 'src/hardware';
import { getJadeDetails } from 'src/hardware/jade';
import { getKeystoneDetails } from 'src/hardware/keystone';
import { getPassportDetails } from 'src/hardware/passport';
import { getSeedSignerDetails } from 'src/hardware/seedsigner';
import { generateKey, hash512 } from 'src/services/operations/encryption';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import useToastMessage from 'src/hooks/useToastMessage';
import LoginMethod from 'src/models/enums/LoginMethod';
import HWError from 'src/hardware/HWErrorState';
import { HWErrorType } from 'src/models/enums/Hardware';
import ReactNativeBiometrics from 'react-native-biometrics';
import { crossInteractionHandler } from 'src/utils/utilities';
import { isTestnet } from 'src/constants/Bitcoin';
import Buttons from 'src/components/Buttons';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { healthCheckSigner } from 'src/store/sagaActions/bhr';
import SigningServer from 'src/services/operations/SigningServer';
import * as SecureStore from 'src/storage/secure-store';
import { setSigningDevices } from 'src/store/reducers/bhr';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import InheritanceKeyServer from 'src/services/operations/InheritanceKey';
import { setInheritanceRequestId } from 'src/store/reducers/storage';
import Instruction from 'src/components/Instruction';
import useUnkownSigners from 'src/hooks/useUnkownSigners';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { getSpecterDetails } from 'src/hardware/specter';
import useSignerMap from 'src/hooks/useSignerMap';
import InhertanceKeyIcon from 'src/assets/images/inheritanceTitleKey.svg';
import SignerCard from '../AddSigner/SignerCard';
import useSigners from 'src/hooks/useSigners';

import useConfigRecovery from 'src/hooks/useConfigReocvery';

const RNBiometrics = new ReactNativeBiometrics();

export const enum InteracationMode {
  VAULT_ADDITION = 'VAULT_ADDITION',
  HEALTH_CHECK = 'HEALTH_CHECK',
  RECOVERY = 'RECOVERY',
  CONFIG_RECOVERY = 'CONFIG_RECOVERY',
  IDENTIFICATION = 'IDENTIFICATION',
  APP_ADDITION = 'APP_ADDITION',
}

const getSignerContent = (
  type: SignerType,
  isMultisig: boolean,
  translations: any,
  isHealthcheck: boolean
) => {
  const { tapsigner, coldcard, ledger, bitbox, trezor } = translations;
  switch (type) {
    case SignerType.COLDCARD:
      const ccInstructions =
        'Export the xPub by going to Advanced/Tools > Export wallet > Generic JSON. From here choose the account number and transfer over NFC. Make sure you remember the account you had chosen (This is important for recovering your vault).\n';
      return {
        Illustration: <ColdCardSetupImage />,
        Instructions: isTestnet()
          ? [
              ccInstructions,
              'Make sure you enable Testnet mode on the coldcard if you are running the app in the Testnet mode from Advance option > Danger Zone > Testnet and enable it.',
            ]
          : [ccInstructions],
        title: coldcard.SetupTitle,
        subTitle: `${coldcard.SetupDescription}`,
        options: [],
      };
    case SignerType.JADE:
      const jadeInstructions = `Make sure the Jade is setup with a companion app and Unlocked. Then export the xPub by going to Settings > Xpub Export. Also to be sure that the wallet type and script type is set to ${
        isMultisig ? 'MultiSig' : 'SingleSig'
      } and Native Segwit in the options section.`;
      return {
        Illustration: <JadeSVG />,
        Instructions: isTestnet()
          ? [
              jadeInstructions,
              'Make sure you enable Testnet mode on the Jade while creating the wallet with the companion app if you are running Keeper in the Testnet mode.',
            ]
          : [jadeInstructions],
        title: 'Setting up Blockstream Jade',
        subTitle: 'Keep your Jade ready and unlocked before proceeding',
        options: [],
      };
    case SignerType.KEEPER:
      return {
        Illustration: <KeeperSetupImage />,
        Instructions: [
          'Choose a wallet or create a new one from your Linked Wallets',
          'Within settings choose Show co-signer Details to scan the QR',
        ],
        title: 'Keep your Device Ready',
        subTitle: 'Keep your Collaborative Key ready before proceeding',
        options: [],
      };
    case SignerType.MOBILE_KEY:
      return {
        Illustration: <MobileKeyIllustration />,
        Instructions: [
          'Make sure that this wallet’s Recovery Phrase is backed-up properly to secure this key.',
        ],
        title: isHealthcheck ? 'Verify Mobile Key' : 'Set up a Mobile Key',
        subTitle: 'Your passcode or biometrics act as your key for signing transactions',
        options: [],
      };
    case SignerType.KEYSTONE:
      const keystoneInstructions = isMultisig
        ? 'Make sure the BTC-only firmware is installed and export the xPub by going to the Side Menu > Multisig Wallet > Extended menu (three dots) from the top right corner > Show/Export XPUB > Nested SegWit.\n'
        : 'Make sure the BTC-only firmware is installed and export the xPub by going to the extended menu (three dots) in the Generic Wallet section > Export Wallet';
      return {
        Illustration: <KeystoneSetupImage />,
        Instructions: isTestnet()
          ? [
              keystoneInstructions,
              'Make sure you enable Testnet mode on the Keystone if you are running the app in the Testnet mode from  Side Menu > Settings > Blockchain > Testnet and confirm',
            ]
          : [keystoneInstructions],
        title: isHealthcheck ? 'Verify Keystone' : 'Setting up Keystone',
        subTitle: 'Keep your Keystone ready before proceeding',
        options: [],
      };
    case SignerType.PASSPORT:
      const passportInstructions = `Export the xPub from the Account section > Manage Account > Connect Wallet > Keeper > ${
        isMultisig ? 'Multisig' : 'Singlesig'
      } > QR Code.\n`;
      return {
        Illustration: <PassportSVG />,
        Instructions: isTestnet()
          ? [
              passportInstructions,
              'Make sure you enable Testnet mode on the Passport if you are running the app in the Testnet mode from Settings > Bitcoin > Network > Testnet and enable it.',
            ]
          : [passportInstructions],
        title: isHealthcheck ? 'Verify Passport (Batch 2)' : 'Setting up Passport (Batch 2)',
        subTitle: 'Keep your Foundation Passport (Batch 2) ready before proceeding',
        options: [],
      };
    case SignerType.POLICY_SERVER:
      return {
        Illustration: <SigningServerIllustration />,
        Instructions: isHealthcheck
          ? ['A request to the signer will be made to checks it health']
          : [
              `A 2FA authenticator will have to be set up to use this option.`,
              `On providing the correct code from the auth app, the signer will sign the transaction.`,
            ],
        title: isHealthcheck ? 'Verify signer' : 'Setting up a signer',
        subTitle: 'A signer will hold one of the keys of the vault',
        options: [],
      };
    case SignerType.SEEDSIGNER:
      const seedSignerInstructions = `Make sure the seed is loaded and export the xPub by going to Seeds > Select your master fingerprint > Export Xpub > ${
        isMultisig ? 'Multisig' : 'Singlesig'
      } > Native Segwit > Keeper.\n`;
      return {
        Illustration: <SeedSignerSetupImage />,
        Instructions: isTestnet()
          ? [
              seedSignerInstructions,
              'Make sure you enable Testnet mode on the SeedSigner if you are running the app in the Testnet mode from Settings > Advanced > Bitcoin network > Testnet and enable it.',
            ]
          : [seedSignerInstructions],
        title: isHealthcheck ? 'Verify SeedSigner' : 'Setting up SeedSigner',
        subTitle: 'Keep your SeedSigner ready and powered before proceeding',
        options: [],
      };
    case SignerType.SPECTER:
      const specterInstructions = `Make sure the seed is loaded and export the xPub by going to Master Keys > ${
        isMultisig ? 'Multisig' : 'Singlesig'
      } > Native Segwit.\n`;
      return {
        Illustration: <SpecterSetupImage />,
        Instructions: isTestnet()
          ? [
              specterInstructions,
              `Make sure you enable Testnet mode on the Specter if you are running the app in the Testnet by selecting Switch network (Testnet) on the home screen.`,
            ]
          : [specterInstructions],
        title: isHealthcheck ? 'Verify Specter' : 'Setting up Specter DIY',
        subTitle: 'Keep your device ready and powered before proceeding',
        options: [],
      };
    case SignerType.BITBOX02:
      return {
        Illustration: <BitboxImage />,
        Instructions: [
          `Please visit ${config.KEEPER_HWI} on your Chrome browser to use the Keeper Hardware Interface to connect with BitBox02. `,
          'Make sure the device is setup with the Bitbox02 app before using it with the Keeper Hardware Interface.',
        ],
        title: isHealthcheck ? 'Verify BitBox' : bitbox.SetupTitle,
        subTitle: bitbox.SetupDescription,
        options: [],
      };
    case SignerType.TREZOR:
      return {
        Illustration: <TrezorSetup />,
        Instructions: [
          `Please visit ${config.KEEPER_HWI} on your Chrome browser to use the Keeper Hardware Interface to connect with Trezor. `,
          'Make sure the device is setup with the Trezor Connect app before using it with the Keeper Hardware Interface.',
        ],
        title: isHealthcheck ? 'Verify Trezor' : trezor.SetupTitle,
        subTitle: trezor.SetupDescription,
        options: [],
      };
    case SignerType.LEDGER:
      return {
        Illustration: <LedgerImage />,
        Instructions: [
          `Please visit ${config.KEEPER_HWI} on your Chrome browser to use the Keeper Hardware Interface to connect with Ledger. `,
          'Please Make sure you have the BTC app downloaded on Ledger before this step.',
        ],
        title: ledger.SetupTitle,
        subTitle: ledger.SetupDescription,
        options: [],
      };
    case SignerType.SEED_WORDS:
      return {
        Illustration: <SeedWordsIllustration />,
        Instructions: [
          'This mnemonic (12 words) needs to be noted down and kept offline (the private keys are not stored on the app',
          'Make sure that you’re noting down the words in private as exposing them will compromise the Seed Key',
        ],
        title: isHealthcheck ? 'Verify Seed Key' : 'Setting up Seed Key',
        subTitle: 'Seed Key is a 12 word Recovery Phrase. Please note them down and store safely',
        options: [],
      };
    case SignerType.TAPSIGNER:
      return {
        Illustration: <TapsignerSetupImage />,
        Instructions: [
          'You will need the Pin/CVC at the back of the TAPSIGNER',
          'Make sure that the TAPSIGNER has not been used as a signer in other apps',
        ],
        title: isHealthcheck ? 'Verify TAPSIGNER' : tapsigner.SetupTitle,
        subTitle: tapsigner.SetupDescription,
        options: [],
      };
    case SignerType.OTHER_SD:
      return {
        Illustration: <OtherSDSetup />,
        Instructions: [
          'Provide the Signer details either by entering them or scanning',
          'The hardened part of the derivation path of the xpub has to be denoted with a “h” or “”. Please do not use any other character',
        ],
        title: 'Setting up Signer',
        subTitle: 'Keep your Signer ready before proceeding',
        options: [],
      };

    case SignerType.INHERITANCEKEY:
      return {
        Illustration: <InhertanceKeyIcon />,
        title: 'Setting up an Inheritance Key',
        subTitle: 'This step will add an additional, mandatory key to your m-of-n vault',
        Instructions: [
          'This Key would only get activated after the other two Keys have signed',
          `On activation the Key would send emails to your email id for 30 days for you to decline using it`,
        ],
        options: [
          {
            title: 'Configure a New Key',
            icon: <RecoverImage />,
            callback: () => {},
            name: 'newKey',
          },
          {
            title: 'Recover Existing Key',
            icon: <RecoverImage />,
            name: 'recoverKey',
          },
        ],
      };
    default:
      return {
        Illustration: null,
        Instructions: [],
        title: tapsigner.SetupTitle,
        subTitle: tapsigner.SetupDescription,
        unsupported: true,
      };
  }
};

const getnavigationState = (type) => ({
  index: 5,
  routes: [
    { name: 'NewKeeperApp' },
    { name: 'EnterSeedScreen', params: { isSoftKeyRecovery: false, type } },
    { name: 'OtherRecoveryMethods' },
    { name: 'VaultRecoveryAddSigner' },
    { name: 'SigningDeviceListRecovery' },
    { name: 'EnterSeedScreen', params: { isSoftKeyRecovery: true, type } },
  ],
});

function formatDuration(ms) {
  const duration = moment.duration(ms);
  return Math.floor(duration.asHours()) + moment.utc(duration.asMilliseconds()).format(':mm:ss');
}
function SignerContent({
  Illustration,
  Instructions,
  mode,
  options,
  setSelectInheritanceType,
  selectInheritanceType,
}: {
  Illustration: Element;
  Instructions: Array<string>;
  mode: InteracationMode;
  options?: any;
  setSelectInheritanceType: (index) => any;
  selectInheritanceType: any;
}) {
  return (
    <View>
      <Box style={{ alignSelf: 'center', marginRight: 35 }}>{Illustration}</Box>
      <Box marginTop="4">
        {mode === InteracationMode.HEALTH_CHECK && (
          <Instruction text="Health Check is initiated if a signer is not used for the last 180 days" />
        )}
        {Instructions?.map((instruction) => (
          <Instruction text={instruction} key={instruction} />
        ))}
      </Box>
      <View
        style={{
          marginVertical: 5,
          gap: 2,
          flexDirection: 'row',
        }}
      >
        {options &&
          options.map((option, index) => (
            <SignerCard
              isSelected={index === selectInheritanceType}
              isFullText={true}
              name={option.title}
              icon={option.icon}
              onCardSelect={() => {
                setSelectInheritanceType(index);
              }}
            />
          ))}
      </View>
    </View>
  );
}

const setupPassport = (qrData, isMultisig) => {
  const { xpub, derivationPath, masterFingerprint, forMultiSig, forSingleSig } =
    getPassportDetails(qrData);
  if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
    const { signer: passport, key } = generateSignerFromMetaData({
      xpub,
      derivationPath,
      masterFingerprint,
      signerType: SignerType.PASSPORT,
      storageType: SignerStorage.COLD,
      isMultisig,
    });
    return { signer: passport, key };
  }
  throw new HWError(HWErrorType.INVALID_SIG);
};

const verifyPassport = (qrData, signer) => {
  const { masterFingerprint } = getPassportDetails(qrData);
  return masterFingerprint === signer.masterFingerprint;
};

const setupSeedSigner = (qrData, isMultisig) => {
  const { xpub, derivationPath, masterFingerprint, forMultiSig, forSingleSig } =
    getSeedSignerDetails(qrData);
  if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
    const { signer: seedSigner, key } = generateSignerFromMetaData({
      xpub,
      derivationPath,
      masterFingerprint,
      signerType: SignerType.SEEDSIGNER,
      storageType: SignerStorage.COLD,
      isMultisig,
    });
    return { signer: seedSigner, key };
  }
  throw new HWError(HWErrorType.INVALID_SIG);
};

const verifySeedSigner = (qrData: any, signer: VaultSigner) => {
  const { masterFingerprint } = getSeedSignerDetails(qrData);
  return masterFingerprint === signer.masterFingerprint;
};

const setupSpecter = (qrData, isMultisig) => {
  const { xpub, derivationPath, masterFingerprint, forMultiSig, forSingleSig } =
    getSpecterDetails(qrData);
  if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
    const { signer, key } = generateSignerFromMetaData({
      xpub,
      derivationPath,
      masterFingerprint,
      signerType: SignerType.SPECTER,
      storageType: SignerStorage.COLD,
      isMultisig,
    });
    return { signer, key };
  }
  throw new HWError(HWErrorType.INVALID_SIG);
};

const verifySpecter = (qrData, signer) => {
  const { masterFingerprint } = getSpecterDetails(qrData);
  return masterFingerprint === signer.masterFingerprint;
};

const setupKeystone = (qrData, isMultisig) => {
  const { xpub, derivationPath, masterFingerprint, forMultiSig, forSingleSig } =
    getKeystoneDetails(qrData);
  if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
    const { signer: keystone, key } = generateSignerFromMetaData({
      xpub,
      derivationPath,
      masterFingerprint,
      signerType: SignerType.KEYSTONE,
      storageType: SignerStorage.COLD,
      isMultisig,
    });
    return { signer: keystone, key };
  }
  throw new HWError(HWErrorType.INVALID_SIG);
};

const verifyKeystone = (qrData, signer) => {
  const { masterFingerprint } = getKeystoneDetails(qrData);
  return masterFingerprint === signer.masterFingerprint;
};

const setupJade = (qrData, isMultisig) => {
  const { xpub, derivationPath, masterFingerprint, forMultiSig, forSingleSig } =
    getJadeDetails(qrData);
  if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
    const { signer: jade, key } = generateSignerFromMetaData({
      xpub,
      derivationPath,
      masterFingerprint,
      signerType: SignerType.JADE,
      storageType: SignerStorage.COLD,
      isMultisig,
    });
    return { signer: jade, key };
  }
  throw new HWError(HWErrorType.INVALID_SIG);
};

const verifyJade = (qrData, signer) => {
  const { masterFingerprint } = getJadeDetails(qrData);
  return masterFingerprint === signer.masterFingerprint;
};

const setupKeeperSigner = (qrData, isMultisig) => {
  try {
    const { mfp, xpubDetails } = JSON.parse(qrData);
    const { signer: ksd, key } = generateSignerFromMetaData({
      xpub: isMultisig ? xpubDetails[XpubTypes.P2WSH].xpub : xpubDetails[XpubTypes.P2WPKH].xpub,
      derivationPath: isMultisig
        ? xpubDetails[XpubTypes.P2WSH].derivationPath
        : xpubDetails[XpubTypes.P2WPKH].derivationPath,
      masterFingerprint: mfp,
      signerType: SignerType.KEEPER,
      storageType: SignerStorage.WARM,
      isMultisig: true,
      xpubDetails,
    });
    return { signer: ksd, key };
  } catch (err) {
    const message = crossInteractionHandler(err);
    throw new Error(message);
  }
};

const verifyKeeperSigner = (qrData, signer) => {
  try {
    const { masterFingerprint } = extractKeyFromDescriptor(qrData);
    return masterFingerprint === signer.masterFingerprint;
  } catch (err) {
    const message = crossInteractionHandler(err);
    throw new Error(message);
  }
};

const setupMobileKey = async ({ primaryMnemonic, isMultisig }) => {
  const networkType = config.NETWORK_TYPE;

  // fetched multi-sig mobile key
  const {
    xpub: multiSigXpub,
    xpriv: multiSigXpriv,
    derivationPath: multiSigPath,
    masterFingerprint,
  } = await generateMobileKey(primaryMnemonic, networkType);
  // fetched single-sig mobile key
  const {
    xpub: singleSigXpub,
    xpriv: singleSigXpriv,
    derivationPath: singleSigPath,
  } = await generateMobileKey(primaryMnemonic, networkType, EntityKind.WALLET);

  const xpubDetails: XpubDetailsType = {};
  xpubDetails[XpubTypes.P2WPKH] = {
    xpub: singleSigXpub,
    derivationPath: singleSigPath,
    xpriv: singleSigXpriv,
  };
  xpubDetails[XpubTypes.P2WSH] = {
    xpub: multiSigXpub,
    derivationPath: multiSigPath,
    xpriv: multiSigXpriv,
  };

  const { signer: mobileKey, key } = generateSignerFromMetaData({
    xpub: isMultisig ? multiSigXpub : singleSigXpub,
    derivationPath: isMultisig ? multiSigPath : singleSigPath,
    masterFingerprint,
    signerType: SignerType.MOBILE_KEY,
    storageType: SignerStorage.WARM,
    isMultisig: true,
    xpriv: isMultisig ? multiSigXpriv : singleSigXpriv,
    xpubDetails,
  });
  return { signer: mobileKey, key };
};

export const setupSeedWordsBasedKey = (mnemonic: string, isMultisig: boolean) => {
  const networkType = config.NETWORK_TYPE;
  // fetched multi-sig seed words based key
  const {
    xpub: multiSigXpub,
    derivationPath: multiSigPath,
    masterFingerprint,
  } = generateSeedWordsKey(mnemonic, networkType, EntityKind.VAULT);
  // fetched single-sig seed words based key
  const { xpub: singleSigXpub, derivationPath: singleSigPath } = generateSeedWordsKey(
    mnemonic,
    networkType,
    EntityKind.WALLET
  );

  const xpubDetails: XpubDetailsType = {};
  xpubDetails[XpubTypes.P2WPKH] = { xpub: singleSigXpub, derivationPath: singleSigPath };
  xpubDetails[XpubTypes.P2WSH] = { xpub: multiSigXpub, derivationPath: multiSigPath };

  const { signer: softSigner, key } = generateSignerFromMetaData({
    xpub: isMultisig ? multiSigXpub : singleSigXpub,
    derivationPath: isMultisig ? multiSigPath : singleSigPath,
    masterFingerprint,
    signerType: SignerType.SEED_WORDS,
    storageType: SignerStorage.WARM,
    isMultisig,
    xpubDetails,
  });

  return { signer: softSigner, key };
};

function PasswordEnter({
  primaryMnemonic,
  navigation,
  dispatch,
  pinHash,
  isHealthcheck,
  signer,
  close,
  isMultisig,
  addSignerFlow,
}: {
  primaryMnemonic;
  navigation;
  dispatch;
  pinHash;
  isHealthcheck?;
  signer?;
  close?;
  isMultisig;
  addSignerFlow;
}) {
  const [password, setPassword] = useState('');
  const { showToast } = useToastMessage();
  const [inProgress, setInProgress] = useState(false);

  const addMobileKeyWithProgress = () => {
    setInProgress(true);
  };
  useEffect(() => {
    if (inProgress) {
      isHealthcheck ? verifyMobileKey() : addMobileKey();
    }
  }, [inProgress]);
  const addMobileKey = async () => {
    try {
      const currentPinHash = hash512(password);
      if (currentPinHash === pinHash) {
        const { signer } = await setupMobileKey({ primaryMnemonic, isMultisig });
        dispatch(addSigningDevice([signer]));
        const navigationState = addSignerFlow
          ? { name: 'ManageSigners' }
          : { name: 'AddSigningDevice', merge: true, params: {} };
        navigation.dispatch(CommonActions.navigate(navigationState));
        showToast(`${signer.signerName} added successfully`, <TickIcon />);
        setInProgress(false);
        close();
      } else {
        setInProgress(false);
        showToast('Incorrect password. Try again!', <ToastErrorIcon />);
        close();
      }
    } catch (error) {
      setInProgress(false);
      if (error instanceof HWError) {
        showToast(error.message, <ToastErrorIcon />, 3000);
      } else if (error.toString() === 'Error') {
        /* empty */
      } else captureError(error);
    }
  };

  const verifyMobileKey = () => {
    try {
      const currentPinHash = hash512(password);
      if (currentPinHash === pinHash) {
        dispatch(healthCheckSigner([signer]));
        showToast('Mobile Key verified successfully', <TickIcon />);
        setInProgress(false);
        close();
      } else {
        setInProgress(false);
        showToast('Incorrect password. Try again!', <ToastErrorIcon />);
        close();
      }
    } catch (error) {
      setInProgress(false);
      if (error instanceof HWError) {
        showToast(error.message, <ToastErrorIcon />, 3000);
        close();
      } else if (error.toString() === 'Error') {
        /* empty */
      } else captureError(error);
    }
  };
  const onPressNumber = (text) => {
    let tmpPasscode = password;
    if (password.length < 4) {
      if (text !== 'x') {
        tmpPasscode += text;
        setPassword(tmpPasscode);
      }
    }
    if (password && text === 'x') {
      setPassword(password.slice(0, -1));
    }
  };

  const onDeletePressed = () => {
    setPassword(password.slice(0, password.length - 1));
  };

  return (
    <Box style={styles.passwordContainer}>
      <CVVInputsView
        passCode={password}
        passcodeFlag={false}
        backgroundColor
        textColor
        length={4}
      />
      <Text style={styles.infoText} color="light.greenText">
        The app will use the Mobile Key to sign on entering the correct Passcode
      </Text>
      <Box mt={10} alignSelf="flex-end" mr={2}>
        <Box>
          {inProgress ? (
            <ActivityIndicator size="small" />
          ) : (
            <Buttons
              primaryCallback={addMobileKeyWithProgress}
              primaryText="Confirm"
              primaryLoading={inProgress}
            />
          )}
        </Box>
      </Box>
      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        keyColor="light.primaryText"
        ClearIcon={<DeleteIcon />}
      />
    </Box>
  );
}

function HardwareModalMap({
  type,
  visible,
  close,
  isMultisig,
  signer,
  skipHealthCheckCallBack,
  mode = InteracationMode.VAULT_ADDITION,
  primaryMnemonic,
  vaultShellId,
  addSignerFlow = false,
  vaultSigners,
  vaultId,
}: {
  type: SignerType;
  visible: boolean;
  close: any;
  signer?: Signer;
  skipHealthCheckCallBack?: any;
  mode?: InteracationMode;
  isMultisig: boolean;
  primaryMnemonic?: string;
  vaultShellId?: string;
  addSignerFlow: boolean;
  vaultSigners?: VaultSigner[];
  vaultId: string;
}) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);

  const [passwordModal, setPasswordModal] = useState(false);
  const [inProgress, setInProgress] = useState(false);

  const { mapUnknownSigner } = useUnkownSigners();
  const loginMethod = useAppSelector((state) => state.settings.loginMethod);
  const { signers } = useSigners();
  const signingDevices = signers;
  const { signerMap } = useSignerMap() as { signerMap: { [key: string]: Signer } };

  const appId = useAppSelector((state) => state.storage.appId);
  const { pinHash } = useAppSelector((state) => state.storage);
  const isHealthcheck = mode === InteracationMode.HEALTH_CHECK;

  const navigateToTapsignerSetup = () => {
    if (mode === InteracationMode.RECOVERY) {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'AddTapsignerRecovery',
          params: { mode, signer, isMultisig },
        })
      );
    }
    navigation.dispatch(
      CommonActions.navigate({
        name: 'AddTapsigner',
        params: { mode, signer, isMultisig, addSignerFlow },
      })
    );
  };

  const navigateToColdCardSetup = () => {
    if (mode === InteracationMode.RECOVERY) {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'AddColdCardRecovery',
          params: { mode, signer, isMultisig },
        })
      );
    }
    navigation.dispatch(
      CommonActions.navigate({
        name: 'AddColdCard',
        params: { mode, signer, isMultisig, addSignerFlow },
      })
    );
  };

  const navigateToAddQrBasedSigner = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ScanQR',
        params: {
          title: `${isHealthcheck ? 'Verify' : 'Setting up'} ${getSignerNameFromType(type)}`,
          subtitle: 'Please scan until all the QR data has been retrieved',
          onQrScan: isHealthcheck ? onQRScanHealthCheck : onQRScan,
          setup: true,
          type,
          mode,
          signer,
        },
      })
    );
  };

  const navigateToSigningServerSetup = async () => {
    if (mode === InteracationMode.HEALTH_CHECK) {
      try {
        setInProgress(true);
        const signerXfp = WalletUtilities.getFingerprintFromExtendedKey(
          signer.signerXpubs[XpubTypes.P2WSH][0].xpub,
          WalletUtilities.getNetworkByType(config.NETWORK_TYPE)
        );
        const { isSignerAvailable } = await SigningServer.checkSignerHealth(signerXfp);
        if (isSignerAvailable) {
          dispatch(healthCheckSigner([signer]));
          close();
          showToast('Health check done successfully', <TickIcon />);
        } else {
          close();
          showToast('Error in Health check', <ToastErrorIcon />, 3000);
        }
        setInProgress(false);
      } catch (err) {
        console.log(err);
        setInProgress(false);
        close();
        showToast('Error in Health check', <ToastErrorIcon />, 3000);
      }
    } else {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'ChoosePolicyNew',
          params: { signer, addSignerFlow, vaultId },
        })
      );
    }
  };

  const navigateToSetupWithChannel = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ConnectChannel',
        params: {
          title: `${isHealthcheck ? 'Verify' : 'Setting up'} ${getSignerNameFromType(type)}`,
          subtitle: `Please visit ${config.KEEPER_HWI} on your Chrome browser to use the Keeper Hardware Interface to setup`,
          type,
          signer,
          mode,
          isMultisig,
          addSignerFlow,
        },
      })
    );
  };

  const navigateToSetupWithOtherSD = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'SetupOtherSDScreen',
        params: {
          mode,
          isMultisig,
          addSignerFlow,
        },
      })
    );
  };

  const navigateToSeedWordSetup = () => {
    if (mode === InteracationMode.RECOVERY) {
      const navigationState = getnavigationState(SignerType.SEED_WORDS);
      navigation.dispatch(CommonActions.reset(navigationState));
      close();
    } else if (mode === InteracationMode.VAULT_ADDITION) {
      close();
      const mnemonic = bip39.generateMnemonic();
      navigation.dispatch(
        CommonActions.navigate({
          name: 'SetupSeedWordSigner',
          params: {
            seed: mnemonic,
            next: true,
            isHealthcheck,
            onSuccess: (mnemonic) => {
              const { signer, key } = setupSeedWordsBasedKey(mnemonic, isMultisig);
              dispatch(addSigningDevice([signer]));
              const navigationState = addSignerFlow
                ? { name: 'ManageSigners' }
                : { name: 'AddSigningDevice', merge: true, params: {} };
              navigation.dispatch(CommonActions.navigate(navigationState));
              showToast(`${signer.signerName} added successfully`, <TickIcon />);
            },
            addSignerFlow,
          },
        })
      );
    } else if (mode === InteracationMode.HEALTH_CHECK || mode === InteracationMode.IDENTIFICATION) {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'EnterSeedScreen',
          params: {
            mode,
            isHealthCheck: true,
            signer,
            isMultisig,
            setupSeedWordsBasedSigner: setupSeedWordsBasedKey,
            addSignerFlow,
          },
        })
      );
    }
  };

  const onQRScan = async (qrData, resetQR) => {
    let hw: { signer: Signer; key: VaultSigner };
    try {
      switch (type) {
        case SignerType.PASSPORT:
          hw = setupPassport(qrData, isMultisig);
          break;
        case SignerType.SEEDSIGNER:
          hw = setupSeedSigner(qrData, isMultisig);
          break;
        case SignerType.SPECTER:
          hw = setupSpecter(qrData, isMultisig);
          break;
        case SignerType.KEEPER:
          hw = setupKeeperSigner(qrData, isMultisig);
          break;
        case SignerType.KEYSTONE:
          hw = setupKeystone(qrData, isMultisig);
          break;
        case SignerType.JADE:
          hw = setupJade(qrData, isMultisig);
          break;
        default:
          break;
      }

      const handleSuccess = () => {
        dispatch(healthCheckSigner([signer]));
        navigation.dispatch(CommonActions.goBack());
        showToast(`${signer.signerName} verified successfully`, <TickIcon />);
      };

      const handleFailure = () => {
        navigation.dispatch(CommonActions.goBack());
        showToast(`${signer.signerName} verification failed`, <ToastErrorIcon />);
      };

      if (mode === InteracationMode.RECOVERY) {
        dispatch(setSigningDevices(hw.signer));
        navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
      } else if (mode === InteracationMode.IDENTIFICATION) {
        const mapped = mapUnknownSigner({ masterFingerprint: hw.signer.masterFingerprint, type });
        mapped ? handleSuccess() : handleFailure();
      } else {
        dispatch(addSigningDevice([hw.signer]));
        const navigationState = addSignerFlow
          ? { name: 'ManageSigners' }
          : { name: 'AddSigningDevice', merge: true, params: {} };
        navigation.dispatch(CommonActions.navigate(navigationState));
      }
      showToast(`${hw.signer.signerName} added successfully`, <TickIcon />);
    } catch (error) {
      if (error instanceof HWError) {
        showToast(error.message, <ToastErrorIcon />, 3000);
        resetQR();
      } else {
        captureError(error);
        showToast(
          `Invalid QR, please scan the QR from a ${getSignerNameFromType(type)}`,
          <ToastErrorIcon />
        );
        navigation.dispatch(
          CommonActions.navigate({ name: 'AddSigningDevice', merge: true, params: {} })
        );
      }
    }
  };

  const onQRScanHealthCheck = async (qrData, resetQR, signer) => {
    let healthcheckStatus: boolean;
    try {
      switch (type) {
        case SignerType.PASSPORT:
          healthcheckStatus = verifyPassport(qrData, signer);
          break;
        case SignerType.SEEDSIGNER:
          healthcheckStatus = verifySeedSigner(qrData, signer);
          break;
        case SignerType.SPECTER:
          healthcheckStatus = verifySpecter(qrData, signer);
          break;
        case SignerType.KEEPER:
          healthcheckStatus = verifyKeeperSigner(qrData, signer);
          break;
        case SignerType.KEYSTONE:
          healthcheckStatus = verifyKeystone(qrData, signer);
          break;
        case SignerType.JADE:
          healthcheckStatus = verifyJade(qrData, signer);
          break;
        default:
          break;
      }
      if (healthcheckStatus) {
        dispatch(healthCheckSigner([signer]));
        navigation.dispatch(CommonActions.goBack());
        showToast('Health check done successfully', <TickIcon />);
      } else {
        navigation.dispatch(CommonActions.goBack());
        showToast('Error in Health check', <ToastErrorIcon />, 3000);
      }
    } catch (error) {
      console.log('err');
      if (error instanceof HWError) {
        showToast(error.message, <ToastErrorIcon />, 3000);
        resetQR();
      } else {
        captureError(error);
        showToast(
          `Invalid QR, please scan the QR from a ${getSignerNameFromType(type)}`,
          <ToastErrorIcon />
        );
        navigation.dispatch(CommonActions.goBack());
      }
    }
  };

  const fetchSigningServerSetup = () => {
    const { translations } = useContext(LocalizationContext);
    const { vault: vaultTranslation, common } = translations;
    const verifySigningServer = async (otp) => {
      try {
        setInProgress(true);

        if (vaultSigners.length <= 1) throw new Error('Add two other devices first to recover');
        const cosignersMapIds = generateCosignerMapIds(
          signerMap,
          vaultSigners,
          SignerType.POLICY_SERVER
        );
        const response = await SigningServer.fetchSignerSetupViaCosigners(cosignersMapIds[0], otp);
        if (response.xpub) {
          const { signer: signingServerKey } = generateSignerFromMetaData({
            xpub: response.xpub,
            derivationPath: response.derivationPath,
            masterFingerprint: response.masterFingerprint,
            signerType: SignerType.POLICY_SERVER,
            storageType: SignerStorage.WARM,
            isMultisig: true,
            xfp: response.id,
            signerPolicy: response.policy,
          });
          setInProgress(false);
          dispatch(setSigningDevices(signingServerKey));
          navigation.dispatch(CommonActions.navigate('VaultRecoveryAddSigner'));
          showToast(`${signingServerKey.signerName} added successfully`, <TickIcon />);
        }
      } catch (err) {
        setInProgress(false);
        Alert.alert(`${err}`);
      }
    };

    const findSigningServer = async (otp) => {
      try {
        setInProgress(true);
        if (vaultSigners.length <= 1)
          throw new Error('Add two other devices first to do a health check');
        const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
        const ids = vaultSigners.map((signer) =>
          WalletUtilities.getFingerprintFromExtendedKey(signer.xpub, network)
        );
        const response = await SigningServer.findSignerSetup(ids, otp);
        if (response.valid) {
          const mapped = mapUnknownSigner({
            masterFingerprint: response.masterFingerprint,
            type: SignerType.POLICY_SERVER,
            signerPolicy: response.policy,
          });
          if (mapped) {
            showToast(`Signing Server verified successfully`, <TickIcon />);
          } else {
            showToast(`Something Went Wrong!`, <ToastErrorIcon />);
          }
        }
      } catch (err) {
        setInProgress(false);
        Alert.alert(`${err}`);
      }
    };
    const [otp, setOtp] = useState('');
    const onPressNumber = (text) => {
      let tmpPasscode = otp;
      if (otp.length < 6) {
        if (text !== 'x') {
          tmpPasscode += text;
          setOtp(tmpPasscode);
        }
      }
      if (otp && text === 'x') {
        setOtp(otp.slice(0, -1));
      }
    };

    const onDeletePressed = () => {
      setOtp(otp.slice(0, otp.length - 1));
    };

    return (
      <Box width={hp(300)}>
        <Box>
          <TouchableOpacity
            onPress={async () => {
              const clipBoardData = await Clipboard.getString();
              if (clipBoardData.match(/^\d{6}$/)) {
                setOtp(clipBoardData);
              } else {
                showToast('Invalid OTP');
              }
            }}
          >
            <CVVInputsView passCode={otp} passcodeFlag={false} backgroundColor textColor />
          </TouchableOpacity>
          <Text style={styles.cvvInputInfoText} color="light.greenText">
            {vaultTranslation.cvvSigningServerInfo}
          </Text>
          <Box mt={10} alignSelf="flex-end" mr={2}>
            <Box>
              <CustomGreenButton
                onPress={() => {
                  if (mode === InteracationMode.IDENTIFICATION) findSigningServer(otp);
                  verifySigningServer(otp);
                }}
                value={common.confirm}
              />
            </Box>
          </Box>
        </Box>
        <KeyPadView
          onPressNumber={onPressNumber}
          onDeletePressed={onDeletePressed}
          keyColor="light.primaryText"
          ClearIcon={<DeleteIcon />}
        />
      </Box>
    );
  };

  const navigateToMobileKey = async (isMultiSig) => {
    if (mode === InteracationMode.RECOVERY) {
      const navigationState = getnavigationState(SignerType.MOBILE_KEY);
      navigation.dispatch(CommonActions.reset(navigationState));
      close();
    } else if (mode === InteracationMode.VAULT_ADDITION) {
      await biometricAuth(isMultiSig);
    } else if (mode === InteracationMode.HEALTH_CHECK) {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'ExportSeed',
          params: {
            seed: primaryMnemonic,
            signer,
            isHealthCheck: true,
            next: true,
          },
        })
      );
    } else if (mode === InteracationMode.IDENTIFICATION) {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'ExportSeed',
          params: {
            seed: primaryMnemonic,
            signer,
            isHealthCheck: true,
            mode,
            next: true,
          },
        })
      );
    }
  };

  const biometricAuth = async (isMultisig) => {
    if (loginMethod === LoginMethod.BIOMETRIC) {
      try {
        setInProgress(true);
        setTimeout(async () => {
          const { success, signature } = await RNBiometrics.createSignature({
            promptMessage: 'Authenticate',
            payload: appId,
            cancelButtonText: 'Use PIN',
          });
          if (success) {
            setInProgress(false);
            const res = await SecureStore.verifyBiometricAuth(signature, appId);
            if (res.success) {
              const { signer, key } = await setupMobileKey({ primaryMnemonic, isMultisig });
              dispatch(addSigningDevice([signer]));
              const navigationState = addSignerFlow
                ? { name: 'ManageSigners' }
                : { name: 'AddSigningDevice', merge: true, params: {} };
              navigation.dispatch(CommonActions.navigate(navigationState));
              showToast(`${signer.signerName} added successfully`, <TickIcon />);
            } else {
              showToast('Incorrect password. Try again!', <ToastErrorIcon />);
            }
          }
        }, 200);
      } catch (error) {
        setInProgress(false);
        captureError(error);
      }
    } else {
      setInProgress(false);
      setPasswordModal(true);
    }
  };

  const handleInheritanceKey = () => {
    if (selectInheritanceType === 1) {
      requestInheritanceKeyRecovery();
    } else {
      setupInheritanceKey();
    }
  };

  // const requestInheritanceKeyRecovery = async () => {
  //   if (mode === InteracationMode.IDENTIFICATION) {
  //     try {
  //       setInProgress(true);
  //       if (vaultSigners.length <= 1)
  //         throw new Error('Add two other devices first to do a health check');
  //       const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
  //       const thresholdDescriptors = vaultSigners.map((signer) => signer.xfp);
  //       const ids = vaultSigners.map((signer) => signer.xfp);
  //       const response = await InheritanceKeyServer.findIKSSetup(ids, thresholdDescriptors);
  //       if (response.setupInfo.id) {
  //         const mapped = mapUnknownSigner({
  //           masterFingerprint: response.setupInfo.masterFingerprint,
  //           type: SignerType.POLICY_SERVER,
  //           inheritanceKeyInfo: {
  //             configuration: response.setupInfo.configuration,
  //             policy: response.setupInfo?.policy,
  //           },
  //         });
  //         if (mapped) {
  //           showToast(`IKS verified successfully`, <TickIcon />);
  //         } else {
  //           showToast(`Something Went Wrong!`, <ToastErrorIcon />);
  //         }
  //         setInProgress(false);
  //       }
  //     } catch (err) {
  //       setInProgress(false);
  //       Alert.alert(`${err}`);
  //     }
  //   } else {
  //     try {
  //       if (vaultSigners.length <= 1) throw new Error('Add two others devices first to recover');
  //       const cosignersMapIds = generateCosignerMapIds(
  //         signerMap,
  //         vaultSigners,
  //         SignerType.INHERITANCEKEY
  //       );

  //       const requestId = `request-${generateKey(10)}`;
  //       const thresholdDescriptors = vaultSigners.map((signer) => signer.xfp);

  //       const { requestStatus } = await InheritanceKeyServer.requestInheritanceKey(
  //         requestId,
  //         cosignersMapIds[0],
  //         thresholdDescriptors
  //       );

  //       showToast(
  //         `Request would approve in ${formatDuration(requestStatus.approvesIn)} if not rejected`,
  //         <TickIcon />
  //       );
  //       dispatch(setInheritanceRequestId(requestId));
  //       navigation.dispatch(CommonActions.navigate('VaultRecoveryAddSigner'));
  //     } catch (err) {
  //       showToast(`${err}`, <ToastErrorIcon />);
  //     }
  //   }

  //   close();
  // };
  const { initateRecovery, recoveryLoading: configRecoveryLoading } = useConfigRecovery();
  const { inheritanceRequestId } = useAppSelector((state) => state.storage);

  const requestInheritanceKeyRecovery = async () => {
    try {
      if (vaultSigners.length <= 1) throw new Error('Add two other devices first to recover');
      const cosignersMapIds = generateCosignerMapIds(
        signerMap,
        vaultSigners,
        SignerType.INHERITANCEKEY
      );
      const thresholdDescriptors = vaultSigners.map((signer) => signer.xfp);
      // let requestId = `request-${generateKey(10)}`;
      let requestId = inheritanceRequestId;
      let isNewRequest = false;
      if (!requestId) {
        requestId = `request-${generateKey(10)}`;
        isNewRequest = true;
      }
      const { requestStatus, setupInfo } = await InheritanceKeyServer.requestInheritanceKey(
        requestId,
        cosignersMapIds[0],
        thresholdDescriptors
      );
      if (requestStatus && isNewRequest) dispatch(setInheritanceRequestId(requestId));
      if (requestStatus.isDeclined) {
        showToast('Inheritance request has been declined', <ToastErrorIcon />);
        // dispatch(setInheritanceRequestId('')); // clear existing request
        return;
      }

      if (!requestStatus.isApproved) {
        showToast(
          `Request would approve in ${formatDuration(requestStatus.approvesIn)} if not rejected`,
          <TickIcon />
        );
      }

      if (requestStatus.isApproved && setupInfo) {
        const { signer: inheritanceKey } = generateSignerFromMetaData({
          xpub: setupInfo.inheritanceXpub,
          derivationPath: setupInfo.derivationPath,
          masterFingerprint: setupInfo.masterFingerprint,
          signerType: SignerType.INHERITANCEKEY,
          storageType: SignerStorage.WARM,
          isMultisig: true,
          inheritanceKeyInfo: {
            configuration: setupInfo.configuration,
            // policy: setupInfo.policy,      // policy doesn't really apply to the heir
          },
          xfp: setupInfo.id,
        });
        if (setupInfo.configuration.bsms) {
          initateRecovery(setupInfo.configuration.bsms);
        } else {
          // showToast('Cannot recreate vault as BSMS was not present', <ToastErrorIcon />);
        }
        dispatch(addSigningDevice([inheritanceKey]));
        dispatch(setInheritanceRequestId('')); // clear approved request
        showToast(`${inheritanceKey.signerName} added successfully`, <TickIcon />);
        navigation.goBack();
      }
    } catch (err) {
      showToast(`${err}`, <ToastErrorIcon />);
    }
  };

  const setupInheritanceKey = async () => {
    try {
      close();
      setInProgress(true);
      const { setupData } = await InheritanceKeyServer.initializeIKSetup();
      const { id, inheritanceXpub: xpub, derivationPath, masterFingerprint } = setupData;
      const { signer: inheritanceKey } = generateSignerFromMetaData({
        xpub,
        derivationPath,
        masterFingerprint,
        signerType: SignerType.INHERITANCEKEY,
        storageType: SignerStorage.WARM,
        xfp: id,
        isMultisig: true,
      });
      setInProgress(false);
      dispatch(addSigningDevice([inheritanceKey]));
      showToast(`${inheritanceKey.signerName} added successfully`, <TickIcon />);
    } catch (err) {
      console.log({ err });
      showToast(`Failed to add inheritance key`, <TickIcon />);
    }
  };

  const { Illustration, Instructions, title, subTitle, unsupported, options } = getSignerContent(
    type,
    isMultisig,
    translations,
    isHealthcheck
  );

  const [selectInheritanceType, setSelectInheritanceType] = useState(1);
  const Content = useCallback(
    () => (
      <SignerContent
        Illustration={Illustration}
        Instructions={Instructions}
        mode={mode}
        options={options}
        setSelectInheritanceType={setSelectInheritanceType}
        selectInheritanceType={selectInheritanceType}
      />
    ),
    [selectInheritanceType]
  );

  const buttonCallback = () => {
    close();
    switch (type) {
      case SignerType.TAPSIGNER:
        return navigateToTapsignerSetup();
      case SignerType.COLDCARD:
        return navigateToColdCardSetup();
      case SignerType.POLICY_SERVER:
        return navigateToSigningServerSetup();
      case SignerType.MOBILE_KEY:
        return navigateToMobileKey(isMultisig);
      case SignerType.SEED_WORDS:
        return navigateToSeedWordSetup();
      case SignerType.BITBOX02:
      case SignerType.TREZOR:
      case SignerType.LEDGER:
        return navigateToSetupWithChannel();
      case SignerType.PASSPORT:
      case SignerType.SEEDSIGNER:
      case SignerType.SPECTER:
      case SignerType.KEYSTONE:
      case SignerType.JADE:
      case SignerType.KEEPER:
        return navigateToAddQrBasedSigner();
      case SignerType.OTHER_SD:
        return navigateToSetupWithOtherSD();
      case SignerType.INHERITANCEKEY:
        return handleInheritanceKey();
      default:
        return null;
    }
  };

  return (
    <>
      <KeeperModal
        visible={visible && !unsupported}
        close={close}
        title={title}
        subTitle={subTitle}
        buttonText="Proceed"
        buttonTextColor="light.white"
        buttonCallback={buttonCallback}
        DarkCloseIcon={colorMode === 'dark'}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.primaryText`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        Content={Content}
        secondaryButtonText={
          isHealthcheck ? 'Skip' : type === SignerType.INHERITANCEKEY ? 'cancel' : null
        }
        secondaryCallback={
          isHealthcheck
            ? skipHealthCheckCallBack
            : type === SignerType.INHERITANCEKEY
            ? close
            : null
        }
      />
      <KeeperModal
        visible={passwordModal && mode === InteracationMode.VAULT_ADDITION}
        close={() => {
          setPasswordModal(false);
        }}
        title="Enter your password"
        subTitle="The one you use to login to the app"
        textColor="light.primaryText"
        Content={() =>
          PasswordEnter({
            primaryMnemonic,
            navigation,
            dispatch,
            pinHash,
            isHealthcheck,
            signer,
            close: () => {
              setPasswordModal(false);
            },
            isMultisig,
            addSignerFlow,
          })
        }
      />
      <KeeperModal
        visible={
          visible &&
          type === SignerType.POLICY_SERVER &&
          (mode === InteracationMode.RECOVERY || mode === InteracationMode.IDENTIFICATION)
        }
        close={close}
        title="Confirm OTP to setup 2FA"
        subTitle="To complete setting up the signer"
        subTitleColor="light.secondaryText"
        textColor="light.primaryText"
        Content={fetchSigningServerSetup}
      />
      {inProgress && <ActivityIndicatorView visible={inProgress} />}
    </>
  );
}

const styles = StyleSheet.create({
  passwordContainer: {
    width: wp(280),
    marginLeft: wp(5),
  },
  cvvInputInfoText: {
    fontSize: 13,
    letterSpacing: 0.65,
    width: '100%',
    marginTop: 2,
  },
});
export default HardwareModalMap;
