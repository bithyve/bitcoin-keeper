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
import { EntityKind, VaultType, VisibilityType } from 'src/services/wallets/enums';
import { useNavigation, CommonActions } from '@react-navigation/native';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';

import { useAppSelector } from 'src/store/hooks';
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
  const { wallet: walletText } = translations;
  const { getWalletCardGradient, getWalletTags } = useWalletAsset();
  const { allVaults } = useVault({
    includeArchived: false,
    getFirst: true,
    getHiddenWallets: false,
  });
  const { usdtWallets } = useUSDTWallets();

  const dispatch = useDispatch();
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

  const pullDownRefresh = () => {
    setPullRefresh(true);

    dispatch(autoSyncWallets(false, false, true));
    setPullRefresh(false);
  };

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
          tag={getWalletCardSingleTag(item)}
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


const getWalletCardSingleTag = (wallet: Wallet | Vault | USDTWallet) => {
  if (wallet.entityKind === EntityKind.WALLET) return 'Hot Wallet';
  else if (wallet.entityKind === EntityKind.USDT_WALLET) return 'USDT Wallet';
  else if (wallet.entityKind === EntityKind.VAULT) {
    switch (wallet.type) {
      case VaultType.SINGE_SIG:
        return 'Cold Storage';
      case VaultType.COLLABORATIVE:
        return 'Collaborative';
      case VaultType.MINISCRIPT:
        return 'Advance Storage';
      default:
        return 'Wallet';
    }
  }
  return 'Wallet';
};