import { Dimensions, ScrollView, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { Signer, VaultScheme, VaultSigner, signerXpubs } from 'src/core/wallets/interfaces/vault';
import { SignerType, XpubTypes } from 'src/core/wallets/enums';

import Buttons from 'src/components/Buttons';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Note from 'src/components/Note/Note';
import Relay from 'src/services/operations/Relay';
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

const { width } = Dimensions.get('screen');

export const checkSigningDevice = async (id) => {
  try {
    const exisits = await Relay.getSignerIdInfo(id);
    return exisits;
  } catch (err) {
    // ignoring temporarily if the network call fails
    return true;
  }
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
  const { showToast } = useToastMessage();
  const { relayVaultUpdateLoading } = useAppSelector((state) => state.bhr);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  // const [inheritanceInit, setInheritanceInit] = useState(false);
  const {
    name = 'Vault',
    description = 'Secure your sats',
    isInheritance = false,
    vaultId = '',
    scheme,
  } = route.params;

  const { signers } = useSigners();
  const { signerMap } = useSignerMap();
  const [selectedSigners, setSelectedSigners] = useState(new Map());
  const [vaultKeys, setVaultKeys] = useState<VaultSigner[]>([]);
  const { activeVault } = useVault({ vaultId });

  // let { scheme } = route.params;
  // if (scheme && isInheritance) {
  //   scheme = { m: scheme.m, n: scheme.n + 1 };
  // } else if (!scheme && activeVault && !isInheritance) {
  //   scheme = activeVault.scheme;
  //   // added temporarily until we support multiple vaults
  // } else if (!scheme && activeVault && isInheritance) {
  //   scheme = { m: 3, n: 6 };
  // }

  useEffect(() => {
    if (activeVault) {
      const vaultKeys = activeVault.signers;
      setVaultKeys(vaultKeys);
      const updatedSignerMap = new Map();
      vaultKeys.forEach((key) => {
        updatedSignerMap.set(key.masterFingerprint, true);
      });
      setSelectedSigners(new Map(updatedSignerMap));
    }
  }, []);

  const { areSignersValid, amfSigners, invalidSS, invalidIKS, invalidMessage } = useSignerIntel({
    scheme,
    vaultKeys,
    selectedSigners,
    existingKeys: activeVault?.signers || [],
  });

  const triggerVaultCreation = () => {
    setCreating(true);
  };

  const preTitle = 'Add Vault Signing Devices';

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

  const onSignerSelect = (selected, signer: Signer) => {
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
        showToast(
          'You have selected the total (n) keys, please proceed with the creation of vault.'
        );
        return;
      }
      if (isMock || isMultisig) {
        vaultKeys.push({
          ...msXpub,
          masterFingerprint: signer.masterFingerprint,
          xfp: WalletUtilities.getFingerprintFromExtendedKey(
            msXpub.xpub,
            WalletUtilities.getNetworkByType(config.NETWORK_TYPE)
          ),
        });
        setVaultKeys(vaultKeys);
      } else {
        vaultKeys.push({
          ...ssXpub,
          masterFingerprint: signer.masterFingerprint,
          xfp: WalletUtilities.getFingerprintFromExtendedKey(
            ssXpub.xpub,
            WalletUtilities.getNetworkByType(config.NETWORK_TYPE)
          ),
        });
        setVaultKeys(vaultKeys);
      }
      const updatedSignerMap = selectedSigners.set(signer.masterFingerprint, true);
      setSelectedSigners(new Map(updatedSignerMap));
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title={`${preTitle}`} subtitle={subtitle} />
      <VaultMigrationController
        vaultCreating={vaultCreating}
        setCreating={setCreating}
        vaultKeys={vaultKeys}
        scheme={scheme}
        name={name}
        description={description}
        vaultId={vaultId}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box style={styles.signerContainer}>
          {signers.map((signer) => {
            let disabled = false;
            const amfXpub = signer.signerXpubs[XpubTypes.AMF][0];
            const ssXpub = signer.signerXpubs[XpubTypes.P2WPKH][0];
            const msXpub = signer.signerXpubs[XpubTypes.P2WSH][0];
            if (scheme.n > 1 && !msXpub && !amfXpub && !signer.isMock) {
              disabled = true;
            } else if (scheme.n === 1 && !ssXpub && !amfXpub && !signer.isMock) {
              disabled = true;
            }
            return (
              <SignerCard
                disabled={disabled}
                key={signer.masterFingerprint}
                name={signer.signerName}
                description={signer.signerDescription || signer.type}
                icon={SDIcons(signer.type, colorMode !== 'dark').Icon}
                isSelected={!!selectedSigners.get(signer.masterFingerprint)}
                onCardSelect={(selected) => onSignerSelect(selected, signer)}
              />
            );
          })}
          <AddCard
            name={'Add Signer'}
            cardStyles={styles.addCard}
            callback={() =>
              navigation.dispatch(
                CommonActions.navigate('SigningDeviceList', { addSignerFlow: true })
              )
            }
          />
        </Box>
      </ScrollView>
      <Box style={styles.bottomContainer} backgroundColor={`${colorMode}.primaryBackground`}>
        {amfSigners.length ? (
          <Box style={styles.noteContainer}>
            <Note
              title={common.note}
              subtitle={`* ${amfSigners.join(
                ' and '
              )} does not support Testnet directly, so the app creates a proxy Testnet key for you in the beta app`}
            />
          </Box>
        ) : null}
        {invalidSS || invalidIKS ? (
          <Box style={styles.noteContainer}>
            <Note title="WARNING" subtitle={invalidMessage} subtitleColor="error" />
          </Box>
        ) : trezorIncompatible ? (
          <Box style={styles.noteContainer} testID={'view_warning02'}>
            <Note
              title="WARNING"
              subtitle="Trezor multisig is coming soon. Please replace it for now or use it with a sigle sig vault"
              subtitleColor="error"
            />
          </Box>
        ) : null}
        <Buttons
          primaryDisable={!!areSignersValid || !!trezorIncompatible}
          primaryLoading={relayVaultUpdateLoading}
          primaryText="Create Vault"
          primaryCallback={triggerVaultCreation}
          secondaryText="Cancel"
          secondaryCallback={() => {
            navigation.goBack();
          }}
          paddingHorizontal={wp(30)}
        />
      </Box>
      {/* <AddIKS
        vault={activeVault}
        visible={inheritanceInit}
        close={() => setInheritanceInit(false)}
      /> */}
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 20,
  },
  addCard: {
    height: 125,
    width: windowWidth / 3 - windowWidth * 0.05,
    margin: 3,
  },
});

export default AddSigningDevice;
