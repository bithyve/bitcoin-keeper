import { CommonActions, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { Vault, VaultScheme, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { VaultType } from 'src/core/wallets/enums';
import { addNewVault, finaliseVaultMigration, migrateVault } from 'src/store/sagaActions/vaults';
import { useAppSelector } from 'src/store/hooks';
import { updateIntrimVault } from 'src/store/reducers/vaults';
import { TransferType } from 'src/common/data/enums/TransferType';

import { NewVaultInfo } from 'src/store/sagas/wallets';
import { useDispatch } from 'react-redux';
import { captureError } from 'src/core/services/sentry';
import usePlan from 'src/hooks/usePlan';
import useVault from 'src/hooks/useVault';
import WalletOperations from 'src/core/wallets/operations';
import { calculateSendMaxFee, sendPhaseOne } from 'src/store/sagaActions/send_and_receive';
import { Alert } from 'react-native';
import { UNVERIFYING_SIGNERS } from 'src/hardware';

function VaultMigrationController({ vaultCreating, signersState, planStatus }: any) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { activeVault } = useVault();
  const { subscriptionScheme } = usePlan();
  const temporaryVault = useAppSelector((state) => state.vault.intrimVault);
  const sendMaxFee = useAppSelector((state) => state.sendAndReceive.sendMaxFee);
  const { confirmed, unconfirmed } = activeVault?.specs?.balances ?? {
    confirmed: 0,
    unconfirmed: 0,
  };
  const sendPhaseOneState = useAppSelector((state) => state.sendAndReceive.sendPhaseOne);
  const [recipients, setRecepients] = useState<any[]>();

  useEffect(() => {
    if (vaultCreating) {
      initiateNewVault();
    }
  }, [vaultCreating]);

  useEffect(() => {
    if (temporaryVault) {
      createNewVault();
    }
  }, [temporaryVault]);

  useEffect(() => {
    if (sendMaxFee && temporaryVault) {
      const sendMaxBalance = confirmed - sendMaxFee;
      const externalAddresses = Object.keys(temporaryVault.specs.activeAddresses.external);
      const externalAddressesGenerated = externalAddresses && externalAddresses.length;
      const temporaryVaultReference = JSON.parse(JSON.stringify(temporaryVault));
      const { updatedWallet, receivingAddress } = !externalAddressesGenerated
        ? WalletOperations.getNextFreeExternalAddress(temporaryVaultReference)
        : { updatedWallet: temporaryVault, receivingAddress: externalAddresses[0] };
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
          sender: activeVault,
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

  const createVault = useCallback((signers: VaultSigner[], scheme: VaultScheme) => {
    try {
      const vaultInfo: NewVaultInfo = {
        vaultType: VaultType.DEFAULT,
        vaultScheme: scheme,
        vaultSigners: signers,
        vaultDetails: {
          name: 'Vault',
          description: 'Secure your sats',
        },
      };
      dispatch(addNewVault({ newVaultInfo: vaultInfo }));
      return vaultInfo;
    } catch (err) {
      captureError(err);
      return false;
    }
  }, []);

  const sanitizeSigners = () =>
    signersState.map((signer: VaultSigner) => {
      if (
        subscriptionScheme.n !== 1 &&
        !UNVERIFYING_SIGNERS.includes(signer.type) &&
        signer.registered
      ) {
        return { ...signer, registered: false };
      }
      return signer;
    });

  const initiateNewVault = () => {
    if (activeVault) {
      const freshSignersState = sanitizeSigners();
      const vaultInfo: NewVaultInfo = {
        vaultType: VaultType.DEFAULT,
        vaultScheme: subscriptionScheme,
        vaultSigners: freshSignersState,
        vaultDetails: {
          name: 'Vault',
          description: 'Secure your sats',
        },
      };
      dispatch(migrateVault(vaultInfo, planStatus));
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
  return null;
}

export default VaultMigrationController;
