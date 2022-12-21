import { Dimensions, Pressable } from 'react-native';
import { Box, FlatList, HStack, Text, VStack } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { DerivationPurpose, SignerType, VaultMigrationType } from 'src/core/wallets/enums';
import {
  addSigningDevice,
  removeSigningDevice,
  updateSigningDevice,
} from 'src/store/reducers/vaults';

import AddIcon from 'src/assets/images/green_add.svg';
import Buttons from 'src/components/Buttons';
import HeaderTitle from 'src/components/HeaderTitle';
import IconArrowBlack from 'src/assets/images/svgs/icon_arrow_black.svg';
import { LocalizationContext } from 'src/common/content/LocContext';
import Note from 'src/components/Note/Note';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import Relay from 'src/core/services/operations/Relay';
import { ScaledSheet } from 'react-native-size-matters';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { hp, windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import moment from 'moment';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { getPlaceholder } from 'src/common/utilities';
import usePlan from 'src/hooks/usePlan';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { WalletMap } from './WalletMap';
import DescriptionModal from './components/EditDescriptionModal';
import VaultMigrationController from './VaultMigrationController';

const { width } = Dimensions.get('screen');

const hasPlanChanged = (vault: Vault, subscriptionScheme): VaultMigrationType => {
  if (vault) {
    const currentScheme = vault.scheme;
    if (currentScheme.m > subscriptionScheme.m) {
      return VaultMigrationType.DOWNGRADE;
    }
    if (currentScheme.m < subscriptionScheme.m) {
      return VaultMigrationType.UPGRADE;
    }
    return VaultMigrationType.CHANGE;
  }
  return VaultMigrationType.CHANGE;
};

export const checkSigningDevice = async (id) => {
  try {
    const exisits = await Relay.getSignerIdInfo(id);
    return exisits;
  } catch (err) {
    // ignoring temporarily if the network call fails
    return true;
  }
};

function SignerItem({ signer, index }: { signer: VaultSigner | undefined; index: number }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { plan } = usePlan();
  const [visible, setVisible] = useState(false);

  const removeSigner = () => dispatch(removeSigningDevice(signer));
  const navigateToSignerList = () =>
    navigation.dispatch(CommonActions.navigate('SigningDeviceList'));
  const openDescriptionModal = () => setVisible(true);
  const closeDescriptionModal = () => setVisible(false);

  if (!signer) {
    return (
      <Pressable onPress={navigateToSignerList}>
        <Box
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 10,
            marginBottom: hp(25),
          }}
        >
          <HStack style={styles.signerItem}>
            <HStack alignItems="center">
              <AddIcon />
              <VStack marginX="4" maxW="64">
                <Text
                  color="light.primaryText"
                  fontSize={15}
                  numberOfLines={2}
                  alignItems="center"
                  letterSpacing={1.12}
                >
                  {`Add ${getPlaceholder(index)} Signing Device`}
                </Text>
                <Text fontWeight={200} color="light.GreyText" fontSize={13} letterSpacing={0.6}>
                  Select signing device
                </Text>
              </VStack>
            </HStack>
            <Box w="15%" alignItems="center">
              <IconArrowBlack />
            </Box>
          </HStack>
        </Box>
      </Pressable>
    );
  }
  const { isSingleSig, isMultiSig } = getSignerInfoFromPath(signer);
  let shouldReconfigure = false;
  if (
    (plan === SubscriptionTier.L1.toUpperCase() && !isSingleSig) ||
    (plan !== SubscriptionTier.L1.toUpperCase() && !isMultiSig)
  ) {
    shouldReconfigure = true;
  }
  return (
    <Box
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginBottom: hp(windowHeight < 700 ? 5 : 25),
      }}
    >
      <HStack style={styles.signerItem}>
        <HStack>
          <Box
            width="8"
            height="8"
            borderRadius={30}
            bg="#725436"
            justifyContent="center"
            alignItems="center"
            alignSelf="center"
          >
            {WalletMap(signer.type, true).Icon}
          </Box>
          <VStack marginX="4" maxW="80%">
            <Text
              color="light.primaryText"
              fontSize={15}
              numberOfLines={1}
              alignItems="center"
              fontWeight={200}
              letterSpacing={1.12}
              maxWidth={width * 0.5}
            >
              {`${signer.signerName}`}
              <Text fontSize={12}>{` (${signer.xpubInfo.xfp})`}</Text>
            </Text>
            <Text color="light.GreyText" fontSize={12} fontWeight={200} letterSpacing={0.6}>
              {`Added ${moment(signer.lastHealthCheck).calendar().toLowerCase()}`}
            </Text>
            <Pressable onPress={openDescriptionModal}>
              <Box style={styles.descriptionBox}>
                <Text
                  noOfLines={1}
                  color={signer.signerDescription ? '#6A7772' : '#387F6A'}
                  fontSize={12}
                  fontWeight={signer.signerDescription ? 200 : 300}
                  letterSpacing={0.6}
                  fontStyle={signer.signerDescription ? null : 'italic'}
                >
                  {signer.signerDescription ? signer.signerDescription : 'Add Description'}
                </Text>
              </Box>
            </Pressable>
          </VStack>
        </HStack>
        <Pressable style={styles.remove} onPress={() => removeSigner()}>
          <Text fontWeight={200} color="light.GreyText" fontSize={12} letterSpacing={0.6}>
            {shouldReconfigure ? 'Re-configure' : 'Remove'}
          </Text>
        </Pressable>
      </HStack>
      <DescriptionModal
        visible={visible}
        close={closeDescriptionModal}
        signer={signer}
        callback={(value: any) =>
          dispatch(updateSigningDevice({ signer, key: 'signerDescription', value }))
        }
      />
    </Box>
  );
}

const areSignersSame = ({ activeVault, signersState }) => {
  if (!activeVault) {
    return false;
  }
  const currentSignerIds = signersState.map((signer) => (signer ? signer.signerId : ''));
  const activeSignerIds = activeVault.signers.map((signer) => signer.signerId);
  return currentSignerIds.sort().join() === activeSignerIds.sort().join();
};

const areSignersValidInCurrentScheme = ({ plan, signersState }) => {
  if (plan !== SubscriptionTier.L1.toUpperCase()) {
    return true;
  }
  return signersState.every(
    (signer) =>
      signer &&
      ![
        SignerType.MOBILE_KEY,
        SignerType.POLICY_SERVER,
        SignerType.KEEPER,
        SignerType.SEED_WORDS,
      ].includes(signer.type)
  );
};

const PATH_INSENSITIVE_SIGNERS = [SignerType.TAPSIGNER];

const signerLimitMatchesSubscriptionScheme = ({ vaultSigners, currentSignerLimit }) =>
  vaultSigners && vaultSigners.length !== currentSignerLimit;

const getSignerInfoFromPath = (signer: VaultSigner) => {
  const purpose = WalletUtilities.getSignerPurposeFromPath(signer.xpubInfo.derivationPath);
  if (PATH_INSENSITIVE_SIGNERS.includes(signer.type) || signer.isMock) {
    return { isSingleSig: true, isMultiSig: true, purpose };
  }
  if (purpose && DerivationPurpose.BIP48.toString() === purpose) {
    return { isSingleSig: false, isMultiSig: true, purpose };
  }
  return { isSingleSig: true, isMultiSig: false, purpose };
};

function AddSigningDevice() {
  const { useQuery } = useContext(RealmWrapperContext);
  const { subscriptionScheme, plan } = usePlan();
  const currentSignerLimit = subscriptionScheme.n;
  const vaultSigners = useAppSelector((state) => state.vault.signers);
  const [signersState, setSignersState] = useState(vaultSigners);
  const [vaultCreating, setCreating] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);

  const activeVault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];

  const planStatus = hasPlanChanged(activeVault, subscriptionScheme);

  useEffect(() => {
    if (activeVault && !vaultSigners.length) {
      dispatch(addSigningDevice(activeVault.signers));
    }
  }, []);

  useEffect(() => {
    let fills;
    if (planStatus === VaultMigrationType.DOWNGRADE) {
      if (vaultSigners.length < currentSignerLimit) {
        fills = new Array(currentSignerLimit - vaultSigners.length).fill(null);
      } else {
        fills = [];
      }
    } else {
      fills = new Array(currentSignerLimit - vaultSigners.length).fill(null);
    }
    setSignersState(vaultSigners.concat(fills));
  }, [vaultSigners]);

  const triggerVaultCreation = () => {
    setCreating(true);
  };
  const validateSigners = () =>
    signersState.every((signer) => !signer) ||
    signerLimitMatchesSubscriptionScheme({ vaultSigners, currentSignerLimit }) ||
    areSignersSame({ activeVault, signersState }) ||
    !areSignersValidInCurrentScheme({ plan, signersState });

  const renderSigner = ({ item, index }) => <SignerItem signer={item} index={index} />;
  const { common } = translations;

  const amfSigners = [];
  const misMatchedSigners = [];
  signersState.forEach((signer: VaultSigner) => {
    if (signer) {
      if (signer.signerName.includes('*') && !signer.signerName.includes('**'))
        amfSigners.push(signer.type);
      const { isSingleSig, isMultiSig } = getSignerInfoFromPath(signer);
      if (
        (plan === SubscriptionTier.L1.toUpperCase() && !isSingleSig) ||
        (plan !== SubscriptionTier.L1.toUpperCase() && !isMultiSig)
      ) {
        misMatchedSigners.push(signer.xpubInfo.xfp);
      }
    }
  });

  let preTitle: string;
  if (planStatus === VaultMigrationType.DOWNGRADE) {
    preTitle = 'Remove';
  } else if (planStatus === VaultMigrationType.UPGRADE) {
    preTitle = 'Add';
  } else {
    preTitle = 'Change';
  }

  return (
    <ScreenWrapper>
      <HeaderTitle
        title={`${preTitle} Signing Devices`}
        subtitle={`Vault with ${subscriptionScheme.m} of ${subscriptionScheme.n} will be created`}
        headerTitleColor="light.textBlack"
        paddingTop={hp(5)}
      />
      <VaultMigrationController
        vaultCreating={vaultCreating}
        signersState={signersState}
        planStatus={planStatus}
      />
      <FlatList
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        extraData={vaultSigners}
        data={signersState}
        keyExtractor={(item, index) => item?.signerId ?? index}
        renderItem={renderSigner}
        style={{
          marginTop: hp(52),
        }}
      />
      <Box style={styles.bottomContainer}>
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
        {misMatchedSigners.length ? (
          <Box style={styles.noteContainer}>
            <Note
              title="WARNING"
              subtitle={`Looks like you've added a ${
                plan === SubscriptionTier.L1.toUpperCase() ? 'multisig' : 'singlesig'
              } xPub\nPlease export ${misMatchedSigners.join(
                ' and '
              )}'s xpub from the right section`}
              subtitleColor="error"
            />
          </Box>
        ) : null}
        <Buttons
          primaryDisable={validateSigners()}
          primaryLoading={vaultCreating}
          primaryText="Create Vault"
          primaryCallback={triggerVaultCreation}
          secondaryText="Cancel"
          secondaryCallback={navigation.goBack}
        />
      </Box>
    </ScreenWrapper>
  );
}

const styles = ScaledSheet.create({
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
    width: windowWidth,
    bottom: 20,
    right: 20,
    padding: 20,
  },
  noteContainer: {
    width: wp(330),
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
});

export default AddSigningDevice;
