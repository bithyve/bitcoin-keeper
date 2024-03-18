import { Dimensions, ScrollView, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import {
  Signer,
  Vault,
  VaultScheme,
  VaultSigner,
  signerXpubs,
} from 'src/services/wallets/interfaces/vault';
import { NetworkType, SignerType, XpubTypes } from 'src/services/wallets/enums';
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
import useToastMessage from 'src/hooks/useToastMessage';
import useSignerMap from 'src/hooks/useSignerMap';
import WalletUtilities from 'src/services/wallets/operations/utils';
import config from 'src/utils/service-utilities/config';
import useVault from 'src/hooks/useVault';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';
import { useDispatch } from 'react-redux';
import { resetSignersUpdateState } from 'src/store/reducers/bhr';
import { getSignerDescription, getSignerNameFromType } from 'src/hardware';
import Text from 'src/components/KeeperText';
import SignerCard from '../AddSigner/SignerCard';
import VaultMigrationController from './VaultMigrationController';
import { SDIcons } from './SigningDeviceIcons';
import { errorBourndaryOptions } from 'src/screens/ErrorHandler';
import * as Sentry from '@sentry/react-native';

const { width } = Dimensions.get('screen');

const getKeyForScheme = (isMock, isMultisig, signer, msXpub, ssXpub, amfXpub) => {
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
  if (isMock || isMultisig) {
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
    const scriptKey = getKeyForScheme(isMock, isMultisig, signer, msXpub, ssXpub, amfXpub);
    vaultKeys.push(scriptKey);
    setVaultKeys(vaultKeys);
    const updatedSignerMap = selectedSigners.set(signer.masterFingerprint, true);
    setSelectedSigners(new Map(updatedSignerMap));
  }
};

const isSignerValidForScheme = (signer: Signer, scheme, signerMap, selectedSigners) => {
  const amfXpub = signer.signerXpubs[XpubTypes.AMF][0];
  const ssXpub = signer.signerXpubs[XpubTypes.P2WPKH][0];
  const msXpub = signer.signerXpubs[XpubTypes.P2WSH][0];
  if (
    (scheme.n > 1 && !msXpub && !amfXpub && !signer.isMock) ||
    (scheme.n === 1 && !ssXpub && !amfXpub && !signer.isMock)
  ) {
    return false;
  }

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

const setInitialKeys = (
  activeVault,
  scheme,
  allVaults,
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
          const scriptKey = getKeyForScheme(
            signer.isMock,
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
  trezorIncompatible,
  invalidMessage,
  areSignersValid,
  relayVaultUpdateLoading,
  common,
  colorMode,
  setCreating,
  navigation,
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
  allVaults,
  signerMap,
}) {
  const renderSigners = () => {
    const myAppKeys = getSelectedKeysByType(vaultKeys, signerMap, SignerType.MY_KEEPER);
    return signers.map((signer) => {
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
        />
      );
    });
  };
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Box style={styles.signerContainer}>
        {signers.length ? (
          <Box style={styles.gap10}>
            <Text color={`${colorMode}.headerText`} bold style={styles.title}>
              Choose from already added keys
            </Text>
            <Box style={styles.addedSigners}>{renderSigners()}</Box>
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
  const { common, signer } = translations;
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

  const { realySignersUpdateErrorMessage } = useAppSelector((state) => state.bhr);
  const dispatch = useDispatch();

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
    setInitialKeys(
      activeVault,
      scheme,
      allVaults,
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
        allVaults={allVaults}
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
        navigation={navigation}
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
});

export default Sentry.withErrorBoundary(AddSigningDevice, errorBourndaryOptions);
