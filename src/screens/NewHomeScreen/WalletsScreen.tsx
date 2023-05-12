/* eslint-disable react/function-component-definition */
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useContext, useRef, useState } from 'react';
import useWallets from 'src/hooks/useWallets';
import { useAppSelector } from 'src/store/hooks';
import useBalance from 'src/hooks/useBalance';
import { Box, FlatList, ScrollView } from 'native-base';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { useNavigation } from '@react-navigation/native';
import { LocalizationContext } from 'src/common/content/LocContext';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { WalletType } from 'src/core/wallets/enums';
import GradientIcon from 'src/screens/WalletDetailScreen/components/GradientIcon';
import AddSCardIcon from 'src/assets/images/card_add.svg';
import BtcWallet from 'src/assets/images/btc_walletCard.svg';
import WalletInsideGreen from 'src/assets/images/Wallet_inside_green.svg';
import WhirlpoolAccountIcon from 'src/assets/images/whirlpool_account.svg';
import InheritanceIcon from 'src/assets/images/inheritanceWhite.svg';
import WhirlpoolWhiteIcon from 'src/assets/images/white_icon_whirlpool.svg';
import BitcoinIcon from 'src/assets/images/icon_bitcoin_white.svg';
import Hidden from 'src/assets/images/hidden.svg';
import Text from 'src/components/KeeperText';
import ListItemView from './components/ListItemView';
import HomeScreenWrapper from './components/HomeScreenWrapper';
import BalanceToggle from './components/BalanceToggle';
import CurrencyInfo from './components/CurrencyInfo'

const TILE_MARGIN = 10;
const TILE_WIDTH = 170;
const VIEW_WIDTH = TILE_WIDTH + TILE_MARGIN * 2;

function AddNewWalletTile({ walletIndex, isActive, wallet, navigation }) {
  return (
    <TouchableOpacity
      style={styles.addWalletContainer}
      onPress={() =>
        navigation.navigate('EnterWalletDetail', {
          name: `Wallet ${walletIndex + 1}`,
          description: 'Single-sig Wallet',
          type: WalletType.DEFAULT,
        })
      }
    >
      <GradientIcon
        Icon={AddSCardIcon}
        height={40}
        gradient={isActive ? ['#FFFFFF', '#80A8A1'] : ['#9BB4AF', '#9BB4AF']}
      />

      <Text color="light.white" style={styles.addWalletText}>
        {wallet.AddNewWallet}
      </Text>
    </TouchableOpacity>
  );
}

function WalletItem({
  item,
  index,
  walletIndex,
  navigation,
  translations,
  hideAmounts,
}: {
  currentIndex: number;
  item: Wallet;
  index: number;
  walletIndex: number;
  navigation;
  translations;
  hideAmounts: boolean;
}) {
  if (!item) {
    return null;
  }
  const isWhirlpoolWallet = Boolean(item?.whirlpoolConfig?.whirlpoolWalletDetails);
  const isActive = index === walletIndex;
  const { wallet } = translations;
  const margin = Math.abs(walletIndex - index) === 1 ? TILE_MARGIN / 2 : TILE_MARGIN;
  const width = VIEW_WIDTH - margin * 2;
  const opacity = Math.abs(walletIndex - index) === 1 ? 1 : 0.5;

  return (
    <View>
      <TouchableOpacity
        onPress={() => navigation.navigate('WalletDetails', { wallet: item })}
        style={[
          styles.walletContainer,
          { width, marginLeft: margin, marginRight: margin, opacity },
        ]}
      >
        {!(item?.presentationData && item?.specs) ? (
          <AddNewWalletTile
            walletIndex={walletIndex}
            isActive={isActive}
            wallet={wallet}
            navigation={navigation}
          />
        ) : (
          <WalletTile
            isWhirlpoolWallet={isWhirlpoolWallet}
            isActive={isActive}
            wallet={item}
            balances={item?.specs?.balances}
            hideAmounts={hideAmounts}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

function WalletList({ walletIndex, onViewRef, viewConfigRef, wallets, hideAmounts }: any) {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);

  return (
    <Box style={styles.walletsContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={wallets.concat({ isEnd: true })}
        disableIntervalMomentum
        decelerationRate="fast"
        snapToInterval={VIEW_WIDTH}
        snapToAlignment="start"
        renderItem={({ item, index }) => (
          <WalletItem
            hideAmounts={hideAmounts}
            item={item}
            index={index}
            walletIndex={walletIndex}
            navigation={navigation}
            translations={translations}
          />
        )}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
      />
    </Box>
  );
}

function WalletTile({ isActive, wallet, balances, isWhirlpoolWallet, hideAmounts }) {
  const { getBalance, getCurrencyIcon, getSatUnit } = useBalance();

  return (
    <Box>
      <Box style={styles.walletCard}>
        <Box style={styles.walletInnerView}>
          {isWhirlpoolWallet ? (
            <GradientIcon
              Icon={WhirlpoolAccountIcon}
              height={35}
              gradient={isActive ? ['#FFFFFF', '#80A8A1'] : ['#9BB4AF', '#9BB4AF']}
            />
          ) : (
            <GradientIcon
              Icon={WalletInsideGreen}
              height={35}
              gradient={isActive ? ['#FFFFFF', '#80A8A1'] : ['#9BB4AF', '#9BB4AF']}
            />
          )}

          <Box style={styles.walletDetailsWrapper}>
            <Text color="light.white" style={styles.walletName}>
              {wallet?.presentationData?.name}
            </Text>
            <Text
              color="light.white"
              style={styles.walletDescription}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {wallet?.presentationData?.description}
            </Text>
          </Box>
        </Box>
      </Box>

      <Box style={styles.walletBalance}>
        <Text color="light.white" style={styles.walletName}>
          Available Balance
        </Text>
        <CurrencyInfo hideAmounts={hideAmounts} amount={balances?.confirmed + balances?.unconfirmed} fontSize={20} color="light.white" />
      </Box>
    </Box>
  );
}

const WalletsScreen = () => {
  const { wallets } = useWallets();
  const netBalance = useAppSelector((state) => state.wallet.netBalance);
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();
  const [walletIndex, setWalletIndex] = useState<number>(0);
  const currentWallet = wallets[walletIndex];
  const flatListRef = useRef(null);
  const [hideAmounts, setHideAmounts] = useState(true);

  const onViewRef = useRef((viewableItems) => {
    const index = viewableItems.changed.find((item) => item.isViewable === true);
    if (index?.index !== undefined) {
      setWalletIndex(index?.index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 20 });

  return (
    <HomeScreenWrapper>
      <BalanceToggle hideAmounts={hideAmounts} setHideAmounts={setHideAmounts} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box style={styles.titleWrapper}>
          <Box style={styles.titleInfoView}>
            <Text style={styles.titleText} color="light.primaryText">
              {wallets?.length} Hot Wallet{wallets?.length > 1 && 's'}
            </Text>
            <Text style={styles.subTitleText} color="light.secondaryText">
              Single sig wallets for smaller stacks and transactions
            </Text>
          </Box>
          <Box style={styles.netBalanceView}>
            <CurrencyInfo hideAmounts={hideAmounts} amount={netBalance} fontSize={20} color="light.black" />
          </Box>
        </Box>
        <WalletList
          hideAmounts={hideAmounts}
          flatListRef={flatListRef}
          walletIndex={walletIndex}
          onViewRef={onViewRef}
          viewConfigRef={viewConfigRef}
          wallets={wallets}
        />
        <Box style={styles.listItemsWrapper}>
          <Box style={styles.whirlpoolListItemWrapper}>
            <ListItemView
              icon={<WhirlpoolWhiteIcon />}
              title="Whirlpool & UTXOs"
              subTitle="Manage UTXOs and Whirlpool"
              iconBackColor="light.greenText2"
            />
          </Box>
          <Box style={styles.listViewWrapper}>
            <Box style={styles.tranferPolicyWrapper}>
              <ListItemView
                icon={<InheritanceIcon />}
                title="Transfer Policy"
                subTitle="From wallet to vault"
                iconBackColor="light.greenText2"
              />
            </Box>
            <Box style={styles.buyWrapper}>
              <ListItemView
                icon={<BitcoinIcon />}
                title="Buy"
                subTitle="Stack sats in your wallet"
                iconBackColor="light.greenText2"
              />
            </Box>
          </Box>
        </Box>
      </ScrollView>
    </HomeScreenWrapper>
  );
};

export default WalletsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F2EC',
    paddingVertical: 15,
    paddingHorizontal: 20,
    position: 'relative',
  },
  titleWrapper: {
    marginVertical: hp(5),
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center'
  },
  titleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  subTitleText: {
    fontSize: 12,
  },
  addWalletContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  balanceUnit: {
    letterSpacing: 0.6,
    fontSize: 12,
  },
  walletsContainer: {
    marginTop: 18,
    height: hp(210),
    width: '100%',
  },
  walletContainer: {
    backgroundColor: '#2D6759',
    borderRadius: hp(10),
    width: wp(TILE_WIDTH),
    marginHorizontal: TILE_MARGIN / 2,
    height: hp(210),
    padding: wp(15),
    alignContent: 'space-between',
  },
  addWalletText: {
    fontSize: 14,
    marginTop: hp(10),
  },
  walletCard: {
    paddingTop: hp(20)
  },
  walletInnerView: {
    flexDirection: 'column',
    width: wp(170),
  },
  walletDescription: {
    letterSpacing: 0.2,
    fontSize: 13,
  },
  walletName: {
    letterSpacing: 0.2,
    fontSize: 11,
    fontWeight: '400',
  },
  walletBalance: {
    marginTop: hp(12),
  },
  border: {
    borderWidth: 0.5,
    borderRadius: 20,
    opacity: 0.2,
  },

  unconfirmedText: {
    fontSize: 11,
    letterSpacing: 0.72,
    textAlign: 'right',
  },
  unconfirmedBalance: {
    fontSize: 17,
    letterSpacing: 0.6,
    alignSelf: 'flex-end',
  },
  availableBalance: {
    fontSize: hp(24),
    letterSpacing: 1.2,
    lineHeight: hp(30),
  },
  atViewWrapper: {
    marginVertical: 4,
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: '#FDF7F0',
    flexDirection: 'row',
  },
  walletDetailsWrapper: {
    marginTop: 5,
    width: '68%',
  },
  listViewWrapper: {
    flexDirection: 'row',
    width: '99%',
    justifyContent: 'space-around',
  },
  tranferPolicyWrapper: {
    width: '48%',
    marginRight: wp(10)
  },
  buyWrapper: {
    width: '51%'
  },
  listItemsWrapper: {
    marginTop: hp(20),
    width: '99%',
  },
  whirlpoolListItemWrapper: {
    width: '99%',
  },
  titleInfoView: {
    width: '60%'
  },
  netBalanceView: {
    width: '40%',
    alignItems: 'center'
  }
});
