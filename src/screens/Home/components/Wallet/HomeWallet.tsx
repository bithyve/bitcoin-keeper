import { Box, useColorMode, View } from 'native-base';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import DashedCta from 'src/components/DashedCta';
import Plus from 'src/assets/images/add-plus-white.svg';
import WalletCard from './WalletCard';
import Colors from 'src/theme/Colors';
import useWallets from 'src/hooks/useWallets';
import useVault from 'src/hooks/useVault';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { Vault } from 'src/services/wallets/interfaces/vault';

import useWalletAsset from 'src/hooks/useWalletAsset';
import { EntityKind, VisibilityType } from 'src/services/wallets/enums';
import { useNavigation } from '@react-navigation/native';
import KeeperModal from 'src/components/KeeperModal';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';

import NewWalletIcon from 'src/assets/images/wallet-white-small.svg';
import ImportWalletIcon from 'src/assets/images/import.svg';
import CollaborativeWalletIcon from 'src/assets/images/collaborative_vault_white.svg';

import { useAppSelector } from 'src/store/hooks';
import { resetCollaborativeSession } from 'src/store/reducers/vaults';
import { useDispatch } from 'react-redux';

const HomeWallet = () => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const navigation = useNavigation();
  const { wallets } = useWallets({ getAll: true });
  const { getWalletCardGradient, getWalletTags } = useWalletAsset();
  const { allVaults } = useVault({
    includeArchived: false,
    getFirst: true,
    getHiddenWallets: false,
  });
  const { collaborativeSession } = useAppSelector((state) => state.vault);
  const dispatch = useDispatch();
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [collabSessionExistsModalVisible, setCollabSessionExistsModalVisible] = useState(false);

  const nonHiddenWallets = wallets.filter(
    (wallet) => wallet.presentationData.visibility !== VisibilityType.HIDDEN
  );
  const allWallets: (Wallet | Vault)[] = [...nonHiddenWallets, ...allVaults].filter(
    (item) => item !== null
  );

  const handleCollaborativeWalletCreation = () => {
    setShowAddWalletModal(false);
    if (Object.keys(collaborativeSession.signers).length > 0) {
      setCollabSessionExistsModalVisible(true);
    } else {
      dispatch(resetCollaborativeSession());
      setTimeout(() => {
        navigation.navigate('SetupCollaborativeWallet');
      }, 500); // delaying navigation by 0.5 second to ensure collaborative session reset
    }
  };

  const CREATE_WALLET_OPTIONS = [
    {
      title: 'Create Wallet',
      subtitle: 'Create a new Bitcoin wallet',
      icon: <NewWalletIcon />,
      onPress: () => {},
      id: 'newWallet',
    },
    {
      title: 'Import Wallet',
      subtitle: 'Restore an existing wallet',
      icon: <ImportWalletIcon />,
      onPress: () => {
        setShowAddWalletModal(false);
        navigation.navigate('VaultConfigurationCreation');
      },
      id: 'importWallet',
    },
    {
      title: 'Collaborative Wallet',
      subtitle: 'Create wallet with family and friends',
      icon: <CollaborativeWalletIcon />,
      onPress: handleCollaborativeWalletCreation,
      id: 'importWallet',
    },
    // {
    //   label: 'App Data',
    //   icon: <AppDataIcon />,
    //   onPress: () =>
    //     setSelectedDetails({
    //       ...selectedDetails,
    //       appData: !selectedDetails.appData,
    //     }),
    //   id: 'appData',
    // },
  ];

  const renderWalletCard = ({ item }: { item: Wallet | Vault }) => {
    const handleWalletPress = (item, navigation) => {
      if (item.entityKind === EntityKind.VAULT) {
        navigation.navigate('VaultDetails', { vaultId: item.id, autoRefresh: true });
      } else {
        navigation.navigate('WalletDetails', { walletId: item.id, autoRefresh: true });
      }
    };
    return (
      <TouchableOpacity onPress={() => handleWalletPress(item, navigation)}>
        <WalletCard
          backgroundColor={getWalletCardGradient(item)}
          hexagonBackgroundColor={isDarkMode ? Colors.CyanGreen : Colors.CyanGreen}
          iconWidth={42}
          iconHeight={38}
          title={item.presentationData.name}
          tags={getWalletTags(item)}
          totalBalance={item.specs.balances.confirmed + item.specs.balances.unconfirmed}
          description={item.presentationData.description}
          wallet={item}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Box style={styles.walletContainer}>
      <DashedCta
        backgroundColor={`${colorMode}.DashedButtonCta`}
        hexagonBackgroundColor={Colors.pantoneGreen}
        textColor={`${colorMode}.greenWhiteText`}
        name="Add Wallet"
        callback={() => setShowAddWalletModal(true)}
        icon={<Plus width={8.6} height={8.6} />}
        iconWidth={22}
        iconHeight={20}
      />
      <FlatList
        data={allWallets}
        renderItem={renderWalletCard}
        keyExtractor={(item, index) => `${item.id || index}`}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
      <KeeperModal
        visible={showAddWalletModal}
        title="Add a New Wallet"
        subTitle="Create a new wallet or import existing one"
        close={() => setShowAddWalletModal(false)}
        showCloseIcon
        Content={() => (
          <Box style={styles.addWalletOptionsList}>
            {CREATE_WALLET_OPTIONS.map((option, index) => (
              <OptionItem key={index} option={option} colorMode={colorMode} />
            ))}
          </Box>
        )}
      />
      <KeeperModal
        visible={collabSessionExistsModalVisible}
        close={() => setCollabSessionExistsModalVisible(false)}
        title="Collaborative wallet setup session already exists"
        subTitle="You already have a collaborative wallet setup session in progress, would you like to continue the session or start a new one?"
        buttonText="Continue session"
        secondaryButtonText="Start new"
        secondaryCallback={() => {
          setCollabSessionExistsModalVisible(false);
          dispatch(resetCollaborativeSession());
          setTimeout(() => {
            navigation.navigate('SetupCollaborativeWallet');
          }, 500);
        }}
        buttonCallback={() => {
          setCollabSessionExistsModalVisible(false);
          navigation.navigate('SetupCollaborativeWallet');
        }}
      />
    </Box>
  );
};

const OptionItem = ({ option, colorMode }) => {
  return (
    <TouchableOpacity onPress={option.onPress}>
      <Box
        style={styles.optionCTR}
        backgroundColor={`${colorMode}.boxSecondaryBackground`}
        borderColor={`${colorMode}.separator`}
      >
        <Box style={styles.optionIconCtr} backgroundColor={`${colorMode}.pantoneGreen`}>
          {option.icon}
        </Box>
        <Box>
          <Text
            color={`${colorMode}.secondaryText`}
            fontSize={15}
            medium
            style={styles.optionTitle}
          >
            {option.title}
          </Text>
          <Text color={`${colorMode}.secondaryText`} fontSize={13}>
            {option.subtitle}
          </Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

export default HomeWallet;

const styles = StyleSheet.create({
  walletContainer: {
    gap: 15,
  },
  addWalletOptionsList: {
    gap: wp(15),
    marginBottom: hp(10),
  },
  optionTitle: {
    marginBottom: hp(5),
  },
  optionIconCtr: {
    height: hp(39),
    width: wp(39),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  optionCTR: {
    flexDirection: 'row',
    paddingHorizontal: wp(15),
    paddingVertical: hp(22),
    alignItems: 'center',
    gap: wp(16),
    borderRadius: 12,
    borderWidth: 1,
  },
});
