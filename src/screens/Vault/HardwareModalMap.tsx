// /* eslint-disable no-case-declarations */

/* eslint-disable no-case-declarations */
import React, { useCallback, useContext, useEffect, useState } from 'react';
import * as bip39 from 'bip39';
import moment from 'moment';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Linking,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Box, ScrollView, useColorMode, View } from 'native-base';
import { CommonActions, StackActions, useNavigation } from '@react-navigation/native';
import {
  KeyGenerationMode,
  SignerStorage,
  SignerType,
  XpubTypes,
} from 'src/services/wallets/enums';
import { generateCosignerMapIds } from 'src/services/wallets/factories/VaultFactory';
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
import SeedSignerSetupImage from 'src/assets/images/seedsigner-setup-horizontal.svg';
import SpecterSetupImage from 'src/assets/images/illustration_spectre.svg';
import ExternalKeySetupImage from 'src/assets/images/illustration-external-key.svg';
import KeeperSetupImage from 'src/assets/images/mobile-key-illustration.svg';
import SeedWordsIllustration from 'src/assets/images/illustration_seed_words.svg';
import SigningServerIllustration from 'src/assets/images/signingServer_illustration.svg';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import PortalIllustration from 'src/assets/images/portal_illustration.svg';
import OtherSDSetup from 'src/assets/images/illustration_othersd.svg';
import BitboxImage from 'src/assets/images/bitboxSetup.svg';
import TrezorSetup from 'src/assets/images/trezor_setup.svg';
import { Signer, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/services/sentry';
import config, { KEEPER_WEBSITE_BASE_URL } from 'src/utils/service-utilities/config';
import {
  extractKeyFromDescriptor,
  generateSignerFromMetaData,
  getSignerNameFromType,
} from 'src/hardware';
import { getJadeDetails } from 'src/hardware/jade';
import { getKeystoneDetails, getKeystoneDetailsFromFile } from 'src/hardware/keystone';
import { getPassportDetails } from 'src/hardware/passport';
import { getSeedSignerDetails } from 'src/hardware/seedsigner';
import { generateKey, hash512 } from 'src/utils/service-utilities/encryption';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import LoginMethod from 'src/models/enums/LoginMethod';
import HWError from 'src/hardware/HWErrorState';
import ReactNativeBiometrics from 'react-native-biometrics';
import { crossInteractionHandler, getAccountFromSigner } from 'src/utils/utilities';
import { isTestnet } from 'src/constants/Bitcoin';
import Buttons from 'src/components/Buttons';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import SigningServer from 'src/services/backend/SigningServer';
import * as SecureStore from 'src/storage/secure-store';
import { setSigningDevices } from 'src/store/reducers/bhr';
import InheritanceKeyServer from 'src/services/backend/InheritanceKey';
import {
  setInheritanceKeyExistingEmailCount,
  setInheritanceRequestId,
} from 'src/store/reducers/storage';
import Instruction from 'src/components/Instruction';
import useUnkownSigners from 'src/hooks/useUnkownSigners';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { getSpecterDetails } from 'src/hardware/specter';
import useSignerMap from 'src/hooks/useSignerMap';
import InhertanceKeyIcon from 'src/assets/images/inheritance-key-illustration.svg';
import Import from 'src/assets/images/import.svg';
import USBIcon from 'src/assets/images/usb_white.svg';
import NfcComms from 'src/assets/images/nfc_comms.svg';
import QRComms from 'src/assets/images/qr_comms.svg';
import useSigners from 'src/hooks/useSigners';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import { getCosignerDetails } from 'src/services/wallets/factories/WalletFactory';
import {
  setupColdcard,
  setupJade,
  setupKeeperSigner,
  setupKeystone,
  setupMobileKey,
  setupPassport,
  setupSeedSigner,
  setupSeedWordsBasedKey,
  setupSpecter,
} from 'src/hardware/signerSetup';
import { extractColdCardExport } from 'src/hardware/coldcard';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import useCanaryWalletSetup from 'src/hooks/UseCanaryWalletSetup';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import NFC from 'src/services/nfc';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import idx from 'idx';
import { setLastUsedOption } from 'src/store/reducers/signer';
import BackupModalContent from '../AppSettings/BackupModal';
import SetupSignerOptions from 'src/components/SetupSignerOptions';

const RNBiometrics = new ReactNativeBiometrics();

export const enum InteracationMode {
  VAULT_ADDITION = 'VAULT_ADDITION',
  VAULT_REGISTER = 'VAULT_REGISTER',
  HEALTH_CHECK = 'HEALTH_CHECK',
  RECOVERY = 'RECOVERY',
  CONFIG_RECOVERY = 'CONFIG_RECOVERY',
  IDENTIFICATION = 'IDENTIFICATION',
  APP_ADDITION = 'APP_ADDITION',
  CANARY_ADDITION = 'CANARY_ADDITION',
  ADDRESS_VERIFICATION = 'ADDRESS_VERIFICATION',
  SIGN_TRANSACTION = 'SIGN_TRANSACTION',
  BACKUP_SIGNER = 'BACKUP_SIGNER',
}

const getSignerContent = (
  type: SignerType,
  isMultisig: boolean,
  translations: any,
  isHealthcheck: boolean,
  isCanaryAddition: boolean,
  isIdentification: boolean,
  colorMode: string,
  isNfcSupported: boolean,
  keyGenerationMode: KeyGenerationMode
) => {
  const { tapsigner, coldcard, ledger, bitbox, trezor, externalKey, common } = translations;
  switch (type) {
    case SignerType.COLDCARD:
      return {
        type: SignerType.COLDCARD,
        Illustration: <ColdCardSetupImage />,
        Instructions: [
          'Export the Coldcard data by going to Advanced/Tools > Export wallet > Generic JSON.',
          'Or instead, use the Keeper Desktop app to connect to the Coldcard via USB',
        ],
        title: isHealthcheck ? 'Verify Coldcard' : coldcard.SetupTitle,
        subTitle: `${coldcard.SetupDescription}`,
        options: [
          {
            title: 'NFC',
            icon: (
              <CircleIconWrapper
                icon={<NfcComms />}
                backgroundColor={`${colorMode}.BrownNeedHelp`}
                width={35}
              />
            ),
            name: KeyGenerationMode.NFC,
            disabled: !isNfcSupported,
          },
          {
            title: 'File',
            icon: (
              <CircleIconWrapper
                icon={<Import />}
                backgroundColor={`${colorMode}.BrownNeedHelp`}
                width={35}
              />
            ),
            name: KeyGenerationMode.FILE,
          },
          {
            title: 'USB',
            icon: (
              <CircleIconWrapper
                icon={<USBIcon />}
                backgroundColor={`${colorMode}.BrownNeedHelp`}
                width={35}
              />
            ),
            name: KeyGenerationMode.USB,
          },
          {
            title: 'QR',
            icon: (
              <CircleIconWrapper
                icon={<QRComms />}
                backgroundColor={`${colorMode}.BrownNeedHelp`}
                width={35}
              />
            ),
            name: KeyGenerationMode.QR,
          },
        ],
      };
    case SignerType.JADE:
      const jadeUnlockInstructions =
        'If Jade is locked, unlock it by selecting "QR Mode" > QR PIN Unlock > then open https://blkstrm.com/pn in your browser and follow the instructions to unlock the Jade.';
      const jadeInstructions = `When unlocked, export the key by going to Options > Wallet > Export Xpub. Then in Options, make sure Script is set to Native Segwit and Wallet is set to ${
        isMultisig ? 'MultiSig' : 'SingleSig'
      }.`;

      const usbInstructions = `To use Jade via USB, please download the Bitcoin Keeper desktop app from our website: ${KEEPER_WEBSITE_BASE_URL}/desktop and connect your Jade to the computer.`;

      const instructions =
        keyGenerationMode === KeyGenerationMode.USB
          ? [usbInstructions]
          : [jadeUnlockInstructions, jadeInstructions];
      if (isTestnet()) {
        instructions.push(
          'Make sure you enable Testnet mode on the Jade (Options > Device > Settings > Network) if you are running Keeper in the Testnet mode.'
        );
      }
      return {
        type: SignerType.JADE,
        Illustration: <JadeSVG />,
        Instructions: instructions,
        title: isHealthcheck
          ? 'Verify Blockstream Jade'
          : isCanaryAddition
          ? 'Setting up for Canary'
          : 'Setting up Blockstream Jade',
        subTitle: 'Get your Jade ready and powered up before proceeding',
        options: [
          {
            title: 'QR',
            icon: (
              <CircleIconWrapper
                icon={<QRComms />}
                backgroundColor={`${colorMode}.BrownNeedHelp`}
                width={35}
              />
            ),
            name: KeyGenerationMode.QR,
          },
          {
            title: 'USB',
            icon: (
              <CircleIconWrapper
                icon={<USBIcon />}
                backgroundColor={`${colorMode}.BrownNeedHelp`}
                width={35}
              />
            ),
            name: KeyGenerationMode.USB,
          },
        ],
      };
    case SignerType.KEEPER:
      return {
        type: SignerType.KEEPER,
        Illustration: <ExternalKeySetupImage />,
        Instructions: [externalKey.modalInstruction1, externalKey.modalInstruction2],
        title: isHealthcheck
          ? `${common.verify} ${getSignerNameFromType(type)}`
          : isCanaryAddition
          ? externalKey.setupCanaryTitle
          : `${common.importing} ${getSignerNameFromType(type)}`,
        subTitle: isHealthcheck ? '' : externalKey.modalSubtitle,
        options: [],
      };
    case SignerType.MY_KEEPER:
      return {
        type: SignerType.MY_KEEPER,
        Illustration: isHealthcheck ? <SeedWordsIllustration /> : <KeeperSetupImage />,
        Instructions: isHealthcheck
          ? [
              'Make sure you secure the 12-word phrase in a safe place.',
              'It is not advisable if you use this key frequently, as the whole seed will have to be input to sign a transaction.',
            ]
          : [
              'Choose a Mobile Key from your Keeper app',
              'A child key from the parent BIP-85 seed will be generated',
            ],
        title: isHealthcheck
          ? 'Verify Recovery Key'
          : `Setting up ${getSignerNameFromType(type)} (Hot)`,
        subTitle: isHealthcheck
          ? 'Enter the Recovery Key to do a health check'
          : `Generating internal ${getSignerNameFromType(type)}`,
        options: [],
      };
    case SignerType.MOBILE_KEY:
      return {
        type: SignerType.MOBILE_KEY,
        Illustration: <MobileKeyIllustration />,
        Instructions: [
          'Make sure that this wallet’s Recovery Key is backed-up properly to secure this key.',
        ],
        title: isHealthcheck ? 'Verify Recovery Key' : 'Set up a Mobile Key',
        subTitle: 'Your passcode or biometrics act as your key for signing transactions',
        options: [],
      };
    case SignerType.KEYSTONE:
      const keystoneInstructions = isMultisig
        ? 'Make sure the BTC-only firmware is installed and export the xPub by going to the Side Menu > Multisig Wallet > Extended menu (three dots) from the top right corner > Show/Export XPUB > Native SegWit.\n'
        : 'Make sure the BTC-only firmware is installed and export the xPub by going to the extended menu (three dots) in the Generic Wallet section > Export Wallet';
      return {
        type: SignerType.KEYSTONE,
        Illustration: <KeystoneSetupImage />,
        Instructions: isTestnet()
          ? [
              keystoneInstructions,
              'Make sure you enable Testnet mode on the Keystone if you are running the app in the Testnet mode from  Side Menu > Settings > Blockchain > Testnet and confirm',
            ]
          : [keystoneInstructions],
        title: isHealthcheck
          ? 'Verify Keystone'
          : isCanaryAddition
          ? 'Setting up for Canary'
          : 'Setting up Keystone',
        subTitle: 'Get your Keystone ready before proceeding',
        options: [
          {
            title: 'QR',
            icon: (
              <CircleIconWrapper
                icon={<QRComms />}
                backgroundColor={`${colorMode}.BrownNeedHelp`}
                width={35}
              />
            ),
            name: KeyGenerationMode.QR,
          },
          {
            title: 'File',
            icon: (
              <CircleIconWrapper
                icon={<Import />}
                backgroundColor={`${colorMode}.BrownNeedHelp`}
                width={35}
              />
            ),
            name: KeyGenerationMode.FILE,
          },
        ],
      };
    case SignerType.PASSPORT:
      const passportInstructions = `Export the xPub from the Account section > Manage Account > Connect Wallet > Keeper > ${
        isMultisig ? 'Multisig' : 'Singlesig'
      } > QR Code.\n`;
      return {
        type: SignerType.PASSPORT,
        Illustration: <PassportSVG />,
        Instructions: isTestnet()
          ? [
              passportInstructions,
              'Make sure you enable Testnet mode on the Passport if you are running the app in the Testnet mode from Settings > Bitcoin > Network > Testnet and enable it.',
            ]
          : [passportInstructions],
        title: isHealthcheck
          ? 'Verify Passport'
          : isCanaryAddition
          ? 'Setting up for Canary'
          : 'Setting up Passport',
        subTitle: 'Get your Foundation Passport ready before proceeding',
        options: [
          {
            title: 'QR',
            icon: (
              <CircleIconWrapper
                icon={<QRComms />}
                backgroundColor={`${colorMode}.BrownNeedHelp`}
                width={35}
              />
            ),
            name: KeyGenerationMode.QR,
          },
          {
            title: 'File',
            icon: (
              <CircleIconWrapper
                icon={<Import />}
                backgroundColor={`${colorMode}.BrownNeedHelp`}
                width={35}
              />
            ),
            name: KeyGenerationMode.FILE,
          },
        ],
      };
    case SignerType.POLICY_SERVER:
      const subtitle =
        keyGenerationMode !== KeyGenerationMode.RECOVER
          ? isHealthcheck
            ? 'Get your Server Key ready before proceeding'
            : 'The Server Key is a key stored securely on Keeper’s servers. You can configure it with custom spending rules and use it as part of a multi-key wallet setup.'
          : 'Recover an existing Server Key using other signers from the Vault';
      return {
        type: SignerType.POLICY_SERVER,
        Illustration: <SigningServerIllustration />,
        Instructions: isHealthcheck
          ? ['A request to the signer will be made to checks its health']
          : keyGenerationMode !== KeyGenerationMode.RECOVER
          ? [
              '2FA Authenticator will have to be set up to use this option',
              'On providing a correct OTP from the authenticator app, the Server Key will sign the transaction.',
            ]
          : [
              'At least 2 signers are required in order to identify and recover an existing Server Key.',
              'OTP from the authenticator is also required along with the two signers to initiate Server Key recovery.',
            ],
        title: isHealthcheck ? 'Verify Server Key' : 'Set up the Server Key',
        subTitle: subtitle,
        options: isHealthcheck
          ? []
          : [
              {
                title: 'Configure a New Key',
                icon: (
                  <CircleIconWrapper
                    icon={<RecoverImage />}
                    backgroundColor={`${colorMode}.BrownNeedHelp`}
                    width={35}
                  />
                ),
                callback: () => {},
                name: KeyGenerationMode.NEW,
              },
              {
                title: 'Recover Existing Key',
                icon: (
                  <CircleIconWrapper
                    icon={<RecoverImage />}
                    backgroundColor={`${colorMode}.BrownNeedHelp`}
                    width={35}
                  />
                ),
                name: KeyGenerationMode.RECOVER,
              },
            ],
      };
    case SignerType.SEEDSIGNER:
      const seedSignerInstructions = (
        <Text color={`${colorMode}.secondaryText`} style={styles.infoText}>
          Make sure the seed is loaded (
          <Text
            medium
            style={styles.learnHow}
            color={`${colorMode}.greenText`}
            onPress={() =>
              Linking.openURL(
                'https://econoalchemist.github.io/SeedSigner/04_Generate-Seed.html#generate-a-new-seed'
              )
            }
          >
            Learn how
          </Text>
          {`) and export the xPub by going to Seeds > Select your master fingerprint > Export xPub > ${
            isMultisig ? 'Multisig' : 'Singlesig'
          } > Native Segwit > Keeper.`}
        </Text>
      );

      const setupGuideLink = !isHealthcheck && (
        <Text
          color={`${colorMode}.secondaryText`}
          style={styles.infoText}
          onPress={() =>
            Linking.openURL(
              'https://bitcoinmagazine.com/guides/how-to-use-seedsigner-for-secure-bitcoin'
            )
          }
        >
          Setting Up a SeedSigner -
          https://bitcoinmagazine.com/guides/how-to-use-seedsigner-for-secure-bitcoin
        </Text>
      );

      return {
        type: SignerType.SEEDSIGNER,
        Illustration: <SeedSignerSetupImage />,
        Instructions: isTestnet()
          ? [
              seedSignerInstructions,
              'Make sure you enable Testnet mode on the SeedSigner if you are running the app in Testnet mode from Settings > Advanced > Bitcoin network > Testnet and enable it.',
              setupGuideLink,
            ].filter(Boolean)
          : [seedSignerInstructions, setupGuideLink].filter(Boolean),
        title: isHealthcheck
          ? 'Verify SeedSigner'
          : isCanaryAddition
          ? 'Setting up for Canary'
          : 'Setting up SeedSigner',
        subTitle: 'Get your SeedSigner ready and powered before proceeding',
        options: [],
      };

    case SignerType.SPECTER:
      const specterInstructions = `Make sure the seed is loaded and export the xPub by going to Master Keys > ${
        isMultisig ? 'Multisig' : 'Singlesig'
      } > Native Segwit.\n`;
      return {
        type: SignerType.SPECTER,
        Illustration: <SpecterSetupImage />,
        Instructions: isTestnet()
          ? [
              specterInstructions,
              'Make sure you enable Testnet mode on the Specter if you are running the app on Testnet by selecting Switch network (Testnet) on the home screen',
            ]
          : [specterInstructions],
        title: isHealthcheck
          ? 'Verify Specter'
          : isCanaryAddition
          ? 'Setting up for Canary'
          : 'Setting up Specter DIY',
        subTitle: 'Get your device ready and powered before proceeding',
        options: [],
      };
    case SignerType.BITBOX02:
      return {
        type: SignerType.BITBOX02,
        Illustration: <BitboxImage />,
        Instructions: [
          `Please download the Bitcoin Keeper desktop app from our website: ${KEEPER_WEBSITE_BASE_URL}/desktop to connect with BitBox02.`,
          'Make sure the device is setup with the Bitbox02 app before using it with the Keeper Desktop App.',
        ],
        title: isHealthcheck ? 'Verify BitBox' : bitbox.SetupTitle,
        subTitle: bitbox.SetupDescription,
        options: [],
      };
    case SignerType.TREZOR:
      return {
        type: SignerType.TREZOR,
        Illustration: <TrezorSetup />,
        Instructions: [
          `Please download the Bitcoin Keeper desktop app from our website: ${KEEPER_WEBSITE_BASE_URL}/desktop to connect with Trezor.`,
          'Make sure the device is setup with the Trezor Connect app before using it with the Keeper Desktop App.',
        ],
        title: isHealthcheck ? 'Verify Trezor' : trezor.SetupTitle,
        subTitle: trezor.SetupDescription,
        options: [],
      };
    case SignerType.LEDGER:
      return {
        type: SignerType.LEDGER,
        Illustration: <LedgerImage />,
        Instructions: [
          `Please download the Bitcoin Keeper desktop app from our website: ${KEEPER_WEBSITE_BASE_URL}/desktop to connect with Ledger.`,
          'Please Make sure you have the BTC app downloaded on Ledger before this step.',
        ],
        title: isHealthcheck ? 'Verify Ledger' : ledger.SetupTitle,
        subTitle: ledger.SetupDescription,
        options: [],
      };
    case SignerType.SEED_WORDS:
      return {
        type: SignerType.SEED_WORDS,
        Illustration: <SeedWordsIllustration />,
        Instructions: [
          'Make sure you secure the 12-word phrase in a safe place.',
          'It is not advisable if you use this key frequently, as the whole seed will have to be input to sign a transaction.',
        ],
        title: isHealthcheck ? 'Verify Seed Key' : 'Setting up Seed Key',
        subTitle: 'Seed Key is a 12-word phrase that can be generated new or imported',
        options: !isHealthcheck &&
          !isIdentification && [
            {
              title: 'Import',
              icon: (
                <CircleIconWrapper
                  icon={<Import />}
                  backgroundColor={`${colorMode}.BrownNeedHelp`}
                  width={35}
                />
              ),
              callback: () => {},
              name: KeyGenerationMode.IMPORT,
            },
            {
              title: 'Create',
              icon: (
                <CircleIconWrapper
                  icon={<RecoverImage />}
                  backgroundColor={`${colorMode}.BrownNeedHelp`}
                  width={35}
                />
              ),

              callback: () => {},
              name: KeyGenerationMode.CREATE,
            },
          ],
      };
    case SignerType.TAPSIGNER:
      return {
        type: SignerType.TAPSIGNER,
        Illustration: <TapsignerSetupImage />,
        Instructions: ['You will need the PIN (given at the back of the TAPSIGNER).'],
        title: isHealthcheck ? 'Verify TAPSIGNER' : tapsigner.SetupTitle,
        subTitle: tapsigner.SetupDescription,
        options: [],
      };
    case SignerType.PORTAL:
      return {
        type: SignerType.PORTAL,
        Illustration: <PortalIllustration />,
        Instructions: [
          'The Portal device requires continuous power from the mobile device via NFC to function. ',
          'Place the Portal device on a flat surface, then position the mobile device so that its NFC aligns with the Portal.',
        ],
        title: 'Setting up Portal',
        subTitle: 'Please keep your device ready before proceeding',
        options: [],
      };
    case SignerType.OTHER_SD:
      return {
        type: SignerType.OTHER_SD,
        Illustration: <OtherSDSetup />,
        Instructions: [
          'Provide the Signer details either by entering them or scanning',
          'The hardened part of the derivation path of the xpub has to be denoted with a “h” or “”. Please do not use any other character',
        ],
        title: isHealthcheck ? 'Verify Signer' : 'Setting up Signer',
        subTitle: 'Get your Signer ready before proceeding',
        options: [],
      };

    case SignerType.INHERITANCEKEY:
      return {
        type: SignerType.INHERITANCEKEY,
        Illustration: <InhertanceKeyIcon />,
        title: isHealthcheck ? 'Verify Inheritance Key' : 'Setting up an Inheritance Key',
        subTitle: isHealthcheck
          ? ''
          : 'This step will add an additional, mandatory key to your m-of-n vault',

        Instructions: isHealthcheck
          ? ['A request to the inheritance key will be made to checks its health']
          : [
              'This Key would only get activated after the other two Keys have signed',
              'On activation the Key would send emails to your email id for 30 days for you to decline using it',
            ],
        options: isHealthcheck
          ? []
          : [
              {
                title: 'Configure a New Key',
                icon: <RecoverImage />,
                callback: () => {},
                name: KeyGenerationMode.NEW,
              },
              {
                title: 'Recover Existing Key',
                icon: <RecoverImage />,
                name: KeyGenerationMode.RECOVER,
              },
            ],
      };

    default:
      return {
        type,
        Illustration: null,
        Instructions: [],
        title: tapsigner.SetupTitle,
        subTitle: tapsigner.SetupDescription,
        unsupported: true,
        options: [],
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

export function formatDuration(ms) {
  const duration = moment.duration(ms);
  return Math.floor(duration.asHours()) + moment.utc(duration.asMilliseconds()).format(':mm:ss');
}

function SignerContent({
  Illustration,
  Instructions,
  mode,
  options,
  keyGenerationMode,
  sepInstruction = '',
  onSelect,
}: {
  Illustration: Element;
  Instructions: Array<string>;
  mode: InteracationMode;
  options?: any;
  keyGenerationMode: any;
  sepInstruction?: String;
  onSelect: (option) => any;
}) {
  const { colorMode } = useColorMode();
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
        {sepInstruction && (
          <Text fontSize={14} color={`${colorMode}.secondaryText`}>
            {sepInstruction}
          </Text>
        )}
      </Box>
      {options && options.length > 0 && (
        <Box style={styles.signerOptionTitle}>
          <Text medium color={`${colorMode}.greenText`}>
            {mode === InteracationMode.HEALTH_CHECK ? 'Verify Signer Via' : 'Setup Signer Via'}
          </Text>
        </Box>
      )}
      <View
        style={{
          marginVertical: hp(14),
          gap: 2,
          flexDirection: 'row',
        }}
      >
        <Box style={styles.setupOptionsContainer}>
          {options &&
            options.map((option) => (
              <SetupSignerOptions
                disabled={option.disabled}
                key={option.name}
                isSelected={keyGenerationMode === option.name}
                name={option.title}
                icon={option.icon}
                onCardSelect={() => {
                  onSelect(option);
                }}
                customStyle={{
                  width: '48%',
                  paddingTop: hp(14),
                  paddingBottom: hp(9),
                  paddingLeft: wp(12),
                  paddingRight: wp(14),
                }}
              />
            ))}
        </Box>
      </View>
    </View>
  );
}

// TODO: Also compare xpubs

const verifyPassport = (qrData, signer) => {
  const { masterFingerprint } = getPassportDetails(qrData);
  return masterFingerprint === signer.masterFingerprint;
};

const verifySeedSigner = (qrData: any, signer: VaultSigner) => {
  const { masterFingerprint } = getSeedSignerDetails(qrData);
  return masterFingerprint === signer.masterFingerprint;
};

const verifySpecter = (qrData, signer) => {
  const { masterFingerprint } = getSpecterDetails(qrData);
  return masterFingerprint === signer.masterFingerprint;
};

const verifyKeystone = (qrData, signer) => {
  const { masterFingerprint } = getKeystoneDetails(qrData);
  return masterFingerprint === signer.masterFingerprint;
};

const verifyJade = (qrData, signer) => {
  const { masterFingerprint } = getJadeDetails(qrData);
  return masterFingerprint === signer.masterFingerprint;
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

const verifyColdCard = (qrData, signer, isMultiSig) => {
  const { masterFingerprint } = extractColdCardExport(qrData, isMultiSig);
  return masterFingerprint === signer.masterFingerprint;
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
  const { colorMode } = useColorMode();
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
        showToast(error.message, <ToastErrorIcon />);
      } else if (error.toString() === 'Error') {
        /* empty */
      } else captureError(error);
    }
  };

  const verifyMobileKey = () => {
    try {
      const currentPinHash = hash512(password);
      if (currentPinHash === pinHash) {
        dispatch(
          healthCheckStatusUpdate([
            {
              signerId: signer.masterFingerprint,
              status: hcStatusType.HEALTH_CHECK_SUCCESSFULL,
            },
          ])
        );
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
        showToast(error.message, <ToastErrorIcon />);
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
      <Text style={styles.infoText} color={`${colorMode}.greenText`}>
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
        keyColor={`${colorMode}.primaryText`}
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
  accountNumber,
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
  vaultId?: string;
  accountNumber?: number;
}) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { common, settings } = translations;
  const { createCreateCanaryWallet } = useCanaryWalletSetup({});
  const [passwordModal, setPasswordModal] = useState(false);
  const [inProgress, setInProgress] = useState(false);

  const { mapUnknownSigner } = useUnkownSigners();
  const loginMethod = useAppSelector((state) => state.settings.loginMethod);
  const { signers } = useSigners();
  const myAppKeys = signers.filter(
    (signer) => signer.type === SignerType.MY_KEEPER && !signer.archived
  );
  const { signerMap } = useSignerMap() as { signerMap: { [key: string]: Signer } };

  const appId = useAppSelector((state) => state.storage.appId);
  const { pinHash } = useAppSelector((state) => state.storage);
  const isHealthcheck = mode === InteracationMode.HEALTH_CHECK;
  const isIdentification = mode === InteracationMode.IDENTIFICATION;
  const isCanaryAddition = mode === InteracationMode.CANARY_ADDITION;
  const isExternalKey = type === SignerType.KEEPER;
  const [otp, setOtp] = useState('');
  const [signingServerHealthCheckOTPModal, setSigningServerHealthCheckOTPModal] = useState(false);
  const [signingServerRecoverOTPModal, setSigningServerRecoverOTPModal] = useState(false);
  const [isNfcSupported, setNfcSupport] = useState(true);
  const [keyGenerationMode, setKeyGenerationMode] = useState(KeyGenerationMode.FILE);
  const data = useQuery(RealmSchema.BackupHistory);
  const [backupModalVisible, setBackupModalVisible] = useState(false);

  const getNfcSupport = async () => {
    const isSupported = await NFC.isNFCSupported();
    setNfcSupport(isSupported);
  };

  useEffect(() => {
    getNfcSupport();
  }, []);

  const navigateToTapsignerSetup = () => {
    if (mode === InteracationMode.RECOVERY) {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'AddTapsignerRecovery',
          params: { mode, signer, isMultisig, accountNumber: getAccountFromSigner(signer) },
        })
      );
    }
    navigation.dispatch(
      CommonActions.navigate({
        name: 'TapsignerAction',
        params: { mode, signer, isMultisig, accountNumber, addSignerFlow },
      })
    );
  };

  const navigateToPortalSetup = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'SetupPortal',
        params: { mode, signer, isMultisig, accountNumber, addSignerFlow },
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
          title: `${
            isHealthcheck
              ? 'Verify'
              : isCanaryAddition
              ? 'Setting up for Canary '
              : isExternalKey
              ? 'Add'
              : 'Setting up'
          } ${getSignerNameFromType(type)}`,
          subtitle: isExternalKey
            ? 'Please scan a QR or use alternate methods listed below'
            : 'Please scan until all the QR data has been retrieved',
          onQrScan: (data) => {
            isHealthcheck ? onQRScanHealthCheck(data, signer) : onQRScan(data);
          },
          setup: true,
          type,
          mode,
          signer,
          addSignerFlow,
        },
      })
    );
  };

  const navigateToFileBasedSigner = (type) => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'HandleFile',
        params: {
          title: `${
            isHealthcheck ? 'Verify' : isCanaryAddition ? 'Setting up for Canary' : 'Setting up'
          } ${getSignerNameFromType(type)}`,
          subTitle: 'Please upload or paste the file containing the xpub data',
          mode,
          signerType: type,
          addSignerFlow,
          ctaText: 'Proceed',
          onFileExtract,
        },
      })
    );
  };

  const generateMyAppKey = async () => {
    try {
      setInProgress(true);
      const instanceNumberToSet = WalletUtilities.getInstanceNumberForSigners(myAppKeys);
      getCosignerDetails(primaryMnemonic, instanceNumberToSet).then((cosigner) => {
        const hw = setupKeeperSigner(cosigner);
        if (hw) {
          dispatch(addSigningDevice([hw.signer]));
          const navigationState = addSignerFlow
            ? {
                name: 'Home',
                params: { selectedOption: 'Keys', addedSigner: hw.signer },
              }
            : {
                name: 'AddSigningDevice',
                merge: true,
                params: { addedSigner: hw.signer },
              };
          navigation.dispatch(CommonActions.navigate(navigationState));
        }
        setInProgress(false);
      });
    } catch (err) {
      setInProgress(false);
      captureError(err);
      showToast('Key could not be added, please try again', <ToastErrorIcon />);
    }
  };

  const checkSigningServerHealth = async () => {
    if (mode === InteracationMode.HEALTH_CHECK) {
      try {
        setInProgress(true);
        const signerXfp = WalletUtilities.getFingerprintFromExtendedKey(
          signer.signerXpubs[XpubTypes.P2WSH][0].xpub,
          WalletUtilities.getNetworkByType(config.NETWORK_TYPE)
        );
        const { isSignerAvailable } = await SigningServer.checkSignerHealth(signerXfp, Number(otp));
        if (isSignerAvailable) {
          dispatch(
            healthCheckStatusUpdate([
              {
                signerId: signer.masterFingerprint,
                status: hcStatusType.HEALTH_CHECK_SUCCESSFULL,
              },
            ])
          );
          close();
          showToast('Health check done successfully', <TickIcon />);
        } else {
          close();
          dispatch(
            healthCheckStatusUpdate([
              {
                signerId: signer.masterFingerprint,
                status: hcStatusType.HEALTH_CHECK_FAILED,
              },
            ])
          );
          showToast('Error in Health check', <ToastErrorIcon />);
        }
        setInProgress(false);
      } catch (err) {
        console.log(err);
        setInProgress(false);
        close();
        showToast('Error in Health check', <ToastErrorIcon />);
      } finally {
        setOtp('');
      }
    }
  };
  const navigateToSigningServerSetup = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ChoosePolicyNew',
        params: { signer, addSignerFlow, vaultId },
      })
    );
  };

  const navigateToSetupWithChannel = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ConnectChannel',
        params: {
          title: `${
            isHealthcheck ? 'Verify' : isCanaryAddition ? 'Setting up for Canary' : 'Setting up'
          } ${getSignerNameFromType(type)}`,
          subtitle: `Please download the Bitcoin Keeper desktop app from our website: ${KEEPER_WEBSITE_BASE_URL}/desktop to connect.`,
          type,
          signer,
          mode,
          isMultisig,
          addSignerFlow,
          accountNumber,
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

  const importSeedWordsBasedKey = (mnemonic) => {
    try {
      const { signer, key } = setupSeedWordsBasedKey(mnemonic, isMultisig);
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
    } catch (err) {
      Alert.alert(err?.message);
    }
  };

  const navigateToSeedWordSetup = (isImport = false) => {
    if (mode === InteracationMode.RECOVERY) {
      const navigationState = getnavigationState(SignerType.SEED_WORDS);
      navigation.dispatch(CommonActions.reset(navigationState));
      close();
    } else if (mode === InteracationMode.VAULT_ADDITION && !isImport) {
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
              try {
                const { signer, key } = setupSeedWordsBasedKey(mnemonic, isMultisig);
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
              } catch (err) {
                showToast(err?.message, <ToastErrorIcon />);
              }
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
            signer,
            isMultisig,
            setupSeedWordsBasedSigner: setupSeedWordsBasedKey,
            mapUnknownSigner,
          },
        })
      );
    } else if (isImport) {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'EnterSeedScreen',
          params: {
            mode,
            isImport,
            isHealthCheck: false,
            signer,
            isMultisig,
            setupSeedWordsBasedSigner: setupSeedWordsBasedKey,
            addSignerFlow,
            importSeedCta: importSeedWordsBasedKey,
          },
        })
      );
    }
  };

  const navigateToRecoveryKeySetup = () => {
    if (data.length === 0 && mode === InteracationMode.HEALTH_CHECK) {
      setConfirmPassVisible(true);
    } else {
      return navigation.navigate('WalletBackHistory', { isUaiFlow: true });
    }
    close();
  };

  const onQRScan = async (qrData) => {
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
          hw = setupKeeperSigner(qrData);
          break;
        case SignerType.KEYSTONE:
          hw = setupKeystone(qrData, isMultisig);
          break;
        case SignerType.JADE:
          hw = setupJade(qrData, isMultisig);
          break;
        case SignerType.COLDCARD:
          hw = setupColdcard(qrData, isMultisig);
          break;
        default:
          break;
      }

      const handleSuccess = () => {
        dispatch(
          healthCheckStatusUpdate([
            {
              signerId: hw.signer.masterFingerprint,
              status: hcStatusType.HEALTH_CHECK_SUCCESSFULL,
            },
          ])
        );
        navigation.dispatch(StackActions.pop(2));
        showToast(`${hw.signer.signerName} verified successfully`, <TickIcon />);
      };

      const handleFailure = () => {
        navigation.dispatch(CommonActions.goBack());
        dispatch(
          healthCheckStatusUpdate([
            {
              signerId: hw.signer.masterFingerprint,
              status: hcStatusType.HEALTH_CHECK_FAILED,
            },
          ])
        );
        showToast(`${hw.signer.signerName} verification failed`, <ToastErrorIcon />);
      };

      if (mode === InteracationMode.RECOVERY) {
        dispatch(setSigningDevices(hw.signer));
        navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
      } else if (mode === InteracationMode.IDENTIFICATION) {
        const mapped = mapUnknownSigner({ masterFingerprint: hw.signer.masterFingerprint, type });
        mapped ? handleSuccess() : handleFailure();
      } else if (mode === InteracationMode.CANARY_ADDITION) {
        dispatch(setSigningDevices(hw.signer));
        createCreateCanaryWallet(hw.signer);
      } else {
        dispatch(addSigningDevice([hw.signer]));
        const navigationState = addSignerFlow
          ? {
              name: 'Home',
              params: { selectedOption: 'Keys', addedSigner: hw.signer },
            }
          : {
              name: 'AddSigningDevice',
              merge: true,
              params: { addedSigner: hw.signer },
            };
        navigation.dispatch(CommonActions.navigate(navigationState));
      }
    } catch (error) {
      if (error instanceof HWError) {
        showToast(error.message, <ToastErrorIcon />);
      } else {
        captureError(error);
        showToast(
          `Invalid QR, please scan the QR from a ${getSignerNameFromType(type)}`,
          <ToastErrorIcon />
        );
      }
    }
  };

  const onQRScanHealthCheck = async (qrData, signer) => {
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
        case SignerType.COLDCARD:
          healthcheckStatus = verifyColdCard(qrData, signer, isMultisig);
          break;
        default:
          break;
      }
      if (healthcheckStatus) {
        dispatch(
          healthCheckStatusUpdate([
            {
              signerId: signer.masterFingerprint,
              status: hcStatusType.HEALTH_CHECK_SUCCESSFULL,
            },
          ])
        );
        navigation.dispatch(CommonActions.goBack());
        showToast('Health check done successfully', <TickIcon />);
      } else {
        navigation.dispatch(CommonActions.goBack());
        dispatch(
          healthCheckStatusUpdate([
            {
              signerId: signer.masterFingerprint,
              status: hcStatusType.HEALTH_CHECK_FAILED,
            },
          ])
        );
        showToast('Health check Failed', <ToastErrorIcon />);
      }
    } catch (error) {
      if (error instanceof HWError) {
        showToast(error.message, <ToastErrorIcon />);
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

  const onFileExtract = async (fileData) => {
    if (!fileData || !fileData.trim) return;
    let jsonData;
    let hw;
    let error;
    try {
      jsonData = JSON.parse(fileData);
    } catch (error) {
      showToast(`Please scan a valid file from ${getSignerNameFromType(type)}`, <ToastErrorIcon />);
      return;
    }
    switch (type) {
      case SignerType.PASSPORT:
        try {
          const passportDetails = isMultisig
            ? getPassportDetails(jsonData)
            : extractColdCardExport(jsonData, isMultisig);
          const { xpub, derivationPath, masterFingerprint } = passportDetails;
          const { signer } = generateSignerFromMetaData({
            xpub,
            derivationPath,
            masterFingerprint,
            signerType: SignerType.PASSPORT,
            storageType: SignerStorage.COLD,
            isMultisig,
          });
          hw = signer;
          break;
        } catch (err) {
          error = err;
        }
      case SignerType.COLDCARD:
        try {
          const ccDetails = extractColdCardExport(jsonData, isMultisig);
          const { xpub, derivationPath, masterFingerprint, xpubDetails } = ccDetails;
          const { signer } = generateSignerFromMetaData({
            xpub,
            derivationPath,
            masterFingerprint,
            isMultisig,
            signerType: SignerType.COLDCARD,
            storageType: SignerStorage.COLD,
            xpubDetails,
          });
          hw = signer;
        } catch (err) {
          error = err;
        }
        break;
      case SignerType.KEYSTONE:
        try {
          const { xpub, derivationPath, masterFingerprint, forMultiSig, forSingleSig } =
            getKeystoneDetailsFromFile(jsonData);
          if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
            const { signer } = generateSignerFromMetaData({
              xpub,
              derivationPath,
              masterFingerprint,
              signerType: SignerType.KEYSTONE,
              storageType: SignerStorage.COLD,
              isMultisig,
            });
            hw = signer;
          } else {
            // TODO: handle sig type mismatch
            showToast(
              `Please scan a valid file from ${getSignerNameFromType(type)}`,
              <ToastErrorIcon />
            );
          }
        } catch (err) {
          error = err;
        }
        break;
      default:
        break;
    }
    if (error) {
      showToast(`Please scan a valid file from ${getSignerNameFromType(type)}`, <ToastErrorIcon />);
      captureError(error);
      return;
    }
    if (mode === InteracationMode.HEALTH_CHECK) {
      dispatch(
        healthCheckStatusUpdate([
          {
            signerId: signer.masterFingerprint,
            status: hcStatusType.HEALTH_CHECK_SUCCESSFULL,
          },
        ])
      );
      showToast('Health check successful!');
    } else {
      dispatch(addSigningDevice([hw]));
      const navigationState = addSignerFlow
        ? { name: 'Home', params: { selectedOption: 'Keys', addedSigner: hw } }
        : {
            name: 'AddSigningDevice',
            merge: true,
            params: { addedSigner: hw },
          };
      navigation.dispatch(CommonActions.navigate(navigationState));
    }
  };

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
          isBIP85: response.isBIP85,
          signerPolicy: response.policy,
        });
        setInProgress(false);
        dispatch(setSigningDevices(signingServerKey));
        navigation.dispatch(CommonActions.navigate('VaultRecoveryAddSigner'));
        showToast(
          `${signingServerKey.signerName} added successfully`,
          <TickIcon />,
          IToastCategory.SIGNING_DEVICE
        );
      }
    } catch (err) {
      setInProgress(false);
      showToast(`${err}`, <ToastErrorIcon />);
    }
  };

  const findSigningServer = async (otp) => {
    try {
      setInProgress(true);
      if (vaultSigners.length <= 1) {
        throw new Error('Add two other devices first to do a health check');
      }
      const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
      const ids = vaultSigners.map((signer) =>
        WalletUtilities.getFingerprintFromExtendedKey(signer.xpub, network)
      );
      const response = await SigningServer.findSignerSetup(ids, otp);
      if (response.valid) {
        const mapped = mapUnknownSigner({
          masterFingerprint: response.masterFingerprint,
          type: SignerType.POLICY_SERVER,
          isBIP85: response.isBIP85,
          signerPolicy: response.policy,
        });
        if (mapped) {
          showToast('Server key verified successfully', <TickIcon />);
        } else {
          showToast('Something Went Wrong!', <ToastErrorIcon />);
        }
      }
    } catch (err) {
      setInProgress(false);
      showToast(`${err}`, <ToastErrorIcon />);
    }
  };

  const recoverSigningServer = async (otp) => {
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
          isBIP85: response.isBIP85,
          signerPolicy: response.policy,
        });
        setInProgress(false);

        dispatch(addSigningDevice([signingServerKey]));
        showToast(
          `${signingServerKey.signerName} added successfully`,
          <TickIcon />,
          IToastCategory.SIGNING_DEVICE
        );
      }
    } catch (err) {
      setInProgress(false);
      showToast(`${err}`, <ToastErrorIcon />);
    }
  };

  function SigningServerOTPModal() {
    const { translations } = useContext(LocalizationContext);
    const { vault: vaultTranslation, common, signer: signerTranslation } = translations;

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
      <Box width="100%">
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
            <CVVInputsView
              passCode={otp}
              passcodeFlag={false}
              backgroundColor
              textColor
              height={hp(46)}
              width={hp(46)}
              marginTop={hp(0)}
              marginBottom={hp(20)}
              inputGap={2}
              customStyle={styles.CVVInputsView}
            />
          </TouchableOpacity>
        </Box>
        <KeyPadView
          onPressNumber={onPressNumber}
          onDeletePressed={onDeletePressed}
          keyColor={`${colorMode}.primaryText`}
          ClearIcon={<DeleteIcon />}
        />
        <Box mt={10} alignSelf="flex-end" mr={2}>
          <Box>
            <Buttons
              primaryCallback={() => {
                if (mode === InteracationMode.HEALTH_CHECK) {
                  checkSigningServerHealth();
                  setSigningServerHealthCheckOTPModal(false);
                } else if (
                  mode === InteracationMode.VAULT_ADDITION &&
                  keyGenerationMode === KeyGenerationMode.RECOVER
                ) {
                  recoverSigningServer(otp);
                  setSigningServerRecoverOTPModal(false);
                } else {
                  if (mode === InteracationMode.IDENTIFICATION) {
                    findSigningServer(otp);
                  } else {
                    verifySigningServer(otp);
                  }
                }
              }}
              primaryText={common.confirm}
              secondaryText={mode === InteracationMode.HEALTH_CHECK && signerTranslation.forgot2FA}
              secondaryCallback={() => {
                setSigningServerHealthCheckOTPModal(false);
                showToast(signerTranslation.forgot2FANote, null, IToastCategory.DEFAULT, 5000);
              }}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  const navigateToMobileKey = async (isMultiSig) => {
    if (mode === InteracationMode.RECOVERY) {
      const navigationState = getnavigationState(SignerType.MOBILE_KEY);
      navigation.dispatch(CommonActions.reset(navigationState));
      close();
    } else if (mode === InteracationMode.VAULT_ADDITION) {
      await biometricAuth(isMultiSig);
    } else if (mode === InteracationMode.HEALTH_CHECK) {
      navigation.dispatch(
        CommonActions.navigate('ExportSeed', {
          seed: primaryMnemonic,
          next: true,
          isHealthCheck: true,
          signer,
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

  const checkIKSHealth = async () => {
    try {
      setInProgress(true);
      const signerXfp = WalletUtilities.getFingerprintFromExtendedKey(
        signer.signerXpubs[XpubTypes.P2WSH][0].xpub,
        WalletUtilities.getNetworkByType(config.NETWORK_TYPE)
      );
      const { isIKSAvailable } = await InheritanceKeyServer.checkIKSHealth(signerXfp);
      if (isIKSAvailable) {
        dispatch(
          healthCheckStatusUpdate([
            {
              signerId: signer.masterFingerprint,
              status: hcStatusType.HEALTH_CHECK_SUCCESSFULL,
            },
          ])
        );
        close();
        showToast('Health check done successfully', <TickIcon />);
      } else {
        close();
        dispatch(
          healthCheckStatusUpdate([
            {
              signerId: signer.masterFingerprint,
              status: hcStatusType.HEALTH_CHECK_FAILED,
            },
          ])
        );
        showToast('Error in Health check', <ToastErrorIcon />);
      }
      setInProgress(false);
    } catch (err) {
      setInProgress(false);
      close();
      showToast('Error in Health check', <ToastErrorIcon />);
    }
  };

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

      let requestId = inheritanceRequestId;
      let isNewRequest = false;
      if (!requestId) {
        requestId = `request-${generateKey(14)}`;
        isNewRequest = true;
      }
      const { requestStatus, setupInfo } = await InheritanceKeyServer.requestInheritanceKey(
        requestId,
        cosignersMapIds[0],
        thresholdDescriptors
      );
      if (requestStatus && isNewRequest) dispatch(setInheritanceRequestId(requestId));

      // process request based on status
      if (requestStatus.isDeclined) {
        showToast('Inheritance request has been declined', <ToastErrorIcon />);
        // dispatch(setInheritanceRequestId('')); // clear existing request
      } else if (!requestStatus.isApproved) {
        showToast(
          `Request would approve in ${formatDuration(requestStatus.approvesIn)} if not rejected`,
          <TickIcon />
        );
      } else if (requestStatus.isApproved && setupInfo) {
        const { signer: inheritanceKey } = generateSignerFromMetaData({
          xpub: setupInfo.inheritanceXpub,
          derivationPath: setupInfo.derivationPath,
          masterFingerprint: setupInfo.masterFingerprint,
          signerType: SignerType.INHERITANCEKEY,
          storageType: SignerStorage.WARM,
          isMultisig: true,
          inheritanceKeyInfo: {
            // note: a pre-present inheritanceKeyInfo w/ an empty configurations array is also used as a key to identify that it is a recovered inheritance key
            configurations: [], // setupInfo.configurations,
            policy: setupInfo.policy,
          },
          xfp: setupInfo.id,
          isBIP85: setupInfo.isBIP85,
        });

        // Recovery flow via BSMS is disabled for now. TODO: once backup via BSMS is enabled, we can enable recovery via BSMS as well
        // if (setupInfo.configurations[0].bsms) {
        //   initateRecovery(setupInfo.configurations[0].bsms);
        // } else {
        //   // showToast('Cannot recreate vault as BSMS was not present', <ToastErrorIcon />);
        // }
        dispatch(addSigningDevice([inheritanceKey]));
        dispatch(setInheritanceRequestId('')); // clear approved request

        const registeredEmails = idx(setupInfo.policy, (_) => _.alert.emails) || [];
        dispatch(setInheritanceKeyExistingEmailCount(registeredEmails.length));

        showToast(
          `${inheritanceKey.signerName} added successfully`,
          <TickIcon />,
          IToastCategory.SIGNING_DEVICE
        );
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
      const { id, isBIP85, inheritanceXpub: xpub, derivationPath, masterFingerprint } = setupData;
      const { signer: inheritanceKey } = generateSignerFromMetaData({
        xpub,
        derivationPath,
        masterFingerprint,
        signerType: SignerType.INHERITANCEKEY,
        storageType: SignerStorage.WARM,
        xfp: id,
        isBIP85,
        isMultisig: true,
      });
      setInProgress(false);
      dispatch(addSigningDevice([inheritanceKey]));
      showToast(
        `${inheritanceKey.signerName} added successfully`,
        <TickIcon />,
        IToastCategory.SIGNING_DEVICE
      );
    } catch (err) {
      console.log({ err });
      showToast('Failed to add inheritance key', <TickIcon />);
    }
  };

  const handleInheritanceKey = () => {
    if (mode === InteracationMode.HEALTH_CHECK) {
      checkIKSHealth();
    } else {
      if (keyGenerationMode === KeyGenerationMode.RECOVER) {
        requestInheritanceKeyRecovery();
      } else {
        setupInheritanceKey();
      }
    }
  };

  const handleSigningServerKey = () => {
    if (mode === InteracationMode.HEALTH_CHECK) {
      setSigningServerHealthCheckOTPModal(true);
    } else {
      if (keyGenerationMode === KeyGenerationMode.RECOVER) {
        setSigningServerRecoverOTPModal(true);
      } else {
        navigateToSigningServerSetup();
      }
    }
  };

  const {
    Illustration,
    Instructions,
    title,
    subTitle,
    unsupported,
    options,
    sepInstruction = '',
    type: signerType,
  } = getSignerContent(
    type,
    isMultisig,
    translations,
    isHealthcheck,
    isCanaryAddition,
    isIdentification,
    colorMode,
    isNfcSupported,
    keyGenerationMode
  );

  const lastUsedOption = useAppSelector(
    (state) => state.signer.lastUsedOptions[signerType] || KeyGenerationMode.FILE
  );

  const [confirmPassVisible, setConfirmPassVisible] = useState(false);

  useEffect(() => {
    setKeyGenerationMode(lastUsedOption);
  }, [lastUsedOption]);

  const onSelect = (option) => {
    switch (signerType) {
      case SignerType.POLICY_SERVER:
      case SignerType.INHERITANCEKEY:
      case SignerType.KEEPER:
      case SignerType.SEED_WORDS:
      case SignerType.COLDCARD:
      case SignerType.JADE:
      case SignerType.PASSPORT:
      case SignerType.KEYSTONE:
        setKeyGenerationMode(option.name);
        dispatch(setLastUsedOption({ signerType, option: option.name }));
        break;
      default:
        break;
    }
  };

  const Content = useCallback(() => {
    if (signerType === SignerType.POLICY_SERVER) {
      return (
        <Box style={styles.modalContainer}>
          {Illustration}
          {isHealthcheck ? (
            <Instruction text="Health Check is initiated if a signer is not used for the last 180 days" />
          ) : (
            <Text>
              This adds an extra layer of flexibility and security to your Bitcoin holdings while
              keeping you in control.
            </Text>
          )}
        </Box>
      );
    }

    return (
      <SignerContent
        Illustration={Illustration}
        mode={mode}
        options={options}
        Instructions={Instructions}
        keyGenerationMode={keyGenerationMode}
        sepInstruction={sepInstruction}
        onSelect={onSelect}
      />
    );
  }, [signerType, keyGenerationMode, options]); // Add dependencies as required

  const buttonCallback = () => {
    close();
    switch (type) {
      case SignerType.TAPSIGNER:
        return navigateToTapsignerSetup();
      case SignerType.COLDCARD:
        if (keyGenerationMode === KeyGenerationMode.FILE) {
          return navigateToFileBasedSigner(type);
        } else if (keyGenerationMode === KeyGenerationMode.USB) {
          return navigateToSetupWithChannel();
        } else if (keyGenerationMode === KeyGenerationMode.QR) {
          return navigateToAddQrBasedSigner();
        }
        return navigateToColdCardSetup();
      case SignerType.POLICY_SERVER:
        return handleSigningServerKey();
      case SignerType.MOBILE_KEY:
        return navigateToMobileKey(isMultisig);
      case SignerType.SEED_WORDS:
        if (keyGenerationMode === KeyGenerationMode.IMPORT) {
          return navigateToSeedWordSetup(true);
        } else {
          return navigateToSeedWordSetup();
        }
      case SignerType.MY_KEEPER:
        if (mode === InteracationMode.HEALTH_CHECK) {
          return navigateToRecoveryKeySetup();
        }
        return setConfirmPassVisible(true);
      case SignerType.BITBOX02:
      case SignerType.TREZOR:
      case SignerType.LEDGER:
        return navigateToSetupWithChannel();
      case SignerType.PASSPORT:
      case SignerType.KEYSTONE:
        if (keyGenerationMode === KeyGenerationMode.FILE) {
          return navigateToFileBasedSigner(type);
        }
        return navigateToAddQrBasedSigner();
      case SignerType.SEEDSIGNER:
      case SignerType.SPECTER:
        return navigateToAddQrBasedSigner();
      case SignerType.JADE:
        if (keyGenerationMode === KeyGenerationMode.USB) {
          return navigateToSetupWithChannel();
        }
        return navigateToAddQrBasedSigner();
      case SignerType.KEEPER:
        return navigateToAddQrBasedSigner();
      case SignerType.OTHER_SD:
        return navigateToSetupWithOtherSD();
      case SignerType.INHERITANCEKEY:
        return handleInheritanceKey();
      case SignerType.PORTAL:
        return navigateToPortalSetup();
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
        buttonText={
          signerType === SignerType.SEED_WORDS
            ? 'Next'
            : signerType === SignerType.POLICY_SERVER
            ? isHealthcheck
              ? 'Start Health Check'
              : 'Start the Setup'
            : 'Proceed'
        }
        buttonTextColor={`${colorMode}.buttonText`}
        buttonCallback={buttonCallback}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        Content={Content}
        secondaryButtonText={
          isHealthcheck ? 'Skip' : type === SignerType.INHERITANCEKEY ? 'Cancel' : null
        }
        secondaryCallback={
          isHealthcheck
            ? skipHealthCheckCallBack
            : type === SignerType.INHERITANCEKEY || type === SignerType.POLICY_SERVER
            ? close
            : null
        }
        loading={inProgress}
      />
      <KeeperModal
        visible={confirmPassVisible}
        closeOnOverlayClick={false}
        close={() => setConfirmPassVisible(false)}
        title="Enter Passcode"
        subTitleWidth={wp(240)}
        subTitle="Confirm passcode to generate key"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <PasscodeVerifyModal
            close={() => {
              setConfirmPassVisible(false);
            }}
            onSuccess={() => {
              if (type === SignerType.MY_KEEPER && mode === InteracationMode.HEALTH_CHECK) {
                setConfirmPassVisible(false);
                setBackupModalVisible(true);
              } else {
                generateMyAppKey();
              }
            }}
          />
        )}
      />
      <KeeperModal
        visible={passwordModal && mode === InteracationMode.VAULT_ADDITION}
        close={() => {
          setPasswordModal(false);
        }}
        title="Enter your password"
        subTitle="The one you use to login to the app"
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
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
          (visible &&
            type === SignerType.POLICY_SERVER &&
            (mode === InteracationMode.RECOVERY || mode === InteracationMode.IDENTIFICATION)) ||
          (type === SignerType.POLICY_SERVER &&
            mode === InteracationMode.HEALTH_CHECK &&
            signingServerHealthCheckOTPModal) ||
          (type === SignerType.POLICY_SERVER &&
            mode === InteracationMode.VAULT_ADDITION &&
            keyGenerationMode === KeyGenerationMode.RECOVER &&
            signingServerRecoverOTPModal)
        }
        close={() => {
          if (type === SignerType.POLICY_SERVER && mode === InteracationMode.HEALTH_CHECK) {
            setSigningServerHealthCheckOTPModal(false);
          } else {
            setSigningServerRecoverOTPModal(false);
          }
          close();
        }}
        title={
          signingServerHealthCheckOTPModal
            ? common.confirm2FACodeTitle
            : keyGenerationMode !== KeyGenerationMode.RECOVER
            ? 'Confirm OTP to setup 2FA'
            : 'Confirm OTP to recover Server Key'
        }
        subTitle={
          signingServerHealthCheckOTPModal
            ? common.confirm2FACodeSubtitle
            : keyGenerationMode !== KeyGenerationMode.RECOVER
            ? 'To complete setting up the signer'
            : 'To complete recovery of the signer'
        }
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={SigningServerOTPModal}
      />
      <KeeperModal
        visible={backupModalVisible}
        close={() => setBackupModalVisible(false)}
        title={settings.RKBackupTitle}
        subTitle={settings.RKBackupSubTitle}
        subTitleWidth={wp(300)}
        modalBackground={`${colorMode}.primaryBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.modalGreenTitle`}
        showCloseIcon={false}
        buttonText={common.backupNow}
        secondaryButtonText={common.cancel}
        secondaryCallback={() => setBackupModalVisible(false)}
        secButtonTextColor={`${colorMode}.greenText`}
        buttonCallback={() => {
          setBackupModalVisible(false);
          navigation.dispatch(
            CommonActions.navigate('ExportSeed', {
              seed: primaryMnemonic,
              next: true,
            })
          );
        }}
        Content={BackupModalContent}
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
    fontSize: 14,
    width: '100%',
    marginVertical: 2,
  },
  infoText: {
    padding: 3,
    fontSize: 14,
    fontWeight: '400',
    width: wp(285),
  },
  learnHow: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  signerOptionTitle: {
    marginTop: hp(10),
  },
  setupOptionsContainer: {
    gap: wp(11),
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 25,
  },
  CVVInputsView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default HardwareModalMap;
