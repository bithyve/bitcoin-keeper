import { Dimensions, ScrollView, StyleSheet } from 'react-native';
import { Box, Pressable, useColorMode } from 'native-base';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Signer,
  Vault,
  VaultScheme,
  VaultSigner,
  signerXpubs,
} from 'src/services/wallets/interfaces/vault';
import { NetworkType, SignerStorage, SignerType, XpubTypes } from 'src/services/wallets/enums';
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
import {
  generateSignerFromMetaData,
  getSignerDescription,
  getSignerNameFromType,
} from 'src/hardware';
import Text from 'src/components/KeeperText';
import SignerCard from '../AddSigner/SignerCard';
import VaultMigrationController from './VaultMigrationController';
import { SDIcons } from './SigningDeviceIcons';
import { errorBourndaryOptions } from 'src/screens/ErrorHandler';
import * as Sentry from '@sentry/react-native';
import idx from 'idx';
import useSubscriptionLevel from 'src/hooks/useSubscriptionLevel';
import { AppSubscriptionLevel } from 'src/models/enums/SubscriptionTier';
import InheritanceKeyServer from 'src/services/backend/InheritanceKey';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import TickIcon from 'src/assets/images/tick_icon.svg';
import KeeperModal from 'src/components/KeeperModal';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import CardPill from 'src/components/CardPill';
import AddPhoneEmailIcon from 'src/assets/images/phoneemail.svg';

const { width } = Dimensions.get('screen');

const getKeyForScheme = (isMultisig, signer, msXpub, ssXpub, amfXpub) => {
  if (amfXpub) {
    return {
      ...amfXpub,
      masterFingerprint: signer.masterFingerprint,
      xfp: WalletUtilities.getFingerprintFromExtendedKey(
        amfXpub.xpub,
        WalletUtilities.getNetworkByType(config.NETWORK_TYPE)
      ),
    };
  }
  if (isMultisig) {
    return {
      ...msXpub,
      masterFingerprint: signer.masterFingerprint,
      xfp: WalletUtilities.getFingerprintFromExtendedKey(
        msXpub.xpub,
        WalletUtilities.getNetworkByType(config.NETWORK_TYPE)
      ),
    };
  } else {
    return {
      ...ssXpub,
      masterFingerprint: signer.masterFingerprint,
      xfp: WalletUtilities.getFingerprintFromExtendedKey(
        ssXpub.xpub,
        WalletUtilities.getNetworkByType(config.NETWORK_TYPE)
      ),
    };
  }
};

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
    const scriptKey = getKeyForScheme(isMultisig, signer, msXpub, ssXpub, amfXpub);
    vaultKeys.push(scriptKey);
    setVaultKeys(vaultKeys);
    const updatedSignerMap = selectedSigners.set(signer.masterFingerprint, true);
    setSelectedSigners(new Map(updatedSignerMap));
  }
};

const isAssistedKeyValidForScheme = (signer: Signer, scheme, signerMap, selectedSigners) => {
  if (signer.type === SignerType.POLICY_SERVER || signer.type === SignerType.INHERITANCEKEY) {
    // scheme based restrictions for assisted keys
    if (signer.type === SignerType.POLICY_SERVER) {
      // signing server key can be added starting from Vaults w/ m: 2 and n:3
      if (scheme.m < 2 || scheme.n < 3) return false;
    } else if (signer.type === SignerType.INHERITANCEKEY) {
      // inheritance key can be added starting from Vaults w/ m: 3 and n:5(and even w/ a SS already present, the number of assisted keys < m)
      if (scheme.m < 3 || scheme.n < 5) return false;
    }

    // count based restrictions for assisted keys
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
    const cannotFormQuorum = assistedKeys < scheme.m; // Assisted Keys restriction I:  The number of assisted keys should be less than the threshold(m) for a given Vault, such that they can’t form a signing quorum by themselves.
    const notRequiredForQuorum = assistedKeys <= scheme.n - scheme.m; // Assisted Keys restriction II: The threshold for the multi-sig should be achievable w/o the assisted keys
    if (!cannotFormQuorum || !notRequiredForQuorum) return false;
  }
  return true;
};

const isSignerValidForScheme = (signer: Signer, scheme, signerMap, selectedSigners) => {
  const amfXpub = idx(signer, (_) => _.signerXpubs[XpubTypes.AMF][0]);
  const ssXpub = idx(signer, (_) => _.signerXpubs[XpubTypes.P2WPKH][0]);
  const msXpub = idx(signer, (_) => _.signerXpubs[XpubTypes.P2WSH][0]);

  if (
    (scheme.n > 1 && !msXpub && !amfXpub && !signer.isMock) ||
    (scheme.n === 1 && !ssXpub && !amfXpub && !signer.isMock)
  ) {
    return false;
  }

  if (signer.type === SignerType.POLICY_SERVER || signer.type === SignerType.INHERITANCEKEY) {
    return isAssistedKeyValidForScheme(signer, scheme, signerMap, selectedSigners);
  } else return true;
};

const setInitialKeys = (
  activeVault,
  scheme,
  signerMap,
  setVaultKeys,
  setSelectedSigners,
  selectedSigners
) => {
  if (activeVault) {
    // setting initital keys (update if scheme has changed)
    const vaultKeys = activeVault.signers;
    const isMultisig = scheme.n > 1;
    const modifiedVaultKeysForScriptType = [];
    const updatedSignerMap = new Map();
    vaultKeys.forEach((key) => {
      const signer = signerMap[key.masterFingerprint];
      if (isSignerValidForScheme(signer, scheme, signerMap, selectedSigners)) {
        if (modifiedVaultKeysForScriptType.length < scheme.n) {
          updatedSignerMap.set(key.masterFingerprint, true);
          const msXpub: signerXpubs[XpubTypes][0] = signer.signerXpubs[XpubTypes.P2WSH][0];
          const ssXpub: signerXpubs[XpubTypes][0] = signer.signerXpubs[XpubTypes.P2WPKH][0];
          const amfXpub: signerXpubs[XpubTypes][0] = signer.signerXpubs[XpubTypes.AMF][0];
          const scriptKey = getKeyForScheme(isMultisig, signer, msXpub, ssXpub, amfXpub);
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
  trezorIncompatible,
  invalidMessage,
  areSignersValid,
  relayVaultUpdateLoading,
  common,
  colorMode,
  setCreating,
}) {
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
    if (trezorIncompatible) {
      const message =
        'Trezor multisig is coming soon. Please replace it for now or use it with a sigle sig vault';
      notes.push(
        <Box style={styles.noteContainer} testID="view_warning02" key={message}>
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
  return (
    <Box style={styles.bottomContainer} backgroundColor={`${colorMode}.primaryBackground`}>
      {renderNotes()}
      <Buttons
        primaryDisable={!!areSignersValid || !!trezorIncompatible}
        primaryLoading={relayVaultUpdateLoading}
        primaryText="Proceed"
        primaryCallback={() => setCreating(true)}
        paddingHorizontal={wp(30)}
      />
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
}) {
  const { level } = useSubscriptionLevel();
  const dispatch = useDispatch();

  const navigateToSigningServerSetup = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ChoosePolicyNew',
        params: { signer: undefined, addSignerFlow: false, vaultId: '' },
      })
    );
  };

  const setupInheritanceKey = async () => {
    try {
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

  const renderAssistedKeysShell = useCallback(() => {
    // tier-based, display only, till an actual assisted keys is setup
    const shellAssistedKeys = [];

    const generateShellAssistedKey = (signerType: SignerType): Signer => {
      return {
        type: signerType,
        storageType: SignerStorage.WARM,
        signerName: getSignerNameFromType(signerType, false, false),
        lastHealthCheck: new Date(),
        addedOn: new Date(),
        masterFingerprint: '',
        signerXpubs: {},
        hidden: false,
      };
    };

    let hasSigningServer = false; // actual signing server present?
    let hasInheritanceKey = false; // actual inheritance key present?
    for (let signer of signers) {
      if (signer.type === SignerType.POLICY_SERVER) hasSigningServer = true;
      else if (signer.type === SignerType.INHERITANCEKEY) hasInheritanceKey = true;
    }

    if (!hasSigningServer && level >= AppSubscriptionLevel.L2)
      shellAssistedKeys.push(generateShellAssistedKey(SignerType.POLICY_SERVER));

    if (!hasInheritanceKey && level >= AppSubscriptionLevel.L3)
      shellAssistedKeys.push(generateShellAssistedKey(SignerType.INHERITANCEKEY));

    return shellAssistedKeys.map((shellSigner, index) => {
      const disabled = !isAssistedKeyValidForScheme(
        shellSigner,
        scheme,
        signerMap,
        selectedSigners
      );
      const isAMF = false;
      return (
        <SignerCard
          disabled={disabled}
          key={`${shellSigner.masterFingerprint}_${index}`}
          name={getSignerNameFromType(shellSigner.type, shellSigner.isMock, isAMF)}
          description={'To setup'}
          icon={SDIcons(shellSigner.type, colorMode !== 'dark').Icon}
          isSelected={!!selectedSigners.get(shellSigner.masterFingerprint)} // false
          onCardSelect={() => {
            if (shellSigner.type === SignerType.POLICY_SERVER) navigateToSigningServerSetup();
            else if (shellSigner.type === SignerType.INHERITANCEKEY) setupInheritanceKey();
          }}
          colorMode={colorMode}
        />
      );
    });
  }, []);

  const renderSigners = useCallback(() => {
    const myAppKeys = getSelectedKeysByType(vaultKeys, signerMap, SignerType.MY_KEEPER);
    const signerCards = signers.map((signer) => {
      const disabled =
        !isSignerValidForScheme(signer, scheme, signerMap, selectedSigners) ||
        (signer.type === SignerType.MY_KEEPER &&
          myAppKeys.length >= 1 &&
          myAppKeys[0].masterFingerprint !== signer.masterFingerprint);
      const isAMF =
        signer.type === SignerType.TAPSIGNER &&
        config.NETWORK_TYPE === NetworkType.TESTNET &&
        !signer.isMock;
      return (
        <SignerCard
          disabled={disabled}
          key={signer.masterFingerprint}
          name={getSignerNameFromType(signer.type, signer.isMock, isAMF)}
          description={getSignerDescription(signer.type, signer.extraData?.instanceNumber, signer)}
          icon={SDIcons(signer.type, colorMode !== 'dark').Icon}
          isSelected={!!selectedSigners.get(signer.masterFingerprint)}
          onCardSelect={(selected) =>
            onSignerSelect(
              selected,
              signer,
              scheme,
              vaultKeys,
              setVaultKeys,
              selectedSigners,
              setSelectedSigners,
              showToast
            )
          }
          colorMode={colorMode}
        />
      );
    });
    return signerCards;
  }, [signers]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Box style={styles.signerContainer}>
        {signers.length ? (
          <Box style={styles.gap10}>
            <Text color={`${colorMode}.headerText`} bold style={styles.title}>
              Choose from already added keys
            </Text>
            <Box style={styles.addedSigners}>
              <>
                {renderSigners()}
                {renderAssistedKeysShell()}
              </>
            </Box>
          </Box>
        ) : null}
        <Box style={styles.gap10}>
          <Text color={`${colorMode}.headerText`} bold style={styles.title}>
            {signers.length ? 'or' : ''} add a new key
          </Text>
          <AddCard
            name="Add a key"
            cardStyles={styles.addCard}
            callback={() =>
              navigation.dispatch(
                CommonActions.navigate('SigningDeviceList', {
                  scheme,
                  vaultId,
                  vaultSigners: vaultKeys,
                })
              )
            }
          />
        </Box>
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
    };
  };
  const {
    name = 'Vault',
    description = '',
    isInheritance = false,
    vaultId = '',
    scheme,
  } = route.params;
  const { showToast } = useToastMessage();
  const { relayVaultUpdateLoading } = useAppSelector((state) => state.bhr);
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultTranslation, common, signer } = translations;

  const { signers } = useSigners();
  const { signerMap } = useSignerMap();
  const [selectedSigners, setSelectedSigners] = useState(new Map());
  const [vaultKeys, setVaultKeys] = useState<VaultSigner[]>([]);
  const { activeVault, allVaults } = useVault({ vaultId });

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
      showToast(`Vault Creation Failed ${realyVaultErrorMessage}`, <ToastErrorIcon />);
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
      selectedSigners
    );
  }, []);

  const subtitle =
    scheme.n > 1
      ? `Vault with a ${scheme.m} of ${scheme.n} setup will be created${
          isInheritance ? ' for Inheritance' : ''
        }`
      : `Vault with ${scheme.m} of ${scheme.n} setup will be created`;

  let trezorIncompatible = false;
  if (scheme.n > 1) {
    for (const mfp of selectedSigners.keys()) {
      if (signerMap[mfp].type === SignerType.TREZOR) {
        trezorIncompatible = true;
        break;
      }
    }
  }

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
                backgroundColor={'rgba(45, 103, 89, 1)'}
                icon={<VaultIcon />}
              />
            </Box>
            <Box>
              {vault.presentationData.description && (
                <Text fontSize={12} color={`${colorMode}.secondaryText`}>
                  {vault.presentationData.description}
                </Text>
              )}
              <Text color={`${colorMode}.greenText`} medium style={styles.titleText}>
                {vault.presentationData.name}
              </Text>
            </Box>
          </Box>
        </Box>
        <Box>
          <Text color={`${colorMode}.secondaryText`} style={styles.descText}>
            You should ensure you have a copy of the wallet configuration file for this vault
          </Text>
        </Box>
        {inheritanceSigner && (
          <Pressable
            backgroundColor={`${colorMode}.pantoneGreenLight`}
            borderColor={`${colorMode}.pantoneGreen`}
            style={styles.addPhoneEmailWrapper}
            onPress={() => {
              navigation.dispatch(
                CommonActions.navigate('IKSAddEmailPhone', { vaultId: vault.id })
              );
              setVaultCreatedModalVisible(false);
            }}
          >
            <Box style={styles.iconWrapper}>
              <AddPhoneEmailIcon />
            </Box>
            <Box style={styles.titleWrapper}>
              <Text style={styles.addPhoneEmailTitle} medium color={`${colorMode}.pantoneGreen`}>
                {vaultTranslation.addEmailPhone}
              </Text>
              <Text style={styles.addPhoneEmailSubTitle} color={`${colorMode}.primaryText`}>
                {vaultTranslation.addEmailVaultDetail}
              </Text>
            </Box>
          </Pressable>
        )}
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
        setCreating={setCreating}
        vaultKeys={vaultKeys}
        scheme={scheme}
        name={name}
        description={description}
        vaultId={vaultId}
        generatedVaultId={generatedVaultId}
        setGeneratedVaultId={setGeneratedVaultId}
      />
      <Signers
        signers={signers}
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
      />
      <Footer
        amfSigners={amfSigners}
        invalidSS={invalidSS}
        invalidIKS={invalidIKS}
        trezorIncompatible={trezorIncompatible}
        invalidMessage={invalidMessage}
        areSignersValid={areSignersValid}
        relayVaultUpdateLoading={relayVaultUpdateLoading}
        common={common}
        colorMode={colorMode}
        setCreating={setCreating}
      />
      <KeeperModal
        dismissible
        close={() => {}}
        visible={vaultCreatedModalVisible}
        title={'Vault Created Successfully!'}
        subTitle={`Your ${newVault?.scheme?.m}-of-${newVault?.scheme?.n} vault has been created successfully. Please test the setup before putting in significant amounts.`}
        Content={() => VaultCreatedModalContent(newVault)}
        buttonText={'View Vault'}
        buttonCallback={viewVault}
        showButtons
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.primaryText`}
        subTitleColor={`${colorMode}.secondaryText`}
        subTitleWidth={wp(280)}
        showCloseIcon={false}
      />
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
});

export default Sentry.withErrorBoundary(AddSigningDevice, errorBourndaryOptions);
