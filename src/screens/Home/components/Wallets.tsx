import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useContext } from 'react';
import { Box, useColorMode } from 'native-base';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import CurrencyInfo from 'src/screens/HomeScreen/components/CurrencyInfo';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Text from 'src/components/KeeperText';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { EntityKind, VaultType } from 'src/core/wallets/enums';
import AddSCardIcon from 'src/assets/images/icon_add_white.svg';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { useAppSelector } from 'src/store/hooks';
import GradientIcon from 'src/screens/WalletDetails/components/GradientIcon';
import WhirlpoolAccountIcon from 'src/assets/images/whirlpool_account.svg';
import CollaborativeWalletIcon from 'src/assets/images/icon_collaborative_home.svg';
import WalletActiveIcon from 'src/assets/images/walleTabFilled.svg';
import WalletDark from 'src/assets/images/walletDark.svg';

const ITEM_SIZE = hp(220);

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

const Wallets = ({ navigation, setAddImportVisible, wallets, allBalance }) => {
  const { colorMode } = useColorMode();
  const items = [{ key: 'spacer-start' }, ...wallets, { key: 'add-wallet' }, { key: 'spacer-end' }];
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const { translations } = useContext(LocalizationContext);

  return (
    <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.walletWrapper}>
      <Box style={styles.titleWrapper}>
        <Box style={styles.titleInfoView}>
          <Text style={styles.titleText} color={`${colorMode}.primaryText`} testID="text_HotWallet">
            {wallets.length} Wallet
            {wallets > 1 && 's'}
          </Text>
        </Box>
        <Box style={styles.netBalanceView} testID="view_netBalance">
          <CurrencyInfo
            hideAmounts={false}
            amount={allBalance}
            fontSize={20}
            color={`${colorMode}.primaryText`}
            variation={colorMode === 'light' ? 'dark' : 'light'}
          />
        </Box>
      </Box>
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

export default Wallets;

const styles = StyleSheet.create({
  walletWrapper: {
    marginHorizontal: -20,
    padding: 20,
    paddingBottom: 20,
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
  addWalletContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  addWalletText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
