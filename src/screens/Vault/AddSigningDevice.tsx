import { Alert, Pressable } from 'react-native';
import { Box, FlatList, HStack, Text, VStack } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Vault, VaultScheme, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { SignerType, VaultMigrationType, VaultType } from 'src/core/wallets/enums';
import { addNewVault, finaliseVaultMigration, migrateVault } from 'src/store/sagaActions/vaults';
import {
  addSigningDevice,
  removeSigningDevice,
  updateIntrimVault,
} from 'src/store/reducers/vaults';
import { calculateSendMaxFee, sendPhaseOne } from 'src/store/sagaActions/send_and_receive';

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
import WalletOperations from 'src/core/wallets/operations';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { hp, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import moment from 'moment';
import { newVaultInfo } from 'src/store/sagas/wallets';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { captureError } from 'src/core/services/sentry';
import { getPlaceholder } from 'src/common/utilities';
import usePlan from 'src/hooks/usePlan';
import { WalletMap } from './WalletMap';
import { TransferType } from 'src/common/data/enums/TransferType';

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

  const removeSigner = () => {
    dispatch(removeSigningDevice(signer));
  };

  const navigateToSignerList = () =>
    navigation.dispatch(CommonActions.navigate('SigningDeviceList'));

  if (!signer) {
    return (
      <Pressable onPress={navigateToSignerList}>
        <Box flexDir="row" alignItems="center" marginX="3" marginBottom="10">
          <HStack style={styles.signerItem}>
            <HStack alignItems="center">
              <AddIcon />
              <VStack marginX="4" maxW="64">
                <Text
                  color="light.lightBlack"
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
  return (
    <Box flexDir="row" alignItems="center" marginX="3" marginBottom="12">
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
              color="light.lightBlack"
              fontSize={15}
              numberOfLines={2}
              alignItems="center"
              fontWeight={200}
              letterSpacing={1.12}
            >
              {signer.signerName}
            </Text>
            <Text color="light.GreyText" fontSize={12} fontWeight={200} letterSpacing={0.6}>
              {`Added ${moment(signer.lastHealthCheck).calendar().toLowerCase()}`}
            </Text>
          </VStack>
        </HStack>
        <Pressable style={styles.remove} onPress={() => removeSigner()}>
          <Text fontWeight={200} color="light.GreyText" fontSize={12} letterSpacing={0.6}>
            Remove
          </Text>
        </Pressable>
      </HStack>
    </Box>
  );
}

function AddSigningDevice() {
  const { useQuery } = useContext(RealmWrapperContext);
  const { subscriptionScheme, plan } = usePlan();
  const currentSignerLimit = subscriptionScheme.n;
  const vaultSigners = useAppSelector((state) => state.vault.signers);
  const temporaryVault = useAppSelector((state) => state.vault.intrimVault);
  const [signersState, setSignersState] = useState(vaultSigners);
  const [vaultCreating, setCreating] = useState(false);
  const [recipients, setRecepients] = useState<any[]>();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);

  const activeVault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];

  const { confirmed, unconfirmed } = activeVault?.specs?.balances ?? {
    confirmed: 0,
    unconfirmed: 0,
  };

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

  useEffect(() => {
    if (temporaryVault) {
      createNewVault();
    }
  }, [temporaryVault]);

  useEffect(() => {
    if (vaultCreating) {
      initiateNewVault();
    }
  }, [vaultCreating]);

  const createVault = useCallback((signers: VaultSigner[], scheme: VaultScheme) => {
    try {
      const newVaultDetails: newVaultInfo = {
        vaultType: VaultType.DEFAULT,
        vaultScheme: scheme,
        vaultSigners: signers,
        vaultDetails: {
          name: 'Vault',
          description: 'Secure your sats',
        },
      };
      dispatch(addNewVault({ newVaultInfo: newVaultDetails }));
      return newVaultDetails;
    } catch (err) {
      captureError(err);
      return false;
    }
  }, []);
  const sendMaxFee = useAppSelector((state) => state.sendAndReceive.sendMaxFee);
  const sendPhaseOneState = useAppSelector((state) => state.sendAndReceive.sendPhaseOne);

  useEffect(() => {
    if (sendMaxFee && temporaryVault) {
      const sendMaxBalance = confirmed - sendMaxFee;
      const { updatedWallet, receivingAddress } =
        WalletOperations.getNextFreeExternalAddress(temporaryVault);
      setRecepients([
        {
          address: receivingAddress,
          amount: sendMaxBalance,
        },
      ]);
      dispatch(updateIntrimVault(updatedWallet as Vault));
      dispatch(
        sendPhaseOne({
          wallet: activeVault,
          recipients: [
            {
              address: receivingAddress,
              amount: sendMaxBalance,
            },
          ],
        })
      );
    }
  }, [sendMaxFee]);

  useEffect(() => {
    if (sendPhaseOneState.isSuccessful) {
      navigation.dispatch(
        CommonActions.navigate('SendConfirmation', {
          wallet: activeVault,
          recipients,
          transferType: TransferType.VAULT_TO_VAULT,
        })
      );
    } else if (sendPhaseOneState.hasFailed) {
      if (sendPhaseOneState.failedErrorMessage === 'Insufficient balance')
        Alert.alert('You have insufficient balance at this time.');
      else Alert.alert(sendPhaseOneState.failedErrorMessage);
    }
  }, [sendPhaseOneState]);

  const initiateSweep = () => {
    if (confirmed) {
      dispatch(calculateSendMaxFee({ numberOfRecipients: 1, wallet: activeVault }));
    } else {
      Alert.alert('You have unconfirmed balance, please try again later!');
    }
  };

  const createNewVault = () => {
    const netBanalce = confirmed + unconfirmed;
    if (netBanalce === 0) {
      dispatch(finaliseVaultMigration(activeVault.id));
      const navigationState = {
        index: 1,
        routes: [
          { name: 'NewHome' },
          { name: 'VaultDetails', params: { vaultTransferSuccessful: true } },
        ],
      };
      navigation.dispatch(CommonActions.reset(navigationState));
    } else {
      initiateSweep();
    }
  };

  const initiateNewVault = () => {
    if (activeVault) {
      const newVaultDetails: newVaultInfo = {
        vaultType: VaultType.DEFAULT,
        vaultScheme: subscriptionScheme,
        vaultSigners: signersState,
        vaultDetails: {
          name: 'Vault',
          description: 'Secure your sats',
        },
      };
      dispatch(migrateVault(newVaultDetails, planStatus));
    } else {
      const freshVault = createVault(signersState, subscriptionScheme);
      if (freshVault && !activeVault) {
        const navigationState = {
          index: 1,
          routes: [
            { name: 'NewHome' },
            { name: 'VaultDetails', params: { vaultTransferSuccessful: true } },
          ],
        };
        navigation.dispatch(CommonActions.reset(navigationState));
      }
    }
  };

  const triggerVaultCreation = () => {
    setCreating(true);
  };

  const renderSigner = ({ item, index }) => <SignerItem signer={item} index={index} />;
  const { common } = translations;
  const AstrixSigners = [];
  signersState.forEach((signer: VaultSigner) => {
    if (signer && signer.signerName.includes('*') && !signer.signerName.includes('**'))
      AstrixSigners.push(signer.type);
  });

  let preTitle: string;
  if (planStatus === VaultMigrationType.DOWNGRADE) {
    preTitle = 'Remove';
  } else if (planStatus === VaultMigrationType.UPGRADE) {
    preTitle = 'Add';
  } else {
    preTitle = 'Change';
  }

  const areSignersSame = () => {
    if (!activeVault) {
      return false;
    }
    const currentSignerIds = signersState.map((signer) => (signer ? signer.signerId : ''));
    const activeSignerIds = activeVault.signers.map((signer) => signer.signerId);
    return currentSignerIds.sort().join() === activeSignerIds.sort().join();
  };

  const areSignersValidInCurrentScheme = () => {
    if (plan !== 'PLEB') {
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

  const validateSigners = () =>
    signersState.every((signer) => !signer) ||
    (vaultSigners && vaultSigners.length !== currentSignerLimit) ||
    areSignersSame() ||
    !areSignersValidInCurrentScheme();

  return (
    <ScreenWrapper>
      <HeaderTitle
        title={`${preTitle} Signing Devices`}
        subtitle={`Vault with ${subscriptionScheme.m} of ${subscriptionScheme.n} will be created`}
        headerTitleColor="light.textBlack"
        paddingTop={hp(5)}
      />
      <FlatList
        showsVerticalScrollIndicator={false}
        extraData={vaultSigners}
        data={signersState}
        keyExtractor={(item, index) => item?.signerId ?? index}
        scrollEnabled={false}
        renderItem={renderSigner}
        style={{
          marginTop: hp(52),
        }}
      />
      <Box style={styles.bottomContainer}>
        {AstrixSigners.length ? (
          <Box style={styles.noteContainer}>
            <Note
              title={common.note}
              subtitle={`* ${AstrixSigners.join(
                ' and '
              )} does not support Testnet directly, so the app creates a proxy Testnet key for you in the beta app`}
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
    position: 'absolute',
    bottom: 35,
    right: 20,
    paddingLeft: 40,
  },
  noteContainer: {
    width: wp(330),
  },
});

export default AddSigningDevice;
