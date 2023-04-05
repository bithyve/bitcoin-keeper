/* eslint-disable no-case-declarations */
import React, { useCallback, useContext, useEffect, useState } from 'react';
import * as bip39 from 'bip39';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Box, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import { generateMobileKey, generateSeedWordsKey } from 'src/core/wallets/factories/VaultFactory';
import { hp, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import Text from 'src/components/KeeperText';

import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import ColdCardSetupImage from 'src/assets/images/ColdCardSetup.svg';
import DeleteIcon from 'src/assets/images/deleteBlack.svg';
import JadeSVG from 'src/assets/images/illustration_jade.svg';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import KeeperModal from 'src/components/KeeperModal';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import KeystoneSetupImage from 'src/assets/images/keystone_illustration.svg';
import LedgerImage from 'src/assets/images/ledger_image.svg';
import { LocalizationContext } from 'src/common/content/LocContext';
import MobileKeyIllustration from 'src/assets/images/mobileKey_illustration.svg';
import PassportSVG from 'src/assets/images/illustration_passport.svg';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import SeedSignerSetupImage from 'src/assets/images/seedsigner_setup.svg';
import KeeperSetupImage from 'src/assets/images/illustration_ksd.svg';
import SeedWordsIllustration from 'src/assets/images/illustration_seed_words.svg';
import SigningServerIllustration from 'src/assets/images/signingServer_illustration.svg';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import BitboxImage from 'src/assets/images/bitboxSetup.svg';
import TrezorSetup from 'src/assets/images/trezor_setup.svg';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/core/services/sentry';
import config from 'src/core/config';
import { generateSignerFromMetaData, getSignerNameFromType } from 'src/hardware';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getJadeDetails } from 'src/hardware/jade';
import { getKeystoneDetails } from 'src/hardware/keystone';
import { getPassportDetails } from 'src/hardware/passport';
import { getSeedSignerDetails } from 'src/hardware/seedsigner';
import { hash512 } from 'src/core/services/operations/encryption';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import usePlan from 'src/hooks/usePlan';
import useToastMessage from 'src/hooks/useToastMessage';
import LoginMethod from 'src/common/data/enums/LoginMethod';
import HWError from 'src/hardware/HWErrorState';
import { HWErrorType } from 'src/common/data/enums/Hardware';
import ReactNativeBiometrics from 'react-native-biometrics';
import { crossInteractionHandler } from 'src/common/utilities';
import { isTestnet } from 'src/common/constants/Bitcoin';
import Buttons from 'src/components/Buttons';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import * as SecureStore from '../../storage/secure-store';
import { checkSigningDevice } from './AddSigningDevice';

const RNBiometrics = new ReactNativeBiometrics();

export function BulletPoint({ text }: { text: string }) {
  return (
    <Box style={styles.bulletContainer}>
      <Box backgroundColor="light.greenText" style={styles.bulletPoint} />
      <Text color="light.greenText" style={styles.infoText}>
        {text}
      </Text>
    </Box>
  );
}

const getSignerContent = (type: SignerType, isMultisig: boolean, translations: any) => {
  const { tapsigner, coldcard, ledger, bitbox, trezor } = translations;
  switch (type) {
    case SignerType.COLDCARD:
      const ccInstructions = `Export the xPub by going to Advanced/Tools > Export wallet > Generic JSON. From here choose the account number and transfer over NFC. Make sure you remember the account you had chosen (This is important for recovering your vault).\n`;
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
          `Within settings choose Show Cosigner Details to scan the QR`,
        ],
        title: 'Keep your Device Ready',
        subTitle: 'Keep your Keeper Signing Device ready before proceeding',
      };
    case SignerType.MOBILE_KEY:
      return {
        Illustration: <MobileKeyIllustration />,
        Instructions: [
          `To secure this key, you need the Recovery Phrase of the wallets to be backed up`,
          `This key available for signing transactions if you confirm your passcode or biometrics`,
        ],
        title: 'Set up a Mobile Key',
        subTitle:
          'This key available for signing transactions if you confirm your passcode or biometrics',
      };
    case SignerType.LEDGER:
      return {
        Illustration: <LedgerImage />,
        Instructions: [
          `Please make sure you have the BTC or BTC Testnet app downloaded on the Ledger based on the your current BTC network.`,
          `Proceed once you are on the app on the Nano X. Keeper will scan for your hardware and fetch the xPub.`,
        ],
        title: ledger.SetupTitle,
        subTitle: ledger.SetupDescription,
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
        title: 'Setting up Keystone',
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
        title: 'Setting up Passport (Batch 2)',
        subTitle: 'Keep your Foundation Passport (Batch 2) ready before proceeding',
      };
    case SignerType.POLICY_SERVER:
      return {
        Illustration: <SigningServerIllustration />,
        Instructions: [
          `A 2FA authenticator will have to be set up to use this option.`,
          `On providing the correct code from the auth app, the Signing Server will sign the transaction.`,
        ],
        title: 'Setting up a Signing Server',
        subTitle: 'A Signing Server will hold one of the keys in the vault',
      };
    case SignerType.SEEDSIGNER:
      const seedSignerInstructions = `Make sure the seed is loaded and export the xPub by going to Seeds > Select your master fingerprint > Export Xpub > ${isMultisig ? 'Multisig' : 'Singlesig'
        } > Native Segwit > Keeper.\n`;
      return {
        Illustration: <SeedSignerSetupImage />,
        Instructions: isTestnet()
          ? [
            seedSignerInstructions,
            `Make sure you enable Testnet mode on the SeedSigner if you are running the app in the Testnet mode from Settings > Adavnced > Bitcoin network > Testnet and enable it.`,
          ]
          : [seedSignerInstructions],
        title: 'Setting up SeedSigner',
        subTitle: 'Keep your SeedSigner ready and powered before proceeding',
      };
    case SignerType.BITBOX02:
      return {
        Illustration: <BitboxImage />,
        Instructions: [
          `Please visit ${config.KEEPER_HWI} on your desktop to use the Keeper Hardware Interfce to connect with BitBox02. `,
          `Make sure the device is setup with the Bitbox02 app before using it with the Keeper Hardware Interface.`,
        ],
        title: bitbox.SetupTitle,
        subTitle: bitbox.SetupDescription,
      };
    case SignerType.TREZOR:
      return {
        Illustration: <TrezorSetup />,
        Instructions: [
          `Please visit ${config.KEEPER_HWI} on your desktop to use the Keeper Hardware Interfce to connect with Trezor. `,
          `Make sure the device is setup with the Trezor Connect app before using it with the Keeper Hardware Interface.`,
        ],
        title: trezor.SetupTitle,
        subTitle: trezor.SetupDescription,
      };
    case SignerType.SEED_WORDS:
      return {
        Illustration: <SeedWordsIllustration />,
        Instructions: [
          `Once the transaction is signed the key is not stored on the app.`,
          `Make sure that you are doing this step in private as exposing the Recovery Phrase will compromise the Soft Signer.`,
        ],
        title: 'Keep your Soft Signer ready',
        subTitle:
          'This is the twelve word Recovery Phrase you would have noted down when creating the vault',
      };
    case SignerType.TAPSIGNER:
      return {
        Illustration: <TapsignerSetupImage />,
        Instructions: [
          'You will need the Pin/CVC at the back of TAPSIGNER',
          'You should generally not use the same signing device on multiple wallets/apps',
        ],
        title: tapsigner.SetupTitle,
        subTitle: tapsigner.SetupDescription,
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
}: {
  Illustration: Element;
  Instructions: Array<string>;
}) {
  return (
    <View>
      <Box style={{ alignSelf: 'center', marginRight: 35 }}>{Illustration}</Box>
      <Box marginTop="4">
        {Instructions.map((instruction) => (
          <BulletPoint text={instruction} />
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

const setupSeedWordsBasedKey = (mnemonic) => {
  const networkType = config.NETWORK_TYPE;
  const { xpub, derivationPath, masterFingerprint } = generateSeedWordsKey(mnemonic, networkType);
  const softSigner = generateSignerFromMetaData({
    xpub,
    derivationPath,
    xfp: masterFingerprint,
    signerType: SignerType.SEED_WORDS,
    storageType: SignerStorage.WARM,
    isMultisig: true,
  });

  return softSigner;
};

function PasswordEnter({
  primaryMnemonic,
  navigation,
  dispatch,
  pinHash,
}: {
  primaryMnemonic;
  navigation;
  dispatch;
  pinHash;
}) {
  const [password, setPassword] = useState('');
  const { showToast } = useToastMessage();
  const [inProgress, setInProgress] = useState(false)

  const addMobileKeyWithProgress = () => {
    setInProgress(true)
  }
  useEffect(() => {
    if (inProgress) {
      addMobileKey()
    }
  }, [inProgress])
  const addMobileKey = async () => {
    try {
      const currentPinHash = hash512(password);
      if (currentPinHash === pinHash) {
        const mobileKey = await setupMobileKey({ primaryMnemonic });
        dispatch(addSigningDevice(mobileKey));
        navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
        showToast(`${mobileKey.signerName} added successfully`, <TickIcon />);
        setInProgress(false)
      } else {
        setInProgress(false)
        showToast('Incorrect password. Try again!', <ToastErrorIcon />);
      }
    } catch (error) {
      setInProgress(false)
      if (error instanceof HWError) {
        showToast(error.message, <ToastErrorIcon />, 3000);
      } else if (error.toString() === 'Error') { /* empty */ } else captureError(error);
    }
  }
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
    <Box width={hp(280)}>
      <Box>
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
            {inProgress ?
              <ActivityIndicator size="small" />
              :
              <Buttons
                primaryCallback={addMobileKeyWithProgress}
                primaryText="Confirm"
                primaryLoading={inProgress}
              />
            }
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
}

function HardwareModalMap({
  type,
  visible,
  close,
}: {
  type: SignerType;
  visible: boolean;
  close: any;
}) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const [passwordModal, setPasswordModal] = useState(false);
  const [inProgress, setInProgress] = useState(false)
  const loginMethod = useAppSelector((state) => state.settings.loginMethod);
  const appId = useAppSelector((state) => state.storage.appId);
  const { useQuery } = useContext(RealmWrapperContext);
  const { primaryMnemonic }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const { subscriptionScheme } = usePlan();
  const isMultisig = subscriptionScheme.n !== 1;
  const { pinHash } = useAppSelector((state) => state.storage);

  const navigateToTapsignerSetup = () => {
    navigation.dispatch(CommonActions.navigate({ name: 'AddTapsigner', params: {} }));
  };

  const navigateToColdCardSetup = () => {
    navigation.dispatch(CommonActions.navigate({ name: 'AddColdCard', params: {} }));
  };

  const navigateToLedgerSetup = () => {
    navigation.dispatch(CommonActions.navigate({ name: 'AddLedger', params: {} }));
  };

  const navigateToSigningServerSetup = () => {
    navigation.dispatch(CommonActions.navigate({ name: 'ChoosePolicyNew', params: {} }));
  };

  const navigateToAddQrBasedSigner = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ScanQR',
        params: {
          title: `Setting up ${getSignerNameFromType(type)}`,
          subtitle: 'Please scan until all the QR data has been retrieved',
          onQrScan: onQRScan,
          setup: true,
          type,
        },
      })
    );
  };

  const navigateToSetupWithChannel = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ConnectChannel',
        params: {
          title: `Setting up ${getSignerNameFromType(type)}`,
          subtitle: `Please visit ${config.KEEPER_HWI} to use the Keeper Hardware Interface to setup`,
          type,
        },
      })
    );
  };

  const navigateToSeedWordSetup = () => {
    close();
    const mnemonic = bip39.generateMnemonic();
    navigation.dispatch(
      CommonActions.navigate({
        name: 'SetupSeedWordSigner',
        params: {
          seed: mnemonic,
          next: true,
          onSuccess: (mnemonic) => {
            const softSigner = setupSeedWordsBasedKey(mnemonic);
            dispatch(addSigningDevice(softSigner));
            navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
            showToast(`${softSigner.signerName} added successfully`, <TickIcon />);
          },
        },
      })
    );
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
      dispatch(addSigningDevice(hw));
      navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
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

  const biometricAuth = async () => {
    if (loginMethod === LoginMethod.BIOMETRIC) {
      try {
        setInProgress(true)
        setTimeout(async () => {
          const { success, signature } = await RNBiometrics.createSignature({
            promptMessage: 'Authenticate',
            payload: appId,
            cancelButtonText: 'Use PIN',
          });
          if (success) {
            setInProgress(false)
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
        setInProgress(false)
        captureError(error);
      }
    } else {
      setInProgress(false)
      setPasswordModal(true);
    }
  };

  const { Illustration, Instructions, title, subTitle, unsupported } = getSignerContent(
    type,
    isMultisig,
    translations
  );
  const Content = useCallback(
    () => <SignerContent Illustration={Illustration} Instructions={Instructions} />,
    []
  );

  const buttonCallback = () => {
    close();
    switch (type) {
      case SignerType.TAPSIGNER:
        return navigateToTapsignerSetup();
      case SignerType.COLDCARD:
        return navigateToColdCardSetup();
      case SignerType.LEDGER:
        return navigateToLedgerSetup();
      case SignerType.POLICY_SERVER:
        return navigateToSigningServerSetup();
      case SignerType.MOBILE_KEY:
        return biometricAuth();
      case SignerType.SEED_WORDS:
        return navigateToSeedWordSetup();
      case SignerType.BITBOX02:
      case SignerType.TREZOR:
        return navigateToSetupWithChannel();
      case SignerType.PASSPORT:
      case SignerType.SEEDSIGNER:
      case SignerType.KEYSTONE:
      case SignerType.JADE:
      case SignerType.KEEPER:
        return navigateToAddQrBasedSigner();
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
        textColor="light.primaryText"
        Content={Content}
      />
      <KeeperModal
        visible={passwordModal}
        close={() => {
          setPasswordModal(false);
        }}
        title="Enter your password"
        subTitle="The one you use to login to the app"
        textColor="light.primaryText"
        Content={() => PasswordEnter({ primaryMnemonic, navigation, dispatch, pinHash })}
      />
      {inProgress && <ActivityIndicatorView visible={inProgress} />}
    </>
  );
}
const styles = StyleSheet.create({
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
    width: windowWidth * 0.78,
  },
});
export default HardwareModalMap;
