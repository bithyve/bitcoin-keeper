import { ScrollView, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { CommonActions, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Signer,
  Vault,
  VaultScheme,
  VaultSigner,
  signerXpubs,
} from 'src/services/wallets/interfaces/vault';
import {
  SignerStorage,
  SignerType,
  KeyValidationErrorCode,
  VaultType,
  XpubTypes,
} from 'src/services/wallets/enums';
import Buttons from 'src/components/Buttons';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Note from 'src/components/Note/Note';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { useAppSelector } from 'src/store/hooks';
import useSignerIntel from 'src/hooks/useSignerIntel';
import useSigners from 'src/hooks/useSigners';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import useSignerMap from 'src/hooks/useSignerMap';
import WalletUtilities from 'src/services/wallets/operations/utils';
import useVault from 'src/hooks/useVault';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';
import { useDispatch } from 'react-redux';
import { resetRealyVaultState, resetSignersUpdateState } from 'src/store/reducers/bhr';
import { getSignerDescription, getSignerNameFromType } from 'src/hardware';
import Text from 'src/components/KeeperText';
import idx from 'idx';
import useSubscriptionLevel from 'src/hooks/useSubscriptionLevel';
import { AppSubscriptionLevel } from 'src/models/enums/SubscriptionTier';
import SuccessIllustration from 'src/assets/images/Success.svg';
import TickIcon from 'src/assets/images/tick_icon.svg';
import KeeperModal from 'src/components/KeeperModal';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import SignerEmptyStateIcon from 'src/assets/images/signer-empty.svg';
import KEEPERAPPLIGHT from 'src/assets/images/KeeperIconLight.svg';
import CardPill from 'src/components/CardPill';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { useQuery } from '@realm/react';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import {
  SETUPASSISTEDVAULT,
  SETUPCOLLABORATIVEWALLET,
  ADDRESERVEKEY,
} from 'src/navigation/contants';
import { SentryErrorBoundary } from 'src/services/sentry';
import KeyAddedModal from 'src/components/KeyAddedModal';
import CautionIllustration from 'src/assets/images/downgradetopleb.svg';
import Dropdown from 'src/components/Dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { getKeyUID } from 'src/utils/utilities';
import HardwareModalMap, { InteracationMode } from './HardwareModalMap';
import SignerCard from '../AddSigner/SignerCard';
import VaultMigrationController from './VaultMigrationController';
import { SDIcons } from './SigningDeviceIcons';
import { TIMELOCK_DURATIONS } from './constants';
import AddKeyButton from '../SigningDevices/components/AddKeyButton';
import EmptyListIllustration from '../../components/EmptyListIllustration';
import KeyUnAvailableIllustrationLight from 'src/assets/images/key-unavailable-illustration-light.svg';
const onSignerSelect = (
  selected,
  signer: Signer,
  scheme,
  vaultKeys,
  setVaultKeys,
  selectedSigners,
  setSelectedSigners,
  showToast
) => {
  const amfXpub: signerXpubs[XpubTypes][0] = signer.signerXpubs[XpubTypes.AMF][0];
  const ssXpub: signerXpubs[XpubTypes][0] = signer.signerXpubs[XpubTypes.P2WPKH][0];
  const msXpub: signerXpubs[XpubTypes][0] = signer.signerXpubs[XpubTypes.P2WSH][0];

  const { isMock } = signer;
  const isAmf = !!amfXpub;
  const isMultisig = msXpub && scheme.n > 1;

  if (selected) {
    const updated = selectedSigners.delete(getKeyUID(signer));
    if (updated) {
      if (isMock) {
        const updatedKeys = vaultKeys.filter((key) => msXpub && key.xpub !== msXpub.xpub);
        setVaultKeys(updatedKeys);
      } else if (isAmf) {
        const updatedKeys = vaultKeys.filter((key) => amfXpub && key.xpub !== amfXpub.xpub);
        setVaultKeys(updatedKeys);
      } else if (isMultisig) {
        const updatedKeys = vaultKeys.filter((key) => key.xpub !== msXpub.xpub);
        setVaultKeys(updatedKeys);
      } else {
        const updatedKeys = vaultKeys.filter((key) => key.xpub !== ssXpub.xpub);
        setVaultKeys(updatedKeys);
      }
      setSelectedSigners(new Map(selectedSigners));
    }
  } else {
    if (selectedSigners.size >= scheme.n) {
      showToast('You have selected the total (n) keys, please proceed with the creation of vault.');
      return;
    }
    const scriptKey = WalletUtilities.getKeyForScheme(isMultisig, signer, msXpub, ssXpub, amfXpub);
    vaultKeys.push(scriptKey);
    setVaultKeys(vaultKeys);
    const updatedSignerMap = selectedSigners.set(getKeyUID(signer), true);
    setSelectedSigners(new Map(updatedSignerMap));
  }
};

const getVaultType = ({
  isCollaborativeWallet,
  isSSAddition,
  isAssistedWallet,
  isTimeLock,
  isInheritance,
}) => {
  if (isCollaborativeWallet) return VaultType.COLLABORATIVE;
  if (isSSAddition) return VaultType.SINGE_SIG;
  if (isAssistedWallet) return VaultType.ASSISTED;
  if (isTimeLock) return VaultType.TIMELOCKED;
  if (isInheritance) return VaultType.INHERITANCE;
  return VaultType.DEFAULT;
};

const isAssistedKeyValidForScheme = (
  signer: Signer,
  scheme,
  signerMap,
  selectedSigners
): { isValid: boolean; code?: KeyValidationErrorCode } => {
  // case 1: scheme-based restrictions for assisted keys
  // both assisted keys can be added starting from Vaults w/ m: 2 and n:3
  if (scheme.n < 3) {
    return { isValid: false, code: KeyValidationErrorCode.INSUFFICIENT_TOTAL_KEYS };
  }
  if (scheme.m < 2) {
    return { isValid: false, code: KeyValidationErrorCode.INSUFFICIENT_REQUIRED_KEYS };
  }

  // case 2: count-based restrictions for assisted keys
  const currentAssistedKey = 1; // the assisted key for which the conditions are being checked
  let existingAssistedKeys = 0;

  for (const keyUID of selectedSigners.keys()) {
    if (
      signerMap[keyUID].type === SignerType.POLICY_SERVER ||
      signerMap[keyUID].type === SignerType.INHERITANCEKEY
    ) {
      existingAssistedKeys++;
    }
  }

  const totalAssistedKeys = existingAssistedKeys + currentAssistedKey;

  // Assisted Keys restriction I: The number of assisted keys should be less than the threshold (m)
  // for a given Vault, such that they can’t form a signing quorum by themselves.
  if (totalAssistedKeys >= scheme.m) {
    return { isValid: false, code: KeyValidationErrorCode.ASSISTED_KEYS_QUORUM };
  }

  // Assisted Keys restriction II: The threshold for the multi-sig should be achievable without the assisted keys
  if (totalAssistedKeys > scheme.n - scheme.m) {
    return { isValid: false, code: KeyValidationErrorCode.ASSISTED_KEYS_THRESHOLD };
  }

  return { isValid: true };
};

const isSignerValidForScheme = (
  signer: Signer,
  scheme,
  signerMap,
  selectedSigners
): { isValid: boolean; code?: KeyValidationErrorCode } => {
  const keyUID = getKeyUID(signer);

  if (selectedSigners.has(keyUID)) {
    return { isValid: false, code: KeyValidationErrorCode.ALREADY_SELECTED };
  }

  if (signer.type === SignerType.POLICY_SERVER || signer.type === SignerType.INHERITANCEKEY) {
    return isAssistedKeyValidForScheme(signer, scheme, signerMap, selectedSigners);
  }

  if (signer.type === SignerType.MY_KEEPER && scheme.n <= 1) {
    return { isValid: false, code: KeyValidationErrorCode.MOBILE_KEY_NOT_ALLOWED };
  }

  const amfXpub = idx(signer, (_) => _.signerXpubs[XpubTypes.AMF][0]);
  const ssXpub = idx(signer, (_) => _.signerXpubs[XpubTypes.P2WPKH][0]);
  const msXpub = idx(signer, (_) => _.signerXpubs[XpubTypes.P2WSH][0]);

  if (
    (scheme.n > 1 && !msXpub && !amfXpub && !signer.isMock) ||
    (scheme.n === 1 && !ssXpub && !amfXpub && !signer.isMock)
  ) {
    return { isValid: false, code: KeyValidationErrorCode.MISSING_XPUB };
  }

  return { isValid: true };
};

const setInitialKeys = (
  activeVault,
  scheme,
  signerMap,
  setVaultKeys,
  setSelectedSigners,
  selectedSigners,
  keyToRotate
) => {
  if (activeVault) {
    // setting initital keys (update if scheme has changed)
    const vaultKeys = activeVault.signers.filter(
      (key) => keyToRotate && getKeyUID(key) !== getKeyUID(keyToRotate)
    );
    const isMultisig = scheme.n > 1;
    const modifiedVaultKeysForScriptType = [];
    const updatedSignerMap = new Map();
    vaultKeys.forEach((key) => {
      const signer = signerMap[getKeyUID(key)];
      if (isSignerValidForScheme(signer, scheme, signerMap, selectedSigners).isValid) {
        if (modifiedVaultKeysForScriptType.length < scheme.n) {
          updatedSignerMap.set(getKeyUID(key), true);
          const msXpub: signerXpubs[XpubTypes][0] = signer.signerXpubs[XpubTypes.P2WSH][0];
          const ssXpub: signerXpubs[XpubTypes][0] = signer.signerXpubs[XpubTypes.P2WPKH][0];
          const amfXpub: signerXpubs[XpubTypes][0] = signer.signerXpubs[XpubTypes.AMF][0];
          const scriptKey = WalletUtilities.getKeyForScheme(
            isMultisig,
            signer,
            msXpub,
            ssXpub,
            amfXpub
          );
          if (scriptKey) {
            modifiedVaultKeysForScriptType.push(scriptKey);
          }
        }
      }
    });
    setVaultKeys(modifiedVaultKeysForScriptType);
    setSelectedSigners(new Map(updatedSignerMap));
  }
};

const getSelectedKeysByType = (vaultKeys, signerMap, type) => {
  return vaultKeys.filter((key) => signerMap[getKeyUID(key)].type === type);
};

function Footer({
  amfSigners,
  invalidSS,
  invalidIKS,
  invalidMessage,
  areSignersValid,
  relayVaultUpdateLoading,
  colorMode,
  setCreating,
  isCollaborativeFlow,
  isAssistedWalletFlow,
  isTimeLock,
  setTimelockCautionModal,
  isReserveKeyFlow,
  isAddInheritanceKey,
  currentBlockHeight,
  vaultKeys,
  onGoBack,
  selectedSigners,
  name,
  description,
  vaultId,
  scheme,
}) {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common, vault: vaultText } = translations;
  const renderNotes = () => {
    const notes = [];
    if (amfSigners.length) {
      const message = `* ${amfSigners.join(
        ' and '
      )} does not support Testnet directly, so the app creates a proxy Testnet key for you in the beta app`;
      notes.push(
        <Box style={styles.noteContainer} key={message}>
          <Note title={common.note} subtitle={message} />
        </Box>
      );
    }
    if (invalidSS || invalidIKS) {
      const message = invalidMessage;
      notes.push(
        <Box style={styles.noteContainer} key={message}>
          <Note title="WARNING" subtitle={message} subtitleColor="error" />
        </Box>
      );
    }
    if (isAddInheritanceKey) {
      const message = vaultText.addSignerIKNote;
      notes.push(
        <Box style={styles.noteContainer} key={message}>
          <Note title={common.note} subtitle={message} />
        </Box>
      );
    }
    if (!notes.length) {
      const message = 'You can easily change one or more signers after the vault is setup';
      notes.push(
        <Box style={styles.noteContainer} key={message}>
          <Note title="Note" subtitle={message} />
        </Box>
      );
    }
    return notes;
  };

  const handleProceedButtonClick = () => {
    if (onGoBack) {
      onGoBack(vaultKeys);
    }

    navigation.goBack();
  };

  const isProceedDisabled =
    (isCollaborativeFlow || isAssistedWalletFlow) && selectedSigners.size === 0;
  const isConfirmDisabled = isReserveKeyFlow && selectedSigners.size === 0;

  return (
    <Box style={styles.bottomContainer} backgroundColor={`${colorMode}.thirdBackground`}>
      {!(isCollaborativeFlow || isAssistedWalletFlow) && renderNotes()}
      {!(isCollaborativeFlow || isAssistedWalletFlow) && !isReserveKeyFlow ? (
        <Buttons
          primaryDisable={!!areSignersValid}
          primaryLoading={relayVaultUpdateLoading}
          primaryText={common.proceed}
          primaryCallback={
            !isAddInheritanceKey
              ? () => setCreating(true)
              : () =>
                  navigation.dispatch(
                    CommonActions.navigate('AddReserveKey', {
                      vaultKeys,
                      vaultId,
                      scheme,
                      name,
                      description,
                      isAddInheritanceKey,
                      currentBlockHeight,
                    })
                  )
          }
          fullWidth
        />
      ) : isReserveKeyFlow ? (
        <Buttons
          primaryDisable={isConfirmDisabled}
          primaryLoading={relayVaultUpdateLoading}
          primaryText={common.confirm}
          primaryCallback={handleProceedButtonClick}
          fullWidth
        />
      ) : (
        <Buttons
          primaryDisable={isProceedDisabled}
          primaryLoading={relayVaultUpdateLoading}
          primaryText={common.proceed}
          primaryCallback={() => handleProceedButtonClick()}
          fullWidth
        />
      )}
    </Box>
  );
}

function SignerEmptyState() {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { signer: SignerTranlations } = translations;
  return (
    <Box style={styles.emptyWrapper}>
      <Text color={`${colorMode}.primaryText`} style={styles.emptyText} medium>
        {SignerTranlations.noKeyAvailable}
      </Text>
      <Text color={`${colorMode}.secondaryText`} style={styles.emptySubText}>
        {SignerTranlations.pleaseAddKey}
      </Text>
      <SignerEmptyStateIcon />
    </Box>
  );
}

function Signers({
  signers,
  selectedSigners,
  setSelectedSigners,
  scheme,
  colorMode,
  vaultKeys,
  setVaultKeys,
  showToast,
  navigation,
  vaultId,
  signerMap,
  showSelection,
  keyToRotate,
  setCreating,
  isCollaborativeFlow,
  isAssistedWalletFlow,
  isReserveKeyFlow,
  signerFilters,
  coSigners,
  setExternalKeyAddedModal,
  setAddedKey,
  selectedSignersFromParams,
}) {
  const { level } = useSubscriptionLevel();
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [visibleImportXpub, setVisibleImportXpub] = useState(false);
  const [showSSModal, setShowSSModal] = useState(false);
  const [showSignerModal, setShowSignerModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    name: '',
    title: '',
    message: '',
    code: '',
    clickedSigner: null,
  });
  const isMultisig = scheme.n !== 1;
  const { primaryMnemonic }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const close = () => setVisible(false);
  const closeSSModal = () => setShowSSModal(false);

  const setupSignigngServer = async () => {
    setShowSSModal(true);
  };

  const getDisabledMessage = (
    signer,
    myAppKeys,
    selectedSigners,
    scheme,
    signerMap,
    keyToRotate
  ) => {
    const validationResult = isSignerValidForScheme(signer, scheme, signerMap, selectedSigners);

    if (!validationResult.isValid) {
      let title, message;

      switch (validationResult.code) {
        case KeyValidationErrorCode.ALREADY_SELECTED:
          title = 'Key Already Selected';
          message = 'This key is already selected. Please choose a different key.';
          break;
        case KeyValidationErrorCode.MOBILE_KEY_NOT_ALLOWED:
          title = 'Mobile Key Not Allowed';
          message = 'Mobile keys cannot be used for cold wallets. Please use hot wallet option.';
          break;
        case KeyValidationErrorCode.MISSING_XPUB:
          title = 'Missing xPub from Key';
          message =
            "The key selected is missing the xPub necessary for the selected vault type. Please import the xPub if you'd like to use this device in your new vault.";
          break;
        case KeyValidationErrorCode.INSUFFICIENT_TOTAL_KEYS:
        case KeyValidationErrorCode.INSUFFICIENT_REQUIRED_KEYS:
          title = `${getSignerNameFromType(signer.type)} Is Not Allowed For This Configuration`;
          message = `The ${getSignerNameFromType(
            signer.type
          )} can only be used in a multi-signature vault which has at least 2 required keys and 3 total keys.`;
          break;
        case KeyValidationErrorCode.ASSISTED_KEYS_QUORUM:
        case KeyValidationErrorCode.ASSISTED_KEYS_THRESHOLD:
          title = 'Assisted Key Limit Exceeded';
          message = 'The selected configuration exceeds the allowed number of assisted keys.';
          break;
        default:
          return null;
      }

      return { title, message, code: validationResult.code, clickedSigner: signer };
    }

    if (
      signer.type === SignerType.MY_KEEPER &&
      myAppKeys.length >= 1 &&
      getKeyUID(myAppKeys[0]) !== getKeyUID(signer)
    ) {
      return {
        title: 'Another Mobile Key Already Selected',
        message:
          'You have already selected another mobile key for your vault. Since all mobile keys are derived from your Recovery Key and stored on your phone, it is not allowed to use more than one mobile key in each vault.',
      };
    }

    if (
      keyToRotate &&
      (getKeyUID(keyToRotate) === getKeyUID(signer) || selectedSigners.get(getKeyUID(signer)))
    ) {
      return {
        title: 'Key Already Used In Your Vault',
        message:
          'This key is already used in your vault, please choose another key or add a new one.',
      };
    }

    return null;
  };

  const shellKeys = [];

  const shellAssistedKeys = useMemo(() => {
    const generateShellAssistedKey = (signerType: SignerType) => ({
      type: signerType,
      storageType: SignerStorage.WARM,
      signerName: getSignerNameFromType(signerType, false, false),
      lastHealthCheck: new Date(),
      addedOn: new Date(),
      masterFingerprint: Date.now().toString() + signerType,
      signerXpubs: {},
      hidden: false,
    });

    let hasSigningServer = false; // actual signing server present?
    let isSigningServerShellCreated = false;

    if (shellKeys.filter((signer) => signer.type === SignerType.POLICY_SERVER).length > 0) {
      isSigningServerShellCreated = true;
    }

    for (const signer of signers) {
      if (signer.type === SignerType.POLICY_SERVER) hasSigningServer = true;
    }

    if (!isSigningServerShellCreated && !hasSigningServer && level >= AppSubscriptionLevel.L2) {
      shellKeys.push(generateShellAssistedKey(SignerType.POLICY_SERVER));
    }

    const addedSignersTypes = signers.map((signer) => signer.type);
    return shellKeys.filter((shellSigner) => !addedSignersTypes.includes(shellSigner.type));
  }, [signers]);

  const renderAssistedKeysShell = () => {
    return shellAssistedKeys.map((shellSigner) => {
      const isAMF = false;
      return (
        <SignerCard
          key={getKeyUID(shellSigner)}
          onCardSelect={() => {
            if (shellSigner.type === SignerType.POLICY_SERVER) setupSignigngServer();
          }}
          name={getSignerNameFromType(shellSigner.type, shellSigner.isMock, isAMF)}
          description="Setup required"
          icon={SDIcons(shellSigner.type).Icon}
          showSelection={false}
          showDot={true}
          colorVarient="green"
          colorMode={colorMode}
        />
      );
    });
  };

  const renderSigners = useCallback(
    (signerFilters = []) => {
      const myAppKeys = getSelectedKeysByType(vaultKeys, signerMap, SignerType.MY_KEEPER);
      const filteredSigners =
        signerFilters.length > 0
          ? signers.filter((signer) => signerFilters.includes(signer.type))
          : signers;

      const signerCards = filteredSigners.map((signer) => {
        if (signer.archived) return null;

        const disabledMessage = getDisabledMessage(
          signer,
          myAppKeys,
          selectedSigners,
          scheme,
          signerMap,
          keyToRotate
        );
        const disabled = disabledMessage !== null;

        return (
          <SignerCard
            showSelection={showSelection}
            disabledWithTouch={disabled}
            key={getKeyUID(signer)}
            name={
              !signer.isBIP85
                ? getSignerNameFromType(signer.type, signer.isMock, false)
                : `${getSignerNameFromType(signer.type, signer.isMock, false)} +`
            }
            description={getSignerDescription(signer)}
            icon={SDIcons(signer.type).Icon}
            image={signer?.extraData?.thumbnailPath}
            isSelected={!!selectedSigners.get(getKeyUID(signer))}
            onCardSelect={(selected) => {
              if (disabledMessage) {
                setModalContent({
                  name: getSignerNameFromType(signer.type),
                  title: disabledMessage.title,
                  message: disabledMessage.message,
                  code: disabledMessage.code,
                  clickedSigner: disabledMessage.clickedSigner,
                });
                setShowSignerModal(true);
                return;
              }

              onSignerSelect(
                selected,
                signer,
                scheme,
                vaultKeys,
                setVaultKeys,
                selectedSigners,
                setSelectedSigners,
                showToast
              );
              if (keyToRotate && vaultKeys.length === scheme.n) {
                showToast('Updating vault keys and archiving the old vault', <TickIcon />);
                setCreating(true);
              }
            }}
            colorMode={colorMode}
          />
        );
      });

      return signerCards;
    },
    [signers, signerFilters]
  );

  const renderCollaborativeSigners = useCallback(() => {
    const myAppKeys = getSelectedKeysByType(vaultKeys, signerMap, SignerType.MY_KEEPER);
    const anySignerSelected = [...selectedSigners.values()].some((selected) => selected);
    const validCoSigners = coSigners.filter((signer) => signer);
    const coSignersMap = new Map(validCoSigners.map((signer) => [getKeyUID(signer), true]));

    const filteredSigners = signers
      .filter(
        (signer) =>
          signer.type === SignerType.KEEPER &&
          !signer.archived &&
          !coSignersMap.has(getKeyUID(signer))
      )
      .map((signer) => {
        const { isValid } = isSignerValidForScheme(signer, scheme, signerMap, selectedSigners);
        const disabled =
          !isValid ||
          (signer.type === SignerType.MY_KEEPER &&
            myAppKeys.length >= 1 &&
            getKeyUID(myAppKeys[0]) !== getKeyUID(signer)) ||
          vaultKeys.some(
            (key) =>
              key.masterFingerprint === signer.masterFingerprint &&
              getKeyUID(key) !== getKeyUID(signer)
          ) ||
          (anySignerSelected && !selectedSigners.get(getKeyUID(signer)));

        const handleCardSelect = (selected) => {
          if (disabled) return;

          onSignerSelect(
            selected,
            signer,
            scheme,
            vaultKeys,
            setVaultKeys,
            selectedSigners,
            setSelectedSigners,
            showToast
          );
        };

        return (
          <SignerCard
            showSelection={showSelection}
            disabled={disabled}
            key={getKeyUID(signer)}
            name={
              !signer.isBIP85
                ? getSignerNameFromType(signer.type, signer.isMock)
                : `${getSignerNameFromType(signer.type, signer.isMock)} +`
            }
            description={getSignerDescription(signer)}
            icon={SDIcons(signer.type).Icon}
            image={signer?.extraData?.thumbnailPath}
            isSelected={!!selectedSigners.get(getKeyUID(signer))}
            onCardSelect={handleCardSelect}
            colorMode={colorMode}
          />
        );
      });

    return filteredSigners;
  }, [
    signers,
    selectedSigners,
    scheme,
    signerMap,
    vaultKeys,
    keyToRotate,
    showSelection,
    colorMode,
    setSelectedSigners,
    setVaultKeys,
    showToast,
    setCreating,
    coSigners,
  ]);

  const renderReservedKeys = useCallback(() => {
    const myAppKeys = getSelectedKeysByType(vaultKeys, signerMap, SignerType.MY_KEEPER);
    const anySignerSelected = [...selectedSigners.values()].some((selected) => selected);

    const selectedFingerprintsSet = new Set(
      selectedSignersFromParams.map((signer) => signer.masterFingerprint)
    );

    const signerCards = signers
      .filter((signer) => !signer.archived)
      .filter(
        (signer) =>
          [SignerType.MY_KEEPER, SignerType.TAPSIGNER, SignerType.SEED_WORDS].includes(signer.type) // Filter by desired signer types
      )
      .filter((signer) => !selectedFingerprintsSet.has(signer.masterFingerprint)) // Avoid selected signers from params
      .map((signer) => {
        const { isValid } = isSignerValidForScheme(signer, scheme, signerMap, selectedSigners);
        const disabled =
          !isValid ||
          (signer.type === SignerType.MY_KEEPER &&
            myAppKeys.length >= 1 &&
            myAppKeys[0].masterFingerprint !== signer.masterFingerprint) ||
          (anySignerSelected && !selectedSigners.get(getKeyUID(signer)));

        const handleCardSelect = (selected) => {
          if (disabled) return;

          onSignerSelect(
            selected,
            signer,
            scheme,
            vaultKeys,
            setVaultKeys,
            selectedSigners,
            setSelectedSigners,
            showToast
          );
        };

        return (
          <SignerCard
            showSelection={showSelection}
            disabled={disabled}
            key={getKeyUID(signer)}
            name={
              !signer.isBIP85
                ? getSignerNameFromType(signer.type, signer.isMock)
                : `${getSignerNameFromType(signer.type, signer.isMock)} +`
            }
            description={getSignerDescription(signer)}
            icon={SDIcons(signer.type).Icon}
            image={signer?.extraData?.thumbnailPath}
            isSelected={!!selectedSigners.get(getKeyUID(signer))}
            onCardSelect={handleCardSelect}
            colorMode={colorMode}
          />
        );
      });

    return signerCards;
  }, [
    signers,
    selectedSigners,
    selectedSignersFromParams,
    scheme,
    signerMap,
    vaultKeys,
    keyToRotate,
    showSelection,
    colorMode,
    setSelectedSigners,
    setVaultKeys,
    showToast,
    setCreating,
  ]);

  const signer: Signer = keyToRotate ? signerMap[getKeyUID(keyToRotate)] : null;

  return (
    <Box
      style={styles.signerContainer}
      backgroundColor={`${colorMode}.thirdBackground`}
      borderColor={colorMode === 'light' ? Colors.SilverMist : Colors.separator}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box style={styles.signerInnetContainer}>
          <Box style={{ marginRight: wp(10), marginBottom: hp(20), flexDirection: 'row' }}>
            <Text
              color={`${colorMode}.primaryText`}
              semiBold
              style={styles.title}
              numberOfLines={2}
            >
              {keyToRotate
                ? `Choose the key to be rotated with ${getSignerNameFromType(signer.type)} (${
                    keyToRotate.masterFingerprint
                  })`
                : isCollaborativeFlow
                ? 'Choose keys'
                : 'Choose keys or add a new one'}
            </Text>
            {!isCollaborativeFlow && (
              <Box style={styles.addKeyBtnWrapper}>
                <AddKeyButton
                  short
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.navigate('SignerCategoryList', {
                        scheme,
                        vaultId,
                        vaultSigners: vaultKeys,
                      })
                    )
                  }
                />
              </Box>
            )}
          </Box>
          {signers.length ? (
            <Box>
              <Box style={styles.addedSigners}>
                {!isCollaborativeFlow && !isReserveKeyFlow ? (
                  <>
                    {renderSigners(signerFilters)}
                    {signerFilters.length <= 0 && renderAssistedKeysShell()}
                  </>
                ) : isReserveKeyFlow ? (
                  <>{renderReservedKeys()}</>
                ) : signers.filter(
                    (signer) => signer.type === SignerType.KEEPER && !signer.archived
                  ).length ? (
                  <>{renderCollaborativeSigners()}</>
                ) : (
                  <EmptyListIllustration listType="keys" />
                )}
              </Box>
            </Box>
          ) : (
            <EmptyListIllustration listType="keys" />
          )}

          <HardwareModalMap
            visible={visible}
            close={close}
            type={SignerType.INHERITANCEKEY}
            mode={InteracationMode.VAULT_ADDITION}
            isMultisig={isMultisig}
            primaryMnemonic={primaryMnemonic}
            addSignerFlow={false}
            vaultId={vaultId}
            vaultSigners={vaultKeys}
          />
          <HardwareModalMap
            visible={showSSModal}
            close={closeSSModal}
            type={SignerType.POLICY_SERVER}
            mode={InteracationMode.VAULT_ADDITION}
            isMultisig={isMultisig}
            primaryMnemonic={primaryMnemonic}
            addSignerFlow={false}
            vaultId={vaultId}
            vaultSigners={vaultKeys}
          />
          <HardwareModalMap
            visible={visibleImportXpub}
            close={() => setVisibleImportXpub(false)}
            type={modalContent?.clickedSigner?.type}
            mode={InteracationMode.VAULT_ADDITION}
            isMultisig={isMultisig}
            primaryMnemonic={primaryMnemonic}
            addSignerFlow={false}
            vaultId={vaultId}
            vaultSigners={vaultKeys}
          />
          <KeeperModal
            dismissible
            close={() => setShowSignerModal(false)}
            visible={showSignerModal}
            title={modalContent.title}
            modalBackground={`${colorMode}.modalWhiteBackground`}
            textColor={`${colorMode}.primaryText`}
            buttonTextColor={`${colorMode}.buttonText`}
            buttonBackground={`${colorMode}.greenButtonBackground`}
            subTitleColor={`${colorMode}.secondaryText`}
            subTitleWidth={wp(280)}
            showCloseIcon={true}
            Content={() => (
              <Box>
                <Box alignItems="center" marginBottom={hp(30)}>
                  <KeyUnAvailableIllustrationLight />
                </Box>
                <Text>{modalContent.message}</Text>
                <Box marginTop={hp(40)}>
                  {modalContent.code === KeyValidationErrorCode.MISSING_XPUB ? (
                    <Buttons
                      primaryText="Import xPub"
                      primaryCallback={() => {
                        setShowSignerModal(false);
                        setVisibleImportXpub(true);
                      }}
                      secondaryText="Cancel"
                      secondaryCallback={() => setShowSignerModal(false)}
                    />
                  ) : (
                    <Buttons
                      fullWidth
                      primaryText="Okay"
                      primaryCallback={() => setShowSignerModal(false)}
                    />
                  )}
                </Box>
              </Box>
            )}
          />
        </Box>
      </ScrollView>
    </Box>
  );
}

function AddSigningDevice() {
  const { colorMode } = useColorMode();
  const [vaultCreating, setCreating] = useState(false);
  const navigation = useNavigation();
  const route = useRoute() as {
    params: {
      isInheritance: boolean;
      scheme: VaultScheme;
      name: string;
      description: string;
      vaultId: string;
      keyToRotate?: VaultSigner;
      parentScreen?: string;
      onGoBack?: any;
      coSigners?: any;
      isSSAddition?: boolean;
      addedSigner?: Signer;
      addSignerFlow?: boolean;
      showModal?: boolean;
      isTimeLock?: boolean;
      currentBlockHeight?: number;
      selectedSignersFromParams?: Signer[];
      isAddInheritanceKey?: boolean;
      signerFilters?: SignerType | Array<SignerType>;
    };
  };
  const {
    name = 'Vault',
    description = '',
    isInheritance = false,
    vaultId = '',
    scheme,
    keyToRotate,
    parentScreen = '',
    onGoBack,
    coSigners,
    isSSAddition = false,
    addedSigner,
    selectedSignersFromParams,
    isTimeLock = false,
    isAddInheritanceKey = false,
    currentBlockHeight,
    signerFilters = [],
  } = route.params;
  const { showToast } = useToastMessage();
  const { relayVaultUpdateLoading } = useAppSelector((state) => state.bhr);
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultTranslation, common, signer, wallet: walletTranslation } = translations;
  const [keyAddedModalVisible, setKeyAddedModalVisible] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('');

  const { signers } = useSigners();
  // filter out archived & hidden signers
  const activeSigners = signers.filter((signer) => !signer.archived && !signer.hidden);
  const { signerMap } = useSignerMap();
  const [selectedSigners, setSelectedSigners] = useState(new Map());
  const [vaultKeys, setVaultKeys] = useState<VaultSigner[]>([]);
  const { activeVault, allVaults } = useVault({ vaultId });
  const isCollaborativeWallet = activeVault?.type == VaultType.COLLABORATIVE;
  const isCollaborativeFlow = parentScreen === SETUPCOLLABORATIVEWALLET;
  const isAssistedWallet = activeVault?.type == VaultType.ASSISTED;
  const isAssistedWalletFlow = parentScreen === SETUPASSISTEDVAULT;
  const [timeLockCautionModal, setTimelockCautionModal] = useState(false);
  const [selectDurationModal, setSelectDurationModal] = useState(false);
  const [timeLockWalletCreatedModal, setTimeLockWalletCreatedModal] = useState(false);

  const isReserveKeyFlow = parentScreen === ADDRESERVEKEY;
  const [externalKeyAddedModal, setExternalKeyAddedModal] = useState(false);
  const [addedKey, setAddedKey] = useState(null);

  const { areSignersValid, amfSigners, invalidSS, invalidIKS, invalidMessage } = useSignerIntel({
    scheme,
    vaultKeys,
    selectedSigners,
    existingKeys: activeVault?.signers || [],
  });

  const {
    relayVaultUpdate,
    relayVaultError,
    realyVaultErrorMessage,
    relaySignersUpdate,
    realySignersUpdateErrorMessage,
    relaySignersUpdateLoading,
    realySignersAdded,
  } = useAppSelector((state) => state.bhr);

  const dispatch = useDispatch();

  const [generatedVaultId, setGeneratedVaultId] = useState('');
  const newVault = allVaults.filter((v) => v.id === generatedVaultId)[0];
  const [vaultCreatedModalVisible, setVaultCreatedModalVisible] = useState(false);

  const { vaultSigners: keys } = useSigners(newVault?.id);
  const inheritanceSigner = keys.filter((signer) => signer?.type === SignerType.INHERITANCEKEY)[0];

  const handleOptionSelect = useCallback((option) => {
    setSelectedDuration(option);
  }, []);
  const [inProgress, setInProgress] = useState(false);

  const handleModalClose = () => {
    setKeyAddedModalVisible(false);
  };

  useEffect(() => {
    if (relaySignersUpdateLoading) {
      setInProgress(true);
    }
  }, [relaySignersUpdateLoading]);

  useEffect(() => {
    if (realySignersUpdateErrorMessage) {
      setInProgress(false);
      showToast(
        realySignersUpdateErrorMessage,
        <ToastErrorIcon />,
        IToastCategory.SIGNING_DEVICE,
        5000
      );
      dispatch(resetSignersUpdateState());
    }
    return () => {
      dispatch(resetSignersUpdateState());
    };
  }, [realySignersUpdateErrorMessage]);

  useEffect(() => {
    if (relaySignersUpdate) {
      setInProgress(false);
      if (realySignersAdded && navigation.isFocused()) {
        setKeyAddedModalVisible(true);
      }
      dispatch(resetSignersUpdateState());
    }
    return () => {
      dispatch(resetSignersUpdateState());
    };
  }, [relaySignersUpdate]);

  useFocusEffect(
    useCallback(() => {
      if (relayVaultUpdate && newVault) {
        dispatch(resetRealyVaultState());
        setCreating(false);
        setVaultCreatedModalVisible(true);
      } else if (relayVaultUpdate) {
        navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: 'Home' }] }));
        dispatch(resetRealyVaultState());
        setCreating(false);
      }

      if (relayVaultError) {
        showToast(realyVaultErrorMessage, <ToastErrorIcon />);
        dispatch(resetRealyVaultState());
        setCreating(false);
      }
    }, [relayVaultUpdate, relayVaultError, newVault, navigation, dispatch])
  );

  useEffect(() => {
    setInitialKeys(
      activeVault,
      scheme,
      signerMap,
      setVaultKeys,
      setSelectedSigners,
      selectedSigners,
      keyToRotate
    );
  }, []);

  const subtitle = isSSAddition
    ? 'Choose a single sig key to create a wallet'
    : scheme.n > 1
    ? `Vault with a ${scheme.m} of ${scheme.n} setup will be created${
        isInheritance ? ' for Inheritance' : ''
      }`
    : `Vault with ${scheme.m} of ${scheme.n} setup will be created`;

  function VaultCreatedModalContent(vault: Vault) {
    const tags = ['Vault', `${vault.scheme.m}-of-${vault.scheme.n}`];
    return (
      <Box>
        <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.walletVaultInfoContainer}>
          <Box style={styles.pillsContainer}>
            {tags?.map((tag, index) => {
              return (
                <CardPill
                  key={tag}
                  heading={tag}
                  backgroundColor={
                    index % 2 !== 0 ? null : `${colorMode}.SignleSigCardPillBackColor`
                  }
                />
              );
            })}
          </Box>
          <Box style={styles.walletVaultInfoWrapper}>
            <Box style={styles.iconWrapper}>
              <HexagonIcon
                width={44}
                height={38}
                backgroundColor="rgba(45, 103, 89, 1)"
                icon={<VaultIcon />}
              />
            </Box>
            <Box>
              {vault.presentationData.description ? (
                <Text fontSize={12} color={`${colorMode}.secondaryText`}>
                  {vault.presentationData.description}
                </Text>
              ) : null}
              <Text color={`${colorMode}.greenText`} medium style={styles.titleText}>
                {vault.presentationData.name}
              </Text>
            </Box>
          </Box>
        </Box>
        <Box>
          <Text color={`${colorMode}.secondaryText`} style={styles.descText}>
            {vaultTranslation.VaultCreatedModalDesc}
          </Text>
        </Box>
      </Box>
    );
  }

  function Vault3_5CreatedModalContent(vault: Vault) {
    const tags = ['Vault', `${vault.scheme.m}-of-${vault.scheme.n}`];
    return (
      <Box>
        <Box>
          <Text color={`${colorMode}.secondaryText`} style={styles.desc}>
            {vaultTranslation.Vault3_5CreatedModalDesc1}
          </Text>
          <Text color={`${colorMode}.secondaryText`} style={styles.desc}>
            {vaultTranslation.Vault3_5CreatedModalDesc2}
          </Text>
        </Box>
        <Box style={styles.illustrationContainer}>
          <SuccessIllustration />
        </Box>
        <Box>
          <Text color={`${colorMode}.secondaryText`} style={styles.descText}>
            {vaultTranslation.Vault3_5CreatedModalDesc3}
          </Text>
        </Box>
      </Box>
    );
  }

  function TimeLockWalletCreatedContent(vault: Vault) {
    return (
      <Box>
        <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.walletVaultInfoContainer}>
          <Box style={styles.walletVaultInfoWrapper}>
            <Box style={styles.iconWrapper}>
              <HexagonIcon
                width={44}
                height={38}
                backgroundColor="rgba(45, 103, 89, 1)"
                icon={<VaultIcon />}
              />
            </Box>
            <Box>
              {vault.presentationData.description ? (
                <Text fontSize={12} color={`${colorMode}.secondaryText`}>
                  {vault.presentationData.description}
                </Text>
              ) : null}
              <Text color={`${colorMode}.greenText`} medium style={styles.titleText}>
                {vault.presentationData.name}
              </Text>
            </Box>
          </Box>
        </Box>
        <Box>
          <Text color={`${colorMode}.secondaryText`} style={styles.descText}>
            {vaultTranslation.VaultCreatedModalDesc}
          </Text>
        </Box>
      </Box>
    );
  }
  function TimeLockInfoModalContent() {
    return (
      <Box style={styles.timelockContent}>
        <CautionIllustration style={styles.cautionIllustration} />
        <Note title={common.note} subtitle={vaultTranslation.timeLockSetupNote} />
      </Box>
    );
  }

  function SingleSigWallet(vault: Vault) {
    const tags = ['SINGLE-KEY', 'COLD'];
    return (
      <Box>
        <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.walletVaultInfoContainer}>
          <Box style={styles.pillsContainer}>
            {tags?.map((tag, index) => {
              return (
                <CardPill
                  key={tag}
                  heading={tag}
                  backgroundColor={
                    index % 2 !== 0 ? null : `${colorMode}.SignleSigCardPillBackColor`
                  }
                />
              );
            })}
          </Box>
          <Box style={styles.walletVaultInfoWrapper}>
            <Box style={styles.iconWrapper}>
              <HexagonIcon
                width={44}
                height={38}
                backgroundColor="rgba(45, 103, 89, 1)"
                icon={<VaultIcon />}
              />
            </Box>
            <Box>
              {vault.presentationData.description ? (
                <Text fontSize={12} color={`${colorMode}.secondaryText`}>
                  {vault.presentationData.description}
                </Text>
              ) : null}
              <Text color={`${colorMode}.greenText`} medium style={styles.titleText}>
                {vault.presentationData.name}
              </Text>
            </Box>
          </Box>
        </Box>
        <Box>
          <Text color={`${colorMode}.secondaryText`} style={styles.descText}>
            {vaultTranslation.VaultCreatedModalDesc}
          </Text>
        </Box>
      </Box>
    );
  }

  const viewVault = () => {
    setVaultCreatedModalVisible(false);
    const navigationState = {
      index: 1,
      routes: [
        { name: 'Home' },
        {
          name: 'VaultDetails',
          params: { vaultId: generatedVaultId, vaultTransferSuccessful: true },
        },
      ],
    };
    navigation.dispatch(CommonActions.reset(navigationState));
  };

  const viewAddEmail = () => {
    setVaultCreatedModalVisible(false);
    navigation.dispatch(CommonActions.navigate('IKSAddEmailPhone', { vaultId: generatedVaultId }));
  };

  return (
    <Box backgroundColor={`${colorMode}.primaryBackground`} flex={1}>
      <SafeAreaView style={styles.topContainer}>
        <Box style={styles.topSection}>
          <KeeperHeader
            title={
              isCollaborativeFlow
                ? vaultTranslation.chooseCoSigner
                : !isReserveKeyFlow
                ? signer.addKeys
                : signer.inheritanceKey
            }
            subtitle={
              isCollaborativeFlow
                ? vaultTranslation.forYourCollabVault
                : !isReserveKeyFlow
                ? subtitle
                : signer.designateAsInheritanceKey
            }
            icon={
              !isCollaborativeFlow && (
                <HexagonIcon
                  width={44}
                  height={38}
                  backgroundColor={Colors.pantoneGreen}
                  icon={!isReserveKeyFlow ? <VaultIcon /> : <KEEPERAPPLIGHT />}
                />
              )
            }
            // To-Do-Learn-More
          />
        </Box>
        <VaultMigrationController
          vaultCreating={vaultCreating}
          vaultKeys={vaultKeys}
          scheme={scheme}
          name={name}
          description={description}
          vaultId={vaultId}
          setGeneratedVaultId={setGeneratedVaultId}
          setCreating={setCreating}
          vaultType={getVaultType({
            isCollaborativeWallet,
            isSSAddition,
            isAssistedWallet,
            isTimeLock,
            isInheritance: isAddInheritanceKey,
          })}
          isTimeLock={route.params.isTimeLock}
          isAddInheritanceKey={isAddInheritanceKey}
          currentBlockHeight={currentBlockHeight}
        />
        <Box flex={1}>
          <Signers
            keyToRotate={keyToRotate}
            showSelection={!keyToRotate}
            signers={activeSigners}
            selectedSigners={selectedSigners}
            setSelectedSigners={setSelectedSigners}
            scheme={scheme}
            colorMode={colorMode}
            vaultKeys={vaultKeys}
            setVaultKeys={setVaultKeys}
            showToast={showToast}
            navigation={navigation}
            vaultId={vaultId}
            signerMap={signerMap}
            setCreating={setCreating}
            isCollaborativeFlow={isCollaborativeFlow}
            isReserveKeyFlow={isReserveKeyFlow}
            signerFilters={signerFilters}
            coSigners={coSigners}
            setExternalKeyAddedModal={setExternalKeyAddedModal}
            setAddedKey={setAddedKey}
            selectedSignersFromParams={selectedSignersFromParams}
          />
        </Box>
        <Footer
          amfSigners={amfSigners}
          invalidSS={invalidSS}
          invalidIKS={invalidIKS}
          invalidMessage={invalidMessage}
          areSignersValid={areSignersValid}
          relayVaultUpdateLoading={relayVaultUpdateLoading}
          colorMode={colorMode}
          setCreating={setCreating}
          isCollaborativeFlow={isCollaborativeFlow}
          isReserveKeyFlow={isReserveKeyFlow}
          isAddInheritanceKey={isAddInheritanceKey}
          currentBlockHeight={currentBlockHeight}
          onGoBack={onGoBack}
          vaultKeys={vaultKeys}
          selectedSigners={selectedSigners}
          name={name}
          description={description}
          scheme={scheme}
          vaultId={vaultId}
        />
        <KeeperModal
          dismissible
          close={() => {}}
          visible={vaultCreatedModalVisible}
          title={
            isSSAddition ? 'Wallet Created Successfully' : vaultTranslation.vaultCreatedSuccessTitle
          }
          subTitle={
            inheritanceSigner
              ? `Your ${newVault?.scheme?.m}-of-${newVault?.scheme?.n} vault has been setup successfully. You can start receiving/transferring bitcoin`
              : `Your ${newVault?.scheme?.m}-of-${newVault?.scheme?.n} vault has been created successfully. Please test the setup before putting in significant amounts.`
          }
          Content={
            isSSAddition
              ? () => SingleSigWallet(newVault)
              : inheritanceSigner
              ? () => Vault3_5CreatedModalContent(newVault)
              : () => VaultCreatedModalContent(newVault)
          }
          buttonText={
            inheritanceSigner
              ? vaultTranslation.addEmail
              : isSSAddition
              ? 'View Wallet'
              : vaultTranslation.ViewVault
          }
          buttonCallback={inheritanceSigner ? viewAddEmail : viewVault}
          secondaryButtonText={inheritanceSigner && common.cancel}
          secondaryCallback={viewVault}
          modalBackground={`${colorMode}.modalWhiteBackground`}
          textColor={`${colorMode}.primaryText`}
          buttonTextColor={`${colorMode}.buttonText`}
          buttonBackground={`${colorMode}.greenButtonBackground`}
          subTitleColor={`${colorMode}.secondaryText`}
          subTitleWidth={wp(280)}
          showCloseIcon={false}
        />
        <KeeperModal
          closeOnOverlayClick
          close={() => {
            setTimeLockWalletCreatedModal(false);
          }}
          visible={timeLockWalletCreatedModal}
          title={vaultTranslation.timeLockCreatedTitle}
          subTitle={vaultTranslation.timeLockCreatedSubtitle}
          buttonText={walletTranslation.ViewWallet}
          modalBackground={`${colorMode}.modalWhiteBackground`}
          textColor={`${colorMode}.primaryText`}
          buttonTextColor={`${colorMode}.buttonText`}
          buttonBackground={`${colorMode}.greenButtonBackground`}
          subTitleColor={`${colorMode}.secondaryText`}
          subTitleWidth={wp(280)}
          showCloseIcon={false}
          Content={() => TimeLockWalletCreatedContent(newVault)}
        />
        <KeeperModal
          closeOnOverlayClick
          close={() => {
            setTimelockCautionModal(false);
          }}
          visible={timeLockCautionModal}
          title={vaultTranslation.timeLockCautionTitle}
          subTitle={vaultTranslation.timeLockCautionSubtitle}
          buttonText={common.continue}
          secondaryButtonText={common.cancel}
          buttonCallback={() => {
            setTimelockCautionModal(false);
            setSelectDurationModal(true);
          }}
          secondaryCallback={() => setTimelockCautionModal(false)}
          modalBackground={`${colorMode}.modalWhiteBackground`}
          textColor={`${colorMode}.primaryText`}
          buttonTextColor={`${colorMode}.buttonText`}
          buttonBackground={`${colorMode}.greenButtonBackground`}
          subTitleColor={`${colorMode}.secondaryText`}
          subTitleWidth={wp(280)}
          showCloseIcon={false}
          Content={TimeLockInfoModalContent}
        />
        <KeeperModal
          closeOnOverlayClick
          close={() => {
            setSelectDurationModal(false);
          }}
          visible={selectDurationModal}
          title={vaultTranslation.timeLockDurationTitle}
          subTitle={vaultTranslation.timeLockDurationSubtitle}
          modalBackground={`${colorMode}.modalWhiteBackground`}
          textColor={`${colorMode}.primaryText`}
          buttonTextColor={`${colorMode}.buttonText`}
          buttonBackground={`${colorMode}.greenButtonBackground`}
          secondaryCallback={() => setSelectDurationModal(false)}
          subTitleColor={`${colorMode}.secondaryText`}
          subTitleWidth={wp(280)}
          showCloseIcon={false}
          Content={() => (
            <Box>
              <Dropdown
                options={TIMELOCK_DURATIONS}
                label="Choose unlock-time"
                onOptionSelect={handleOptionSelect}
                selectedOption={selectedDuration}
              />
              <Box style={styles.buttonContainer}>
                <Buttons
                  paddingHorizontal={wp(20)}
                  primaryText={walletTranslation.Createwallet}
                  primaryCallback={() => {
                    setCreating(true);
                    setSelectDurationModal(false);
                  }}
                  secondaryText={common.cancel}
                  secondaryCallback={() => setSelectDurationModal(false)}
                  primaryDisable={!selectedDuration}
                />
              </Box>
            </Box>
          )}
        />
        <KeyAddedModal
          visible={externalKeyAddedModal}
          close={() => {
            setExternalKeyAddedModal(false);
          }}
          signer={addedKey}
        />
        <KeyAddedModal
          visible={keyAddedModalVisible}
          close={handleModalClose}
          signer={addedSigner}
        />
      </SafeAreaView>
      {inProgress && <ActivityIndicatorView visible={inProgress} />}
    </Box>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
  },
  topSection: {
    height: '17%',
    paddingHorizontal: 20,
    paddingTop: hp(15),
  },
  addedSigners: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: hp(20),
  },
  signerItem: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  bottomContainer: {
    gap: 10,
    paddingHorizontal: wp(32),
    paddingBottom: hp(15),
  },
  noteContainer: {
    width: wp(307),
  },
  signerContainer: {
    width: windowWidth + 2,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    marginLeft: -1,
    marginTop: hp(35),
    flex: 1,
  },
  signerInnetContainer: {
    flex: 1,
    marginTop: hp(35),
  },
  title: {
    marginLeft: wp(25),
    fontSize: 14,
    flex: -1,
  },
  walletVaultInfoContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    marginVertical: 20,
    borderRadius: 10,
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  walletVaultInfoWrapper: {
    flexDirection: 'row',
  },
  iconWrapper: {
    marginRight: 10,
  },
  titleText: {
    fontSize: 14,
  },
  descText: {
    fontSize: 14,
    width: wp(300),
    marginBottom: hp(18),
  },
  illustrationContainer: {
    alignSelf: 'center',
    marginTop: hp(18),
    marginBottom: hp(30),
  },
  desc: {
    marginBottom: hp(18),
  },
  externalKeyModal: {
    alignItems: 'center',
  },
  externalKeyIllustration: {
    marginBottom: hp(20),
  },
  externalKeyText: {
    marginBottom: hp(20),
  },
  cautionIllustration: {
    alignSelf: 'center',
    marginBottom: hp(30),
  },
  timelockContent: {
    marginBottom: hp(10),
  },
  buttonContainer: {
    marginTop: hp(30),
  },
  emptyWrapper: {
    alignSelf: 'center',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: hp(35),
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: hp(3),
  },
  emptySubText: {
    fontSize: 14,
    lineHeight: 20,
    width: wp(206),
    textAlign: 'center',
    marginBottom: hp(30),
  },
  addKeyBtnWrapper: {
    flex: 1,
    minWidth: wp(110),
    marginLeft: wp(15),
    marginRight: wp(25),
    marginTop: hp(1),
  },
});

export default SentryErrorBoundary(AddSigningDevice);
