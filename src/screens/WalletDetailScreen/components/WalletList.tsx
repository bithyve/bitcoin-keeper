import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, View } from 'native-base';
import React, { useContext } from 'react';
import useBalance from 'src/hooks/useBalance';
import { Shadow } from 'react-native-shadow-2';
import AddSCardIcon from 'src/assets/images/card_add.svg';
import BtcWallet from 'src/assets/images/btc_walletCard.svg';
import { hp, windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletInsideGreen from 'src/assets/images/Wallet_inside_green.svg';
import WhirlpoolAccountIcon from 'src/assets/images/whirlpool_account.svg';
import { WalletType } from 'src/core/wallets/enums';
import { useNavigation } from '@react-navigation/native';
import { LocalizationContext } from 'src/common/content/LocContext';

import GradientIcon from './GradientIcon';

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

function WalletTile({
  isActive,
  wallet,
  balances,
  isWhirlpoolWallet,
}) {

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

          <Box
            style={styles.walletDetailsWrapper}
          >
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
        <Box>
          <Text color="light.white" style={styles.unconfirmedText}>
            Unconfirmed
          </Text>
          <Box style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Box
              style={{
                marginRight: 3,
              }}
            >
              {getCurrencyIcon(BtcWallet, 'light')}
            </Box>
            <Text color="light.white" style={styles.unconfirmedBalance}>
              {getBalance(balances?.unconfirmed)}
            </Text>
          </Box>
        </Box>
      </Box>

      <Box style={styles.walletBalance}>
        <Text color="light.white" style={styles.walletName}>
          Available Balance
        </Text>
        <Box style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Box
            style={{
              marginRight: 3,
            }}
          >
            {getCurrencyIcon(BtcWallet, 'light')}
          </Box>
          <Text color="light.white" style={styles.availableBalance}>
            {getBalance(balances?.confirmed + balances?.unconfirmed)}
            <Text color="light.textColor" style={styles.balanceUnit}>
              {getSatUnit()}
            </Text>
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

function WalletItem({
  item,
  index,
  walletIndex,
  navigation,
  translations,
}: {
  item: Wallet;
  index: number;
  walletIndex: number;
  navigation;
  translations;
}) {
  if (!item) {
    return null;
  }
  const isWhirlpoolWallet = Boolean(item?.whirlpoolConfig?.whirlpoolWalletDetails);
  const isActive = index === walletIndex;
  const { wallet } = translations;
  return (
    <Shadow
      distance={9}
      startColor="#e4e4e4"
      offset={[0, 14]}
      viewStyle={{
        height: hp(137),
        marginRight: 15,
      }}
    >
      <View>
        <Box
          variant={isActive ? 'linearGradient' : 'InactiveGradient'}
          style={styles.walletContainer}
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
            />
          )}
        </Box>
      </View>
    </Shadow>
  );
}

function WalletList({ walletIndex, onViewRef, viewConfigRef, wallets }: any) {
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
        snapToInterval={windowWidth * 0.8 + 15}
        snapToAlignment="start"
        renderItem={({ item, index }) => (
          <WalletItem
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

export default WalletList;

const styles = StyleSheet.create({
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
    height: hp(165),
    width: '100%',
  },
  walletContainer: {
    borderRadius: hp(10),
    width: windowWidth * 0.8,
    height: hp(windowHeight > 700 ? 145 : 150),
    padding: wp(15),
    position: 'relative',
    marginLeft: 0,
  },
  addWalletText: {
    fontSize: 14,
    marginTop: hp(10),
  },
  walletCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: hp(60),
  },
  walletInnerView: {
    flexDirection: 'row',
    alignItems: 'center',
    width: wp(170),
  },
  walletDescription: {
    letterSpacing: 0.20,
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
    marginLeft: 10,
    width: '68%'
  }
});
