import {
  StyleSheet,
  TouchableOpacity,
  Animated,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import useWallets from 'src/hooks/useWallets';
import { useAppSelector } from 'src/store/hooks';
import { Box, HStack, useColorMode } from 'native-base';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { EntityKind, VaultType, VisibilityType } from 'src/core/wallets/enums';
import GradientIcon from 'src/screens/WalletDetails/components/GradientIcon';
import WalletActiveIcon from 'src/assets/images/walleTabFilled.svg';
import WalletDark from 'src/assets/images/walletDark.svg';
import WhirlpoolAccountIcon from 'src/assets/images/whirlpool_account.svg';
import AddSCardIcon from 'src/assets/images/icon_add_white.svg';
import TickIcon from 'src/assets/images/icon_tick.svg';
import Text from 'src/components/KeeperText';
import useToastMessage from 'src/hooks/useToastMessage';
import idx from 'idx';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { useDispatch } from 'react-redux';
import CollaborativeWalletIcon from 'src/assets/images/icon_collaborative_home.svg';
import { resetElectrumNotConnectedErr } from 'src/store/reducers/login';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { Vault } from 'src/core/wallets/interfaces/vault';
import useCollaborativeWallet from 'src/hooks/useCollaborativeWallet';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import CurrencyInfo from 'src/screens/HomeScreen/components/CurrencyInfo';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useQuery } from '@realm/react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { CommonActions } from '@react-navigation/native';
import IconSettings from 'src/assets/images/new_icon_settings.svg';
import IconDarkSettings from 'src/assets/images/dark_new_icon_settings.svg';
import useVault from 'src/hooks/useVault';
import KeeperModal from 'src/components/KeeperModal';
import { DowngradeModal } from './components/DowngradeModal';
import AddWalletModal from './components/AddWalletModal';
import ElectrumDisconnectModal from './components/ElectrumDisconnectModal';

const ITEM_SIZE = hp(220);

const calculateBalancesForVaults = (vaults) => {
  let totalUnconfirmedBalance = 0;
  let totalConfirmedBalance = 0;

  vaults.forEach((vault) => {
    const unconfirmedBalance = idx(vault, (_) => _.specs.balances.unconfirmed) || 0;
    const confirmedBalance = idx(vault, (_) => _.specs.balances.confirmed) || 0;

    totalUnconfirmedBalance += unconfirmedBalance;
    totalConfirmedBalance += confirmedBalance;
  });
  return totalUnconfirmedBalance + totalConfirmedBalance;
};

function AddNewWalletTile({ wallet, setAddImportVisible }) {
  return (
    <TouchableOpacity
      style={styles.addWalletContainer}
      onPress={() => setAddImportVisible(true)}
      testID="btn_add_wallet"
    >
      <AddSCardIcon />
      <Text color="light.white" style={styles.addWalletText}>
        {wallet.AddImportNewWallet}
      </Text>
    </TouchableOpacity>
  );
}

const Header = ({ navigation }) => {
  const { colorMode } = useColorMode();
  return (
    <HStack style={styles.headerContainer}>
      <TouchableOpacity
        onPress={() => navigation.dispatch(CommonActions.navigate('AppSettings'))}
        testID="btn_AppSettingsIcon"
      >
        {colorMode === 'light' ? <IconSettings /> : <IconDarkSettings />}
      </TouchableOpacity>
    </HStack>
  );
};

const UAIStack = ({ navigation }) => {
  return <Box style={styles.uaiContainer}></Box>;
};

function WalletTile({ wallet, balances, isWhirlpoolWallet, hideAmounts, isCollaborativeWallet }) {
  const { colorMode } = useColorMode();
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const { translations } = useContext(LocalizationContext);
  const { importWallet } = translations;
  return (
    <Box>
      <Box style={styles.walletCard}>
        <Box style={styles.walletInnerView}>
          {isWhirlpoolWallet ? (
            <GradientIcon Icon={WhirlpoolAccountIcon} height={35} />
          ) : isCollaborativeWallet ? (
            <CollaborativeWalletIcon />
          ) : (
            <Box style={styles.walletIconWrapper}>
              {colorMode === 'light' ? <WalletActiveIcon /> : <WalletDark />}
            </Box>
          )}
          <Box style={styles.walletDetailsWrapper}>
            {wallet?.type === 'IMPORTED' ? (
              <Text color={`${colorMode}.white`} style={styles.walletType}>
                {importWallet.importedWalletTitle}
              </Text>
            ) : null}
            <Text color={`${colorMode}.white`} style={styles.walletName}>
              {wallet?.presentationData?.name}
            </Text>
          </Box>
        </Box>
      </Box>
      <Box style={styles.walletBalance}>
        <CurrencyInfo
          hideAmounts={hideAmounts}
          amount={balances?.confirmed + balances?.unconfirmed}
          fontSize={satsEnabled ? 17 : 20}
          color={`${colorMode}.white`}
          variation={colorMode === 'light' ? 'light' : 'dark'}
        />
      </Box>
    </Box>
  );
}

function WalletItem({
  item,
  navigation,
  translations,
  hideAmounts,
  walletIndex,
  setAddImportVisible,
}: {
  item: Wallet | Vault;
  navigation;
  translations;
  hideAmounts: boolean;
  walletIndex: number;
  setAddImportVisible: any;
}) {
  const { colorMode } = useColorMode();
  const { wallet } = translations;
  if (!item) {
    return null;
  }

  if (item.key && item.key === 'add-wallet') {
    return (
      <Box backgroundColor={`${colorMode}.pantoneGreen`} style={[styles.walletContainer]}>
        <AddNewWalletTile wallet={wallet} setAddImportVisible={setAddImportVisible} />
      </Box>
    );
  }
  const isWhirlpoolWallet = Boolean(item?.whirlpoolConfig?.whirlpoolWalletDetails);
  const isCollaborativeWallet =
    item.entityKind === EntityKind.VAULT && item.type === VaultType.COLLABORATIVE;
  const isVault = item.entityKind === EntityKind.VAULT && item.type === VaultType.DEFAULT;

  return (
    <TouchableWithoutFeedback
      testID={`view_wallet_${walletIndex}`}
      onPress={() => {
        isVault
          ? navigation.navigate('VaultDetails', { vaultId: item.id })
          : isCollaborativeWallet
          ? navigation.navigate('VaultDetails', {
              collaborativeWalletId: item.collaborativeWalletId,
            })
          : navigation.navigate('WalletDetails', { walletId: item.id });
      }}
    >
      <Box backgroundColor={`${colorMode}.pantoneGreen`} style={[styles.walletContainer]}>
        <WalletTile
          isWhirlpoolWallet={isWhirlpoolWallet}
          isCollaborativeWallet={isCollaborativeWallet}
          wallet={item}
          balances={item?.specs?.balances}
          hideAmounts={hideAmounts}
        />
      </Box>
    </TouchableWithoutFeedback>
  );
}

const Wallets = ({ navigation, setAddImportVisible, wallets }) => {
  const items = [{ key: 'spacer-start' }, ...wallets, { key: 'add-wallet' }, { key: 'spacer-end' }];
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const { translations } = useContext(LocalizationContext);

  return (
    <Box>
      <Animated.FlatList
        testID="list_wallets"
        keyExtractor={(item) => item.id || item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={items}
        disableIntervalMomentum
        decelerationRate={'fast'}
        bounces={false}
        snapToInterval={ITEM_SIZE}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: true,
        })}
        renderItem={({ item, index }) => {
          const inputRange = [(index - 2) * ITEM_SIZE, (index - 1) * ITEM_SIZE, index * ITEM_SIZE];
          const scale = scrollX.interpolate({ inputRange, outputRange: [0.8, 1, 0.8] });
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0.6, 1, 0.6] });
          if (item.key && item.key.includes('spacer')) {
            return <View style={{ width: (windowWidth - ITEM_SIZE) / 2 }} />;
          }
          return (
            <Animated.View style={{ transform: [{ scale }], opacity, width: ITEM_SIZE }}>
              <WalletItem
                hideAmounts={false}
                item={item}
                walletIndex={index}
                navigation={navigation}
                translations={translations}
                setAddImportVisible={setAddImportVisible}
              />
            </Animated.View>
          );
        }}
      />
    </Box>
  );
};

const Keys = () => {
  return <Box />;
};

const Inheritance = () => {
  return <Box />;
};

const Home = ({ navigation }) => {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const { wallets } = useWallets({ getAll: true });
  const { collaborativeWallets } = useCollaborativeWallet();
  const { activeVault } = useVault();
  const nonHiddenWallets = wallets.filter(
    (wallet) => wallet.presentationData.visibility !== VisibilityType.HIDDEN
  );
  const allVaults = [activeVault, ...collaborativeWallets];
  const allWallets: (Wallet | Vault)[] = [...nonHiddenWallets, ...allVaults];

  const [addImportVisible, setAddImportVisible] = useState(false);
  const [electrumErrorVisible, setElectrumErrorVisible] = useState(false);
  const { relayWalletUpdate, relayWalletError, realyWalletErrorMessage } = useAppSelector(
    (state) => state.bhr
  );
  const netBalanceWallets = useAppSelector((state) => state.wallet.netBalance);
  const netBalanceAllVaults = calculateBalancesForVaults(allVaults);

  const [defaultWalletCreation, setDefaultWalletCreation] = useState(false);
  const { showToast } = useToastMessage();
  const electrumClientConnectionStatus = useAppSelector(
    (state) => state.login.electrumClientConnectionStatus
  );

  useEffect(() => {
    if (electrumClientConnectionStatus.success) {
      showToast(`Connected to: ${electrumClientConnectionStatus.connectedTo}`, <TickIcon />);
      if (electrumErrorVisible) setElectrumErrorVisible(false);
    } else if (electrumClientConnectionStatus.failed) {
      showToast(`${electrumClientConnectionStatus.error}`, <ToastErrorIcon />);
      setElectrumErrorVisible(true);
    }
  }, [electrumClientConnectionStatus.success, electrumClientConnectionStatus.error]);

  useEffect(() => {
    if (electrumClientConnectionStatus.setElectrumNotConnectedErr) {
      showToast(`${electrumClientConnectionStatus.setElectrumNotConnectedErr}`, <ToastErrorIcon />);
      dispatch(resetElectrumNotConnectedErr());
    }
  }, [electrumClientConnectionStatus.setElectrumNotConnectedErr]);

  useEffect(() => {
    if (relayWalletUpdate) {
      if (defaultWalletCreation && wallets[collaborativeWallets.length]) {
        navigation.navigate('SetupCollaborativeWallet', {
          coSigner: wallets[collaborativeWallets.length],
          walletId: wallets[collaborativeWallets.length].id,
          collaborativeWalletsCount: collaborativeWallets.length,
        });
        dispatch(resetRealyWalletState());
        setDefaultWalletCreation(false);
      }
    }
    if (relayWalletError) {
      showToast(
        realyWalletErrorMessage || 'Something went wrong - Wallet creation failed',
        <ToastErrorIcon />
      );
      setDefaultWalletCreation(false);
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError, wallets]);

  return (
    <ScreenWrapper>
      <Header navigation={navigation} />
      <UAIStack navigation={navigation} />
      <Box style={styles.titleWrapper}>
        <Box style={styles.titleInfoView}>
          <Text style={styles.titleText} color={`${colorMode}.primaryText`} testID="text_HotWallet">
            {allWallets.length} Wallet
            {nonHiddenWallets?.length + collaborativeWallets?.length > 1 && 's'}
          </Text>
        </Box>
        <Box style={styles.netBalanceView} testID="view_netBalance">
          <CurrencyInfo
            hideAmounts={false}
            amount={netBalanceWallets + netBalanceAllVaults}
            fontSize={20}
            color={`${colorMode}.primaryText`}
            variation={colorMode === 'light' ? 'dark' : 'light'}
          />
        </Box>
      </Box>
      <Wallets
        navigation={navigation}
        setAddImportVisible={setAddImportVisible}
        wallets={allWallets}
      />
      <Keys />
      <Inheritance />
      <DowngradeModal navigation={navigation} />
      <AddWalletModal
        navigation={navigation}
        visible={addImportVisible}
        setAddImportVisible={setAddImportVisible}
        wallets={wallets}
        collaborativeWallets={collaborativeWallets}
        setDefaultWalletCreation={setDefaultWalletCreation}
      />
      <ElectrumDisconnectModal
        electrumErrorVisible={electrumErrorVisible}
        setElectrumErrorVisible={setElectrumErrorVisible}
      />
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  headerContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  uaiContainer: {
    margin: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletContainer: {
    borderRadius: hp(10),
    height: hp(210),
    padding: '10%',
    justifyContent: 'flex-end',
  },
  walletBalance: {
    marginTop: hp(12),
  },
  walletName: {
    letterSpacing: 0.2,
    fontSize: 14,
    fontWeight: '400',
  },
  walletType: {
    letterSpacing: 0.2,
    fontSize: 11,
    fontWeight: '400',
  },
  walletDetailsWrapper: {
    marginTop: 5,
    width: '68%',
  },
  walletIconWrapper: {
    marginVertical: hp(5),
  },
  walletCard: {
    paddingTop: windowHeight > 680 ? hp(20) : 0,
  },
  walletInnerView: {
    width: wp(170),
  },
  titleWrapper: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginVertical: hp(20),
    justifyContent: 'space-between',
  },
  titleText: {
    fontSize: 16,
  },
  titleInfoView: {
    width: '60%',
  },
  netBalanceView: {
    width: '40%',
    alignItems: 'flex-end',
  },
});
