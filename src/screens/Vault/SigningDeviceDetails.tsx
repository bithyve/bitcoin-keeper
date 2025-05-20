import React, { useContext, useEffect, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { Box, Center, useColorMode } from 'native-base';
import { CommonActions, StackActions, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Text from 'src/components/KeeperText';
import { ScrollView } from 'react-native-gesture-handler';
import { hp, wp } from 'src/constants/responsive';
import KeeperHeader from 'src/components/KeeperHeader';
import useToastMessage from 'src/hooks/useToastMessage';
import KeeperModal from 'src/components/KeeperModal';
import SeedSigner from 'src/assets/images/seedsigner-setup-horizontal.svg';
import Ledger from 'src/assets/images/ledger_image.svg';
import Keystone from 'src/assets/images/keystone_illustration.svg';
import PassportSVG from 'src/assets/images/illustration_passport.svg';
import SkipHealthCheck from 'src/assets/images/skipHealthCheck.svg';
import MobileKeyModalIllustration from 'src/assets/images/mobile-key-illustration.svg';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import ColdCardSetupImage from 'src/assets/images/ColdCardSetup.svg';
import MobileKeyIllustration from 'src/assets/images/mobileKey_illustration.svg';
import SeedWordsIllustration from 'src/assets/images/illustration_seed_words.svg';
import KeeperSetupImage from 'src/assets/images/illustration-external-key.svg';
import SigningServerIllustration from 'src/assets/images/signingServer_illustration.svg';
import WalletIcon from 'src/assets/images/wallet-white.svg';
import VaultIcon from 'src/assets/images/vault-white.svg';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import SettingIcon from 'src/assets/images/settings-gear.svg';
import SettingIconLight from 'src/assets/images/settings-gear-green.svg';
import BitboxImage from 'src/assets/images/bitboxSetup.svg';
import TrezorSetup from 'src/assets/images/trezor_setup.svg';
import JadeSVG from 'src/assets/images/illustration_jade.svg';
import SpecterSetupImage from 'src/assets/images/illustration_spectre.svg';
import HealthCheckLight from 'src/assets/images/health-check-green.svg';
import HealthCheckDark from 'src/assets/images/health-check-white.svg';
import ChangeKeyLight from 'src/assets/images/change-key-green.svg';
import ChangeKeyDark from 'src/assets/images/change-key-white.svg';
import EmptyStateLight from 'src/assets/images/empty-activity-illustration-light.svg';
import EmptyStateDark from 'src/assets/images/empty-activity-illustration-dark.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import {
  EntityKind,
  SignerType,
  VaultType,
  VisibilityType,
  XpubTypes,
} from 'src/services/wallets/enums';
import { healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import useVault from 'src/hooks/useVault';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import KeeperFooter from 'src/components/KeeperFooter';
import { KEEPER_KNOWLEDGEBASE } from 'src/utils/service-utilities/config';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import useSignerMap from 'src/hooks/useSignerMap';
import useSigners from 'src/hooks/useSigners';
import { getPsbtForHwi, getSignerDescription, getSignerNameFromType } from 'src/hardware';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useIndicatorHook } from 'src/hooks/useIndicatorHook';
import { uaiType } from 'src/models/interfaces/Uai';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import { Signer, Vault } from 'src/services/wallets/interfaces/vault';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import BackupModalContent from 'src/screens/AppSettings/BackupModal';
import { getPersistedDocument } from 'src/services/documents';
import { generateDataFromPSBT, getAccountFromSigner, getKeyUID } from 'src/utils/utilities';
import idx from 'idx';
import Colors from 'src/theme/Colors';
import HexagonIcon from 'src/components/HexagonIcon';
import WalletCopiableData from 'src/components/WalletCopiableData';
import { captureError } from 'src/services/sentry';
import {
  findChangeFromReceiverAddresses,
  findVaultFromSenderAddress,
  getKeyExpression,
} from 'src/utils/service-utilities/utils';
import ConciergeNeedHelp from 'src/assets/images/conciergeNeedHelp.svg';
import { credsAuthenticated } from 'src/store/reducers/login';
import { Psbt, script } from 'bitcoinjs-lib';
import { resetSignersUpdateState } from 'src/store/reducers/bhr';
import SignerCard from '../AddSigner/SignerCard';
import { SDColoredIcons, SDIcons } from './SigningDeviceIcons';
import IdentifySignerModal from './components/IdentifySignerModal';
import HardwareModalMap, { InteracationMode } from './HardwareModalMap';
import ShareKeyModalContent from './components/ShareKeyModalContent';
import STModalContent from './components/STModalContent';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { HCESession, HCESessionContext } from 'react-native-hce';
import NFC from 'src/services/nfc';
import nfcManager, { NfcTech } from 'react-native-nfc-manager';
import PrivateBitboxImage from 'src/assets/privateImages/bitBox-illustration.svg';
import PrivateColdCard from 'src/assets/privateImages/coldCard-illustration.svg';
import PrivateJade from 'src/assets/privateImages/jade-illustrationsvg.svg';
import PrivateKeyStone from 'src/assets/privateImages/keystone-illustration.svg';
import PrivateLedger from 'src/assets/privateImages/ledger-illustration.svg';
import PrivatePassport from 'src/assets/privateImages/passport-illustration.svg';
import PrivateSpector from 'src/assets/privateImages/spector-illustration.svg';
import PrivateTapSigner from 'src/assets/privateImages/tapsigner-illustration.svg';
import PrivateTrezor from 'src/assets/privateImages/trezor-illustration.svg';
import PrivateSeedKey from 'src/assets/privateImages/seedKey-illustration.svg';
import PrivateServerKeyIllustration from 'src/assets/privateImages/Server-key-ilustration.svg';
import PrivateSeedSignerSetupImage from 'src/assets/privateImages/seedSigner-illustration.svg';
import PrivateMy_Keeper from 'src/assets/privateImages/mobileKeyIllustration.svg';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';

export const SignersReqVault = [
  SignerType.LEDGER,
  SignerType.TREZOR,
  SignerType.BITBOX02,
  SignerType.PORTAL,
  SignerType.KEYSTONE,
];

function EmptyActivityView({ colorMode, isDarkMode }) {
  return (
    <Box style={styles.emptyWrapper}>
      <Text color={`${colorMode}.secondaryText`} style={styles.emptyText} medium>
        No activity detected!
      </Text>
      <Text color={`${colorMode}.secondaryText`} style={styles.emptySubText}>
        This Signer isn't linked to a wallet yet. Ready to unlock its power?
      </Text>
      <Box style={styles.emptyStateContainer}>
        {!isDarkMode ? <EmptyStateLight /> : <EmptyStateDark />}
      </Box>
    </Box>
  );
}

const getSignerContent = (type: SignerType, privateTheme) => {
  switch (type) {
    case SignerType.COLDCARD:
      return {
        title: 'Coldcard',
        subTitle:
          'Coldcard is an easy-to-use, ultra-secure, open-source, and affordable hardware wallet that is easy to back up via an encrypted microSD card. Your private key is stored in a dedicated security chip.',
        assert: privateTheme ? <PrivateColdCard /> : <ColdCardSetupImage />,
        description:
          '\u2022 Coldcard provides the best physical security.\n\u2022 All of the Coldcard is viewable, editable, and verifiable. You can compile it yourself.',
        FAQ: 'https://coldcard.com/docs/faq',
      };
    case SignerType.TAPSIGNER:
      return {
        title: 'TAPSIGNER',
        subTitle:
          'TAPSIGNER is a Bitcoin private key on a card! You can sign mobile wallet transaction by tapping the phone.',
        assert: privateTheme ? <PrivateTapSigner /> : <TapsignerSetupImage />,
        description:
          '\u2022 TAPSIGNER’s lower cost makes hardware wallet features and security available to a wider market around the world.\n\u2022 An NFC card provides fast and easy user experiences.\n\u2022 TAPSIGNER is a great way to keep your keys separate from your wallet(s). \n\u2022 The card form factor makes it easy to carry and easy to conceal.',
        FAQ: 'https://tapsigner.com/faq',
      };
    case SignerType.LEDGER:
      return {
        title: 'LEDGER',
        subTitle:
          'Ledger has industry-leading security to keep your Bitcoin secure at all times. Buy, sell, exchange, and grow your assets with our partners easily and securely. With Ledger, you can secure, store and manage your Bitcoin.',
        assert: privateTheme ? <PrivateLedger width={180} height={180} /> : <Ledger />,
        description: '',
        FAQ: 'https://support.ledger.com/hc/en-us/categories/4404369571601?support=true',
      };
    case SignerType.SEEDSIGNER:
      return {
        title: 'SeedSigner',
        subTitle:
          'The goal of SeedSigner is to lower the cost and complexity of Bitcoin multi-signature wallet use. To accomplish this goal, SeedSigner offers anyone the opportunity to build a verifiably air-gapped, stateless Bitcoin signer using inexpensive, publicly available hardware components (usually < $50).',
        assert: privateTheme ? <PrivateSeedSignerSetupImage /> : <SeedSigner />,
        description:
          '\u2022 SeedSigner helps users save with Bitcoin by assisting with trustless private key generation and multi-signature wallet setup. \n\u2022 It also help users transact with Bitcoin via a secure, air-gapped QR-exchange signing model.',
        FAQ: 'https://seedsigner.com/faqs/',
      };
    case SignerType.KEYSTONE:
      return {
        title: 'Keystone',
        subTitle:
          'It offers a convenient cold storage solution with open source firmware, a 4-inch touchscreen, and multi-key support. Protect your bitcoin with the right balance between a secure and convenient hardware wallet with mobile phone support.',
        assert: privateTheme ? <PrivateKeyStone /> : <Keystone />,
        description:
          "\u2022 With QR codes, you can verify all data transmission to ensure that information coming into Keystone contains no trojans or viruses, while information going out doesn't leak private keys or any other sensitive information.",
        FAQ: 'https://support.keyst.one/miscellaneous/faq',
      };
    case SignerType.PASSPORT:
      return {
        title: 'Foundation Passport',
        subTitle:
          'Foundation products empower individuals to reclaim their digital sovereignty by taking control of your money and data. Foundation offers best-in-class security and privacy via openness. No walled gardens; no closed source engineering',
        assert: privateTheme ? <PrivatePassport /> : <PassportSVG />,
        description:
          '\u2022 Passport has no direct connection with the outside world – meaning your keys are never directly exposed online. It uses a camera and QR codes for communication. This provides hardcore, air-gapped security while offering a seamless user experience.\n\u2022 Passport’s software and hardware are both fully open source. No walled gardens, no closed source engineering. Connect Passport to their Envoy mobile app for a seamless experience.',
        FAQ: 'https://docs.foundationdevices.com',
      };
    case SignerType.MOBILE_KEY:
      return {
        title: 'Mobile Key',
        subTitle: 'You could use the wallet key on your app as one of the signing keys',
        assert: privateTheme ? <PrivateMy_Keeper /> : <MobileKeyIllustration />,
        description:
          '\u2022To back up the Mobile Key, ensure the Wallet Seed (12 words) is backed up.\n\u2022 You will find this in the settings menu from the top left of the Home Screen.\n\u2022 These keys are considered as hot because they are on your connected device.',
        FAQ: KEEPER_KNOWLEDGEBASE,
      };
    case SignerType.SEED_WORDS:
      return {
        title: 'Seed Key',
        subTitle: 'You could use a newly generated seed (12 words) as one of the signing keys',
        assert: privateTheme ? <PrivateSeedKey /> : <SeedWordsIllustration />,
        description:
          '\u2022 Keep these safe by writing them down on a piece of paper or on a metal plate.\n\u2022 When you use them to sign a transaction, you will have to provide these in the same order.\n\u2022 These keys are considered warm because you may have to get them online when signing a transaction.',
        FAQ: '',
      };
    case SignerType.MY_KEEPER:
    case SignerType.KEEPER:
      return {
        title: `${getSignerNameFromType(type)} as signer`,
        subTitle: 'You can use a specific BIP-85 wallet on Keeper as a signer',
        assert: privateTheme ? <PrivateMy_Keeper /> : <KeeperSetupImage />,
        description:
          '\u2022 Make sure that the other Keeper app is backed up using the 12-word Recovery Phrase.\n\u2022 When you want to sign a transaction using this option, you will have to navigate to the specific wallet used.',
        FAQ: KEEPER_KNOWLEDGEBASE,
      };
    case SignerType.POLICY_SERVER:
      return {
        title: 'Server Key',
        subTitle:
          'The key on the signer will sign a transaction depending on the policy and authentication',
        assert: privateTheme ? <PrivateServerKeyIllustration /> : <SigningServerIllustration />,
        description:
          '\u2022 An auth app provides the 6-digit authentication code.\n\u2022 When restoring the app using signers, you will need to provide this code. \n\u2022 Considered a hot key as it is on a connected online server',
        FAQ: '',
      };
    case SignerType.BITBOX02:
      return {
        title: 'Bitbox 02',
        subTitle: 'Easy backup and restore with a microSD card',
        assert: privateTheme ? <PrivateBitboxImage /> : <BitboxImage />,
        description:
          '\u2022 BitBox02 is known for its ease of use, open-source firmware, and security features like backup recovery via microSD card, USB-C connectivity, and integration with the BitBoxApp.\n\u2022 The wallet prioritizes privacy and security with advanced encryption and verification protocols, making it ideal for users who value high security in managing their bitcoin.',
        FAQ: 'https://shiftcrypto.ch/support/',
      };
    case SignerType.TREZOR:
      return {
        title: 'Trezor',
        subTitle:
          'Trezor Suite is designed for every level of user. Easily and securely send, receive, and manage coins with confidence',
        assert: privateTheme ? <PrivateTrezor /> : <TrezorSetup />,
        description:
          '\u2022Sleek, secure design.\n\u2022 Digital Independence.\n\u2022 Easy hardware wallet backup',
        FAQ: 'https://trezor.io/support',
      };
    case SignerType.JADE:
      return {
        title: 'Jade Blockstream',
        subTitle:
          'Jade is an easy-to-use, purely open-source hardware wallet that offers advanced security for your Bitcoin.',
        assert: privateTheme ? <PrivateJade /> : <JadeSVG />,
        description:
          '\u2022World-class security.\n\u2022 Manage your assets from mobile or desktop.\n\u2022 Camera for fully air-gapped transactions',
        FAQ: 'https://help.blockstream.com/hc/en-us/categories/900000061906-Blockstream-Jade',
      };
    case SignerType.SPECTER:
      return {
        title: 'Specter DIY',
        subTitle:
          'An open-source hardware wallet for users to take full control over their Bitcoin security.',
        assert: privateTheme ? <PrivateSpector /> : <SpecterSetupImage />,
        description:
          '\u2022 Create a trust-minimized signing device, providing a high level of security and privacy for Bitcoin transactions.',
        FAQ: 'https://docs.specter.solutions/diy/faq/',
      };
    default:
      return {
        title: '',
        subTitle: '',
        assert: null,
        description: '',
        FAQ: '',
      };
  }
};

function SigningDeviceDetails({ route }) {
  const { translations } = useContext(LocalizationContext);
  const { signer: signerTranslations, BackupWallet: strings, common } = translations;
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { vaultKey, vaultId, isInheritanceKey, isEmergencyKey, signerId, vaultSigners, isUaiFlow } =
    route.params;
  const { signers } = useSigners();
  const currentSigner =
    signers.find((signer) => getKeyUID(signer) === signerId) ||
    signers.find((signer) => signer.masterFingerprint === signerId);
  const { signerMap } = useSignerMap();
  const signer: Signer = currentSigner || signerMap[getKeyUID(vaultKey)];
  const [detailModal, setDetailModal] = useState(false);
  const [details, setDetails] = useState('');

  const [skipHealthCheckModalVisible, setSkipHealthCheckModalVisible] = useState(false);
  const [visible, setVisible] = useState(isUaiFlow);
  const [identifySignerModal, setIdentifySignerModal] = useState(false);
  const { showToast } = useToastMessage();
  const { activeVault, allVaults } = useVault({ vaultId, includeArchived: false });
  const allUnhiddenVaults = allVaults.filter((vault) => {
    return idx(vault, (_) => _.presentationData.visibility) !== VisibilityType.HIDDEN;
  });
  const { primaryMnemonic, id: appRecoveryKeyId }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const { entityBasedIndicator } = useIndicatorHook({ entityId: signer.masterFingerprint });
  const { typeBasedIndicator } = useIndicatorHook({
    types: [uaiType.RECOVERY_PHRASE_HEALTH_CHECK],
  });
  const [showMobileKeyModal, setShowMobileKeyModal] = useState(false);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [shareKeyModal, setShareKeyModal] = useState(false);
  const [stModal, setStModal] = useState(false);
  const isDarkMode = colorMode === 'dark';
  const data = useQuery(RealmSchema.BackupHistory);
  const signerVaults: Vault[] = [];

  const [nfcVisible, setNfcVisible] = React.useState(false);
  const { session } = useContext(HCESessionContext);
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const privateTheme = themeMode === 'PRIVATE';
  const privateThemeLight = themeMode === 'PRIVATE_LIGHT';

  const cleanUp = () => {
    setNfcVisible(false);
    Vibration.cancel();
    if (isAndroid) {
      NFC.stopTagSession(session);
    }
  };
  useEffect(() => {
    const unsubDisconnect = session.on(HCESession.Events.HCE_STATE_DISCONNECTED, () => {
      cleanUp();
    });
    const unsubConnect = session.on(HCESession.Events.HCE_STATE_WRITE_FULL, () => {
      try {
        const data = idx(session, (_) => _.application.content.content);
        if (!data) {
          showToast('Please scan a valid psbt', <ToastErrorIcon />);
          return;
        }
        signPSBT(data);
      } catch (err) {
        captureError(err);
        showToast('Something went wrong.', <ToastErrorIcon />);
      } finally {
        cleanUp();
      }
    });

    const unsubRead = session.on(HCESession.Events.HCE_STATE_READ, () => {});
    return () => {
      cleanUp();
      unsubRead();
      unsubDisconnect();
      unsubConnect();
    };
  }, [session]);

  useEffect(() => {
    if (isAndroid) {
      if (nfcVisible) {
      } else {
        NFC.stopTagSession(session);
      }
    }
    return () => {
      nfcManager.cancelTechnologyRequest();
    };
  }, [nfcVisible]);

  const isAndroid = Platform.OS === 'android';
  const isIos = Platform.OS === 'ios';

  allUnhiddenVaults.forEach((vault) => {
    const keys = vault.signers;
    for (const key of keys) {
      if (getKeyUID(signer) === getKeyUID(key)) {
        signerVaults.push(vault);
        break;
      }
    }
  });

  if (!signer) {
    return null;
  }
  const fetchKeyExpression = (signer: Signer) => {
    for (const type of [XpubTypes.P2WSH]) {
      if (signer.masterFingerprint && signer.signerXpubs[type] && signer.signerXpubs[type]?.[0]) {
        const keyDescriptor = getKeyExpression(
          signer.masterFingerprint,
          idx(signer, (_) => _.signerXpubs[type][0].derivationPath.replaceAll('h', "'")),
          idx(signer, (_) => _.signerXpubs[type][0].xpub),
          false
        );
        return keyDescriptor;
      }
    }

    throw new Error('Missing key details.');
  };

  useEffect(() => {
    if (!details) {
      setTimeout(() => {
        try {
          const keyDescriptor = fetchKeyExpression(signer);
          setDetails(keyDescriptor);
        } catch (_) {}
      }, 200);
    }
  }, []);

  const { title, subTitle, assert, description } = getSignerContent(signer?.type, privateTheme);
  function SignerContent() {
    return (
      <Box>
        <Center>{assert}</Center>
        <Text color={`${colorMode}.headerWhite`} style={styles.contentDescription}>
          {description}
        </Text>
      </Box>
    );
  }

  function HealthCheckSkipContent() {
    return (
      <Box>
        <Box style={styles.skipHealthIllustration}>
          <SkipHealthCheck />
        </Box>
        <Text>
          You can choose to manually confirm the health of the signer if you are sure that they are
          secure and accessible. Or you can choose to do the Health Check when you can
        </Text>
      </Box>
    );
  }
  const navigateToCosignerDetails = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'CosignerDetails',
        params: { signer },
      })
    );
  };
  const navigateToScanPSBT = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ScanQR',
        params: {
          title: 'Scan Transaction',
          subtitle: 'Please scan until all the QR data has been retrieved',
          onQrScan: signPSBT,
          setup: true,
          type: SignerType.KEEPER,
          isHealthcheck: true,
          signer,
          disableMockFlow: true,
          isPSBT: true,
          importOptions: false,
          isSingning: true,
        },
      })
    );
  };
  function ShareKeyModalData() {
    return (
      <Box>
        <ShareKeyModalContent
          navigation={navigation}
          signer={signer}
          navigateToCosignerDetails={navigateToCosignerDetails}
          setShareKeyModal={setShareKeyModal}
          data={details}
        />
      </Box>
    );
  }
  function StModalContent() {
    return (
      <Box>
        <STModalContent
          navigateToScanPSBT={navigateToScanPSBT}
          setData={signPSBT}
          setStModal={setStModal}
          readFromNFC={readFromNFC}
        />
      </Box>
    );
  }

  const readFromNFC = async () => {
    try {
      if (!isIos) {
        setNfcVisible(true);
        NFC.startTagSession({ session, content: '', writable: true });
      }
      const records = await NFC.read([NfcTech.Ndef]);
      try {
        const psbt = records[0].data;
        signPSBT(psbt);
      } catch (err) {
        captureError(err);
        showToast('Please scan a valid psbt tag', <ToastErrorIcon />);
      }
    } catch (err) {
      cleanUp();
      if (err.toString() === 'Error') {
        console.log('NFC interaction cancelled');
        return;
      }
      captureError(err);
      showToast('Something went wrong.', <ToastErrorIcon />);
    }
  };

  function MobileKeyModalContent() {
    return (
      <Box>
        <Box style={styles.mobileKeyIllustration}>
          <MobileKeyModalIllustration />
        </Box>
        <Text style={styles.mobileKeyText}>{signerTranslations.MKHealthCheckModalDesc}</Text>
      </Box>
    );
  }

  const navigateToAssignSigner = () => {
    dispatch(resetSignersUpdateState());
    navigation.dispatch(
      CommonActions.navigate({
        name: 'AssignSignerType',
        params: {
          parentNavigation: navigation,
          vault: activeVault,
          signer,
        },
      })
    );
  };

  const signPSBT = async (serializedPSBT) => {
    try {
      let { senderAddresses, receiverAddresses, fees, signerMatched, feeRate, changeAddressIndex } =
        generateDataFromPSBT(serializedPSBT, signer);
      let isMiniscript = false;
      try {
        const psbt = Psbt.fromBase64(serializedPSBT);
        // Check script ASM for Miniscript-specific patterns
        const miniscriptPatterns = ['OP_CHECKLOCKTIMEVERIFY', 'OP_CHECKSEQUENCEVERIFY'];

        psbt.data.inputs.forEach((input) => {
          if (input.witnessUtxo?.script) {
            const witnessScript = script.decompile(input.witnessScript);
            // Convert to ASM format to check opcodes
            const asm = script.toASM(witnessScript);
            isMiniscript = miniscriptPatterns.some((pattern) => asm.includes(pattern));
          }
        });
      } catch (error) {
        console.log('Error checking if miniscript:', error);
      }

      if (!signerMatched) {
        showToast('Current signer is not available in the PSBT', <ToastErrorIcon />);
        navigation.goBack();
        return;
      }
      const activeVault = findVaultFromSenderAddress(allVaults, senderAddresses);
      if (SignersReqVault.includes(signer.type)) {
        if (!activeVault) {
          navigation.goBack();
          throw new Error('Please import the vault before signing');
        }
        const psbtWithGlobalXpub = await getPsbtForHwi(serializedPSBT, activeVault);
        serializedPSBT = psbtWithGlobalXpub.serializedPSBT;
      }
      if (activeVault && changeAddressIndex) {
        receiverAddresses = findChangeFromReceiverAddresses(
          activeVault,
          receiverAddresses,
          parseInt(changeAddressIndex)
        );
      }
      if (activeVault) {
        isMiniscript = !!activeVault?.scheme?.miniscriptScheme;
      }
      if (signer.type === SignerType.BITBOX02) {
        // Update PSBT inputs to use SELECTED_MINISCRIPT_BIP32_DERIVATIONS if they exist
        // This is needed for Miniscript since the BitBox02 only produces one signature,
        // but the Ledger and Coldcard require to pass all bip32 derivations to sign,
        // so the BitBox02 will only produce signature for one of these and we can't control
        // if it's the correct one or not
        const psbt = Psbt.fromBase64(serializedPSBT);
        psbt.data.inputs.map((input) => {
          if (input.unknownKeyVals) {
            const newBip32Derivations = input.unknownKeyVals.find(
              (keyVal) => keyVal.key.toString() === 'SELECTED_MINISCRIPT_BIP32_DERIVATIONS'
            );
            if (newBip32Derivations) {
              const parsed = JSON.parse(Buffer.from(newBip32Derivations.value).toString());

              // PSBT expects bip32Derivation to be an array of:
              // { masterFingerprint: Buffer, pubkey: Buffer, path: string }
              input.bip32Derivation = parsed.map((deriv) => ({
                masterFingerprint: Buffer.from(deriv.masterFingerprint.data),
                pubkey: Buffer.from(deriv.pubkey.data),
                path: deriv.path,
              }));
            }
          }
        });
        serializedPSBT = psbt.toBase64();
      }

      navigation.dispatch(
        StackActions.replace('PSBTSendConfirmation', {
          sender: senderAddresses,
          recipient: receiverAddresses,
          fees,
          signer,
          psbt: serializedPSBT,
          feeRate,
          isMiniscript,
          activeVault,
        })
      );
    } catch (error) {
      console.log('🚀 ~ signPSBT ~ error:', error);
      showToast(error.message);
      captureError(error);
    }
  };

  function FooterIcon({ Icon, showDot = false }) {
    return (
      <Box justifyContent="center" alignItems="center" position="relative">
        <Icon />
        {showDot && <Box style={styles.redDot} />}
      </Box>
    );
  }

  const navigateToSettings = () => {
    navigation.dispatch(
      CommonActions.navigate('SignerAdvanceSettings', {
        signer,
        vaultKey,
        vaultId,
        isMultisig: activeVault?.isMultiSig,
        signerId,
      })
    );
  };

  const getWalletIcon = (wallet) => {
    if (wallet.entityKind === EntityKind.VAULT) {
      if (wallet.type === VaultType.SINGE_SIG) return <WalletIcon />;
      else return wallet.type === VaultType.COLLABORATIVE ? <CollaborativeIcon /> : <VaultIcon />;
    } else {
      return <WalletIcon />;
    }
  };

  const identifySigner = signer.type === SignerType.OTHER_SD;
  const signerFooterItems = [
    signer?.type !== SignerType.POLICY_SERVER &&
      details && {
        text: 'Share Key',
        Icon: () => <FooterIcon Icon={() => <ThemedSvg name={'share_key'} />} />,
        onPress: () => {
          setShareKeyModal(true);
        },
      },
    signer?.type !== SignerType.KEEPER &&
      signer?.type !== SignerType.POLICY_SERVER &&
      signer?.type !== SignerType.UNKOWN_SIGNER &&
      details && {
        text: 'Sign Transaction',
        Icon: () => <FooterIcon Icon={() => <ThemedSvg name={'sign_transaction'} />} />,
        // onPress: navigateToScanPSBT,
        onPress: () => {
          setStModal(true);
        },
      },
    signer?.type === SignerType.UNKOWN_SIGNER && {
      text: 'Set Device Type',
      Icon: () => <FooterIcon Icon={isDarkMode ? ChangeKeyDark : ChangeKeyLight} />,
      onPress: navigateToAssignSigner,
    },
    signer?.type !== SignerType.MY_KEEPER && {
      text: 'Health Check',
      Icon: () => (
        <FooterIcon
          Icon={() => <ThemedSvg name="health_check" />}
          showDot={
            (signer.type !== SignerType.MY_KEEPER &&
              entityBasedIndicator?.[signer.masterFingerprint]?.[
                uaiType.SIGNING_DEVICES_HEALTH_CHECK
              ]) ||
            (signer.type === SignerType.MY_KEEPER &&
              typeBasedIndicator?.[uaiType.RECOVERY_PHRASE_HEALTH_CHECK]?.[appRecoveryKeyId])
          }
        />
      ),
      onPress: () => {
        if (signer.type === SignerType.UNKOWN_SIGNER) {
          navigation.dispatch(
            CommonActions.navigate({
              name: 'AssignSignerType',
              params: {
                parentNavigation: navigation,
                vault: activeVault,
                signer,
              },
            })
          );
        } else if (signer.type === SignerType.MY_KEEPER) {
          setShowMobileKeyModal(true);
        } else {
          setVisible(true);
        }
      },
    },
  ].filter(Boolean);

  const vaultSignerFooterItems = [
    ...(signer.type !== SignerType.MY_KEEPER
      ? [
          {
            text: 'Health Check',
            Icon: () => (
              <FooterIcon
                Icon={isDarkMode ? HealthCheckDark : HealthCheckLight}
                showDot={
                  entityBasedIndicator?.[signer.masterFingerprint]?.[
                    uaiType.SIGNING_DEVICES_HEALTH_CHECK
                  ]
                }
              />
            ),
            onPress: () => {
              if (signer.type === SignerType.UNKOWN_SIGNER) {
                navigation.dispatch(
                  CommonActions.navigate({
                    name: 'AssignSignerType',
                    params: {
                      parentNavigation: navigation,
                      vault: activeVault,
                      signer,
                    },
                  })
                );
              } else if (signer.type === SignerType.MY_KEEPER) {
                setShowMobileKeyModal(true);
              } else {
                setVisible(true);
              }
            },
          },
        ]
      : []),
    ...(activeVault &&
    ((!isInheritanceKey && !isEmergencyKey) ||
      !activeVault.scheme?.miniscriptScheme?.usedMiniscriptTypes?.length ||
      activeVault.scheme?.miniscriptScheme?.usedMiniscriptTypes?.length < 2)
      ? [
          {
            text: 'Change Key',
            Icon: () => <FooterIcon Icon={isDarkMode ? ChangeKeyDark : ChangeKeyLight} />,
            onPress: isEmergencyKey
              ? () =>
                  navigation.dispatch(
                    CommonActions.navigate('AddEmergencyKey', {
                      vaultId,
                      name: activeVault.presentationData.name,
                      description: activeVault.presentationData.description,
                      scheme: activeVault.scheme,
                      isAddEmergencyKey: true,
                      currentBlockHeight: null,
                      keyToRotate: signer,
                    })
                  )
              : isInheritanceKey
              ? () =>
                  navigation.dispatch(
                    CommonActions.navigate('AddReserveKey', {
                      vaultId,
                      name: activeVault.presentationData.name,
                      description: activeVault.presentationData.description,
                      scheme: activeVault.scheme,
                      isAddInheritanceKey: true,
                      currentBlockHeight: null,
                      keyToRotate: signer,
                    })
                  )
              : () =>
                  navigation.dispatch(
                    CommonActions.navigate({
                      name: 'AddSigningDevice',
                      merge: true,
                      params: {
                        vaultId,
                        name: activeVault.presentationData.name,
                        description: activeVault.presentationData.description,
                        scheme: activeVault.scheme,
                        keyToRotate: vaultKey,
                      },
                    })
                  ),
          },
        ]
      : []),
    {
      text: 'Settings',
      Icon: () => <FooterIcon Icon={isDarkMode ? SettingIcon : SettingIconLight} />,
      onPress: navigateToSettings,
    },
  ];

  const footerItems = !vaultKey ? signerFooterItems : vaultSignerFooterItems;

  return (
    <Box
      safeAreaTop
      backgroundColor={privateTheme ? `${colorMode}.charcolBrown` : `${colorMode}.pantoneGreen`}
      style={[styles.wrapper]}
    >
      <Box style={styles.topSection}>
        <KeeperHeader
          contrastScreen
          learnMore={signer.type !== SignerType.UNKOWN_SIGNER}
          learnMorePressed={() => setDetailModal(true)}
          learnBackgroundColor={
            privateTheme ? `${colorMode}.charcolBrown` : `${colorMode}.pantoneGreen`
          }
          learnTextColor={`${colorMode}.buttonText`}
          mediumTitle
          title={signer?.signerName === 'Signing Server' ? 'Server Key' : signer?.signerName}
          titleColor={`${colorMode}.headerWhite`}
          subTitleColor={`${colorMode}.headerWhite`}
          subtitle={getSignerDescription(signer)}
          icon={
            <CircleIconWrapper
              backgroundColor={
                privateTheme
                  ? `${colorMode}.pantoneGreen`
                  : colorMode === 'dark'
                  ? `${colorMode}.primaryBackground`
                  : `${colorMode}.thirdBackground`
              }
              icon={
                SDIcons({ type: signer.type, light: colorMode === 'dark', width: 26, height: 26 })
                  .Icon
              }
              // icon={SDIcons({ type: signer.type }).Icon}
              image={getPersistedDocument(signer?.extraData?.thumbnailPath)}
            />
          }
          topRightComponent={
            !vaultKey ? (
              <TouchableOpacity
                style={styles.settingIcon}
                onPress={navigateToSettings}
                testID="btn_manage_singner_setting"
              >
                <SettingIcon />
              </TouchableOpacity>
            ) : null
          }
        />
      </Box>
      <Box style={styles.bottomSection} backgroundColor={`${colorMode}.primaryBackground`}>
        <Box style={styles.paddedArea}>
          <Box style={styles.flex1}>
            <Text style={styles.recentHistoryText} color={`${colorMode}.secondaryText`} medium>
              {`Key used in ${signerVaults.length} wallet${signerVaults.length > 1 ? 's' : ''}`}
            </Text>
            {signerVaults.length > 0 ? (
              <ScrollView
                horizontal
                contentContainerStyle={styles.signerVaults}
                showsHorizontalScrollIndicator={false}
              >
                {signerVaults.map((vault) => (
                  <SignerCard
                    key={vault?.id}
                    name={vault?.presentationData.name}
                    description={vault?.presentationData?.description}
                    icon={
                      <HexagonIcon
                        width={38}
                        height={34}
                        backgroundColor={
                          privateTheme || privateThemeLight
                            ? Colors.goldenGradient
                            : Colors.primaryGreen
                        }
                        icon={getWalletIcon(vault)}
                      />
                    }
                    showSelection={false}
                    colorVarient="transparent"
                    customStyle={styles.signerCard}
                    colorMode={colorMode}
                    borderColor={`${colorMode}.separator`}
                  />
                ))}
              </ScrollView>
            ) : (
              <Box style={{ flex: 1 }}>
                <EmptyActivityView colorMode={colorMode} isDarkMode={isDarkMode} />
              </Box>
            )}
            <Box style={styles.fingerprint}>
              <WalletCopiableData
                title={common.signerFingerPrint}
                data={signer.masterFingerprint}
                dataType="fingerprint"
                width="95%"
                height={62}
              />
            </Box>
            <HardwareModalMap
              type={signer?.type}
              visible={visible}
              close={() => setVisible(false)}
              signer={signer}
              skipHealthCheckCallBack={() => {
                setVisible(false);
                setSkipHealthCheckModalVisible(true);
              }}
              mode={InteracationMode.HEALTH_CHECK}
              isMultisig={activeVault?.isMultiSig || true}
              primaryMnemonic={primaryMnemonic}
              vaultId={vaultId}
              addSignerFlow={false}
              vaultSigners={vaultSigners}
              accountNumber={getAccountFromSigner(signer)}
            />
            <KeeperModal
              visible={skipHealthCheckModalVisible}
              close={() => setSkipHealthCheckModalVisible(false)}
              title="Skipping Health Check"
              subTitle="It is very important that you keep your signers secure and fairly accessible at all times."
              buttonText="Confirm Access"
              secondaryButtonText="Confirm Later"
              buttonTextColor={`${colorMode}.buttonText`}
              buttonCallback={() => {
                dispatch(
                  healthCheckStatusUpdate([
                    {
                      signerId: signer.masterFingerprint,
                      status: hcStatusType.HEALTH_CHECK_MANAUAL,
                    },
                  ])
                );
                showToast('Device verified manually!');
                setSkipHealthCheckModalVisible(false);
              }}
              secondaryCallback={() => {
                dispatch(
                  healthCheckStatusUpdate([
                    {
                      signerId: signer.masterFingerprint,
                      status: hcStatusType.HEALTH_CHECK_SKIPPED,
                    },
                  ])
                );
                showToast('Device health check skipped!');
                setSkipHealthCheckModalVisible(false);
              }}
              textColor={`${colorMode}.textGreen`}
              subTitleColor={`${colorMode}.modalSubtitleBlack`}
              Content={HealthCheckSkipContent}
            />

            <KeeperModal
              visible={detailModal}
              close={() => setDetailModal(false)}
              title={!signer.isBIP85 ? title : `${title} +`}
              subTitle={subTitle}
              modalBackground={
                privateTheme ? `${colorMode}.primaryBackground` : `${colorMode}.pantoneGreen`
              }
              textColor={`${colorMode}.headerWhite`}
              Content={SignerContent}
              subTitleWidth={wp(280)}
              DarkCloseIcon
              buttonText={common.Okay}
              secondaryButtonText={common.needHelp}
              buttonTextColor={`${colorMode}.textGreen`}
              buttonBackground={
                privateTheme ? `${colorMode}.pantoneGreen` : `${colorMode}.modalWhiteButton`
              }
              secButtonTextColor={
                privateTheme ? `${colorMode}.pantoneGreen` : `${colorMode}.modalGreenSecButtonText`
              }
              secondaryIcon={<ConciergeNeedHelp />}
              secondaryCallback={() => {
                setDetailModal(false);
                navigation.dispatch(
                  CommonActions.navigate({
                    name: 'CreateTicket',
                    params: {
                      tags: [ConciergeTag.KEYS],
                      screenName: 'signing-device-details',
                    },
                  })
                );
              }}
              buttonCallback={() => setDetailModal(false)}
            />
            <KeeperModal
              visible={showMobileKeyModal}
              close={() => setShowMobileKeyModal(false)}
              title={signerTranslations.performHealthCheckTitle}
              subTitle={signerTranslations.performHealthCheckSubTitle}
              modalBackground={`${colorMode}.modalWhiteBackground`}
              textColor={`${colorMode}.modalWhiteContent`}
              subTitleWidth={wp(280)}
              buttonText={common.continue}
              buttonCallback={() => {
                if (data.length === 0) {
                  dispatch(credsAuthenticated(false));
                  setConfirmPassVisible(true);
                } else {
                  setShowMobileKeyModal(false);
                  navigation.navigate('WalletBackHistory', { isUaiFlow: true });
                }
              }}
              secondaryButtonText={common.back}
              secondaryCallback={() => setShowMobileKeyModal(false)}
              buttonTextColor={`${colorMode}.buttonText`}
              buttonBackground={`${colorMode}.pantoneGreen`}
              Content={MobileKeyModalContent}
            />
            <KeeperModal
              visible={confirmPassVisible}
              closeOnOverlayClick={false}
              close={() => setConfirmPassVisible(false)}
              title={common.confirmPassCode}
              subTitleWidth={wp(240)}
              subTitle={signerTranslations.RKBackupPassSubTitle}
              modalBackground={`${colorMode}.modalWhiteBackground`}
              textColor={`${colorMode}.textGreen`}
              subTitleColor={`${colorMode}.modalSubtitleBlack`}
              Content={() => (
                <PasscodeVerifyModal
                  useBiometrics
                  close={() => {
                    setConfirmPassVisible(false);
                  }}
                  onSuccess={() => {
                    setShowMobileKeyModal(false);
                    setBackupModalVisible(true);
                  }}
                />
              )}
            />
            <KeeperModal
              visible={shareKeyModal}
              close={() => setShareKeyModal(false)}
              title={'Share Key Details'}
              subTitle={'Choose how you would like to share your key'}
              modalBackground={`${colorMode}.modalWhiteBackground`}
              textColor={`${colorMode}.textGreen`}
              subTitleColor={`${colorMode}.modalSubtitleBlack`}
              Content={ShareKeyModalData}
            />
            <KeeperModal
              visible={stModal}
              close={() => setStModal(false)}
              title={'Scan Transaction'}
              subTitle={'Scan and verify transaction details'}
              modalBackground={`${colorMode}.modalWhiteBackground`}
              textColor={`${colorMode}.textGreen`}
              subTitleColor={`${colorMode}.modalSubtitleBlack`}
              Content={StModalContent}
            />

            <KeeperModal
              visible={backupModalVisible}
              close={() => setBackupModalVisible(false)}
              title={signerTranslations.RKBackupTitle}
              subTitle={signerTranslations.RKBackupSubTitle}
              subTitleWidth={wp(300)}
              modalBackground={`${colorMode}.primaryBackground`}
              subTitleColor={`${colorMode}.secondaryText`}
              textColor={`${colorMode}.modalGreenTitle`}
              showCloseIcon={false}
              buttonText={common.backupNow}
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
            <IdentifySignerModal
              visible={identifySigner && identifySignerModal}
              close={() => setIdentifySignerModal(false)}
              signer={signer}
              secondaryCallback={() => {
                setVisible(true);
              }}
              vaultId={vaultId}
            />
          </Box>
        </Box>
        <Box
          safeAreaBottom
          style={styles.footerWrapper}
          backgroundColor={isDarkMode ? Colors.SecondaryBlack : `${colorMode}.primaryBackground`}
        >
          <KeeperFooter
            marginX={footerItems.length === 2 ? wp(20) : !vaultKey ? 0 : wp(5)}
            wrappedScreen={false}
            items={footerItems}
            fontSize={12}
            backgroundColor={isDarkMode ? Colors.SecondaryBlack : `${colorMode}.primaryBackground`}
          />
          <NfcPrompt visible={nfcVisible} close={cleanUp} ctaText="Done" />
        </Box>
      </Box>
    </Box>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  topSection: {
    height: '25%',
    paddingHorizontal: 20,
    paddingTop: hp(15),
  },
  bottomSection: {
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    flex: 1,
  },
  skipHealthIllustration: {
    marginLeft: wp(25),
  },
  walletHeaderWrapper: {
    margin: wp(15),
    flexDirection: 'row',
    width: '100%',
  },
  walletIconWrapper: {
    width: '15%',
  },
  walletIconView: {
    height: 40,
    width: 40,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletDescText: {
    fontSize: 14,
  },
  walletNameWrapper: {
    width: '85%',
    marginLeft: 10,
  },
  walletNameText: {
    fontSize: 20,
  },
  recentHistoryText: {
    fontSize: 16,
    paddingTop: hp(43),
    paddingBottom: hp(10),
    paddingHorizontal: wp(10),
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 10 / 2,
    backgroundColor: 'red',
    position: 'absolute',
    top: 0,
    right: -10,
    borderWidth: 1,
    borderColor: 'white',
  },
  contentDescription: {
    fontSize: 14,
    marginTop: hp(25),
  },
  circleIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex1: {
    flexGrow: 1,
  },
  healthCheckContainer: {
    marginHorizontal: wp(15),
  },
  mobileKeyIllustration: {
    alignSelf: 'center',
    marginBottom: hp(20),
  },
  mobileKeyText: {
    width: wp(280),
    marginBottom: hp(20),
  },
  healthCheckListContainer: {
    height: hp(520),
  },
  itemBox: {
    padding: 4,
    marginLeft: 10,
    borderLeftWidth: 1,
    width: '100%',
    position: 'relative',
  },
  dotContainer: {
    zIndex: 999,
    position: 'absolute',
    left: -8,
    padding: 4,
    borderRadius: 15,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 20,
    opacity: 0.7,
  },
  date: {
    fontSize: 11,
    marginLeft: 20,
    opacity: 0.7,
  },
  noteWrapper: {
    marginHorizontal: '5%',
  },
  healthCheckList: {
    flexGrow: 1,
    paddingBottom: hp(220),
  },
  emptyWrapper: {
    marginTop: hp(15),
    alignItems: 'center',
    justifyContent: 'center',
    height: '90%',
  },
  emptyStateContainer: {
    marginLeft: wp(20),
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: hp(3),
  },
  emptySubText: {
    fontSize: 14,
    lineHeight: 20,
    width: wp(250),
    textAlign: 'center',
    marginBottom: hp(30),
  },
  signerVaults: {
    gap: 5,
  },
  signerCard: {
    borderWidth: 1,
    borderColor: Colors.secondaryLightGrey,
    height: 125,
    width: wp(105),
    paddingTop: 5,
    paddingLeft: 14,
  },
  fingerprint: {
    alignItems: 'center',
  },
  paddedArea: {
    flexGrow: 1,
    paddingHorizontal: '5%',
  },
  footerWrapper: {
    justifyContent: 'center',
  },
  settingIcon: {
    width: wp(40),
    height: wp(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SigningDeviceDetails;
