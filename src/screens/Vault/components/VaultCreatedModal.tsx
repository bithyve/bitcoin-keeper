import { View } from 'react-native';
import React, { useCallback } from 'react';
import KeeperModal from 'src/components/KeeperModal';
import Success from 'src/assets/images/Success.svg';
import Text from 'src/components/KeeperText';
import { Vault } from 'src/core/wallets/interfaces/vault';

function VaultCreatedModal({
  vault,
  vaultCreated,
  close,
}: {
  vault: Vault;
  vaultCreated: boolean;
  close: () => void;
}) {
  const NewVaultContent = useCallback(
    () => (
      <View>
        <Success />
        <Text fontSize={13} letterSpacing={0.65} color="light.greenText" marginTop={3}>
          For sending out of the vault you will need the signing devices. This means no one can
          steal your bitcoin in the vault unless they also have the signing devices
        </Text>
      </View>
    ),
    []
  );

  return (
    <KeeperModal
      visible={vaultCreated}
      title="New Vault Created"
      subTitle={`Your vault with ${vault.scheme.m} of ${vault.scheme.n} has been successfully setup. You can start receiving bitcoin in it`}
      buttonText="View Vault"
      subTitleColor="light.secondaryText"
      buttonCallback={close}
      close={close}
      Content={NewVaultContent}
    />
  );
}

export default VaultCreatedModal;
