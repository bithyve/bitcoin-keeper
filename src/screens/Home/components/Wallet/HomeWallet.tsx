import { Box, useColorMode, View } from 'native-base';
import React, { useContext, useState, useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import WalletCard from './WalletCard';
import Colors from 'src/theme/Colors';
import useWallets from 'src/hooks/useWallets';
import useVault from 'src/hooks/useVault';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { Vault } from 'src/services/wallets/interfaces/vault';

import useWalletAsset from 'src/hooks/useWalletAsset';
import { EntityKind, VisibilityType } from 'src/services/wallets/enums';
import { useNavigation, CommonActions } from '@react-navigation/native';
import KeeperModal from 'src/components/KeeperModal';
import Text from 'src/components/KeeperText';
import { hp, windowWidth, wp } from 'src/constants/responsive';

import CollaborativeWalletIcon from 'src/assets/images/collaborative_vault_white.svg';

import { useAppSelector } from 'src/store/hooks';
import { resetCollaborativeSession } from 'src/store/reducers/vaults';
import { useDispatch } from 'react-redux';
import { autoSyncWallets } from 'src/store/sagaActions/wallets';
import { RefreshControl } from 'react-native';
import { ELECTRUM_CLIENT } from 'src/services/electrum/client';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useUSDTWallets } from 'src/hooks/useUSDTWallets';
import {
  getAvailableBalanceUSDTWallet,
  USDTWallet,
} from 'src/services/wallets/factories/USDTWalletFactory';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import Fonts from 'src/constants/Fonts';
import CreateWalletIllustration from 'src/assets/images/createWalletIllustration.svg';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import HelpGreen from 'src/assets/images/helpGreen.svg';
import { SelectWalletTypeCards } from 'src/screens/AddWalletScreen/SelectWalletType';
import { FAB } from 'src/components/FAB';
import Plus from 'src/assets/images/plusRound.svg';

const HomeWallet = () => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const navigation = useNavigation();
  const { wallets } = useWallets({ getAll: true });
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletText, common } = translations;
  const { getWalletCardGradient, getWalletTags } = useWalletAsset();
  const { allVaults } = useVault({
    includeArchived: false,
    getFirst: true,
    getHiddenWallets: false,
  });
  const { usdtWallets } = useUSDTWallets();
  const { collaborativeSession } = useAppSelector((state) => state.vault);

  const dispatch = useDispatch();
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [collabSessionExistsModalVisible, setCollabSessionExistsModalVisible] = useState(false);
  const [pullRefresh, setPullRefresh] = useState(false);
  const { walletSyncing } = useAppSelector((state) => state.wallet);
  const syncing =
    ELECTRUM_CLIENT.isClientConnected &&
    Object.values(walletSyncing).some((isSyncing) => isSyncing);

  const nonHiddenWallets = wallets.filter(
    (wallet) => wallet.presentationData.visibility !== VisibilityType.HIDDEN
  );
  const allWallets: (Wallet | Vault | USDTWallet)[] = [
    ...nonHiddenWallets,
    ...allVaults,
    ...usdtWallets,
  ].filter((item) => item !== null);
  const [isShowAmount, setIsShowAmount] = useState(false);
  const [loading, setLoading] = useState(false);
  const { relayWalletUpdate, relayWalletError, realyWalletErrorMessage } = useAppSelector(
    (state) => state.bhr
  );

  const { showToast } = useToastMessage();

  useEffect(() => {
    if (relayWalletUpdate) {
      dispatch(resetRealyWalletState());
      setLoading(false);
    }
    if (relayWalletError) {
      showToast(realyWalletErrorMessage || walletText.walletCreationFailed, <ToastErrorIcon />);
      setLoading(false);
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError]);

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

  const pullDownRefresh = () => {
    setPullRefresh(true);

    dispatch(autoSyncWallets(false, false, true));
    setPullRefresh(false);
  };

  const CREATE_WALLET_OPTIONS = [
    {
      title: common.collaborativeWallet,
      subtitle: walletText.walletWithFamily,
      icon: <CollaborativeWalletIcon />,
      onPress: handleCollaborativeWalletCreation,
      id: 'collaborativeWallet',
    },
  ];

  const renderWalletCard = ({ item }: { item: Wallet | Vault | USDTWallet }) => {
    const handleWalletPress = (item, navigation) => {
      if (item.entityKind === EntityKind.VAULT) {
        navigation.navigate('VaultDetails', { vaultId: item.id, autoRefresh: true });
      } else if (item.entityKind === EntityKind.USDT_WALLET) {
        navigation.navigate('usdtDetails', { usdtWalletId: item.id });
      } else {
        navigation.navigate('WalletDetails', { walletId: item.id, autoRefresh: true });
      }
    };
    return (
      <TouchableOpacity
        onPress={() => handleWalletPress(item, navigation)}
        testID={`wallet_item_${item.id}`}
      >
        <WalletCard
          backgroundColor={getWalletCardGradient(item)}
          hexagonBackgroundColor={
            item.entityKind === EntityKind.USDT_WALLET ? Colors.aqualightMarine : Colors.CyanGreen
          }
          iconWidth={33}
          iconHeight={30}
          title={item.presentationData.name}
          tags={getWalletTags(item)}
          totalBalance={
            item.entityKind === EntityKind.USDT_WALLET
              ? getAvailableBalanceUSDTWallet(item as USDTWallet)
              : item.specs.balances.confirmed + item.specs.balances.unconfirmed
          }
          description={item.presentationData.description}
          wallet={item}
          isShowAmount={isShowAmount}
          setIsShowAmount={setIsShowAmount}
          tag={item.entityKind === EntityKind.VAULT ? 'Cold Storage' : 'Hot Wallet'}
        />
      </TouchableOpacity>
    );
  };

  const EmptyWalletComponent = () => {
    return (
      <Box style={styles.createWalletCtr}>
        <Box
          style={styles.createWalletIllustration}
          backgroundColor={`${colorMode}.boxSecondaryBackground`}
          borderColor={`${colorMode}.separator`}
        >
          <CreateWalletIllustration />
          <Box style={styles.createWalletTxtCtr}>
            <Text
              fontSize={18}
              medium
              style={styles.createWalletTitle}
              color={`${colorMode}.textGreen`}
            >
              {walletText.createFirstWalletTitle}
            </Text>
            <Text
              fontSize={13}
              style={styles.createWalletSubTitle}
              color={`${colorMode}.primaryText`}
            >
              {walletText.createFirstWalletSubtitle}
            </Text>
          </Box>
        </Box>
        <SelectWalletTypeCards />

        <Pressable onPress={() => {}}>
          <Box
            style={styles.suggestionCtr}
            backgroundColor={isDarkMode ? Colors.seperatorDark : `${colorMode}.separator`}
            borderColor={`${colorMode}.primaryBackground`}
          >
            <HelpGreen />
            <Text color={`${colorMode}.greenText`} fontSize={14} bold style={styles.suggestionTxt}>
              {walletText.helpMeDecide}
            </Text>
          </Box>
        </Pressable>
      </Box>
    );
  };

  return (
    <Box style={styles.walletContainer}>
      <ActivityIndicatorView visible={syncing || loading} showLoader />
      <FlatList
        data={allWallets}
        renderItem={renderWalletCard}
        refreshControl={<RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />}
        keyExtractor={(item, index) => `${item.id || index}`}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={EmptyWalletComponent}
      />
      <KeeperModal
        visible={collabSessionExistsModalVisible}
        close={() => setCollabSessionExistsModalVisible(false)}
        title={walletText.collaborativeSessionExists}
        subTitle={walletText.collaborativeSessionExistsDesc}
        buttonText={common.continueSession}
        secondaryButtonText={common.startNew}
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
      {!!allWallets.length && (
        <FAB
          onPress={() => navigation.dispatch(CommonActions.navigate('SelectWalletType'))}
          icon={<Plus />}
        />
      )}
    </Box>
  );
};

export default HomeWallet;

const styles = StyleSheet.create({
  walletContainer: {
    gap: 15,
  },
  customStyle: {
    marginBottom: hp(10),
  },
  DashedCtaStyle: {
    width: windowWidth * 0.88,
  },
  walletTypeContainer: {
    gap: wp(15),
    marginBottom: hp(10),
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
  },
  typeCard: {
    width: wp(148),
    height: hp(104),
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    borderRadius: 12,
    gap: wp(10),
  },
  createWalletCtr: {
    gap: hp(8),
    paddingHorizontal: wp(22),
  },
  suggestionCtr: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: hp(15),
    marginTop: hp(10),
    marginBottom: hp(40),
    gap: wp(6),
  },
  suggestionTxt: { textAlign: 'center' },
  createWalletTitle: {
    fontFamily: Fonts.LoraMedium,
    fontWeight: '500',
  },
  createWalletSubTitle: { textAlign: 'center' },
  createWalletTxtCtr: {
    gap: hp(4),
    alignItems: 'center',
    paddingHorizontal: wp(20),
    marginTop: hp(16),
  },
  createWalletIllustration: {
    borderWidth: 1,
    padding: wp(20),
    borderRadius: wp(16),
    marginBottom: hp(2),
    alignItems: 'center',
  },
});
