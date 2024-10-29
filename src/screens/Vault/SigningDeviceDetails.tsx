import React, { useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Box, Center, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
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
import ChangeIcon from 'src/assets/images/change-green.svg';
import ChangeDarkIcon from 'src/assets/images/change.svg';
import HealthCheckIcon from 'src/assets/images/health-check-green.svg';
import HealthCheckDarkIcon from 'src/assets/images/health-check-white.svg';
import KeyDetailsIcon from 'src/assets/images/key-green.svg';
import KeyDetailsDarkIcon from 'src/assets/images/key-white.svg';
import SkipHealthCheck from 'src/assets/images/skipHealthCheck.svg';
import MobileKeyModalIllustration from 'src/assets/images/mobile-key-illustration.svg';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import ColdCardSetupImage from 'src/assets/images/ColdCardSetup.svg';
import MobileKeyIllustration from 'src/assets/images/mobileKey_illustration.svg';
import SeedWordsIllustration from 'src/assets/images/illustration_seed_words.svg';
import KeeperSetupImage from 'src/assets/images/illustration_ksd.svg';
import SigningServerIllustration from 'src/assets/images/signingServer_illustration.svg';
import BitboxImage from 'src/assets/images/bitboxSetup.svg';
import TrezorSetup from 'src/assets/images/trezor_setup.svg';
import JadeSVG from 'src/assets/images/illustration_jade.svg';
import SpecterSetupImage from 'src/assets/images/illustration_spectre.svg';
import InhertanceKeyIcon from 'src/assets/images/inheritance-key-illustration.svg';
import EmptyState from 'src/assets/images/key-empty-state-illustration.svg';
import { SignerType } from 'src/services/wallets/enums';
import { healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import useVault from 'src/hooks/useVault';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { KEEPER_KNOWLEDGEBASE } from 'src/utils/service-utilities/config';
import moment from 'moment';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import useSignerMap from 'src/hooks/useSignerMap';
import useSigners from 'src/hooks/useSigners';
import SettingIcon from 'src/assets/images/settings-gear.svg';
import SigningDeviceChecklist from './SigningDeviceChecklist';
import HardwareModalMap, { InteracationMode } from './HardwareModalMap';
import IdentifySignerModal from './components/IdentifySignerModal';
import { SDColoredIcons } from './SigningDeviceIcons';
import { getSignerDescription, getSignerNameFromType } from 'src/hardware';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useIndicatorHook } from 'src/hooks/useIndicatorHook';
import { uaiType } from 'src/models/interfaces/Uai';
import { goToConcierge } from 'src/store/sagaActions/concierge';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import { useAppSelector } from 'src/store/hooks';
import { resetKeyHealthState } from 'src/store/reducers/vaults';
import TickIcon from 'src/assets/images/tick_icon.svg';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import { Signer } from 'src/services/wallets/interfaces/vault';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import BackupModalContent from 'src/screens/AppSettings/BackupModal';
import Note from 'src/components/Note/Note';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackupHistoryItem } from 'src/models/enums/BHR';

const getSignerContent = (type: SignerType) => {
  switch (type) {
    case SignerType.COLDCARD:
      return {
        title: 'Coldcard',
        subTitle:
          'Coldcard is an easy-to-use, ultra-secure, open-source, and affordable hardware wallet that is easy to back up via an encrypted microSD card. Your private key is stored in a dedicated security chip.',
        assert: <ColdCardSetupImage />,
        description:
          '\u2022 Coldcard provides the best physical security.\n\u2022 All of the Coldcard is viewable, editable, and verifiable. You can compile it yourself.',
        FAQ: 'https://coldcard.com/docs/faq',
      };
    case SignerType.TAPSIGNER:
      return {
        title: 'TAPSIGNER',
        subTitle:
          'TAPSIGNER is a Bitcoin private key on a card! You can sign mobile wallet transaction by tapping the phone.',
        assert: <TapsignerSetupImage />,
        description:
          '\u2022 TAPSIGNER’s lower cost makes hardware wallet features and security available to a wider market around the world.\n\u2022 An NFC card provides fast and easy user experiences.\n\u2022 TAPSIGNER is a great way to keep your keys separate from your wallet(s). \n\u2022 The card form factor makes it easy to carry and easy to conceal.',
        FAQ: 'https://tapsigner.com/faq',
      };
    case SignerType.LEDGER:
      return {
        title: 'LEDGER',
        subTitle:
          'Ledger has industry-leading security to keep your Bitcoin secure at all times. Buy, sell, exchange, and grow your assets with our partners easily and securely. With Ledger, you can secure, store and manage your Bitcoin.',
        assert: <Ledger />,
        description: '',
        FAQ: 'https://support.ledger.com/hc/en-us/categories/4404369571601?support=true',
      };
    case SignerType.SEEDSIGNER:
      return {
        title: 'SeedSigner',
        subTitle:
          'The goal of SeedSigner is to lower the cost and complexity of Bitcoin multi-signature wallet use. To accomplish this goal, SeedSigner offers anyone the opportunity to build a verifiably air-gapped, stateless Bitcoin signer using inexpensive, publicly available hardware components (usually < $50).',
        assert: <SeedSigner />,
        description:
          '\u2022 SeedSigner helps users save with Bitcoin by assisting with trustless private key generation and multi-signature wallet setup. \n\u2022 It also help users transact with Bitcoin via a secure, air-gapped QR-exchange signing model.',
        FAQ: 'https://seedsigner.com/faqs/',
      };
    case SignerType.KEYSTONE:
      return {
        title: 'Keystone',
        subTitle:
          'It offers a convenient cold storage solution with open source firmware, a 4-inch touchscreen, and multi-key support. Protect your bitcoin with the right balance between a secure and convenient hardware wallet with mobile phone support.',
        assert: <Keystone />,
        description:
          "\u2022 With QR codes, you can verify all data transmission to ensure that information coming into Keystone contains no trojans or viruses, while information going out doesn't leak private keys or any other sensitive information.",
        FAQ: 'https://support.keyst.one/miscellaneous/faq',
      };
    case SignerType.PASSPORT:
      return {
        title: 'Foundation Passport',
        subTitle:
          'Foundation products empower individuals to reclaim their digital sovereignty by taking control of your money and data. Foundation offers best-in-class security and privacy via openness. No walled gardens; no closed source engineering',
        assert: <PassportSVG />,
        description:
          '\u2022 Passport has no direct connection with the outside world – meaning your keys are never directly exposed online. It uses a camera and QR codes for communication. This provides hardcore, air-gapped security while offering a seamless user experience.\n\u2022 Passport’s software and hardware are both fully open source. No walled gardens, no closed source engineering. Connect Passport to their Envoy mobile app for a seamless experience.',
        FAQ: 'https://docs.foundationdevices.com',
      };
    case SignerType.MOBILE_KEY:
      return {
        title: 'Mobile Key',
        subTitle: 'You could use the wallet key on your app as one of the signing keys',
        assert: <MobileKeyIllustration />,
        description:
          '\u2022To back up the Mobile Key, ensure the Wallet Seed (12 words) is backed up.\n\u2022 You will find this in the settings menu from the top left of the Home Screen.\n\u2022 These keys are considered as hot because they are on your connected device.',
        FAQ: KEEPER_KNOWLEDGEBASE,
      };
    case SignerType.SEED_WORDS:
      return {
        title: 'Seed Key',
        subTitle: 'You could use a newly generated seed (12 words) as one of the signing keys',
        assert: <SeedWordsIllustration />,
        description:
          '\u2022 Keep these safe by writing them down on a piece of paper or on a metal plate.\n\u2022 When you use them to sign a transaction, you will have to provide these in the same order.\n\u2022 These keys are considered warm because you may have to get them online when signing a transaction.',
        FAQ: '',
      };
    case SignerType.MY_KEEPER:
    case SignerType.KEEPER:
      return {
        title: `${getSignerNameFromType(type)} as signer`,
        subTitle: 'You can use a specific BIP-85 wallet on Keeper as a signer',
        assert: <KeeperSetupImage />,
        description:
          '\u2022 Make sure that the other Keeper app is backed up using the 12-word Recovery Phrase.\n\u2022 When you want to sign a transaction using this option, you will have to navigate to the specific wallet used.',
        FAQ: KEEPER_KNOWLEDGEBASE,
      };
    case SignerType.POLICY_SERVER:
      return {
        title: 'Signing Server',
        subTitle:
          'The key on the signer will sign a transaction depending on the policy and authentication',
        assert: <SigningServerIllustration />,
        description:
          '\u2022 An auth app provides the 6-digit authentication code.\n\u2022 When restoring the app using signers, you will need to provide this code. \n\u2022 Considered a hot key as it is on a connected online server',
        FAQ: '',
      };
    case SignerType.BITBOX02:
      return {
        title: 'Bitbox 02',
        subTitle: 'Easy backup and restore with a microSD card',
        assert: <BitboxImage />,
        description:
          '\u2022 BitBox02 is known for its ease of use, open-source firmware, and security features like backup recovery via microSD card, USB-C connectivity, and integration with the BitBoxApp.\n\u2022 The wallet prioritizes privacy and security with advanced encryption and verification protocols, making it ideal for users who value high security in managing their bitcoin.',
        FAQ: 'https://shiftcrypto.ch/support/',
      };
    case SignerType.TREZOR:
      return {
        title: 'Trezor',
        subTitle:
          'Trezor Suite is designed for every level of user. Easily and securely send, receive, and manage coins with confidence',
        assert: <TrezorSetup />,
        description:
          '\u2022Sleek, secure design.\n\u2022 Digital Independence.\n\u2022 Easy hardware wallet backup',
        FAQ: 'https://trezor.io/support',
      };
    case SignerType.JADE:
      return {
        title: 'Jade Blockstream',
        subTitle:
          'Jade is an easy-to-use, purely open-source hardware wallet that offers advanced security for your Bitcoin.',
        assert: <JadeSVG />,
        description:
          '\u2022World-class security.\n\u2022 Manage your assets from mobile or desktop.\n\u2022 Camera for fully air-gapped transactions',
        FAQ: 'https://help.blockstream.com/hc/en-us/categories/900000061906-Blockstream-Jade',
      };
    case SignerType.INHERITANCEKEY:
      return {
        title: 'Inheritance Key',
        subTitle:
          'An additional key setup with special conditions to help transfer bitcoin to the beneficiary.',
        assert: <InhertanceKeyIcon />,
        description:
          '\u2022 Prepare for the future by using a 3-of-6 multisig setup with one key being an Inheritance Key.\n\u2022 Ensure a seamless transfer of assets while maintaining control over your financial legacy.',
        FAQ: `${KEEPER_KNOWLEDGEBASE}sections/17238611956253-Inheritance`,
      };
    case SignerType.SPECTER:
      return {
        title: 'Specter DIY',
        subTitle:
          'An open-source hardware wallet for users to take full control over their Bitcoin security.',
        assert: <SpecterSetupImage />,
        description:
          '\u2022 Create a trust-minimized signing device, providing a high level of security and privacy for Bitcoin transactions.',
        FAQ: `https://docs.specter.solutions/diy/faq/`,
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
  const { vaultKey, vaultId, signerId, vaultSigners, isUaiFlow } = route.params;
  const { signers } = useSigners();
  const currentSigner = signers.find((signer) => signer.masterFingerprint === signerId);
  const { signerMap } = useSignerMap();
  const signer: Signer = currentSigner || signerMap[vaultKey.masterFingerprint];
  const [detailModal, setDetailModal] = useState(false);
  const [skipHealthCheckModalVisible, setSkipHealthCheckModalVisible] = useState(false);
  const [visible, setVisible] = useState(isUaiFlow);
  const [identifySignerModal, setIdentifySignerModal] = useState(false);
  const { showToast } = useToastMessage();
  const { activeVault } = useVault({ vaultId });
  const { primaryMnemonic }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const { keyHeathCheckSuccess, keyHeathCheckError } = useAppSelector((state) => state.vault);
  const { entityBasedIndicator } = useIndicatorHook({ entityId: signerId });
  const [healthCheckArray, setHealthCheckArray] = useState([]);
  const [showMobileKeyModal, setShowMobileKeyModal] = useState(false);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const data = useQuery(RealmSchema.BackupHistory);
  const history: BackupHistoryItem[] = useMemo(() => data.sorted('date', true), [data]);
  const { top } = useSafeAreaInsets();

  useEffect(() => {
    return () => {
      dispatch(resetKeyHealthState());
    };
  }, []);

  useEffect(() => {
    if (keyHeathCheckError) {
      showToast(keyHeathCheckError);
    }
    if (keyHeathCheckSuccess) {
      showToast('Key restored successfully', <TickIcon />);
    }
  }, [keyHeathCheckSuccess, keyHeathCheckError]);

  useEffect(() => {
    if (signer) {
      setHealthCheckArray(signer.healthCheckDetails);
      setShowLoader(false);
    }
  }, [signer.healthCheckDetails.length]);

  if (!signer) {
    return null;
  }

  const navigateToSettings = () => {
    navigation.dispatch(
      CommonActions.navigate('SignerAdvanceSettings', { signer, vaultKey, vaultId, signerId })
    );
  };

  const { title, subTitle, assert, description, FAQ } = getSignerContent(signer?.type);
  function SignerContent() {
    return (
      <Box>
        <Center>{assert}</Center>
        <Text color={`${colorMode}.modalGreenContent`} style={styles.contentDescription}>
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

  const EmptyHistoryView = ({ colorMode }) => (
    <Box style={styles.emptyWrapper}>
      <Text color={`${colorMode}.primaryText`} style={styles.emptyText} semiBold>
        {'Key History'}
      </Text>
      <Text color={`${colorMode}.secondaryText`} style={styles.emptySubText}>
        {'The history of your key health checks would be visible here.'}
      </Text>
      <Box style={styles.emptyStateContainer}>
        <EmptyState />
      </Box>
    </Box>
  );

  function MenuItem({ Icon, text, onPress }) {
    return (
      <TouchableOpacity activeOpacity={0.6} onPress={onPress} testID={`btn${text}`}>
        <Box style={styles.menuItemContainer}>
          <Box style={styles.menuItemIcon}>
            <Icon />
          </Box>
          <Text color={`${colorMode}.secondaryText`} medium>
            {text}
          </Text>
        </Box>
      </TouchableOpacity>
    );
  }

  function MenuBar({ menuItems }) {
    return (
      <Box
        style={styles.menuBarContainer}
        backgroundColor={`${colorMode}.secondaryBackground`}
        borderColor={`${colorMode}.border`}
      >
        {menuItems.map((item, index) => (
          <MenuItem key={index} Icon={item.Icon} text={item.text} onPress={item.onPress} />
        ))}
      </Box>
    );
  }

  function FooterIcon({ Icon, showDot = false }) {
    return (
      <Box justifyContent="center" alignItems="center">
        <Icon />
        {showDot && <Box style={styles.redDot} />}
      </Box>
    );
  }

  const identifySigner = signer.type === SignerType.OTHER_SD;

  const menuItems = [
    {
      text: 'Key Details',
      Icon: () => <FooterIcon Icon={colorMode === 'dark' ? KeyDetailsDarkIcon : KeyDetailsIcon} />,
      onPress: () => {
        navigation.dispatch(
          CommonActions.navigate('SignerAdvanceSettings', { signer, vaultKey, vaultId, signerId })
        );
      },
    },
    {
      text: 'Health Check',
      Icon: () => (
        <FooterIcon
          Icon={colorMode === 'dark' ? HealthCheckDarkIcon : HealthCheckIcon}
          showDot={entityBasedIndicator?.[signerId]?.[uaiType.SIGNING_DEVICES_HEALTH_CHECK]}
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
  ];

  if (vaultKey) {
    menuItems.push({
      text: 'Change Key',
      Icon: () => <FooterIcon Icon={colorMode === 'dark' ? ChangeDarkIcon : ChangeIcon} />,
      onPress: () =>
        navigation.dispatch(
          CommonActions.navigate({
            name: 'AddSigningDevice',
            merge: true,
            params: { vaultId, scheme: activeVault.scheme, keyToRotate: vaultKey },
          })
        ),
    });
  }

  return (
    <Box
      backgroundColor={`${colorMode}.pantoneGreen`}
      style={[styles.wrapper, { paddingTop: top }]}
    >
      <Box style={styles.topSection}>
        <KeeperHeader
          learnMore={signer.type !== SignerType.UNKOWN_SIGNER}
          learnMorePressed={() => setDetailModal(true)}
          learnBackgroundColor={`${colorMode}.pantoneGreen`}
          learnTextColor={`${colorMode}.modalGreenContent`}
          title={
            !signer.isBIP85
              ? getSignerNameFromType(signer.type, signer.isMock, false)
              : `${getSignerNameFromType(signer.type, signer.isMock, false) + ' +'}`
          }
          titleColor={`${colorMode}.modalGreenContent`}
          subTitleColor={`${colorMode}.modalGreenContent`}
          contrastScreen={true}
          subtitle={getSignerDescription(signer)}
          icon={
            <CircleIconWrapper
              backgroundColor={`${colorMode}.whiteCircle`}
              icon={SDColoredIcons(signer.type, colorMode === 'light', 26, 26).Icon}
            />
          }
          rightComponent={
            <TouchableOpacity onPress={navigateToSettings} testID="btn_manage_singner_setting">
              <SettingIcon />
            </TouchableOpacity>
          }
        />
      </Box>
      <Box style={styles.bottomSection} backgroundColor={`${colorMode}.primaryBackground`}>
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          <Text style={styles.recentHistoryText}>Recent History</Text>
          <ScrollView contentContainerStyle={styles.flex1} showsVerticalScrollIndicator={false}>
            <Box style={styles.healthCheckContainer}>
              {showLoader ? (
                <ActivityIndicatorView visible={showLoader} showLoader />
              ) : healthCheckArray.length === 0 ? (
                <EmptyHistoryView colorMode={colorMode} />
              ) : currentSigner.type !== SignerType.MY_KEEPER ? (
                healthCheckArray.map((item, index) => (
                  <SigningDeviceChecklist
                    status={item.type}
                    key={index.toString()}
                    date={item.actionDate}
                  />
                ))
              ) : (
                history.map((item, index) => (
                  <SigningDeviceChecklist
                    status={item?.title}
                    key={index.toString()}
                    date={moment.unix(item?.date).toDate()}
                  />
                ))
              )}
            </Box>
          </ScrollView>
          {currentSigner.type === SignerType.MY_KEEPER && (
            <Box style={styles.noteWrapper}>
              <Note
                title={common.note}
                subtitle={signerTranslations.MKHealthCheckNote}
                subtitleColor="GreyText"
              />
            </Box>
          )}
          <Box style={styles.menuWrapper}>
            <MenuBar menuItems={menuItems} />
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
            textColor={`${colorMode}.primaryText`}
            Content={HealthCheckSkipContent}
          />

          <KeeperModal
            visible={detailModal}
            close={() => setDetailModal(false)}
            title={!signer.isBIP85 ? title : title + ' +'}
            subTitle={subTitle}
            modalBackground={`${colorMode}.modalGreenBackground`}
            textColor={`${colorMode}.modalGreenContent`}
            Content={SignerContent}
            subTitleWidth={wp(280)}
            DarkCloseIcon
            buttonText={common.Okay}
            secondaryButtonText={common.needHelp}
            buttonTextColor={`${colorMode}.modalWhiteButtonText`}
            buttonBackground={`${colorMode}.modalWhiteButton`}
            secButtonTextColor={`${colorMode}.modalGreenSecButtonText`}
            secondaryCallback={() => {
              setDetailModal(false);
              dispatch(goToConcierge([ConciergeTag.KEYS], 'signing-device-details'));
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
                setConfirmPassVisible(true);
              } else {
                setShowMobileKeyModal(false);
                navigation.navigate('WalletBackHistory', { isUaiFlow: true });
              }
            }}
            secondaryButtonText={common.back}
            secondaryCallback={() => setShowMobileKeyModal(false)}
            buttonTextColor={`${colorMode}.buttonText`}
            buttonBackground={`${colorMode}.greenButtonBackground`}
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
            subTitleColor={`${colorMode}.secondaryText`}
            textColor={`${colorMode}.primaryText`}
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
          <ActivityIndicatorView visible={showLoader} showLoader />
        </SafeAreaView>
      </Box>
    </Box>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  topSection: {
    height: '27%',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  bottomSection: {
    paddingHorizontal: '5%',
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
    paddingHorizontal: '4%',
    paddingTop: '24%',
    paddingBottom: '6%',
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 10 / 2,
    backgroundColor: 'red',
    position: 'absolute',
    top: 0,
    left: '25%',
    borderWidth: 1,
    borderColor: 'white',
  },
  contentDescription: {
    fontSize: 13,
    letterSpacing: 0.65,
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
  safeArea: {
    flex: 1,
  },
  healthCheckContainer: {
    marginHorizontal: wp(10),
  },
  mobileKeyIllustration: {
    alignSelf: 'center',
    marginBottom: hp(20),
  },
  mobileKeyText: {
    width: wp(280),
    marginBottom: hp(20),
  },
  dotContainer: {
    zIndex: 999,
    position: 'absolute',
    left: -8,
    padding: 4,
    borderRadius: 15,
  },
  noteWrapper: {
    marginHorizontal: '5%',
  },
  healthCheckList: {
    flexGrow: 1,
    paddingBottom: hp(220),
  },
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '90%',
  },
  emptyStateContainer: {
    marginLeft: wp(20),
  },
  emptyText: {
    fontSize: 15,
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
  menuWrapper: {
    width: '100%',
    position: 'absolute',
    alignSelf: 'center',
    top: '-8%',
    left: '2.5%',
  },
  menuBarContainer: {
    width: '95%',
    height: hp(91),
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
    paddingHorizontal: 20,
  },
  menuItemContainer: {
    gap: 6,
    alignItems: 'center',
  },
  menuItemIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    height: hp(30),
  },
});

export default SigningDeviceDetails;
