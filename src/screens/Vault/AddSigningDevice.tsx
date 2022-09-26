import { Box, FlatList, HStack, Text, VStack } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Vault, VaultScheme, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { VaultMigrationType, VaultType } from 'src/core/wallets/enums';
import { addNewVault, finaliseVaultMigration, migrateVault } from 'src/store/sagaActions/vaults';
import {
  addSigningDevice,
  removeSigningDevice,
  updateIntrimVault,
} from 'src/store/reducers/vaults';

import AddIcon from 'src/assets/images/green_add.svg';
import Buttons from 'src/components/Buttons';
import Header from 'src/components/Header';
import IconArrowBlack from 'src/assets/images/svgs/icon_arrow_black.svg';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { Pressable } from 'react-native';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import Relay from 'src/core/services/operations/Relay';
import { SUBSCRIPTION_SCHEME_MAP } from 'src/common/constants';
import { ScaledSheet } from 'react-native-size-matters';
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
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const navigateToSignerList = () =>
    navigation.dispatch(CommonActions.navigate('SigningDeviceList'));
  const activeVault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];

  const planStatus = hasPlanChanged(activeVault, keeper);

  useEffect(() => {
    if (activeVault) {
      dispatch(addSigningDevice(activeVault.signers));
    }
    checkSigningDevice('7FBC64C9');
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
      sweepVaultFunds(activeVault, temporaryVault, activeVault.specs.balances.confirmed.toString());
    }
  }, [temporaryVault]);

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

  const sweepVaultFunds = (oldVault: Vault, newVault: Vault, amount?: string) => {
    const { confirmed, unconfirmed } = activeVault.specs.balances;
    const netBanalce = confirmed + unconfirmed;
    if (netBanalce === 0) {
      dispatch(finaliseVaultMigration(oldVault.id));
      navigation.dispatch(CommonActions.navigate({ name: 'VaultDetails' }));
      return;
    }
    const { updatedWallet, receivingAddress } =
      WalletOperations.getNextFreeExternalAddress(newVault);
    dispatch(updateIntrimVault(updatedWallet as Vault));
    navigation.dispatch(
      CommonActions.navigate('AddSendAmount', {
        wallet: oldVault,
        address: receivingAddress,
        amount,
      })
    );
  };

  const onProceed = () => {
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
        navigation.dispatch(CommonActions.navigate('NewHome'));
      }
    }
  };

  const removeSigner = (signer) => {
    dispatch(removeSigningDevice(signer));
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
                  >
                    {`Add Signer ${index + 1}`}
                  </Text>
                  <Text color={'light.GreyText'} fontSize={13} letterSpacing={0.6}>
                    {`Lorem ipsum dolor sit amet, consectetur`}
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
                letterSpacing={1.12}
              >
                {signer.signerName}
              </Text>
              <Text color={'light.GreyText'} fontSize={12} letterSpacing={0.6}>
                {`Added ${moment(signer.lastHealthCheck).calendar()}`}
              </Text>
            </VStack>
          </HStack>
          <Pressable style={styles.remove} onPress={() => removeSigner(signer)}>
            <Text color={'light.GreyText'} fontSize={12} letterSpacing={0.6}>
              {`Remove`}
            </Text>
          </Pressable>
        </HStack>
      </Box>
    );
  };

  const renderSigner = ({ item, index }) => <SignerItem signer={item} index={index} />;
  return (
    <ScreenWrapper>
      <Header
        title={'Add Signers'}
        subtitle={'Lorem ipsum dolor sit amet, consectetur'}
        headerTitleColor={'light.textBlack'}
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
      {signersState.every((signer) => {
        return !!signer;
      }) && (
        <Box position={'absolute'} bottom={10} width={'100%'}>
          <Buttons
            primaryText="Create Vault"
            primaryCallback={onProceed}
            secondaryText={'Cancel'}
            secondaryCallback={navigation.goBack}
          />
        </Box>
      )}
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
