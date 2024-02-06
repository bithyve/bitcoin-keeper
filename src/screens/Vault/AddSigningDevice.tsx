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
} from 'src/core/wallets/interfaces/vault';
import { SignerType, XpubTypes } from 'src/core/wallets/enums';
import Buttons from 'src/components/Buttons';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Note from 'src/components/Note/Note';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { useAppSelector } from 'src/store/hooks';
import useSignerIntel from 'src/hooks/useSignerIntel';
import { SDIcons } from './SigningDeviceIcons';
import VaultMigrationController from './VaultMigrationController';
import useSigners from 'src/hooks/useSigners';
import SignerCard from '../AddSigner/SignerCard';
import AddCard from 'src/components/AddCard';
import useToastMessage from 'src/hooks/useToastMessage';
import useSignerMap from 'src/hooks/useSignerMap';
import WalletUtilities from 'src/core/wallets/operations/utils';
import config from 'src/core/config';
import useVault from 'src/hooks/useVault';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';

const { width } = Dimensions.get('screen');

const getKeyForScheme = (isMock, isMultisig, signer, msXpub, ssXpub) => {
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

  const isMock = !!amfXpub || signer.isMock;
  const isMultisig = msXpub && scheme.n > 1;

  if (selected) {
    const updated = selectedSigners.delete(signer.masterFingerprint);
    if (updated) {
      if (isMock) {
        const updatedKeys = vaultKeys.filter(
          (key) => (msXpub && key.xpub !== msXpub.xpub) || (amfXpub && key.xpub !== amfXpub.xpub)
        );
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
    const scriptKey = getKeyForScheme(isMock, isMultisig, signer, msXpub, ssXpub);
    vaultKeys.push(scriptKey);
    setVaultKeys(vaultKeys);
    const updatedSignerMap = selectedSigners.set(signer.masterFingerprint, true);
    setSelectedSigners(new Map(updatedSignerMap));
  }
};

const isSignerValidForScheme = (signer: Signer, scheme, allVaults: Vault[], signerMap) => {
  const amfXpub = signer.signerXpubs[XpubTypes.AMF][0];
  const ssXpub = signer.signerXpubs[XpubTypes.P2WPKH][0];
  const msXpub = signer.signerXpubs[XpubTypes.P2WSH][0];
  if (
    (scheme.n > 1 && !msXpub && !amfXpub && !signer.isMock) ||
    (scheme.n === 1 && !ssXpub && !amfXpub && !signer.isMock)
  ) {
    return false;
  }

  if (signer.type === SignerType.POLICY_SERVER) {
    if (scheme.m < 2 || scheme.n < 3) return false; // signing server key can be added for Vaults w/ m: 2 and n:3
  } else if (signer.type === SignerType.INHERITANCEKEY) {
    // inheritance key can be added for Vaults w/ at least 5 keys
    if (scheme.m < 3 || scheme.n < 5) return false;

    // TEMP: Disabling multiple IKS
    let IKSExists = false;
    for (const vault of allVaults) {
      vault.signers.forEach((key) => {
        if (signerMap[key.masterFingerprint]?.type === SignerType.INHERITANCEKEY) IKSExists = true;
      });
    }
    if (IKSExists) return false;
  }

  return true;
};

const setInitialKeys = (
  activeVault,
  scheme,
  allVaults,
  signerMap,
  setVaultKeys,
  setSelectedSigners
) => {
  if (activeVault) {
    // setting initital keys (update if scheme has changed)
    const vaultKeys = activeVault.signers;
    const isMultisig = scheme.n > 1;
    const modifiedVaultKeysForScriptType = [];
    const updatedSignerMap = new Map();
    vaultKeys.forEach((key) => {
      const signer = signerMap[key.masterFingerprint];
      if (isSignerValidForScheme(signer, scheme, allVaults, signerMap)) {
        if (modifiedVaultKeysForScriptType.length < scheme.n) {
          updatedSignerMap.set(key.masterFingerprint, true);
          const msXpub: signerXpubs[XpubTypes][0] = signer.signerXpubs[XpubTypes.P2WSH][0];
          const ssXpub: signerXpubs[XpubTypes][0] = signer.signerXpubs[XpubTypes.P2WPKH][0];
          const scriptKey = getKeyForScheme(signer.isMock, isMultisig, signer, msXpub, ssXpub);
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

const Footer = ({
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
}) => {
  const renderNotes = () => {
    let notes = [];
    if (!!amfSigners.length) {
      notes.push(
        <Box style={styles.noteContainer}>
          <Note
            title={common.note}
            subtitle={`* ${amfSigners.join(
              ' and '
            )} does not support Testnet directly, so the app creates a proxy Testnet key for you in the beta app`}
          />
        </Box>
      );
    }
    if (invalidSS || invalidIKS) {
      notes.push(
        <Box style={styles.noteContainer}>
          <Note title="WARNING" subtitle={invalidMessage} subtitleColor="error" />
        </Box>
      );
    }
    if (trezorIncompatible) {
      notes.push(
        <Box style={styles.noteContainer} testID="view_warning02">
          <Note
            title="WARNING"
            subtitle="Trezor multisig is coming soon. Please replace it for now or use it with a sigle sig vault"
            subtitleColor="error"
          />
        </Box>
      );
    }
    if (!notes.length) {
      notes.push(
        <Box style={styles.noteContainer}>
          <Note
            title="Note"
            subtitle="You can easily change one or more signers after the vault is setup"
          />
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
        primaryText="Create Vault"
        primaryCallback={() => setCreating(true)}
        secondaryText="Cancel"
        secondaryCallback={() => {
          navigation.goBack();
        }}
        paddingHorizontal={wp(30)}
      />
    </Box>
  );
};

const Signers = ({
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
}) => {
  const renderSigners = () => {
    return signers.map((signer) => {
      const disabled = !isSignerValidForScheme(signer, scheme, allVaults, signerMap);
      return (
        <SignerCard
          disabled={disabled}
          key={signer.masterFingerprint}
          name={signer.signerName}
          description={signer.signerDescription || signer.type}
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
        <Box style={styles.addedSigners}>{renderSigners()}</Box>
        <AddCard
          name={'Add Signer'}
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
    </ScrollView>
  );
};

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

  useEffect(() => {
    setInitialKeys(activeVault, scheme, allVaults, signerMap, setVaultKeys, setSelectedSigners);
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

  //TODO: add learn more modal
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={signer.addSigners}
        subtitle={subtitle}
        icon={
          <HexagonIcon
            width={44}
            height={38}
            backgroundColor={Colors.pantoneGreen}
            icon={<VaultIcon />}
          />
        }
        learnMore
        learnBackgroundColor={`${colorMode}.RussetBrown`}
        learnTextColor={`${colorMode}.white`}
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
    gap: 40,
    paddingBottom: 20,
    marginTop: 20,
  },
  addCard: {
    height: 125,
    width: windowWidth / 3 - windowWidth * 0.05,
    margin: 3,
  },
});

export default AddSigningDevice;
