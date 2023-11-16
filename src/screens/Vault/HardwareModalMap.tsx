/* eslint-disable no-case-declarations */
import React, { useCallback, useContext, useEffect, useState } from 'react';
import * as bip39 from 'bip39';
import { ActivityIndicator, Alert, Clipboard, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, useColorMode, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { EntityKind, SignerStorage, SignerType, XpubTypes } from 'src/core/wallets/enums';
import { generateMobileKey, generateSeedWordsKey } from 'src/core/wallets/factories/VaultFactory';
import { hp, wp } from 'src/constants/responsive';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import Text from 'src/components/KeeperText';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import ColdCardSetupImage from 'src/assets/images/ColdCardSetup.svg';
import DeleteIcon from 'src/assets/images/deleteBlack.svg';
import JadeSVG from 'src/assets/images/illustration_jade.svg';
import KeeperModal from 'src/components/KeeperModal';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import KeystoneSetupImage from 'src/assets/images/keystone_illustration.svg';
import LedgerImage from 'src/assets/images/ledger_image.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import MobileKeyIllustration from 'src/assets/images/mobileKey_illustration.svg';
import PassportSVG from 'src/assets/images/illustration_passport.svg';
import SeedSignerSetupImage from 'src/assets/images/seedsigner_setup.svg';
import KeeperSetupImage from 'src/assets/images/illustration_ksd.svg';
import SeedWordsIllustration from 'src/assets/images/illustration_seed_words.svg';
import SigningServerIllustration from 'src/assets/images/signingServer_illustration.svg';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import OtherSDSetup from 'src/assets/images/illustration_othersd.svg';
import BitboxImage from 'src/assets/images/bitboxSetup.svg';
import TrezorSetup from 'src/assets/images/trezor_setup.svg';
import { VaultSigner, XpubDetailsType } from 'src/core/wallets/interfaces/vault';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/services/sentry';
import config from 'src/core/config';
import { generateSignerFromMetaData, getSignerNameFromType } from 'src/hardware';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
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
import { checkSigningDevice } from './AddSigningDevice';
import * as SecureStore from 'src/storage/secure-store';
import { setSigningDevices } from 'src/store/reducers/bhr';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import InheritanceKeyServer from 'src/services/operations/InheritanceKey';
import { formatDuration } from '../VaultRecovery/VaultRecovery';
import { setInheritanceRequestId } from 'src/store/reducers/storage';
import { getnavigationState } from '../Recovery/SigninDeviceListRecovery';

const RNBiometrics = new ReactNativeBiometrics();

export const enum InteracationMode {
  SIGNING = 'SIGNING',
  HEALTH_CHECK = 'HEALTH_CHECK',
  RECOVERY = 'RECOVERY',
}

export function BulletPoint({ text }: { text: string }) {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.bulletContainer}>
      <Box backgroundColor={`${colorMode}.greenText`} style={styles.bulletPoint} />
      <Text color={`${colorMode}.greenText`} style={styles.infoText}>
        {text}
      </Text>
    </Box>
  );
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
      const ccInstructions = `Export the xPub by going to Advanced/Tools > Export wallet > Generic JSON. From here choose the account number and transfer over NFC. Make sure you remember the account you had chosen (This is important for recovering your Vault).\n`;
      return {
        Illustration: <ColdCardSetupImage />,
        Instructions: isTestnet()
          ? [
            ccInstructions,
            `Make sure you enable Testnet mode on the coldcard if you are running the app in the Testnet mode from Advance option > Danger Zone > Testnet and enable it.`,
          ]
          : [ccInstructions],
        title: coldcard.SetupTitle,
        subTitle: `${coldcard.SetupDescription}`,
      };
    case SignerType.JADE:
      const jadeInstructions = `Make sure the Jade is setup with a companion app and Unlocked. Then export the xPub by going to Settings > Xpub Export. Also to be sure that the wallet type and script type is set to ${isMultisig ? 'MultiSig' : 'SingleSig'
        } and Native Segwit in the options section.`;
      return {
        Illustration: <JadeSVG />,
        Instructions: isTestnet()
          ? [
            jadeInstructions,
            `Make sure you enable Testnet mode on the Jade while creating the wallet with the companion app if you are running Keeper in the Testnet mode.`,
          ]
          : [jadeInstructions],
        title: 'Setting up Blockstream Jade',
        subTitle: 'Keep your Jade ready and unlocked before proceeding',
      };
    case SignerType.KEEPER:
      return {
        Illustration: <KeeperSetupImage />,
        Instructions: [
          `Choose a wallet or create a new one from your Linked Wallets`,
          `Within settings choose Show co-signer Details to scan the QR`,
        ],
        title: 'Keep your Device Ready',
        subTitle: 'Keep your Keeper Signing Device ready before proceeding',
      };
    case SignerType.MOBILE_KEY:
      return {
        Illustration: <MobileKeyIllustration />,
        Instructions: [
          `Make sure that this wallet's Recovery Phrase is backed-up properly to secure this key.`,
        ],
        title: isHealthcheck ? 'Verify Mobile Key' : 'Set up a Mobile Key',
        subTitle: 'Your passcode or biometrics act as your key for signing transactions',
      };
    case SignerType.KEYSTONE:
      const keystoneInstructions = isMultisig
        ? `Make sure the BTC-only firmware is installed and export the xPub by going to the Side Menu > Multisig Wallet > Extended menu (three dots) from the top right corner > Show/Export XPUB > Nested SegWit.\n`
        : `Make sure the BTC-only firmware is installed and export the xPub by going to the extended menu (three dots) in the Generic Wallet section > Export Wallet`;
      return {
        Illustration: <KeystoneSetupImage />,
        Instructions: isTestnet()
          ? [
            keystoneInstructions,
            `Make sure you enable Testnet mode on the Keystone if you are running the app in the Testnet mode from  Side Menu > Settings > Blockchain > Testnet and confirm`,
          ]
          : [keystoneInstructions],
        title: isHealthcheck ? 'Verify Keystone' : 'Setting up Keystone',
        subTitle: 'Keep your Keystone ready before proceeding',
      };
    case SignerType.PASSPORT:
      const passportInstructions = `Export the xPub from the Account section > Manage Account > Connect Wallet > Keeper > ${isMultisig ? 'Multisig' : 'Singlesig'
        } > QR Code.\n`;
      return {
        Illustration: <PassportSVG />,
        Instructions: isTestnet()
          ? [
            passportInstructions,
            `Make sure you enable Testnet mode on the Passport if you are running the app in the Testnet mode from Settings > Bitcoin > Network > Testnet and enable it.`,
          ]
          : [passportInstructions],
        title: isHealthcheck ? 'Verify Passport (Batch 2)' : 'Setting up Passport (Batch 2)',
        subTitle: 'Keep your Foundation Passport (Batch 2) ready before proceeding',
      };
    case SignerType.POLICY_SERVER:
      return {
        Illustration: <SigningServerIllustration />,
        Instructions: isHealthcheck
          ? ['A request to the signing server will be made to checks it health']
          : [
            `A 2FA authenticator will have to be set up to use this option.`,
            `On providing the correct code from the auth app, the Signing Server will sign the transaction.`,
          ],
        title: isHealthcheck ? 'Verify Signing Server' : 'Setting up a Signing Server',
        subTitle: 'A Signing Server will hold one of the keys of the Vault',
      };
    case SignerType.SEEDSIGNER:
      const seedSignerInstructions = `Make sure the seed is loaded and export the xPub by going to Seeds > Select your master fingerprint > Export Xpub > ${isMultisig ? 'Multisig' : 'Singlesig'
        } > Native Segwit > Keeper.\n`;
      return {
        Illustration: <SeedSignerSetupImage />,
        Instructions: isTestnet()
          ? [
            seedSignerInstructions,
            `Make sure you enable Testnet mode on the SeedSigner if you are running the app in the Testnet mode from Settings > Advanced > Bitcoin network > Testnet and enable it.`,
          ]
          : [seedSignerInstructions],
        title: isHealthcheck ? 'Verify SeedSigner' : 'Setting up SeedSigner',
        subTitle: 'Keep your SeedSigner ready and powered before proceeding',
      };
    case SignerType.BITBOX02:
      return {
        Illustration: <BitboxImage />,
        Instructions: [
          `Please visit ${config.KEEPER_HWI} on your Chrome browser to use the Keeper Hardware Interface to connect with BitBox02. `,
          `Make sure the device is setup with the Bitbox02 app before using it with the Keeper Hardware Interface.`,
        ],
        title: isHealthcheck ? 'Verify BitBox' : bitbox.SetupTitle,
        subTitle: bitbox.SetupDescription,
      };
    case SignerType.TREZOR:
      return {
        Illustration: <TrezorSetup />,
        Instructions: [
          `Please visit ${config.KEEPER_HWI} on your Chrome browser to use the Keeper Hardware Interface to connect with Trezor. `,
          `Make sure the device is setup with the Trezor Connect app before using it with the Keeper Hardware Interface.`,
        ],
        title: isHealthcheck ? 'Verify Trezor' : trezor.SetupTitle,
        subTitle: trezor.SetupDescription,
      };
    case SignerType.LEDGER:
      return {
        Illustration: <LedgerImage />,
        Instructions: [
          `Please visit ${config.KEEPER_HWI} on your Chrome browser to use the Keeper Hardware Interface to connect with Ledger. `,
          `Please Make sure you have the BTC app downloaded on Ledger before this step.`,
        ],
        title: ledger.SetupTitle,
        subTitle: ledger.SetupDescription,
      };
    case SignerType.SEED_WORDS:
      return {
        Illustration: <SeedWordsIllustration />,
        Instructions: [
          `Once the transaction is signed the key is not stored on the app.`,
          `Make sure that you're noting down the words in private as exposing them will compromise the Seed Key`,
        ],
        title: isHealthcheck ? 'Verify Seed Key' : 'Setting up Seed Key',
        subTitle: 'Seed Key is a 12 word Recovery Phrase. Please note them down and store safely',
      };
    case SignerType.TAPSIGNER:
      return {
        Illustration: <TapsignerSetupImage />,
        Instructions: [
          'You will need the Pin/CVC at the back of TAPSIGNER',
          'You should generally not use the same signing device on multiple wallets/apps',
        ],
        title: isHealthcheck ? 'Verify TAPSIGNER' : tapsigner.SetupTitle,
        subTitle: tapsigner.SetupDescription,
      };
    case SignerType.OTHER_SD:
      return {
        Illustration: <OtherSDSetup />,
        Instructions: [
          'Manually provide the signing device details',
          `The hardened part of the derivation path of the xpub has to be denoted with a " h " or " ' ". Please do not use any other charecter`,
        ],
        title: 'Keep your signing device ready',
        subTitle: 'Keep your signing device ready before proceeding',
      };
    case SignerType.INHERITANCEKEY:
      return {
        Illustration: <OtherSDSetup />,
        Instructions: [
          'Manually provide the signing device details',
          `The hardened part of the derivation path of the xpub has to be denoted with a " h " or " ' ". Please do not use any other charecter`,
        ],
        title: 'Keep your signing device ready',
        subTitle: 'Keep your signing device ready before proceeding',
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

function SignerContent({
  Illustration,
  Instructions,
  mode,
}: {
  Illustration: Element;
  Instructions: Array<string>;
  mode: InteracationMode;
}) {
  return (
    <View>
      <Box style={{ alignSelf: 'center', marginRight: 35 }}>{Illustration}</Box>
      <Box marginTop="4">
        {mode === InteracationMode.HEALTH_CHECK && (
          <BulletPoint text="Health Check is initiated if a signing device is not used for the last 180 days" />
        )}
        {Instructions.map((instruction) => (
          <BulletPoint text={instruction} key={instruction} />
        ))}
      </Box>
    </View>
  );
}

const setupPassport = (qrData, isMultisig) => {
  const { xpub, derivationPath, xfp, forMultiSig, forSingleSig } = getPassportDetails(qrData);
  if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
    const passport: VaultSigner = generateSignerFromMetaData({
      xpub,
      derivationPath,
      xfp,
      signerType: SignerType.PASSPORT,
      storageType: SignerStorage.COLD,
      isMultisig,
    });
    return passport;
  }
  throw new HWError(HWErrorType.INVALID_SIG);
};

const verifyPassport = (qrData, signer) => {
  const { xpub } = getPassportDetails(qrData);
  return xpub === signer.xpub;
};

const setupSeedSigner = (qrData, isMultisig) => {
  const { xpub, derivationPath, xfp, forMultiSig, forSingleSig } = getSeedSignerDetails(qrData);
  if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
    const seedSigner: VaultSigner = generateSignerFromMetaData({
      xpub,
      derivationPath,
      xfp,
      signerType: SignerType.SEEDSIGNER,
      storageType: SignerStorage.COLD,
      isMultisig,
    });
    return seedSigner;
  }
  throw new HWError(HWErrorType.INVALID_SIG);
};

const verifySeedSigner = (qrData, signer) => {
  const { xpub } = getSeedSignerDetails(qrData);
  return xpub === signer.xpub;
};

const setupKeystone = (qrData, isMultisig) => {
  const { xpub, derivationPath, xfp, forMultiSig, forSingleSig } = getKeystoneDetails(qrData);
  if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
    const keystone: VaultSigner = generateSignerFromMetaData({
      xpub,
      derivationPath,
      xfp,
      signerType: SignerType.KEYSTONE,
      storageType: SignerStorage.COLD,
      isMultisig,
    });
    return keystone;
  }
  throw new HWError(HWErrorType.INVALID_SIG);
};

const verifyKeystone = (qrData, signer) => {
  const { xpub } = getKeystoneDetails(qrData);
  return xpub === signer.xpub;
};

const setupJade = (qrData, isMultisig) => {
  const { xpub, derivationPath, xfp, forMultiSig, forSingleSig } = getJadeDetails(qrData);
  if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
    const jade: VaultSigner = generateSignerFromMetaData({
      xpub,
      derivationPath,
      xfp,
      signerType: SignerType.JADE,
      storageType: SignerStorage.COLD,
      isMultisig,
    });
    return jade;
  }
  throw new HWError(HWErrorType.INVALID_SIG);
};

const verifyJade = (qrData, signer) => {
  const { xpub } = getJadeDetails(qrData);
  return xpub === signer.xpub;
};

const setupKeeperSigner = (qrData) => {
  try {
    const { mfp, xpub, derivationPath } = JSON.parse(qrData);
    const ksd = generateSignerFromMetaData({
      xpub,
      derivationPath,
      xfp: mfp,
      signerType: SignerType.KEEPER,
      storageType: SignerStorage.WARM,
      isMultisig: true,
    });
    return ksd;
  } catch (err) {
    const message = crossInteractionHandler(err);
    throw new Error(message);
  }
};

const verifyKeeperSigner = (qrData, signer) => {
  try {
    const { xpub } = JSON.parse(qrData);
    return xpub === signer.xpub;
  } catch (err) {
    const message = crossInteractionHandler(err);
    throw new Error(message);
  }
};

const setupMobileKey = async ({ primaryMnemonic }) => {
  const networkType = config.NETWORK_TYPE;
  const { xpub, xpriv, derivationPath, masterFingerprint } = await generateMobileKey(
    primaryMnemonic,
    networkType
  );
  const mobileKey = generateSignerFromMetaData({
    xpub,
    derivationPath,
    xfp: masterFingerprint,
    signerType: SignerType.MOBILE_KEY,
    storageType: SignerStorage.WARM,
    isMultisig: true,
    xpriv,
  });
  return mobileKey;
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

  const softSigner = generateSignerFromMetaData({
    xpub: isMultisig ? multiSigXpub : singleSigXpub,
    derivationPath: isMultisig ? multiSigPath : singleSigPath,
    xfp: masterFingerprint,
    signerType: SignerType.SEED_WORDS,
    storageType: SignerStorage.WARM,
    isMultisig,
  });

  return softSigner;
};

function PasswordEnter({
  primaryMnemonic,
  navigation,
  dispatch,
  pinHash,
  isHealthcheck,
  signer,
  close,
}: {
  primaryMnemonic;
  navigation;
  dispatch;
  pinHash;
  isHealthcheck?;
  signer?;
  close?;
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
        const mobileKey = await setupMobileKey({ primaryMnemonic });
        dispatch(addSigningDevice(mobileKey));
        navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
        showToast(`${mobileKey.signerName} added successfully`, <TickIcon />);
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
        showToast(`Mobile Key verified successfully`, <TickIcon />);
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
  mode,
  primaryMnemonic,
  vaultShellId,
}: {
  type: SignerType;
  visible: boolean;
  close: any;
  signer?: VaultSigner;
  skipHealthCheckCallBack?: any;
  mode: InteracationMode;
  isMultisig: boolean;
  primaryMnemonic?: string;
  vaultShellId?: string;
}) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);

  const [passwordModal, setPasswordModal] = useState(false);
  const [inProgress, setInProgress] = useState(false);

  const loginMethod = useAppSelector((state) => state.settings.loginMethod);
  const { signingDevices, relayVaultReoveryShellId } = useAppSelector((state) => state.bhr);
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
      CommonActions.navigate({ name: 'AddTapsigner', params: { mode, signer, isMultisig } })
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
      CommonActions.navigate({ name: 'AddColdCard', params: { mode, signer, isMultisig } })
    );
  };

  const navigateToAddQrBasedSigner = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ScanQR',
        params: {
          title: `${isHealthcheck ? `Verify` : `Setting up`} ${getSignerNameFromType(type)}`,
          subtitle: 'Please scan until all the QR data has been retrieved',
          onQrScan: isHealthcheck ? onQRScanHealthCheck : onQRScan,
          setup: true,
          type,
          isHealthcheck: true,
          signer,
        },
      })
    );
  };

  const navigateToSigningServerSetup = async () => {
    if (mode === InteracationMode.HEALTH_CHECK) {
      try {
        setInProgress(true);
        const { isSignerAvailable } = await SigningServer.checkSignerHealth(vaultShellId, appId);
        if (isSignerAvailable) {
          dispatch(healthCheckSigner([signer]));
          close();
          showToast(`Health check done successfully`, <TickIcon />);
        } else {
          close();
          showToast('Error in Health check', <ToastErrorIcon />, 3000);
        }
        setInProgress(false);
      } catch (err) {
        setInProgress(false);
        close();
        showToast('Error in Health check', <ToastErrorIcon />, 3000);
      }
    } else {
      navigation.dispatch(CommonActions.navigate({ name: 'ChoosePolicyNew', params: { signer } }));
    }
  };

  const navigateToSetupWithChannel = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ConnectChannel',
        params: {
          title: `${isHealthcheck ? `Verify` : `Setting up`} ${getSignerNameFromType(type)}`,
          subtitle: `Please visit ${config.KEEPER_HWI} on your Chrome browser to use the Keeper Hardware Interface to setup`,
          type,
          signer,
          mode,
          isMultisig,
        },
      })
    );
  };

  const navigateToSetupWithOtherSD = () => {
    console.log('gere');
    navigation.dispatch(
      CommonActions.navigate({
        name: 'SetupOtherSDScreen',
        params: {
          mode,
          isMultisig,
        },
      })
    );
  };

  const navigateToSeedWordSetup = () => {
    if (mode === InteracationMode.RECOVERY) {
      const navigationState = getnavigationState(SignerType.SEED_WORDS);
      navigation.dispatch(CommonActions.reset(navigationState));
      close();
    } else if (mode === InteracationMode.SIGNING) {
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
              const softSigner = setupSeedWordsBasedKey(mnemonic, isMultisig);
              dispatch(addSigningDevice(softSigner));
              navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
              showToast(`${softSigner.signerName} added successfully`, <TickIcon />);
            },
          },
        })
      );
    } else if (mode === InteracationMode.HEALTH_CHECK) {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'EnterSeedScreen',
          params: {
            isHealthCheck: true,
            signer,
            isMultisig,
            setupSeedWordsBasedSigner: setupSeedWordsBasedKey,
          },
        })
      );
    }
  };

  const onQRScan = async (qrData, resetQR) => {
    let hw: VaultSigner;
    try {
      switch (type) {
        case SignerType.PASSPORT:
          hw = setupPassport(qrData, isMultisig);
          break;
        case SignerType.SEEDSIGNER:
          hw = setupSeedSigner(qrData, isMultisig);
          break;
        case SignerType.KEEPER:
          hw = setupKeeperSigner(qrData);
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

      if (mode === InteracationMode.RECOVERY) {
        dispatch(setSigningDevices(hw));
        navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
      } else {
        dispatch(addSigningDevice(hw));
        navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
      }
      showToast(`${hw.signerName} added successfully`, <TickIcon />);
      const exsists = await checkSigningDevice(hw.signerId);
      if (exsists)
        showToast('Warning: Vault with this signer already exisits', <ToastErrorIcon />, 3000);
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
        navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
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
        showToast(`Health check done successfully`, <TickIcon />);
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

  const addSigningServerVaultShellId = () => {
    const verifySigningServer = async (otp) => {
      try {
        setInProgress(true);
        const vaultId = relayVaultReoveryShellId;
        const appId = relayVaultReoveryShellId;
        const response = await SigningServer.fetchSignerSetup(vaultId, appId, otp);
        if (response.xpub) {
          const signingServerKey = generateSignerFromMetaData({
            xpub: response.xpub,
            derivationPath: response.derivationPath,
            xfp: response.masterFingerprint,
            signerType: SignerType.POLICY_SERVER,
            storageType: SignerStorage.WARM,
            isMultisig: true,
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
          <Text
            fontSize={13}
            letterSpacing={0.65}
            width={wp(290)}
            color="light.greenText"
            marginTop={2}
          >
            If you lose your authenticator app, use the other Signing Devices to reset the Signing
            Server
          </Text>
          <Box mt={10} alignSelf="flex-end" mr={2}>
            <Box>
              <CustomGreenButton
                onPress={() => {
                  verifySigningServer(otp);
                }}
                value="Confirm"
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

  const navigateToMobileKey = async () => {
    if (mode === InteracationMode.RECOVERY) {
      const navigationState = getnavigationState(SignerType.MOBILE_KEY);
      navigation.dispatch(CommonActions.reset(navigationState));
      close();
    } else if (mode === InteracationMode.SIGNING) {
      await biometricAuth();
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
    }
  };

  const biometricAuth = async () => {
    console.log('biometricAuth');
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
              const mobileKey = await setupMobileKey({ primaryMnemonic });
              dispatch(addSigningDevice(mobileKey));
              navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
              showToast(`${mobileKey.signerName} added successfully`, <TickIcon />);
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

  const requestInheritanceKeyRecovery = async (signers: VaultSigner[]) => {
    try {
      const requestId = `request-${generateKey(10)}`;
      const vaultId = relayVaultReoveryShellId;
      const thresholdDescriptors = signers.map((signer) => signer.signerId);

      const { requestStatus } = await InheritanceKeyServer.requestInheritanceKey(
        requestId,
        vaultId,
        thresholdDescriptors
      );

      showToast(
        `Request would approve in ${formatDuration(requestStatus.approvesIn)} if not rejected`,
        <TickIcon />
      );
      dispatch(setInheritanceRequestId(requestId));
      navigation.dispatch(CommonActions.navigate('VaultRecoveryAddSigner'));
    } catch (err) {
      showToast(`${err}`, <ToastErrorIcon />);
    }
    close();
  };

  const { Illustration, Instructions, title, subTitle, unsupported } = getSignerContent(
    type,
    isMultisig,
    translations,
    isHealthcheck
  );

  const Content = useCallback(
    () => <SignerContent Illustration={Illustration} Instructions={Instructions} mode={mode} />,
    []
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
        return navigateToMobileKey();
      case SignerType.SEED_WORDS:
        return navigateToSeedWordSetup();
      case SignerType.BITBOX02:
      case SignerType.TREZOR:
      case SignerType.LEDGER:
        return navigateToSetupWithChannel();
      case SignerType.PASSPORT:
      case SignerType.SEEDSIGNER:
      case SignerType.KEYSTONE:
      case SignerType.JADE:
      case SignerType.KEEPER:
        return navigateToAddQrBasedSigner();
      case SignerType.OTHER_SD:
        return navigateToSetupWithOtherSD();
      case SignerType.INHERITANCEKEY:
        return requestInheritanceKeyRecovery(signingDevices);
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
        secondaryButtonText={isHealthcheck ? 'Skip' : null}
        secondaryCallback={isHealthcheck ? skipHealthCheckCallBack : null}
      />
      <KeeperModal
        visible={passwordModal && mode === InteracationMode.SIGNING}
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
          })
        }
      />
      <KeeperModal
        visible={visible && type === SignerType.POLICY_SERVER && mode === InteracationMode.RECOVERY}
        close={close}
        title="Confirm OTP to setup 2FA"
        subTitle="To complete setting up the signing server"
        subTitleColor="light.secondaryText"
        textColor="light.primaryText"
        Content={addSigningServerVaultShellId}
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
  bulletContainer: {
    marginTop: 4,
    flexDirection: 'row',
  },
  bulletPoint: {
    marginRight: wp(5),
    height: hp(5),
    width: hp(5),
    borderRadius: 10,
    top: 12,
  },
  infoText: {
    letterSpacing: 0.65,
    padding: 3,
    fontSize: 13,
    width: wp(285),
  },
});
export default HardwareModalMap;
