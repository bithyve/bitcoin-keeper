import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import { CommonActions, StackActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Clipboard, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { Signer, Vault, VaultSigner } from 'src/services/wallets/interfaces/vault';
import KeeperHeader from 'src/components/KeeperHeader';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import ScreenWrapper from 'src/components/ScreenWrapper';
import {
  EntityKind,
  SignerType,
  VaultType,
  VisibilityType,
  XpubTypes,
} from 'src/services/wallets/enums';
import TickIcon from 'src/assets/images/icon_tick.svg';
import SigningServerIcon from 'src/assets/images/server_light.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { registerToColcard } from 'src/hardware/coldcard';
import idx from 'idx';
import { useDispatch } from 'react-redux';
import { updateKeyDetails, updateSignerDetails } from 'src/store/sagaActions/wallets';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import useVault from 'src/hooks/useVault';
import useNfcModal from 'src/hooks/useNfcModal';
import WarningIllustration from 'src/assets/images/warning.svg';
import KeeperModal from 'src/components/KeeperModal';
import OptionCard from 'src/components/OptionCard';
import WalletVault from 'src/assets/images/vault-hexa-green.svg';
import WalletIcon from 'src/assets/images/wallet-white.svg';
import VaultIcon from 'src/assets/images/vault-white.svg';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import DeleteIcon from 'src/assets/images/delete_phone.svg';

import { hp, wp } from 'src/constants/responsive';
import ActionCard from 'src/components/ActionCard';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import {
  InheritanceAlert,
  InheritanceConfiguration,
  InheritancePolicy,
} from 'src/models/interfaces/AssistedKeys';
import InheritanceKeyServer from 'src/services/backend/InheritanceKey';
import { captureError } from 'src/services/sentry';
import { emailCheck } from 'src/utils/utilities';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import WalletCopiableData from 'src/components/WalletCopiableData';
import useSignerMap from 'src/hooks/useSignerMap';
import { getSignerNameFromType } from 'src/hardware';
import config from 'src/utils/service-utilities/config';
import { signCosignerPSBT } from 'src/services/wallets/factories/WalletFactory';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import { addNewVault, refillMobileKey } from 'src/store/sagaActions/vaults';
import { generateVaultId } from 'src/services/wallets/factories/VaultFactory';
import WalletUtilities from 'src/services/wallets/operations/utils';
import useCanaryVault from 'src/hooks/useCanaryWallets';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { resetRealyVaultState } from 'src/store/reducers/bhr';
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
import { generateKey } from 'src/utils/service-utilities/encryption';
import { setInheritanceOTBRequestId } from 'src/store/reducers/storage';
import { SDIcons } from './SigningDeviceIcons';
import InhertanceKeyIcon from 'src/assets/images/icon_ik.svg';
import { resetKeyHealthState } from 'src/store/reducers/vaults';
import moment from 'moment';
import useIsSmallDevices from 'src/hooks/useSmallDevices';
import HardwareModalMap, { formatDuration, InteracationMode } from './HardwareModalMap';
import Note from 'src/components/Note/Note';
import { healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import useSigners from 'src/hooks/useSigners';
import SignerCard from '../AddSigner/SignerCard';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { generateMobileKeySeeds } from 'src/hardware/signerSeeds';

const { width } = Dimensions.get('screen');

const SignersWithoutRKSigningSupport = [
  SignerType.POLICY_SERVER,
  SignerType.OTHER_SD,
  SignerType.UNKOWN_SIGNER,
  SignerType.INHERITANCEKEY,
];

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
  const {
    vaultKey,
    vaultId,
    signer: signerFromParam,
    signerId,
  }: {
    signer: Signer;
    vaultKey: VaultSigner;
    vaultId: string;
    signerId: string;
  } = route.params;
  const { signerMap } = useSignerMap();
  const { signers } = useSigners();

  const signer: Signer = signerFromParam
    ? signers.find((signer) => signer.masterFingerprint === signerFromParam.masterFingerprint) // to reflect associated contact image in real time
    : signerMap[vaultKey.masterFingerprint];

  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const {
    vault: vaultTranslation,
    common,
    signer: signerTranslation,
    BackupWallet,
    seed: seedTranslation,
  } = translations;
  const { allCanaryVaults } = useCanaryVault({ getAll: true });
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp)[0];
  const isSmallDevice = useIsSmallDevices();
  const { primaryMnemonic }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const [editEmailModal, setEditEmailModal] = useState(false);
  const [deleteEmailModal, setDeleteEmailModal] = useState(false);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [canaryVaultLoading, setCanaryVaultLoading] = useState(false);
  const [OTBLoading, setOTBLoading] = useState(false);
  const [backupModal, setBackupModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [warningEnabled, setHideWarning] = useState(false);
  const [seed, setSeed] = useState('');
  const [vaultUsed, setVaultUsed] = useState<Vault>();
  const [canaryWalletId, setCanaryWalletId] = useState<string>();
  const [otp, setOtp] = useState('');
  const [actionAfterPasscode, setActionAfterPasscode] = useState<
    null | 'hideKey' | 'mobileKeySeed'
  >(null);
  const supportsRKSigning = !SignersWithoutRKSigningSupport.includes(signer.type);

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

  const inheritanceKeyExistingEmailCount =
    useAppSelector((state) => state.storage.inheritanceKeyExistingEmailCount) || 0; // || 0 for backward compatibility: inheritanceKeyExistingEmailCount might be undefined for upgraded apps

  const currentEmail =
    idx(
      signer,
      (_) => _.inheritanceKeyInfo.policy.alert.emails[inheritanceKeyExistingEmailCount]
    ) || '';

  const [waningModal, setWarning] = useState(false);
  const { withNfcModal, nfcVisible, closeNfc } = useNfcModal();

  const { activeVault, allVaults } = useVault({ vaultId, includeArchived: false });
  const allUnhiddenVaults = allVaults.filter((vault) => {
    return idx(vault, (_) => _.presentationData.visibility) !== VisibilityType.HIDDEN;
  });
  const signerVaults: Vault[] = [];

  allUnhiddenVaults.forEach((vault) => {
    const keys = vault.signers;
    for (const key of keys) {
      if (signer.masterFingerprint === key.masterFingerprint) {
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

  const registerColdCard = async () => {
    await withNfcModal(() => registerToColcard({ vault: activeVault }));
  };

  const { relayVaultUpdate, relayVaultError, realyVaultErrorMessage } = useAppSelector(
    (state) => state.bhr
  );
  const {
    oneTimeBackupStatus,
  }: {
    oneTimeBackupStatus: {
      signingServer: boolean;
      inheritanceKey: boolean;
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
        dispatch(addNewVault({ newVaultInfo: vaultInfo }));
        return vaultInfo;
      } catch (err) {
        captureError(err);
        return false;
      }
    },
    [signer]
  );

  const navigation: any = useNavigation();
  const dispatch = useDispatch();

  const updateIKSPolicy = async (removeEmail: string, newEmail?: string) => {
    try {
      if (!removeEmail && !newEmail) {
        showToast('Nothing to update');
        navigation.goBack();
        return;
      }

      if (signer.inheritanceKeyInfo === undefined) {
        showToast('Something went wrong, IKS configuration missing', <TickIcon />);
      }

      const existingPolicy: InheritancePolicy = signer.inheritanceKeyInfo.policy;
      const existingAlert: InheritanceAlert | any =
        idx(signer, (_) => _.inheritanceKeyInfo.policy.alert) || {};
      const existingEmails = existingAlert.emails || [];

      // remove the previous email
      existingEmails[inheritanceKeyExistingEmailCount] = '';

      // add the new email(if provided)
      if (newEmail) existingEmails[inheritanceKeyExistingEmailCount] = newEmail; // only update email for the latest inheritor(for source app, inheritanceKeyExistingEmailCount is 0)

      const updatedPolicy: InheritancePolicy = {
        ...existingPolicy,
        alert: {
          ...existingAlert,
          emails: existingEmails,
        },
      };

      let configurationForVault: InheritanceConfiguration = null;
      for (const config of signer.inheritanceKeyInfo.configurations) {
        if (config.id === vaultId) {
          configurationForVault = config;
          break;
        }
      }

      if (!configurationForVault) {
        showToast(`Something went wrong, IKS configuration missing for vault: ${vaultId}`);
        return;
      }

      const { updated } = await InheritanceKeyServer.updateInheritancePolicy(
        vaultKey.xfp,
        updatedPolicy,
        configurationForVault
      );

      if (updated) {
        const updateInheritanceKeyInfo = {
          ...signer.inheritanceKeyInfo,
          policy: updatedPolicy,
        };

        dispatch(updateSignerDetails(signer, 'inheritanceKeyInfo', updateInheritanceKeyInfo));
        showToast(`Email ${newEmail ? 'updated' : 'deleted'}`, <TickIcon />);
        navigation.goBack();
      } else showToast(`Failed to ${newEmail ? 'update' : 'delete'} email`);
    } catch (err) {
      captureError(err);
      showToast(`Failed to ${newEmail ? 'update' : 'delete'} email`);
    }
  };

  const registerSigner = async () => {
    switch (signer.type) {
      case SignerType.COLDCARD:
        await registerColdCard();
        dispatch(
          updateKeyDetails(vaultKey, 'registered', {
            registered: true,
            vaultId: activeVault.id,
          })
        );
        dispatch(
          healthCheckStatusUpdate([
            {
              signerId: signer.masterFingerprint,
              status: hcStatusType.HEALTH_CHECK_REGISTRATION,
            },
          ])
        );
        return;
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
      case SignerType.JADE:
      case SignerType.PASSPORT:
      case SignerType.SEEDSIGNER:
      case SignerType.SPECTER:
      case SignerType.OTHER_SD:
        navigation.dispatch(CommonActions.navigate('RegisterWithQR', { vaultKey, vaultId }));
        break;
      default:
        showToast('Coming soon', null, IToastCategory.DEFAULT, 1000);
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
          signerId,
          vaultId,
          vaultKey,
        },
      })
    );
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

  function EditModalContent() {
    const [email, setEmail] = useState(currentEmail);
    const [emailStatusFail, setEmailStatusFail] = useState(false);
    return (
      <Box style={styles.editModalContainer}>
        <Box>
          <TextInput
            style={styles.textInput}
            placeholder="pleb@bitcoin.com"
            value={email}
            onChangeText={(value) => {
              setEmail(value.trim());
              emailStatusFail && setEmailStatusFail(false);
            }}
          />
          {emailStatusFail && (
            <Text color={`${colorMode}.errorRed`} style={styles.errorStyle}>
              Email is not correct
            </Text>
          )}
          {currentEmail && (
            <TouchableOpacity
              onPress={() => {
                setEditEmailModal(false);
                setDeleteEmailModal(true);
              }}
            >
              <Box style={styles.deleteContentWrapper} backgroundColor={`${colorMode}.LightBrown`}>
                <Box>
                  <DeleteIcon />
                </Box>
                <Box>
                  <Text style={styles.fw800} color={`${colorMode}.BrownNeedHelp`} fontSize={13}>
                    Delete Email
                  </Text>
                  <Box fontSize={12}>This is a irreversible action</Box>
                </Box>
              </Box>
            </TouchableOpacity>
          )}
          <Box style={styles.warningIconWrapper}>
            <WarningIllustration />
          </Box>
          <Text style={styles.noteText} color={`${colorMode}.primaryGreenBackground`}>
            Note:
          </Text>
          <Text color={`${colorMode}.greenText`} style={styles.noteDescription}>
            If notification is not declined continuously for 30 days, the Key would be activated
          </Text>
        </Box>
        {currentEmail !== email && (
          <TouchableOpacity
            style={styles.updateBtnCtaStyle}
            onPress={() => {
              if (!emailCheck(email)) {
                setEmailStatusFail(true);
              } else {
                updateIKSPolicy(currentEmail, email);
              }
            }}
          >
            <Box backgroundColor={`${colorMode}.greenButtonBackground`} style={styles.cta}>
              <Text style={styles.ctaText} color={`${colorMode}.white`} bold>
                Update
              </Text>
            </Box>
          </TouchableOpacity>
        )}
      </Box>
    );
  }

  function DeleteEmailModalContent() {
    return (
      <Box style={styles.deleteEmailContent}>
        <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.emailContainer}>
          <Text fontSize={13} color={`${colorMode}.secondaryText`}>
            {currentEmail}
          </Text>
        </Box>
        <Text color={`${colorMode}.greenText`} style={styles.deleteRegisteredEmailNote}>
          You would not receive daily reminders about your Inheritance Key if it is used
        </Text>
      </Box>
    );
  }

  const navigateToAssignSigner = () => {
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
          signer: signer,
        },
      })
    );
  };

  const signPSBT = async (serializedPSBT, resetQR) => {
    try {
      let signedSerialisedPSBT;
      try {
        const key = signer.signerXpubs[XpubTypes.P2WSH][0];
        signedSerialisedPSBT = signCosignerPSBT(key.xpriv, serializedPSBT);
      } catch (e) {
        showToast(e.message);
        captureError(e);
      }
      if (signedSerialisedPSBT) {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'ShowQR',
            params: {
              data: signedSerialisedPSBT,
              encodeToBytes: false,
              title: 'Signed PSBT',
              subtitle: 'Please scan until all the QR data has been retrieved',
              type: SignerType.KEEPER,
            },
          })
        );
      }
    } catch (e) {
      resetQR();
      showToast('Please scan a valid PSBT');
    }
  };

  const navigateToScanPSBT = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ScanQR',
        params: {
          title: 'Scan a PSBT file',
          subtitle: 'Please scan until all the QR data has been retrieved',
          onQrScan: signPSBT,
          setup: true,
          type: SignerType.KEEPER,
          isHealthcheck: true,
          signer,
          disableMockFlow: true,
          isPSBT: true,
        },
      })
    );
  };

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
    }
  };

  const navigateToCosignerDetails = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'CosignerDetails',
        params: { signer },
      })
    );
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
  const isInheritanceKey = signer.type === SignerType.INHERITANCEKEY;
  const isAppKey = signer.type === SignerType.KEEPER;
  const isMyAppKey = signer.type === SignerType.MY_KEEPER;
  const isTapsigner = signer.type === SignerType.TAPSIGNER;
  const signersWithoutRegistration = isAppKey || isMyAppKey || isTapsigner;
  const isAssistedKey = isPolicyServer || isInheritanceKey;
  const isMobileKey = signer.type === SignerType.MY_KEEPER;

  const isOtherSD = signer.type === SignerType.UNKOWN_SIGNER;
  const CANARY_NON_SUPPORTED_DEVICES = [
    SignerType.UNKOWN_SIGNER,
    SignerType.INHERITANCEKEY,
    SignerType.POLICY_SERVER,
    SignerType.MOBILE_KEY,
    SignerType.MY_KEEPER,
  ];
  const isCanaryWalletAllowed = isOnL2Above && !CANARY_NON_SUPPORTED_DEVICES.includes(signer.type);

  const showOneTimeBackup = (isPolicyServer || isInheritanceKey) && vaultId && signer?.isBIP85;
  let disableOneTimeBackup = false; // disables OTB once the user has backed it up
  if (showOneTimeBackup) {
    if (isPolicyServer) disableOneTimeBackup = oneTimeBackupStatus?.signingServer;
    else if (isInheritanceKey) disableOneTimeBackup = oneTimeBackupStatus?.inheritanceKey;
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

  const { inheritanceOTBRequestId } = useAppSelector((state) => state.storage);
  const initiateOneTimeBackup = async () => {
    if (isPolicyServer) {
      setShowOTPModal(true);
      setBackupModal(false);
    } else if (isInheritanceKey) {
      try {
        setOTBLoading(true);
        let configurationForVault: InheritanceConfiguration = null;
        const iksConfigs = idx(signer, (_) => _.inheritanceKeyInfo.configurations) || [];
        for (const config of iksConfigs) {
          if (config.id === activeVault.id) {
            configurationForVault = config;
            break;
          }
        }
        if (!configurationForVault) {
          showToast('Unable to find IKS configuration');
          return;
        }

        let requestId = inheritanceOTBRequestId;
        let isNewRequest = false;
        if (!requestId) {
          requestId = `request-${generateKey(14)}`;
          isNewRequest = true;
        }

        const { requestStatus, backup } = await InheritanceKeyServer.fetchBackup(
          vaultKey.xfp,
          requestId,
          configurationForVault
        );
        setOTBLoading(false);

        if (requestStatus && isNewRequest) dispatch(setInheritanceOTBRequestId(requestId));

        // process request based on status
        if (requestStatus.isDeclined) {
          showToast('One Time Backup request has been declined', <ToastErrorIcon />);
        } else if (!requestStatus.isApproved) {
          showToast(
            `Request would approve in ${formatDuration(requestStatus.approvesIn)} if not rejected`,
            <TickIcon />
          );
          // dispatch(setInheritanceOTBRequestId('')); // clear existing request
        } else if (requestStatus.isApproved && backup) {
          navigation.navigate('ExportSeed', {
            vaultKey,
            vaultId,
            seed: backup.mnemonic,
            derivationPath: backup.derivationPath,
            signer,
            isFromAssistedKey: true,
            isIKS: true,
          });
        } else showToast('Unknown request status, please try again');
      } catch (err) {
        showToast(`${err}`);
      }
      // navigation.navigate('SignerBackupSeed');
      setBackupModal(false);
    } else {
      showToast('This signer does not support one-time backup');
    }
  };

  const getWalletIcon = (wallet) => {
    if (wallet.entityKind === EntityKind.VAULT) {
      if (wallet.type === VaultType.SINGE_SIG) return <WalletIcon />;
      else return wallet.type === VaultType.COLLABORATIVE ? <CollaborativeIcon /> : <VaultIcon />;
    } else {
      return <WalletIcon />;
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <ActivityIndicatorView visible={canaryVaultLoading || OTBLoading} showLoader={true} />
      <KeeperHeader
        title="Settings"
        subtitle={
          !signer.isBIP85
            ? `for ${getSignerNameFromType(signer.type, signer.isMock, false)}`
            : `for ${`${getSignerNameFromType(signer.type, signer.isMock, false)} +`}`
        }
        icon={
          <CircleIconWrapper
            backgroundColor={`${colorMode}.primaryGreenBackground`}
            icon={SDIcons(signer.type, true).Icon}
            image={signer?.extraData?.thumbnailPath}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.contentContainerStyle}>
        {isInheritanceKey && vaultId && (
          <OptionCard
            title="Registered Email"
            description="View, change or delete"
            callback={() => {
              setEditEmailModal(true);
            }}
          />
        )}
        {isAssistedKey || signersWithoutRegistration || !vaultId ? null : (
          <OptionCard
            title="Manual Registration"
            description="Register your active vault"
            callback={registerSigner}
          />
        )}
        {isPolicyServer && vaultId && (
          <OptionCard
            title="Change Verification & Policy"
            description="Restriction and threshold"
            callback={navigateToPolicyChange}
          />
        )}
        {showOneTimeBackup && (
          <OptionCard
            title={vaultTranslation.oneTimeBackupTitle}
            description={
              disableOneTimeBackup
                ? BackupWallet.viewBackupHistory
                : vaultTranslation.oneTimeBackupDesc
            }
            callback={() => {
              disableOneTimeBackup ? navigation.goBack() : setBackupModal(true);
            }}
          />
        )}
        {isTapsigner && (
          <OptionCard
            title="Manage TAPSIGNER"
            description="Manage your TAPSIGNER card"
            callback={openTapsignerSettings}
          />
        )}
        {/* // ! Hide Remote Key */}
        {/* {!isAssistedKey && ( */}
        {(isAssistedKey || isMyAppKey) && (
          <OptionCard
            title={signerTranslation.keyDetails}
            description={signerTranslation.keyDetailsSubtitle}
            callback={navigateToCosignerDetails}
          />
        )}
        <OptionCard
          title="Additional Info"
          description="Associate contact or Edit description"
          callback={navigateToAdditionalDetails}
        />
        {isMobileKey && (
          <OptionCard
            title={seedTranslation.mobileKeySeedWordsTitle}
            description={signerTranslation.mobileKeySeedOptionSubtitle}
            callback={() => {
              setActionAfterPasscode('mobileKeySeed');
              setConfirmPassVisible(true);
            }}
          />
        )}
        {/* // ! Hide Remote Key */}
        {/* {supportsRKSigning && ( */}
        {isMyAppKey && (
          <OptionCard
            title="Sign a transaction"
            description="Using a PSBT file"
            callback={navigateToScanPSBT}
          />
        )}
        {isAssistedKey || signersWithoutRegistration ? null : (
          <OptionCard
            title={isOtherSD ? 'Assign signer type' : 'Change signer type'}
            description="Select from signer list"
            callback={isOtherSD ? navigateToAssignSigner : () => setWarning(true)}
          />
        )}
        {vaultId ? null : (
          <OptionCard
            title="Hide key"
            description="Hide this key from the list"
            callback={() => {
              for (const vaultItem of allUnhiddenVaults) {
                if (
                  vaultItem.signers.find((s) => s.masterFingerprint === signer.masterFingerprint)
                ) {
                  setVaultUsed(vaultItem);
                  setHideWarning(true);
                  return;
                }
              }
              setActionAfterPasscode('hideKey');
              setConfirmPassVisible(true);
            }}
          />
        )}
        {isCanaryWalletAllowed && (
          <OptionCard
            title="Canary Wallet"
            description="Your on-chain key alert"
            callback={handleCanaryWallet}
          />
        )}
        <Box style={styles.signerText}>
          {`Signer used in ${signerVaults.length} wallet${signerVaults.length > 1 ? 's' : ''}`}
        </Box>
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
                    colorMode === 'dark' ? Colors.pantoneGreenDark : Colors.pantoneGreen
                  }
                  icon={getWalletIcon(vault)}
                />
              }
              showSelection={false}
              colorVarient="transparent"
              customStyle={styles.signerCard}
              colorMode={colorMode}
            />
          ))}
        </ScrollView>
      </ScrollView>
      <Box style={styles.fingerprint}>
        <WalletCopiableData
          title={common.signerFingerPrint}
          data={signer.masterFingerprint}
          dataType="fingerprint"
        />
      </Box>
      <NfcPrompt visible={nfcVisible} close={closeNfc} />
      <KeeperModal
        visible={waningModal}
        close={() => setWarning(false)}
        title="Changing Signer Type"
        subTitle="Are you sure you want to change the signer type?"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        DarkCloseIcon={colorMode === 'dark'}
        buttonText="Continue"
        secondaryButtonText="Cancel"
        secondaryCallback={() => setWarning(false)}
        buttonCallback={navigateToAssignSigner}
        Content={WarningContent}
      />
      <KeeperModal
        visible={editEmailModal}
        close={() => setEditEmailModal(false)}
        title="Registered Email"
        subTitle="Delete or edit registered email"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        DarkCloseIcon={colorMode === 'dark'}
        Content={EditModalContent}
      />
      <KeeperModal
        visible={deleteEmailModal}
        close={() => setDeleteEmailModal(false)}
        title="Deleting Registered Email"
        subTitle="Are you sure you want to delete email id?"
        subTitleWidth={wp(200)}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        showCloseIcon={false}
        buttonText="Delete"
        buttonCallback={() => {
          updateIKSPolicy(currentEmail);
        }}
        secondaryButtonText="Cancel"
        secondaryCallback={() => setDeleteEmailModal(false)}
        Content={DeleteEmailModalContent}
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
        buttonTextColor={`${colorMode}.white`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        DarkCloseIcon={colorMode === 'dark'}
        buttonCallback={() => {
          setHideWarning(false);
          navigation.dispatch(CommonActions.navigate('VaultDetails', { vaultId: vaultUsed.id }));
        }}
        textColor={`${colorMode}.primaryText`}
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
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
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
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        Content={() =>
          backupModalContent({
            title: signer.signerName,
            subTitle: `${common.added} ${moment(signer.addedOn).calendar().toLowerCase()}`,
            icon:
              signer.type === SignerType.INHERITANCEKEY ? (
                <InhertanceKeyIcon />
              ) : (
                <SigningServerIcon />
              ),
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
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
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
    fontWeight: '900',
    fontSize: 14,
  },
  noteDescription: {
    fontSize: 13,
    padding: 1,
    letterSpacing: 0.65,
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
    fontSize: 13,
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
    marginHorizontal: 10,
  },
  signerCard: {
    borderWidth: 1,
    borderColor: Colors.SilverMist,
    height: 120,
    width: wp(105),
    paddingTop: 5,
    paddingLeft: 14,
  },
  deleteEmailContent: {
    gap: 60,
    marginTop: 40,
  },
  deleteRegisteredEmailNote: {
    width: wp(200),
    fontSize: 13,
    letterSpacing: 0.13,
  },
  emailContainer: {
    borderRadius: 10,
    height: hp(65),
    padding: 15,
    justifyContent: 'center',
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
    paddingTop: hp(10),
    paddingHorizontal: wp(10),
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
    fontSize: 13,
    letterSpacing: 0.65,
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
});
