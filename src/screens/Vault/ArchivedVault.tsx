import React from 'react';
import Text from 'src/components/KeeperText';
import { Pressable, FlatList, Box, useColorMode } from 'native-base';
import { Vault } from 'src/services/wallets/interfaces/vault';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import KeeperHeader from 'src/components/KeeperHeader';
import BTC from 'src/assets/images/btc_black.svg';
import EmptyState from 'src/assets/images/empty-state-illustration.svg';
import useBalance from 'src/hooks/useBalance';
import { StyleSheet } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import useVault from 'src/hooks/useVault';

function ArchivedVault({ navigation, route }) {
  const { colorMode } = useColorMode();
  const { vaultId } = route.params;
  const { allVaults, activeVault: currentVault } = useVault({ includeArchived: true, vaultId });
  const vaults =
    currentVault.archived || !currentVault.archivedId
      ? []
      : allVaults.filter(
          (v) =>
            v.archived &&
            // include vaults that have the same parent archived id or the parent vault itself which is archived but does not have an archived id
            (v.archivedId === currentVault.archivedId || v.id === currentVault.archivedId)
        );

  const { getBalance } = useBalance();

  function VaultItem({ vaultItem }: { vaultItem: Vault }) {
    return (
      <Pressable
        onPress={() =>
          navigation.dispatch(
            CommonActions.navigate({
              name: 'VaultDetails',
              params: { vaultId: vaultItem.id },
              merge: true,
            })
          )
        }
        backgroundColor={`${colorMode}.primaryBackground`}
        height={hp(135)}
        width={wp(300)}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        style={{
          paddingHorizontal: 20,
          borderRadius: hp(10),
          marginBottom: hp(16),
        }}
      >
        <Box>
          <Box
            flexDirection="row"
            alignItems="center"
            style={{
              marginBottom: hp(10),
            }}
          >
            <Text color={`${colorMode}.headerText`} fontSize={16} bold>
              {vaultItem?.specs?.transactions?.length}
            </Text>
            <Text
              color={`${colorMode}.textBlack`}
              fontSize={12}
              marginLeft={1}
              letterSpacing={0.72}
            >
              Transactions
            </Text>
          </Box>
          <Box
            flexDirection="row"
            style={{
              marginBottom: hp(10),
            }}
          >
            <Box justifyContent="center" marginTop={2}>
              <BTC />
            </Box>
            <Text
              color={`${colorMode}.textBlack`}
              fontSize={24}
              letterSpacing={1.12}
              style={{
                marginLeft: wp(4),
              }}
            >
              {getBalance(
                vaultItem?.specs?.balances?.confirmed + vaultItem?.specs?.balances?.unconfirmed
              )}
            </Text>
          </Box>
          <Box flexDirection="row">
            <Text color={`${colorMode}.textBlack`} fontSize={12} light letterSpacing={0.02}>
              Archived On
            </Text>
            <Text
              style={styles.date}
              color={`${colorMode}.textBlack`}
              fontSize={12}
              bold
              letterSpacing={0.02}
            >
              {` ${'12 December, 2021'}`}
            </Text>
          </Box>
        </Box>
      </Pressable>
    );
  }

  const renderArchiveVaults = ({ item }) => <VaultItem vaultItem={item} />;

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Archived Vaults"
        subtitle="Previously used vaults"
        headerTitleColor={`${colorMode}.headerText`}
      />
      {vaults.length === 0 ? (
        <Box style={styles.emptyWrapper}>
          <Text style={styles.emptyText} semiBold>
            No archived vaults
          </Text>
          <Text style={styles.emptySubText}>There are no archived vaults to show</Text>
          <EmptyState />
        </Box>
      ) : (
        <Box alignItems="center">
          <FlatList
            data={vaults}
            keyExtractor={(item, index) => item.id}
            renderItem={renderArchiveVaults}
            showsVerticalScrollIndicator={false}
            style={{
              marginTop: hp(44),
              marginBottom: hp(100),
            }}
          />
        </Box>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  date: {
    fontStyle: 'italic',
  },
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.8,
  },
  emptyText: {
    marginBottom: hp(3),
  },
  emptySubText: {
    marginBottom: hp(30),
  },
});

export default ArchivedVault;
