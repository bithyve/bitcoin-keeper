import React, { useContext } from 'react';
import { Pressable, FlatList, Box, Text } from 'native-base';
// data
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
// components and asserts
import HeaderTitle from 'src/components/HeaderTitle';
import BTC from 'src/assets/images/svgs/btc_black.svg';
import Arrow from 'src/assets/images/svgs/icon_arrow.svg';
import { getAmount } from 'src/common/constants/Bitcoin';

function ArchivedVault() {
  const { useQuery } = useContext(RealmWrapperContext);
  const vault: Vault[] = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => vault.archived);

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
            <Text color="light.headerText" fontSize={16} fontWeight={300} fontFamily="body">
              {vaultItem?.specs?.transactions?.length}
            </Text>
            <Text
              color="light.textBlack"
              fontSize={12}
              fontWeight={200}
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
              color="light.textBlack"
              fontSize={24}
              fontWeight={200}
              letterSpacing={1.12}
              style={{
                marginLeft: wp(4),
              }}
            >
              {getAmount(
                vaultItem?.specs?.balances?.confirmed + vaultItem?.specs?.balances?.unconfirmed
              )}
            </Text>
          </Box>
          <Box flexDirection="row">
            <Text color="light.textBlack" fontSize={12} fontWeight={100} letterSpacing={0.02}>
              Archived On
            </Text>
            <Text
              color="light.textBlack"
              fontSize={12}
              fontWeight={300}
              letterSpacing={0.02}
              fontStyle="italic"
            >
              {` ${'12 December, 2021'}`}
            </Text>
          </Box>
        </Box>
        <Box>
          <Arrow />
        </Box>
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
        paddingLeft={4}
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

export default ArchivedVault;
