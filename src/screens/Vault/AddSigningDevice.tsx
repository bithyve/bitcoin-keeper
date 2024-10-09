import { Dimensions, ScrollView, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Signer,
  Vault,
  VaultScheme,
  VaultSigner,
  signerXpubs,
} from 'src/services/wallets/interfaces/vault';
import {
  NetworkType,
  SignerStorage,
  SignerType,
  VaultType,
  XpubTypes,
} from 'src/services/wallets/enums';
import Buttons from 'src/components/Buttons';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Note from 'src/components/Note/Note';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { useAppSelector } from 'src/store/hooks';
import useSignerIntel from 'src/hooks/useSignerIntel';
import useSigners from 'src/hooks/useSigners';
import AddCard from 'src/components/AddCard';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import useSignerMap from 'src/hooks/useSignerMap';
import WalletUtilities from 'src/services/wallets/operations/utils';
import config from 'src/utils/service-utilities/config';
import useVault from 'src/hooks/useVault';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';
import { useDispatch } from 'react-redux';
import { resetRealyVaultState, resetSignersUpdateState } from 'src/store/reducers/bhr';
import { getSignerDescription, getSignerNameFromType } from 'src/hardware';
import Text from 'src/components/KeeperText';
import { errorBourndaryOptions } from 'src/screens/ErrorHandler';
import * as Sentry from '@sentry/react-native';
import idx from 'idx';
import useSubscriptionLevel from 'src/hooks/useSubscriptionLevel';
import { AppSubscriptionLevel } from 'src/models/enums/SubscriptionTier';
import SuccessIllustration from 'src/assets/images/Success.svg';
import TickIcon from 'src/assets/images/tick_icon.svg';
import KeeperModal from 'src/components/KeeperModal';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import CardPill from 'src/components/CardPill';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { useQuery } from '@realm/react';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { SDIcons } from './SigningDeviceIcons';
import VaultMigrationController from './VaultMigrationController';
import SignerCard from '../AddSigner/SignerCard';
import HardwareModalMap, { InteracationMode } from './HardwareModalMap';
import { SETUPCOLLABORATIVEWALLET } from 'src/navigation/contants';
import { setupKeeperSigner } from 'src/hardware/signerSetup';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/services/sentry';
import HWError from 'src/hardware/HWErrorState';
import KeyAddedModal from 'src/components/KeyAddedModal';

const { width } = Dimensions.get('screen');

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
    const updated = selectedSigners.delete(signer.masterFingerprint);
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
    const updatedSignerMap = selectedSigners.set(signer.masterFingerprint, true);
    setSelectedSigners(new Map(updatedSignerMap));
  }
};

const isAssistedKeyValidForScheme = (
  signer: Signer,
  scheme,
  signerMap,
  selectedSigners
): { isValid: boolean; err?: string } => {
  // case 1: scheme based restrictions for assisted keys
  // both assisted keys can be added starting from Vaults w/ m: 2 and n:3
  if (scheme.n < 3) return { isValid: false, err: 'Requires a minimum of 3 Total Keys' };
  else if (scheme.m < 2) return { isValid: false, err: 'Requires a minimum of 2 Required Keys' };

  // case 2: count based restrictions for assisted keys
  const currentAssistedKey = 1; // the assisted key for which the conditions are being checked
  let existingAssistedKeys = 0;
  for (const mfp of selectedSigners.keys()) {
    if (
      signerMap[mfp].type === SignerType.POLICY_SERVER ||
      signerMap[mfp].type === SignerType.INHERITANCEKEY
    ) {
      existingAssistedKeys++;
    }
  }
  const assistedKeys = existingAssistedKeys + currentAssistedKey;

  // Assisted Keys restriction I:  The number of assisted keys should be less than the threshold(m) for a given Vault, such that they can’t form a signing quorum by themselves.
  const cannotFormQuorum = assistedKeys < scheme.m;
  if (!cannotFormQuorum) {
    return {
      isValid: false,
      err: 'Number of assisted keys should be less than the Required Keys',
    };
  }

  // Assisted Keys restriction II: The threshold for the multi-sig should be achievable w/o the assisted keys
  const notRequiredForQuorum = assistedKeys <= scheme.n - scheme.m;
  if (!notRequiredForQuorum) {
    return {
      isValid: false,
      err: 'Required Keys is not achievable without the assisted keys',
    };
  }

  return { isValid: true };
};

const isSignerValidForScheme = (
  signer: Signer,
  scheme,
  signerMap,
  selectedSigners
): { isValid: boolean; err?: string } => {
  const amfXpub = idx(signer, (_) => _.signerXpubs[XpubTypes.AMF][0]);
  const ssXpub = idx(signer, (_) => _.signerXpubs[XpubTypes.P2WPKH][0]);
  const msXpub = idx(signer, (_) => _.signerXpubs[XpubTypes.P2WSH][0]);

  if (
    (scheme.n > 1 && !msXpub && !amfXpub && !signer.isMock) ||
    (scheme.n === 1 && !ssXpub && !amfXpub && !signer.isMock)
  ) {
    return { isValid: false };
  }

  if (signer.type === SignerType.POLICY_SERVER || signer.type === SignerType.INHERITANCEKEY) {
    return isAssistedKeyValidForScheme(signer, scheme, signerMap, selectedSigners);
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
      (key) => keyToRotate && key.masterFingerprint !== keyToRotate?.masterFingerprint
    );
    const isMultisig = scheme.n > 1;
    const modifiedVaultKeysForScriptType = [];
    const updatedSignerMap = new Map();
    vaultKeys.forEach((key) => {
      const signer = signerMap[key.masterFingerprint];
      if (isSignerValidForScheme(signer, scheme, signerMap, selectedSigners).isValid) {
        if (modifiedVaultKeysForScriptType.length < scheme.n) {
          updatedSignerMap.set(key.masterFingerprint, true);
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
  return vaultKeys.filter((key) => signerMap[key.masterFingerprint].type === type);
};

function Footer({
  amfSigners,
  invalidSS,
  invalidIKS,
  invalidMessage,
  areSignersValid,
  relayVaultUpdateLoading,
  common,
  colorMode,
  setCreating,
  isCollaborativeFlow,
  vaultKeys,
  onGoBack,
  selectedSigners,
}) {
  const navigation = useNavigation();
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

  const isProceedDisabled = isCollaborativeFlow && selectedSigners.size === 0;
  return (
    <Box style={styles.bottomContainer} backgroundColor={`${colorMode}.primaryBackground`}>
      {!isCollaborativeFlow && renderNotes()}
      {!isCollaborativeFlow ? (
        <Buttons
          primaryDisable={!!areSignersValid}
          primaryLoading={relayVaultUpdateLoading}
          primaryText="Proceed"
          primaryCallback={() => setCreating(true)}
          paddingHorizontal={wp(30)}
        />
      ) : (
        <Buttons
          primaryDisable={isProceedDisabled}
          primaryLoading={relayVaultUpdateLoading}
          primaryText="Proceed"
          primaryCallback={() => handleProceedButtonClick()}
          paddingHorizontal={wp(30)}
        />
      )}
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
  coSigners,
}) {
  const { level } = useSubscriptionLevel();
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [showSSModal, setShowSSModal] = useState(false);
  const isMultisig = scheme.n !== 1;
  const { primaryMnemonic }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const close = () => setVisible(false);
  const closeSSModal = () => setShowSSModal(false);

  const setupSignigngServer = async () => {
    setShowSSModal(true);
  };

  const setupInheritanceKey = async () => {
    setVisible(true);
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
    let hasInheritanceKey = false; // actual inheritance key present?
    let isSigningServerShellCreated = false;
    let isInheritanceKeyShellCreated = false;

    if (shellKeys.filter((signer) => signer.type === SignerType.POLICY_SERVER).length > 0)
      isSigningServerShellCreated = true;

    if (shellKeys.filter((signer) => signer.type === SignerType.INHERITANCEKEY).length > 0)
      isInheritanceKeyShellCreated = true;

    for (const signer of signers) {
      if (signer.type === SignerType.POLICY_SERVER) hasSigningServer = true;
      else if (signer.type === SignerType.INHERITANCEKEY) hasInheritanceKey = true;
    }

    if (!isSigningServerShellCreated && !hasSigningServer && level >= AppSubscriptionLevel.L2)
      shellKeys.push(generateShellAssistedKey(SignerType.POLICY_SERVER));

    if (!isInheritanceKeyShellCreated && !hasInheritanceKey && level >= AppSubscriptionLevel.L3)
      shellKeys.push(generateShellAssistedKey(SignerType.INHERITANCEKEY));

    const addedSignersTypes = signers.map((signer) => signer.type);
    return shellKeys.filter((shellSigner) => !addedSignersTypes.includes(shellSigner.type));
  }, [signers]);

  const renderAssistedKeysShell = () => {
    return shellAssistedKeys.map((shellSigner) => {
      const isAMF = false;
      return (
        <SignerCard
          key={shellSigner.masterFingerprint}
          onCardSelect={() => {
            if (shellSigner.type === SignerType.POLICY_SERVER) setupSignigngServer();
            else if (shellSigner.type === SignerType.INHERITANCEKEY) setupInheritanceKey();
          }}
          name={getSignerNameFromType(shellSigner.type, shellSigner.isMock, isAMF)}
          description="Setup required"
          icon={SDIcons(shellSigner.type, colorMode !== 'dark').Icon}
          showSelection={false}
          showDot={true}
          isFullText
          colorVarient="green"
          colorMode={colorMode}
        />
      );
    });
  };

  const renderSigners = useCallback(() => {
    const myAppKeys = getSelectedKeysByType(vaultKeys, signerMap, SignerType.MY_KEEPER);
    const signerCards = signers.map((signer) => {
      if (signer.archived) return null;
      const { isValid, err } = isSignerValidForScheme(signer, scheme, signerMap, selectedSigners);
      const disabled =
        !isValid ||
        (signer.type === SignerType.MY_KEEPER &&
          myAppKeys.length >= 1 &&
          myAppKeys[0].masterFingerprint !== signer.masterFingerprint) ||
        // disabled selection during change key flow
        (keyToRotate &&
          (keyToRotate.masterFingerprint === signer.masterFingerprint ||
            selectedSigners.get(signer.masterFingerprint)));
      return (
        <SignerCard
          showSelection={showSelection}
          disabled={disabled}
          key={signer.masterFingerprint}
          name={
            !signer.isBIP85
              ? getSignerNameFromType(signer.type, signer.isMock, false)
              : `${getSignerNameFromType(signer.type, signer.isMock, false)} +`
          }
          description={getSignerDescription(signer.type, signer.extraData?.instanceNumber, signer)}
          icon={SDIcons(signer.type, colorMode !== 'dark').Icon}
          isSelected={!!selectedSigners.get(signer.masterFingerprint)}
          onCardSelect={(selected) => {
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
  }, [signers]);

  const renderCollaborativeSigners = useCallback(() => {
    const myAppKeys = getSelectedKeysByType(vaultKeys, signerMap, SignerType.MY_KEEPER);
    const anySignerSelected = [...selectedSigners.values()].some((selected) => selected);
    const validCoSigners = coSigners.filter((signer) => signer);
    const coSignersMap = new Map(validCoSigners.map((signer) => [signer.masterFingerprint, true]));

    const signerCards = signers
      .filter((signer) => signer.type === SignerType.KEEPER && !signer.archived)
      .map((signer) => {
        const { isValid, err } = isSignerValidForScheme(signer, scheme, signerMap, selectedSigners);
        const isCoSigner = coSignersMap.has(signer.masterFingerprint);
        const disabled =
          !isValid ||
          (signer.type === SignerType.MY_KEEPER &&
            myAppKeys.length >= 1 &&
            myAppKeys[0].masterFingerprint !== signer.masterFingerprint) ||
          (anySignerSelected && !selectedSigners.get(signer.masterFingerprint)) ||
          isCoSigner;

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
            isFromSiginingList={true}
            key={signer.masterFingerprint}
            name={
              !signer.isBIP85
                ? getSignerNameFromType(signer.type, signer.isMock)
                : `${getSignerNameFromType(signer.type, signer.isMock)} +`
            }
            description={getSignerDescription(
              signer.type,
              signer.extraData?.instanceNumber,
              signer
            )}
            icon={SDIcons(signer.type, colorMode !== 'dark').Icon}
            isSelected={!!selectedSigners.get(signer.masterFingerprint) || isCoSigner}
            onCardSelect={handleCardSelect}
            colorMode={colorMode}
          />
        );
      });

    return signerCards;
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

  const signer: Signer = keyToRotate ? signerMap[keyToRotate.masterFingerprint] : null;

  const onQrScan = async (qrData, resetQR) => {
    try {
      let hw: { signer: Signer; key: VaultSigner };
      hw = setupKeeperSigner(qrData);
      if (hw) {
        dispatch(addSigningDevice([hw.signer]));
        showToast(
          `${hw.signer.signerName} added successfully`,
          <TickIcon />,
          IToastCategory.SIGNING_DEVICE
        );
        navigation.dispatch(CommonActions.goBack());
      }
    } catch (error) {
      if (error instanceof HWError) {
        showToast(error.message, <ToastErrorIcon />);
        resetQR();
      } else {
        captureError(error);
        showToast(
          `Invalid QR, please scan the QR from a ${getSignerNameFromType(SignerType.KEEPER)}`,
          <ToastErrorIcon />
        );
        navigation.goBack();
      }
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Box style={styles.signerContainer}>
        {signers.length ? (
          <Box style={styles.gap10}>
            <Text color={`${colorMode}.headerText`} bold style={styles.title} numberOfLines={2}>
              {keyToRotate
                ? `Choose the key to be rotated with ${getSignerNameFromType(signer.type)} (${
                    keyToRotate.masterFingerprint
                  })`
                : 'Choose from already added keys'}
            </Text>
            <Box style={styles.addedSigners}>
              {!isCollaborativeFlow ? (
                <>
                  {renderSigners()}
                  {renderAssistedKeysShell()}
                </>
              ) : (
                <>{renderCollaborativeSigners()}</>
              )}
            </Box>
          </Box>
        ) : null}
        {
          <Box style={styles.gap10}>
            <Text color={`${colorMode}.headerText`} bold style={styles.title}>
              {signers.length ? 'or' : ''} add a new key
            </Text>
            <AddCard
              name="Add a key"
              cardStyles={styles.addCard}
              callback={
                !isCollaborativeFlow
                  ? () =>
                      navigation.dispatch(
                        CommonActions.navigate('SigningDeviceList', {
                          scheme,
                          vaultId,
                          vaultSigners: vaultKeys,
                        })
                      )
                  : () => {
                      navigation.dispatch(
                        CommonActions.navigate({
                          name: 'ScanQR',
                          params: {
                            title: `Setting up ${getSignerNameFromType(SignerType.KEEPER)}`,
                            subtitle: 'Please scan until all the QR data has been retrieved',
                            onQrScan,
                            setup: true,
                            type: SignerType.KEEPER,
                          },
                        })
                      );
                    }
              }
            />
          </Box>
        }
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
      </Box>
    </ScrollView>
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
    addSignerFlow = false,
    showModal = false,
  } = route.params;
  const { showToast } = useToastMessage();
  const { relayVaultUpdateLoading } = useAppSelector((state) => state.bhr);
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultTranslation, common, signer } = translations;
  const [keyAddedModalVisible, setKeyAddedModalVisible] = useState(false);

  const { signers } = useSigners();
  // filter out archived & hidden signers
  const activeSigners = signers.filter((signer) => !signer.archived && !signer.hidden);
  const { signerMap } = useSignerMap();
  const [selectedSigners, setSelectedSigners] = useState(new Map());
  const [vaultKeys, setVaultKeys] = useState<VaultSigner[]>([]);
  const { activeVault, allVaults } = useVault({ vaultId });
  const isCollaborativeWallet = activeVault?.type == VaultType.COLLABORATIVE;
  const isCollaborativeFlow = parentScreen === SETUPCOLLABORATIVEWALLET;

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
    realySignersUpdateErrorMessage,
  } = useAppSelector((state) => state.bhr);

  const dispatch = useDispatch();

  const [generatedVaultId, setGeneratedVaultId] = useState('');
  const newVault = allVaults.filter((v) => v.id === generatedVaultId)[0];
  const [vaultCreatedModalVisible, setVaultCreatedModalVisible] = useState(false);

  const { vaultSigners: keys } = useSigners(newVault?.id);
  const inheritanceSigner = keys.filter((signer) => signer?.type === SignerType.INHERITANCEKEY)[0];

  const handleModalClose = () => {
    setKeyAddedModalVisible(false);
    navigation.dispatch(CommonActions.setParams({ showModal: false }));
  };
  useEffect(() => {
    if (realySignersUpdateErrorMessage) {
      showToast(realySignersUpdateErrorMessage);
      dispatch(resetSignersUpdateState());
    }
    return () => {
      dispatch(resetSignersUpdateState());
    };
  }, [realySignersUpdateErrorMessage]);

  useEffect(() => {
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
      showToast(`Error: ${realyVaultErrorMessage}`, <ToastErrorIcon />);
      dispatch(resetRealyVaultState());
      setCreating(false);
    }
  }, [relayVaultUpdate, relayVaultError]);

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

  useEffect(() => {
    if (showModal) {
      setKeyAddedModalVisible(true);
    }
  }, [showModal]);

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
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={signer.addKeys}
        subtitle={subtitle}
        icon={
          <HexagonIcon
            width={44}
            height={38}
            backgroundColor={Colors.pantoneGreen}
            icon={<VaultIcon />}
          />
        }
        // To-Do-Learn-More
      />
      <VaultMigrationController
        vaultCreating={vaultCreating}
        vaultKeys={vaultKeys}
        scheme={scheme}
        name={isSSAddition ? 'Air-gapped Wallet' : name}
        description={isSSAddition ? 'External signing device' : description}
        vaultId={vaultId}
        setGeneratedVaultId={setGeneratedVaultId}
        vaultType={
          isCollaborativeWallet
            ? VaultType.COLLABORATIVE
            : isSSAddition
            ? VaultType.SINGE_SIG
            : VaultType.DEFAULT
        }
      />
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
        coSigners={coSigners}
      />
      <Footer
        amfSigners={amfSigners}
        invalidSS={invalidSS}
        invalidIKS={invalidIKS}
        invalidMessage={invalidMessage}
        areSignersValid={areSignersValid}
        relayVaultUpdateLoading={relayVaultUpdateLoading}
        common={common}
        colorMode={colorMode}
        setCreating={setCreating}
        isCollaborativeFlow={isCollaborativeFlow}
        onGoBack={onGoBack}
        vaultKeys={vaultKeys}
        selectedSigners={selectedSigners}
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
        showButtons
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.primaryText`}
        buttonTextColor={`${colorMode}.buttonText`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        subTitleWidth={wp(280)}
        showCloseIcon={false}
      />
      <KeyAddedModal visible={keyAddedModalVisible} close={handleModalClose} signer={addedSigner} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  signerItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: hp(25),
  },
  addedSigners: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  signerItem: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  remove: {
    height: 26,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: '#FAC48B',
    justifyContent: 'center',
  },
  bottomContainer: {
    paddingHorizontal: 15,
    gap: 20,
  },
  noteContainer: {
    width: wp(330),
  },
  descriptionBox: {
    height: 24,
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
  backArrow: {
    width: '15%',
    alignItems: 'center',
  },
  signerContainer: {
    width: windowWidth,
    gap: 60,
    paddingBottom: 20,
    marginTop: 20,
  },
  addCard: {
    height: 125,
    width: windowWidth / 3 - windowWidth * 0.05,
    margin: 3,
  },
  gap10: {
    gap: 10,
  },
  title: {
    width: '90%',
    marginLeft: 15,
    fontSize: 14,
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
    fontSize: 13,
    width: wp(300),
    marginBottom: hp(18),
  },
  addPhoneEmailWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(20),
    paddingVertical: hp(10),
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  titleWrapper: {
    width: '75%',
  },
  addPhoneEmailTitle: {
    fontSize: 14,
  },
  addPhoneEmailSubTitle: {
    fontSize: 12,
  },
  illustrationContainer: {
    alignSelf: 'center',
    marginTop: hp(18),
    marginBottom: hp(30),
  },
  desc: {
    marginBottom: hp(18),
  },
});

export default Sentry.withErrorBoundary(AddSigningDevice, errorBourndaryOptions);
