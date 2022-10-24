import { Alert, Pressable } from 'react-native';
import { Box, FlatList, HStack, Text, VStack } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ScaledSheet, s } from 'react-native-size-matters';
import { Vault, VaultScheme, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { VaultMigrationType, VaultType } from 'src/core/wallets/enums';
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
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { LocalizationContext } from 'src/common/content/LocContext';
import Note from 'src/components/Note/Note';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import Relay from 'src/core/services/operations/Relay';
import { SUBSCRIPTION_SCHEME_MAP } from 'src/common/constants';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { WalletMap } from './WalletMap';
import WalletOperations from 'src/core/wallets/operations';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { hp } from 'src/common/data/responsiveness/responsive';
import moment from 'moment';
import { newVaultInfo } from 'src/store/sagas/wallets';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';

const hasPlanChanged = (vault: Vault, keeper: KeeperApp): VaultMigrationType => {
  if (vault) {
    const currentScheme = vault.scheme;
    const subscriptionScheme = SUBSCRIPTION_SCHEME_MAP[keeper.subscription.name.toUpperCase()];
    if (currentScheme.m > subscriptionScheme.m) {
      return VaultMigrationType.DOWNGRADE;
    } else if (currentScheme.m < subscriptionScheme.m) {
      return VaultMigrationType.UPGRADE;
    } else {
      return VaultMigrationType.CHANGE;
    }
  } else {
    return VaultMigrationType.CHANGE;
  }
};

export const checkSigningDevice = async (id) => {
  const exisits = await Relay.getSignerIdInfo(id);
  return exisits;
};

const AddSigningDevice = () => {
  const { useQuery } = useContext(RealmWrapperContext);
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const subscriptionScheme = SUBSCRIPTION_SCHEME_MAP[keeper.subscription.name.toUpperCase()];
  const currentSignerLimit = subscriptionScheme.n;
  const vaultSigners = useAppSelector((state) => state.vault.signers);
  const temporaryVault = useAppSelector((state) => state.vault.intrimVault);
  const [signersState, setSignersState] = useState(vaultSigners);
  const [vaultCreating, setCreating] = useState(false);
  const [recipients, setRecepients] = useState<any[]>();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);

  const navigateToSignerList = () =>
    navigation.dispatch(CommonActions.navigate('SigningDeviceList'));
  const activeVault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];
  const { confirmed, unconfirmed } = activeVault?.specs?.balances ?? {
    confirmed: 0,
    unconfirmed: 0,
  };

  const planStatus = hasPlanChanged(activeVault, keeper);

  useEffect(() => {
    if (activeVault && !vaultSigners.length) {
      dispatch(addSigningDevice(activeVault.signers));
    }
  }, []);

  useEffect(() => {
    const fills =
      planStatus === VaultMigrationType.DOWNGRADE
        ? []
        : new Array(currentSignerLimit - vaultSigners.length).fill(null);
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
      const newVaultInfo: newVaultInfo = {
        vaultType: VaultType.DEFAULT,
        vaultScheme: scheme,
        vaultSigners: signers,
        vaultDetails: {
          name: 'Vault',
          description: 'Secure your sats',
        },
      };
      dispatch(addNewVault({ newVaultInfo }));
      return newVaultInfo;
    } catch (err) {
      console.log(err);
      return false;
    }
  }, []);
  const sendMaxFee = useAppSelector((state) => state.sendAndReceive.sendMaxFee);
  const sendPhaseOneState = useAppSelector((state) => state.sendAndReceive.sendPhaseOne);

  useEffect(() => {
    if (sendMaxFee) {
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
          uiMetaData: {
            title: 'Transfer Funds to the New Vault',
            subtitle: 'On-chain transaction incurs fees',
            from: 'Old Vault',
            to: 'New Vault',
            vaultToVault: true,
          },
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
      return;
    } else {
      initiateSweep();
    }
  };

  const initiateNewVault = () => {
    const currentScheme = SUBSCRIPTION_SCHEME_MAP[keeper.subscription.name.toUpperCase()];
    if (activeVault) {
      const newVaultInfo: newVaultInfo = {
        vaultType: VaultType.DEFAULT,
        vaultScheme: currentScheme,
        vaultSigners: signersState,
        vaultDetails: {
          name: 'Vault',
          description: 'Secure your sats',
        },
      };
      dispatch(migrateVault(newVaultInfo, planStatus));
    } else {
      const freshVault = createVault(signersState, currentScheme);
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

  const removeSigner = (signer) => {
    dispatch(removeSigningDevice(signer));
  };

  const triggerVaultCreation = () => {
    setCreating(true);
  };

  const getPlaceholder = (index) => {
    const mainIndex = index + 1;
    if (mainIndex == 1) return mainIndex + 'st';
    else if (mainIndex == 2) return mainIndex + 'nd';
    else if (mainIndex == 3) return mainIndex + 'rd';
    else return mainIndex + 'th';
  };

  const SignerItem = ({ signer, index }: { signer: VaultSigner | undefined; index: number }) => {
    if (!signer) {
      return (
        <Pressable onPress={navigateToSignerList}>
          <Box flexDir={'row'} alignItems={'center'} marginX={'3'} marginBottom={'12'}>
            <HStack style={styles.signerItem}>
              <HStack alignItems={'center'}>
                <AddIcon />
                <VStack marginX={'4'} maxW={'64'}>
                  <Text
                    color={'light.lightBlack'}
                    fontSize={15}
                    numberOfLines={2}
                    alignItems={'center'}
                    letterSpacing={1.12}
                    fontWeight={200}
                  >
                    {`Add ${getPlaceholder(index)} Signing Device`}
                  </Text>
                  <Text fontWeight={200} color={'light.GreyText'} fontSize={13} letterSpacing={0.6}>
                    {`Select signing device`}
                  </Text>
                </VStack>
              </HStack>
              <Box w={'15%'} alignItems={'center'}>
                <IconArrowBlack />
              </Box>
            </HStack>
          </Box>
        </Pressable>
      );
    }
    return (
      <Box flexDir={'row'} alignItems={'center'} marginX={'3'} marginBottom={'12'}>
        <HStack style={styles.signerItem}>
          <HStack>
            <Box
              width={'8'}
              height={'8'}
              borderRadius={30}
              bg={'#725436'}
              justifyContent={'center'}
              alignItems={'center'}
              alignSelf={'center'}
            >
              {WalletMap(signer.type, true).Icon}
            </Box>
            <VStack marginX={'4'} maxW={'80%'}>
              <Text
                color={'light.lightBlack'}
                fontSize={15}
                numberOfLines={2}
                alignItems={'center'}
                fontWeight={200}
                letterSpacing={1.12}
              >
                {signer.signerName}
              </Text>
              <Text color={'light.GreyText'} fontSize={12} fontWeight={200} letterSpacing={0.6}>
                {`Added ${moment(signer.lastHealthCheck).calendar().toLowerCase()}`}
              </Text>
            </VStack>
          </HStack>
          <Pressable style={styles.remove} onPress={() => removeSigner(signer)}>
            <Text fontWeight={200} color={'light.GreyText'} fontSize={12} letterSpacing={0.6}>
              {`Remove`}
            </Text>
          </Pressable>
        </HStack>
      </Box>
    );
  };

  const renderSigner = ({ item, index }) => <SignerItem signer={item} index={index} />;
  const common = translations['common'];
  const AstrixSigners = [];
  signersState.forEach((signer: VaultSigner) => {
    if (signer && signer.signerName.includes('*') && !signer.signerName.includes('**'))
      AstrixSigners.push(signer.type);
  });

  return (
    <ScreenWrapper>
      <HeaderTitle
        title={`${planStatus === VaultMigrationType.DOWNGRADE
            ? 'Remove'
            : planStatus === VaultMigrationType.UPGRADE
              ? 'Add'
              : 'Change'
          } Signing Devices`}
        subtitle={`Vault with ${subscriptionScheme.m} of ${subscriptionScheme.n} will be created`}
        headerTitleColor={'light.textBlack'}
        paddingTop={hp(5)}
      />
      <FlatList
        extraData={vaultSigners}
        data={signersState}
        keyExtractor={(item, index) => item?.signerId ?? index}
        renderItem={renderSigner}
        style={{
          marginTop: hp(52),
        }}
      />
      <Box position={'absolute'} bottom={10} width={'100%'}>
        {!!AstrixSigners.length ? (
          <Box padding={'4'}>
            <Note
              title={common.note}
              subtitle={`* ${AstrixSigners.join(
                ' and '
              )} does not support Testnet directly, so the app creates a proxy Testnet key for use in the beta app`}
            />
          </Box>
        ) : null}
        {signersState.every((signer) => {
          return !!signer;
        }) && (
            <Buttons
              primaryLoading={vaultCreating}
              primaryText="Create Vault"
              primaryCallback={triggerVaultCreation}
              secondaryText={'Cancel'}
              secondaryCallback={navigation.goBack}
            />
          )}
      </Box>
    </ScreenWrapper>
  );
};

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
});

export default AddSigningDevice;
