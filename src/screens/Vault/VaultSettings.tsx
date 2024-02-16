import React from 'react';
import { StyleSheet } from 'react-native';
import { Box, ScrollView, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import KeeperHeader from 'src/components/KeeperHeader';
import { hp } from 'src/constants/responsive';
import { genrateOutputDescriptors } from 'src/core/utils';
import Colors from 'src/theme/Colors';
import useVault from 'src/hooks/useVault';
import ScreenWrapper from 'src/components/ScreenWrapper';
import OptionCard from 'src/components/OptionCard';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import HexagonIcon from 'src/components/HexagonIcon';
import WalletFingerprint from 'src/components/WalletFingerPrint';

function VaultSettings({ route }) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { vaultId } = route.params;
  const { activeVault: vault } = useVault({ vaultId });
  const descriptorString = genrateOutputDescriptors(vault);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Vault Settings"
        subtitle="Settings specific to the vault"
        icon={
          <HexagonIcon
            width={44}
            height={38}
            backgroundColor={Colors.pantoneGreen}
            icon={<VaultIcon />}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.optionViewWrapper}>
        <OptionCard
          title="Vault Details"
          description="Vault name & description"
          callback={() => {
            navigation.dispatch(CommonActions.navigate('EditWalletDetails', { wallet: vault }));
          }}
        />
        <OptionCard
          title="Vault configuration file"
          description="Vault configuration that needs to be stored privately"
          callback={() => {
            navigation.dispatch(
              CommonActions.navigate('GenerateVaultDescriptor', { descriptorString })
            );
          }}
        />
        <OptionCard
          title="Archived vault"
          description="View details of old vaults"
          callback={() => {
            navigation.dispatch(CommonActions.navigate('ArchivedVault'));
          }}
        />
        <OptionCard
          title="Update scheme"
          description="Update your vault configuration and transfer funds"
          callback={() => {
            navigation.dispatch(
              CommonActions.navigate({ name: 'VaultSetup', params: { vaultId } })
            );
          }}
        />
      </ScrollView>
      <Box style={styles.fingerprint}>
        <WalletFingerprint fingerprint={vaultId} />
      </Box>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  optionViewWrapper: {
    marginTop: hp(30),
    alignItems: 'center',
  },
  fingerprint: {
    alignItems: 'center',
  },
});
export default VaultSettings;
