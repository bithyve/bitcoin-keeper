import React, { useContext } from 'react';
import { FlatList, Box, useColorMode } from 'native-base';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import KeeperHeader from 'src/components/KeeperHeader';
import EmptyState from 'src/assets/images/empty-state-illustration.svg';
import { StyleSheet } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import useVault from 'src/hooks/useVault';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import ActionCard from 'src/components/ActionCard';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';
import Note from 'src/components/Note/Note';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useIsSmallDevices from 'src/hooks/useSmallDevices';
import Text from 'src/components/KeeperText';

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

  const { translations } = useContext(LocalizationContext);
  const { common, vault: vaultText } = translations;
  const isSmallDevice = useIsSmallDevices();

  const renderArchiveVaults = ({ item }) => (
    <Box style={styles.cardContainer}>
      <ActionCard
        cardName={item.presentationData.name}
        description={item.presentationData.description}
        icon={<VaultIcon />}
        customStyle={!isSmallDevice ? { height: hp(125) } : { height: hp(150) }}
        callback={() =>
          navigation.dispatch(
            CommonActions.navigate({
              name: 'VaultDetails',
              params: { vaultId: item?.id },
              merge: true,
            })
          )
        }
      />
    </Box>
  );

  const numColumns = 3;

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={vaultText.archivedVaultsTitle}
        subtitle={`${common.for} ${currentVault?.presentationData?.name}`}
        icon={
          <HexagonIcon
            width={58}
            height={50}
            backgroundColor={Colors.pantoneGreen}
            icon={<VaultIcon />}
          />
        }
      />
      {vaults.length === 0 ? (
        <Box style={styles.emptyWrapper}>
          <Text color={`${colorMode}.primaryText`} style={styles.emptyText} semiBold>
            {vaultText.archivedVaultEmptyTitle}
          </Text>
          <Text color={`${colorMode}.secondaryText`} style={styles.emptySubText}>
            {vaultText.archivedVaultEmptySubtitle}
          </Text>
          <EmptyState />
        </Box>
      ) : (
        <Box style={styles.container}>
          <FlatList
            key={`flatlist-${numColumns}`}
            data={vaults}
            keyExtractor={(item, index) => item?.id}
            renderItem={renderArchiveVaults}
            showsVerticalScrollIndicator={false}
            numColumns={numColumns}
            contentContainerStyle={{
              marginTop: hp(30),
              marginBottom: hp(100),
            }}
          />
        </Box>
      )}
      <Box style={styles.noteWrapper}>
        <Note
          title={common.note}
          subtitle={vaultText.archivedVaultsNote}
          subtitleColor="GreyText"
        />
      </Box>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  date: {
    fontStyle: 'italic',
  },
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: hp(3),
  },
  emptySubText: {
    fontSize: 14,
    lineHeight: 20,
    width: wp(250),
    textAlign: 'center',
    marginBottom: hp(30),
  },
  cardContainer: {
    marginLeft: wp(8),
    marginBottom: hp(8),
  },
  noteWrapper: {
    marginHorizontal: '5%',
  },
});

export default ArchivedVault;
