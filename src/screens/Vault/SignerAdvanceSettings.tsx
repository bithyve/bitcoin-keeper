import Text from 'src/components/KeeperText';
import { Box, Center, ScrollView, useColorMode, View } from 'native-base';
import { CommonActions, StackActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Clipboard, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { Signer, Vault, VaultSigner } from 'src/services/wallets/interfaces/vault';
import SigningServerIllustration from 'src/assets/images/backup-server-illustration.svg';
import ColdCardSetupImage from 'src/assets/images/ColdCardSetup.svg';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import Ledger from 'src/assets/images/ledger_image.svg';
import SeedSigner from 'src/assets/images/seedsigner-setup-horizontal.svg';
import Keystone from 'src/assets/images/keystone_illustration.svg';
import MobileKeyIllustration from 'src/assets/images/mobileKey_illustration.svg';
import PassportSVG from 'src/assets/images/illustration_passport.svg';
import SeedWordsIllustration from 'src/assets/images/illustration_seed_words.svg';
import KeeperSetupImage from 'src/assets/images/illustration_ksd.svg';
import BitboxImage from 'src/assets/images/bitboxSetup.svg';
import TrezorSetup from 'src/assets/images/trezor_setup.svg';
import JadeSVG from 'src/assets/images/illustration_jade.svg';
import SpecterSetupImage from 'src/assets/images/illustration_spectre.svg';
import ConciergeNeedHelp from 'src/assets/images/conciergeNeedHelp.svg';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { SignerType, VaultType, VisibilityType, XpubTypes } from 'src/services/wallets/enums';
import TickIcon from 'src/assets/images/icon_tick.svg';
import SigningServerIcon from 'src/assets/images/server_light.svg';
import idx from 'idx';
import { useDispatch } from 'react-redux';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import useVault from 'src/hooks/useVault';
import useNfcModal from 'src/hooks/useNfcModal';
import WarningIllustration from 'src/assets/images/warning.svg';
import KeeperModal from 'src/components/KeeperModal';
import OptionCard from 'src/components/OptionCard';
import WalletVault from 'src/assets/images/vault-hexa-green.svg';
import { hp, wp } from 'src/constants/responsive';
import ActionCard from 'src/components/ActionCard';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { captureError } from 'src/services/sentry';
import { getAccountFromSigner, getKeyUID } from 'src/utils/utilities';
import useSignerMap from 'src/hooks/useSignerMap';
import { getSignerNameFromType } from 'src/hardware';
import config, { KEEPER_KNOWLEDGEBASE } from 'src/utils/service-utilities/config';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import { addNewVault, refillMobileKey } from 'src/store/sagaActions/vaults';
import { generateVaultId } from 'src/services/wallets/factories/VaultFactory';
import WalletUtilities from 'src/services/wallets/operations/utils';
import useCanaryVault from 'src/hooks/useCanaryWallets';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { resetRealyVaultState, resetSignersUpdateState } from 'src/store/reducers/bhr';
import { useAppSelector } from 'src/store/hooks';
import usePlan from 'src/hooks/usePlan';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import SigningServer from 'src/services/backend/SigningServer';
import { resetKeyHealthState } from 'src/store/reducers/vaults';
import moment from 'moment';
import Note from 'src/components/Note/Note';
import useSigners from 'src/hooks/useSigners';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { generateMobileKeySeeds } from 'src/hardware/signerSeeds';
import useArchivedVaults from 'src/hooks/useArchivedVaults';
import WalletHeader from 'src/components/WalletHeader';
import InfoIcon from 'src/assets/images/info_icon.svg';
import InfoDarkIcon from 'src/assets/images/info-Dark-icon.svg';
import Buttons from 'src/components/Buttons';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import { vaultAlreadyExists } from './VaultMigrationController';
import HardwareModalMap, { InteracationMode } from './HardwareModalMap';

const { width } = Dimensions.get('screen');

function Content({ colorMode, vaultUsed }: { colorMode: string; vaultUsed: Vault }) {
  return (
    <Box>
      <ActionCard
        description={vaultUsed.presentationData?.description}
        cardName={vaultUsed.presentationData.name}
        icon={<WalletVault />}
        callback={() => {}}
      />
      <Box style={styles.pv20}>
        <Text color={`${colorMode}.primaryText`} style={styles.warningText}>
          Either hide the vault or remove the key from the vault to perform this operation.
        </Text>
      </Box>
    </Box>
  );
}

// add key check for cancary wallet based on ss config

function SignerAdvanceSettings({ route }: any) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const {
    vaultKey,
    vaultId,
    signer: signerFromParam,
  }: {
    signer: Signer;
    vaultKey: VaultSigner;
    vaultId: string;
  } = route.params;
  const { signerMap } = useSignerMap();
  const { signers } = useSigners();

  const signer: Signer = signerFromParam
    ? signers.find((signer) => getKeyUID(signer) === getKeyUID(signerFromParam)) // to reflect associated contact image in real time
    : signerMap[getKeyUID(vaultKey)];

  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const {
    vault: vaultTranslation,
    common,
    signingServer,
    signer: signerTranslation,
    seed: seedTranslation,
  } = translations;
  const { allCanaryVaults } = useCanaryVault({ getAll: true });
  const { primaryMnemonic }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [canaryVaultLoading, setCanaryVaultLoading] = useState(false);
  const [OTBLoading, setOTBLoading] = useState(false);
  const [backupModal, setBackupModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [warningEnabled, setHideWarning] = useState(false);
  const [seed, setSeed] = useState('');
  const [vaultUsed, setVaultUsed] = useState<Vault>();
  const [canaryWalletId, setCanaryWalletId] = useState<string>();
  const [displayBackupModal, setDisplayBackupModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [actionAfterPasscode, setActionAfterPasscode] = useState<
    null | 'hideKey' | 'mobileKeySeed'
  >(null);
  const [detailModal, setDetailModal] = useState(false);

  useEffect(() => {
    const fetchOrGenerateSeeds = async () => {
      if (isMobileKey) {
        try {
          if (!signer?.extraData?.instanceNumber) {
            throw new Error('Instance number is not available or invalid.');
          }
          const instanceNumber = signer?.extraData?.instanceNumber - 1;
          const generatedSeeds = await generateMobileKeySeeds(instanceNumber, primaryMnemonic);
          setSeed(generatedSeeds);
        } catch (error) {
          console.error('Error generating seeds: ', error);
        }
      }
    };
    setTimeout(() => {
      fetchOrGenerateSeeds();
    }, 100);
  }, [signer, primaryMnemonic]);

  const CANARY_SCHEME = { m: 1, n: 1 };

  const { isOnL2Above } = usePlan();

  const [waningModal, setWarning] = useState(false);
  const { withNfcModal, nfcVisible, closeNfc } = useNfcModal();

  const { activeVault, allVaults } = useVault({ vaultId, includeArchived: false });
  const { archivedVaults } = useArchivedVaults();
  const allUnhiddenVaults = allVaults.filter((vault) => {
    return idx(vault, (_) => _.presentationData.visibility) !== VisibilityType.HIDDEN;
  });
  const signerVaults: Vault[] = [];

  allUnhiddenVaults.forEach((vault) => {
    const keys = vault.signers;
    for (const key of keys) {
      if (getKeyUID(signer) === getKeyUID(key)) {
        signerVaults.push(vault);
        break;
      }
    }
  });

  useEffect(() => {
    if (vaultId && vaultKey) {
      if (signer.type === SignerType.MY_KEEPER && !vaultKey.xpriv) {
        dispatch(refillMobileKey(vaultKey));
      }
    }
    return () => {
      dispatch(resetKeyHealthState());
    };
  }, []);

  const hideKey = () => {
    dispatch(updateSignerDetails(signer, 'hidden', true));
    showToast('Key hidden successfully', <TickIcon />);
    const popAction = StackActions.pop(2);
    navigation.dispatch(popAction);
  };

  const { relayVaultUpdate, relayVaultError, realyVaultErrorMessage } = useAppSelector(
    (state) => state.bhr
  );
  const {
    oneTimeBackupStatus,
  }: {
    oneTimeBackupStatus: {
      signingServer: boolean;
    };
  } = useAppSelector((state) => state.settings);

  useEffect(() => {
    if (relayVaultUpdate) {
      navigation.navigate('VaultDetails', { vaultId: canaryWalletId });
      setCanaryVaultLoading(false);
      dispatch(resetRealyVaultState());
    }
    if (relayVaultError) {
      showToast(`Canary wallet creation failed ${realyVaultErrorMessage}`);
      dispatch(resetRealyVaultState());
      setCanaryVaultLoading(false);
    }
  }, [relayVaultUpdate, relayVaultError]);

  const createCreateCanaryWallet = useCallback(
    (ssVaultKey) => {
      try {
        const vaultInfo: NewVaultInfo = {
          vaultType: VaultType.CANARY,
          vaultScheme: CANARY_SCHEME,
          vaultSigners: [ssVaultKey],
          vaultDetails: {
            name: 'Canary Wallet',
            description: `Canary Wallet for ${signer.signerName}`,
          },
        };
        if (vaultAlreadyExists(vaultInfo, allVaults, archivedVaults)) {
          throw Error('Single-key wallet for this device already exists');
        }

        dispatch(addNewVault({ newVaultInfo: vaultInfo }));
        return vaultInfo;
      } catch (err) {
        captureError(err);
        showToast(err && err.message ? err.message.toString() : err.toString());
        setCanaryVaultLoading(false);
        return false;
      }
    },
    [signer]
  );

  const navigation: any = useNavigation();
  const dispatch = useDispatch();

  const registerSigner = async () => {
    switch (signer.type) {
      case SignerType.LEDGER:
      case SignerType.BITBOX02:
        navigation.dispatch(
          CommonActions.navigate('RegisterWithChannel', {
            vaultKey,
            vaultId,
            signerType: signer.type,
          })
        );
        break;
      case SignerType.KEYSTONE:
      case SignerType.PASSPORT:
      case SignerType.SPECTER:
      case SignerType.OTHER_SD:
      case SignerType.COLDCARD:
        navigation.dispatch(CommonActions.navigate('RegisterWithQR', { vaultKey, vaultId }));
        break;
      case SignerType.JADE:
        // For now, Jade only supports registration via USB for Miniscript
        if (activeVault.scheme.miniscriptScheme) {
          navigation.dispatch(
            CommonActions.navigate('RegisterWithChannel', {
              vaultKey,
              vaultId,
              signerType: signer.type,
            })
          );
        } else {
          navigation.dispatch(CommonActions.navigate('RegisterWithQR', { vaultKey, vaultId }));
        }
        break;
      case SignerType.PORTAL:
        navigation.dispatch(
          CommonActions.navigate('SetupPortal', {
            vaultKey,
            vaultId,
            mode: InteracationMode.VAULT_REGISTER,
            accountNumber: getAccountFromSigner(signer),
          })
        );
        break;

      default:
        showToast(
          "This device doesn't require vault registration",
          null,
          IToastCategory.DEFAULT,
          1000
        );
        break;
    }
  };

  const navigateToPolicyChange = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ChoosePolicyNew',
        params: {
          isUpdate: true,
          signer,
          vaultId,
          vaultKey,
        },
      })
    );
  };

  const navigateToKeyHistory = () => {
    navigation.dispatch(CommonActions.navigate('KeyHistory', { signer, vaultKey, vaultId }));
  };

  function WarningContent() {
    return (
      <>
        <Box style={styles.warningIllustration}>
          <WarningIllustration />
        </Box>
        <Box>
          <Text color={`${colorMode}.greenText`} style={styles.warningText}>
            If the signer is identified incorrectly there may be repercussions with general signer
            interactions like signing etc.
          </Text>
        </Box>
      </>
    );
  }

  const navigateToAssignSigner = () => {
    dispatch(resetSignersUpdateState());
    setWarning(false);
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

  const openTapsignerSettings = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ManageTapsignerSettings',
        params: {
          signer,
        },
      })
    );
  };

  // const signPSBTForExternalKeeperKey = async (serializedPSBT, resetQR) => {
  //   try {
  //     let signedSerialisedPSBT;
  //     try {
  //       const key = signer.signerXpubs[XpubTypes.P2WSH][0];
  //       signedSerialisedPSBT = signCosignerPSBT(
  //         signer.masterFingerprint,
  //         key.xpriv,
  //         serializedPSBT
  //       );
  //     } catch (e) {
  //       showToast(e.message);
  //       captureError(e);
  //     }
  //   }}};

  const [canaryWalletSingleSigModal, setCanaryWalletSingleSigModal] = useState(false);

  const handleCanaryWallet = () => {
    try {
      setCanaryVaultLoading(true);
      const singleSigSigner = idx(signer, (_) => _.signerXpubs[XpubTypes.P2WPKH][0]);
      if (!singleSigSigner) {
        showToast('No single Sig found');
        setCanaryVaultLoading(false);
      } else {
        const ssVaultKey: VaultSigner = {
          ...singleSigSigner,
          masterFingerprint: signer.masterFingerprint,
          xfp: WalletUtilities.getFingerprintFromExtendedKey(
            singleSigSigner.xpub,
            WalletUtilities.getNetworkByType(config.NETWORK_TYPE)
          ),
        };
        const canaryVaultId = generateVaultId([ssVaultKey], CANARY_SCHEME);
        setCanaryWalletId(canaryVaultId);
        const canaryVault = allCanaryVaults.find((vault) => vault.id === canaryVaultId);

        if (canaryVault) {
          navigation.navigate('VaultDetails', { vaultId: canaryVaultId });
          setCanaryVaultLoading(false);
        } else {
          createCreateCanaryWallet(ssVaultKey);
        }
      }
    } catch (err) {
      console.log('Something Went Wrong', err);
      setCanaryVaultLoading(false);
    }
  };

  const navigateToAdditionalDetails = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'AdditionalDetails',
        params: { signer },
      })
    );
  };

  function Card({ title = '', subTitle = '', icon = null }) {
    const { colorMode } = useColorMode();

    return (
      <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.cardContainer}>
        <Box style={styles.iconContainer}>
          <HexagonIcon width={44} height={38} backgroundColor={Colors.pantoneGreen} icon={icon} />
        </Box>
        <Box style={styles.titlesContainer}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.subTitleText}>{subTitle}</Text>
        </Box>
      </Box>
    );
  }

  useEffect(() => {
    if (!showOTPModal) {
      setOtp('');
    }
  }, [showOTPModal]);

  const backupModalContent = ({ title = '', subTitle = '', icon = null }) => {
    return (
      <Box>
        <Box style={styles.cardWrapper}>
          <Card title={title} subTitle={subTitle} icon={icon} />
        </Box>
        <Box style={styles.noteWrapper}>
          <Note
            title={common.note}
            subtitle={signerTranslation.OTBModalNote}
            subtitleColor="GreyText"
          />
        </Box>
      </Box>
    );
  };

  function SigningServerOTPModal() {
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

    const onPressConfirm = async () => {
      try {
        setOTBLoading(true);
        const { mnemonic, derivationPath } = await SigningServer.fetchBackup(
          vaultKey.xfp,
          Number(otp)
        );
        setOTBLoading(false);
        navigation.navigate('ExportSeed', {
          vaultKey,
          vaultId,
          seed: mnemonic,
          derivationPath,
          signer,
          isFromAssistedKey: true,
          isSS: true,
        });
      } catch (err) {
        setOTBLoading(false);
        showToast(`${err}`);
      }
      setShowOTPModal(false);
    };

    const onDeletePressed = () => {
      setOtp(otp.slice(0, otp.length - 1));
    };

    return (
      <Box style={styles.otpModal}>
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
          <Text style={styles.cvvInputInfoText} color={`${colorMode}.greenText`}>
            {vaultTranslation.cvvSigningServerInfo}
          </Text>
          <Box mt={10} alignSelf="flex-end" mr={2}>
            <Box>
              <CustomGreenButton onPress={onPressConfirm} value={common.confirm} />
            </Box>
          </Box>
        </Box>
        <KeyPadView
          onPressNumber={onPressNumber}
          onDeletePressed={onDeletePressed}
          keyColor={`${colorMode}.primaryText`}
        />
      </Box>
    );
  }

  const isPolicyServer = signer.type === SignerType.POLICY_SERVER;
  const isAppKey = signer.type === SignerType.KEEPER;
  const isMyAppKey = signer.type === SignerType.MY_KEEPER;
  const isTapsigner = signer.type === SignerType.TAPSIGNER;
  const signersWithoutRegistration = isAppKey || isMyAppKey || isTapsigner;
  const isAssistedKey = isPolicyServer;
  const isMobileKey = signer.type === SignerType.MY_KEEPER;

  const isOtherSD = signer.type === SignerType.UNKOWN_SIGNER;
  const CANARY_NON_SUPPORTED_DEVICES = [
    SignerType.UNKOWN_SIGNER,
    SignerType.POLICY_SERVER,
    SignerType.MOBILE_KEY,
    SignerType.MY_KEEPER,
  ];
  const isCanaryWalletAllowed = isOnL2Above && !CANARY_NON_SUPPORTED_DEVICES.includes(signer.type);

  const showOneTimeBackup = isPolicyServer && signer?.isBIP85;
  let disableOneTimeBackup = false; // disables OTB once the user has backed it up
  if (showOneTimeBackup) {
    if (isPolicyServer) disableOneTimeBackup = oneTimeBackupStatus?.signingServer;
  }

  const onSuccess = () => {
    if (actionAfterPasscode === 'hideKey') {
      hideKey();
    } else if (actionAfterPasscode === 'mobileKeySeed') {
      navigation.dispatch(
        CommonActions.navigate('ExportSeed', {
          seed,
          isFromMobileKey: true,
          next: false,
        })
      );
    }
    setConfirmPassVisible(false);
  };

  const initiateOneTimeBackup = async () => {
    if (isPolicyServer) {
      setShowOTPModal(true);
      setBackupModal(false);
    } else {
      showToast('This signer does not support one-time backup');
    }
  };

  const navigateToSigningRequests = () => {
    navigation.navigate('SigningRequest');
  };

  const BackupModalContent = useCallback(() => {
    return (
      <Box style={styles.modalContainer}>
        <SigningServerIllustration />
        <Box>
          <Text fontSize={12} semiBold style={styles.modalTitle}>
            {signingServer.attention}:
          </Text>
          <Text fontSize={12} style={styles.modalTitle}>
            {signingServer.attentionSubTitle}
          </Text>
        </Box>
        <Buttons
          primaryCallback={() => {}}
          fullWidth
          primaryText="Backup Now"
          paddingVertical={13}
        />
      </Box>
    );
  }, []);

  const displayedCards = [
    !isMobileKey && (
      <OptionCard
        key="keyHistory"
        title="Key History"
        description="View the usage timeline"
        callback={navigateToKeyHistory}
      />
    ),
    !(isAssistedKey || signersWithoutRegistration || !vaultId) && (
      <OptionCard
        key="manualRegistration"
        title="Manual Registration"
        description="Register your active vault"
        callback={registerSigner}
      />
    ),
    isPolicyServer && (
      <OptionCard
        key="configurationSetting"
        title="Server Policy Setting"
        description="Update your server key signing policy"
        callback={navigateToPolicyChange}
      />
    ),
    isPolicyServer && (
      <OptionCard
        key="signingRequests"
        title="Signing requests"
        description="See your pending signing requests"
        callback={navigateToSigningRequests}
      />
    ),
    isTapsigner && (
      <OptionCard
        key="manageTapsigner"
        title="Manage TAPSIGNER"
        description="Manage your TAPSIGNER card"
        callback={openTapsignerSettings}
      />
    ),
    <OptionCard
      key="additionalInfo"
      title="Additional Info"
      description="Associate contact or Edit description"
      callback={navigateToAdditionalDetails}
    />,
    isMobileKey && (
      <OptionCard
        key="mobileKeySeedWords"
        title={seedTranslation.mobileKeySeedWordsTitle}
        description={signerTranslation.mobileKeySeedOptionSubtitle}
        callback={() => {
          setActionAfterPasscode('mobileKeySeed');
          setConfirmPassVisible(true);
        }}
      />
    ),
    !(isAssistedKey || signersWithoutRegistration) && (
      <OptionCard
        key="changeDeviceType"
        title={isOtherSD ? 'Assign device type' : 'Change device type'}
        description="Select from device list"
        callback={isOtherSD ? navigateToAssignSigner : () => setWarning(true)}
      />
    ),
    !vaultId && (
      <OptionCard
        key="hideKey"
        title="Hide key"
        description="Hide this key from the list"
        callback={() => {
          for (const vaultItem of allUnhiddenVaults) {
            if (vaultItem.signers.find((s) => getKeyUID(s) === getKeyUID(signer))) {
              setVaultUsed(vaultItem);
              setHideWarning(true);
              return;
            }
          }
          setActionAfterPasscode('hideKey');
          setConfirmPassVisible(true);
        }}
      />
    ),
    isCanaryWalletAllowed && (
      <OptionCard
        key="canaryWallet"
        title="Canary Wallet"
        description="Your on-chain key alert"
        callback={handleCanaryWallet}
      />
    ),
    // isPolicyServer && showBackupModal && (
    //   <OptionCard
    //     key="backupServerKey"
    //     title="Back up Server Key"
    //     description={
    //       disableOneTimeBackup ? BackupWallet.viewBackupHistory : 'Save a backup of the Server Key'
    //     }
    //     callback={() => {
    //       disableOneTimeBackup ? navigation.goBack() : handleBackupModal();
    //     }}
    //   />
    // ),
    isPolicyServer && showOneTimeBackup && (
      <OptionCard
        key="backupServerKey"
        title="Back up Server Key"
        description={
          disableOneTimeBackup ? 'Server key backed up' : 'Save a backup of the Server Key'
        }
        callback={() => {
          if (!disableOneTimeBackup) setBackupModal(true);
        }}
        disabled={disableOneTimeBackup}
      />
    ),
  ].filter(Boolean);

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
          title: 'Server Key',
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
      case SignerType.SPECTER:
        return {
          title: 'Specter DIY',
          subTitle:
            'An open-source hardware wallet for users to take full control over their Bitcoin security.',
          assert: <SpecterSetupImage />,
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
  const { title, subTitle, assert, description } = getSignerContent(signer?.type);
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

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <ActivityIndicatorView visible={canaryVaultLoading || OTBLoading} showLoader={true} />
      <WalletHeader
        title={
          !signer.isBIP85
            ? ` ${getSignerNameFromType(signer.type, signer.isMock, false).replace(
                /\*+/g,
                ''
              )} Settings`
            : ` ${getSignerNameFromType(signer.type, signer.isMock, false).replace(
                /\*+/g,
                ''
              )} Settings`
        }
        rightComponent={
          <TouchableOpacity style={styles.infoIcon} onPress={() => setDetailModal(true)}>
            {isDarkMode ? <InfoDarkIcon /> : <InfoIcon />}
          </TouchableOpacity>
        }
      />
      <ScrollView>
        <Box
          backgroundColor={
            isDarkMode ? `${colorMode}.modalWhiteBackground` : `${colorMode}.ChampagneBliss`
          }
          style={styles.contentContainerStyle}
          borderColor={`${colorMode}.separator`}
          borderWidth={1}
        >
          {displayedCards.map((card, index) => (
            <Box key={card.key}>
              {card}
              {index < displayedCards.length - 1 && (
                <View style={styles.divider} backgroundColor={`${colorMode}.textColor3`} />
              )}
            </Box>
          ))}
        </Box>
      </ScrollView>
      <NfcPrompt visible={nfcVisible} close={closeNfc} />
      <KeeperModal
        visible={waningModal}
        close={() => setWarning(false)}
        title="Changing Signer Type"
        subTitle="Are you sure you want to change the signer type?"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        buttonText="Continue"
        secondaryButtonText="Cancel"
        secondaryCallback={() => setWarning(false)}
        buttonCallback={navigateToAssignSigner}
        Content={WarningContent}
      />
      <KeeperModal
        visible={displayBackupModal}
        close={() => setDisplayBackupModal(false)}
        title={signingServer.BackUpModalTitle}
        subTitle={signingServer.BackUpModalSubTitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={BackupModalContent}
      />
      <KeeperModal
        visible={warningEnabled && !!vaultUsed}
        close={() => setHideWarning(false)}
        title="Key is being used for Vault"
        subTitle="The Key you are trying to hide is used in one of the visible vaults."
        buttonText="View Vault"
        secondaryButtonText="Back"
        secondaryCallback={() => setHideWarning(false)}
        secButtonTextColor={`${colorMode}.greenText`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        buttonTextColor={`${colorMode}.buttonText`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        buttonCallback={() => {
          setHideWarning(false);
          navigation.dispatch(CommonActions.navigate('VaultDetails', { vaultId: vaultUsed.id }));
        }}
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => <Content vaultUsed={vaultUsed} colorMode={colorMode} />}
      />
      <KeeperModal
        visible={confirmPassVisible}
        closeOnOverlayClick={false}
        close={() => setConfirmPassVisible(false)}
        title="Confirm Passcode"
        subTitleWidth={wp(240)}
        subTitle={
          actionAfterPasscode === 'hideKey' ? 'To hide the key' : 'To view Mobile Key seed words'
        }
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <PasscodeVerifyModal
            useBiometrics={false}
            close={() => {
              setConfirmPassVisible(false);
            }}
            onSuccess={onSuccess}
          />
        )}
      />
      <KeeperModal
        visible={backupModal}
        closeOnOverlayClick={true}
        close={() => setBackupModal(false)}
        showCloseIcon={false}
        title={`${signerTranslation.backingUp} ${signer.signerName}`}
        subTitle={`${signerTranslation.writeBackupSeed} ${signer.signerName}. ${signerTranslation.doItPrivately}`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() =>
          backupModalContent({
            title: signer.signerName,
            subTitle: `${common.added} ${moment(signer.addedOn).calendar().toLowerCase()}`,
            icon: <SigningServerIcon />,
          })
        }
        buttonText={common.proceed}
        buttonCallback={initiateOneTimeBackup}
        secondaryButtonText={common.cancel}
        secondaryCallback={() => setBackupModal(false)}
      />
      <KeeperModal
        visible={showOTPModal}
        close={() => setShowOTPModal(false)}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        title={vaultTranslation.oneTimeBackupTitle}
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={SigningServerOTPModal}
      />
      <HardwareModalMap
        type={signer.type}
        visible={canaryWalletSingleSigModal}
        close={() => setCanaryWalletSingleSigModal(false)}
        mode={InteracationMode.CANARY_ADDITION}
        isMultisig={true}
        addSignerFlow={false}
      />
      <KeeperModal
        visible={detailModal}
        close={() => setDetailModal(false)}
        title={!signer.isBIP85 ? title : `${title} +`}
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
    </ScreenWrapper>
  );
}

export default SignerAdvanceSettings;

const styles = StyleSheet.create({
  card: {
    height: 80,
    width: '100%',
    borderRadius: 10,
    marginVertical: '10%',
    paddingHorizontal: '6%',
    justifyContent: 'center',
  },
  circle: {
    height: 60,
    width: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#694B2E',
  },
  divider: {
    height: 1,
    marginVertical: hp(5),
    opacity: 0.1,
  },
  item: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  descriptionBox: {
    height: 24,
    backgroundColor: '#FDF7F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  descriptionEdit: {
    height: 50,
    backgroundColor: '#FDF7F0',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  descriptionContainer: {
    width: width * 0.8,
  },
  textInput: {
    height: 55,
    padding: 20,
    backgroundColor: 'rgba(253, 247, 240, 1)',
    borderRadius: 10,
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
  },
  walletNameText: {
    fontSize: 20,
  },
  inputContainer: {
    alignItems: 'center',
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
    marginTop: '10%',
  },
  inputWrapper: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    height: 60,
  },
  copyIconWrapper: {
    padding: 10,
    borderRadius: 10,
    marginRight: 5,
  },
  deleteContentWrapper: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    marginVertical: hp(10),
    gap: 10,
    padding: 10,
    height: hp(70),
    alignItems: 'center',
    flexDirection: 'row',
  },
  warningIconWrapper: {
    alignItems: 'center',
    marginVertical: hp(20),
  },
  noteText: {
    fontSize: 15,
  },
  noteDescription: {
    fontSize: 12,
    padding: 1,
  },
  contentDescription: {
    fontSize: 14,
    marginTop: hp(25),
  },
  editModalContainer: {},
  fw800: {
    fontWeight: '800',
  },
  fingerprintContainer: {
    justifyContent: 'center',
    paddingLeft: 2,
  },
  w80: {
    width: '80%',
  },
  warningText: {
    fontSize: 14,
    padding: 1,
    letterSpacing: 0.65,
  },
  walletUsedText: {
    marginLeft: 2,
    marginVertical: 20,
  },
  actionCardContainer: {
    gap: 5,
  },
  cta: {
    borderRadius: 10,
    width: wp(120),
    height: hp(45),
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 13,
    letterSpacing: 1,
  },
  updateBtnCtaStyle: { alignItems: 'flex-end', marginTop: 10 },
  errorStyle: {
    marginTop: 10,
  },
  fingerprint: {
    alignItems: 'center',
  },
  signerText: {
    marginVertical: hp(15),
  },
  signerCard: {
    borderWidth: 1,
    borderColor: Colors.SilverMist,
    height: 120,
    width: wp(105),
    paddingTop: 5,
    paddingLeft: 14,
  },
  pv20: {
    paddingVertical: 20,
  },
  warningIllustration: {
    alignSelf: 'center',
    marginBottom: hp(20),
    marginRight: wp(40),
  },
  contentContainerStyle: {
    marginTop: hp(20),
    paddingHorizontal: wp(20),
    paddingVertical: hp(10),
    borderRadius: wp(15),
  },
  signerVaults: {
    gap: 5,
  },
  textDesc: {
    fontSize: 13,
    marginTop: hp(10),
    marginBottom: hp(10),
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 15,
    marginBottom: hp(20),
    minHeight: hp(70),
  },
  iconContainer: {
    width: wp(30),
    marginLeft: wp(10),
  },
  titlesContainer: {
    marginLeft: wp(15),
  },
  titleText: {
    color: Colors.pantoneGreen,
    fontSize: 14,
    fontWeight: '500',
  },
  subTitleText: {
    fontSize: 12,
  },
  cvvInputInfoText: {
    fontSize: 14,
    width: '100%',
    marginTop: 2,
  },
  otpModal: {
    width: '100%',
  },
  cardWrapper: {
    marginBottom: hp(50),
  },
  noteWrapper: {
    marginBottom: hp(15),
  },
  infoIcon: {
    width: wp(40),
    height: wp(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  modalTitle: {
    marginBottom: 10,
  },
});
