import React from 'react';
import Text from 'src/components/KeeperText';
import { Pressable, FlatList, Box, useColorMode } from 'native-base';
// data
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { Vault } from 'src/core/wallets/interfaces/vault';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import KeeperHeader from 'src/components/KeeperHeader';
import BTC from 'src/assets/images/btc_black.svg';
import useBalance from 'src/hooks/useBalance';
import { StyleSheet } from 'react-native';
import { useQuery } from '@realm/react';
import { CommonActions } from '@react-navigation/native';

function ArchivedVault({ navigation }) {
  const { colorMode } = useColorMode();
  const vault: Vault[] = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => vault.archived);
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
            <Text color={`${colorMode}.textBlack`} fontSize={12} marginLeft={1} letterSpacing={0.72}>
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
      <Box alignItems="center">
        <FlatList
          data={vault}
          keyExtractor={(item, index) => item.id}
          renderItem={renderArchiveVaults}
          showsVerticalScrollIndicator={false}
          style={{
            marginTop: hp(44),
            marginBottom: hp(100),
          }}
        />
      </Box>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  date: {
    fontStyle: 'italic',
  },
});

export default ArchivedVault;
