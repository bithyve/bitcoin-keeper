import React, { useCallback, useContext } from 'react';
import KeeperModal from 'src/components/KeeperModal';
import Success from 'src/assets/images/Success.svg';
import Text from 'src/components/KeeperText';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { useColorMode, Box } from 'native-base';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function VaultCreatedModal({
  vault,
  vaultCreated,
  close,
}: {
  vault: Vault;
  vaultCreated: boolean;
  close: () => void;
}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { signer: signerText } = translations;
  const subtitle =
    vault.scheme.n > 1
      ? `Vault with a ${vault.scheme.m} of ${vault.scheme.n} setup will be created`
      : `Vault with ${vault.scheme.m} of ${vault.scheme.n} setup will be created`;
  const NewVaultContent = useCallback(
    () => (
      <Box>
        <Success />
        <Text fontSize={13} letterSpacing={0.65} color={`${colorMode}.greenText`} marginTop={3}>
          {signerText.sendingOutOfVault}
        </Text>
      </Box>
    ),
    []
  );

  return (
    <KeeperModal
      visible={vaultCreated}
      title={signerText.vaultCreated}
      subTitle={subtitle}
      buttonText={signerText.viewVault}
      textColor={`${colorMode}.textGreen`}
      subTitleColor={`${colorMode}.modalSubtitleBlack`}
      buttonCallback={close}
      close={close}
      Content={NewVaultContent}
    />
  );
}

export default VaultCreatedModal;
