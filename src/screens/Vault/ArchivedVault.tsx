import React, { useContext } from 'react';
import Text from 'src/components/KeeperText';
import { Pressable, FlatList, Box } from 'native-base';
// data
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
// components and asserts
import HeaderTitle from 'src/components/HeaderTitle';
import BTC from 'src/assets/images/btc_black.svg';
import useBalance from 'src/hooks/useBalance';
import { StyleSheet } from 'react-native';

function ArchivedVault() {
  const { useQuery } = useContext(RealmWrapperContext);
  const vault: Vault[] = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => vault.archived);
  const { getBalance } = useBalance();

  function VaultItem({ vaultItem, index }: { vaultItem: Vault; index: number }) {
    return (
      <Pressable
        backgroundColor="light.primaryBackground"
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
            <Text color="light.headerText" fontSize={16} bold>
              {vaultItem?.specs?.transactions?.length}
            </Text>
            <Text color="light.textBlack" fontSize={12} marginLeft={1} letterSpacing={0.72}>
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
              color="light.textBlack"
              fontSize={24}
              letterSpacing={1.12}
              style={{
                marginLeft: wp(4),
              }}
            >
              {getBalance(vaultItem?.specs?.balances?.confirmed + vaultItem?.specs?.balances?.unconfirmed)}
            </Text>
          </Box>
          <Box flexDirection="row">
            <Text color="light.textBlack" fontSize={12} light letterSpacing={0.02}>
              Archived On
            </Text>
            <Text
              style={styles.date}
              color="light.textBlack"
              fontSize={12}
              bold
              letterSpacing={0.02}
            >
              {` ${'12 December, 2021'}`}
            </Text>
          </Box>
        </Box>
        <Box>{/* <Arrow /> */}</Box>
      </Pressable>
    );
  }

  const renderArchiveVaults = ({ item, index }) => <VaultItem vaultItem={item} index={index} />;

  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Archived Vaults"
        subtitle="Previously used vaults"
        headerTitleColor="light.headerText"
        paddingLeft={20}
        paddingTop={5}
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
