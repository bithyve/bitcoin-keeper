import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, Pressable, View } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { getAmt, getCurrencyImageByRegion, getUnit } from 'src/common/constants/Bitcoin';
import { Shadow } from 'react-native-shadow-2';
import AddSCardIcon from 'src/assets/images/card_add.svg';
import BtcWallet from 'src/assets/images/btc_walletCard.svg';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletInsideGreen from 'src/assets/images/Wallet_inside_green.svg';
import { WalletType } from 'src/core/wallets/enums';
import { useNavigation } from '@react-navigation/native';
import { LocalizationContext } from 'src/common/content/LocContext';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { useAppSelector } from 'src/store/hooks';
import GradientIcon from './GradientIcon';
import BTC from 'src/assets/images/btc_wallet.svg';
import KeeperModal from 'src/components/KeeperModal';
import PreMix from 'src/assets/images/icon_premix.svg';
import PostMix from 'src/assets/images/icon_postmix.svg';
import BadBank from 'src/assets/images/icon_badbank.svg';
import Deposit from 'src/assets/images/icon_deposit.svg';
import { whirlpoolWalletTypeMap } from 'src/hooks/useWallets';

const AccountComponent = ({ title, balance, onPress, icon }) => {
  return (
    <Pressable
      style={{
        marginTop: hp(20),
        paddingHorizontal: wp(15),
        paddingVertical: hp(10),
        height: hp(55),
        width: wp(270),
        alignSelf: 'center',
        justifyContent: 'center',
        borderRadius: hp(5),
      }}
      backgroundColor="light.lightAccent"
      onPress={onPress}
    >
      <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box style={{ flexDirection: 'row', alignItems: 'center' }}>
          {icon}
          <Text style={{ fontSize: 11, letterSpacing: 1, marginLeft: wp(10) }}>{title}</Text>
        </Box>
        <Box flexDirection={'row'}>
          <Box
            style={{
              marginRight: 3,
              marginTop: 3,
            }}
          >
            <BTC />
          </Box>
          <Text style={{ fontSize: 20, letterSpacing: 1 }}>{balance}</Text>
        </Box>
      </Box>
    </Pressable>
  );
};

function SelectAccountContent({
  depositWallet,
  setSelectedAccount,
}: {
  depositWallet: Wallet;
  setSelectedAccount: any;
}) {
  return (
    <View>
      <AccountComponent
        title={'Deposit Wallet'}
        balance={'0.000024'}
        onPress={() => {
          setSelectedAccount(WalletType.DEFAULT);
        }}
        icon={<Deposit />}
      />

      <AccountComponent
        title={depositWallet?.whirlpoolConfig?.premixWallet?.presentationData?.name}
        balance={'0.000024'}
        onPress={() => {
          setSelectedAccount(WalletType.PRE_MIX);
        }}
        icon={<PreMix />}
      />

      <AccountComponent
        title={depositWallet?.whirlpoolConfig?.postmixWallet?.presentationData?.name}
        balance={'0.000024'}
        onPress={() => {}}
        icon={<PostMix />}
      />

      <AccountComponent
        title={depositWallet?.whirlpoolConfig?.badbankWallet?.presentationData?.name}
        balance={'0.000024'}
        onPress={() => {}}
        icon={<BadBank />}
      />
    </View>
  );
}

const AddNewWalletTile = ({ walletIndex, isActive, wallet, navigation }) => {
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
};

const WhirlpoolWalletTile = ({
  isActive,
  selectedWallet,
  setAccountSelectionModalVisible,
  currentCurrency,
  currencyCode,
}) => {
  return (
    <Box>
      <Box style={{ ...styles.walletCard, height: wp(40) }}>
        <Box style={styles.walletInnerView}>
          <GradientIcon
            Icon={WalletInsideGreen}
            height={35}
            gradient={isActive ? ['#FFFFFF', '#80A8A1'] : ['#9BB4AF', '#9BB4AF']}
          />
          <Box
            style={{
              marginLeft: 10,
            }}
          >
            <Text color="light.white" style={styles.walletName}>
              {selectedWallet?.presentationData?.name}
            </Text>
            <Text
              color="light.white"
              style={styles.walletDescription}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {selectedWallet?.presentationData?.description}
            </Text>
          </Box>
        </Box>
      </Box>

      <Pressable
        style={{
          marginTop: hp(20),
          paddingHorizontal: wp(15),
          paddingVertical: hp(10),
          height: hp(55),
          width: wp(270),
          alignSelf: 'center',
          justifyContent: 'center',
          borderRadius: hp(5),
        }}
        backgroundColor="light.Glass"
        onPress={() => setAccountSelectionModalVisible(true)}
      >
        <Box
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text color="light.white" style={{ fontSize: 13, letterSpacing: 1 }}>
            {selectedWallet?.presentationData?.name}
          </Text>
          <Box>
            <Box flexDirection={'row'}>
              <Box
                style={{
                  marginRight: 3,
                  marginTop: 3,
                }}
              >
                {getCurrencyImageByRegion(currencyCode, 'light', currentCurrency, BtcWallet)}
              </Box>
              <Text color="light.white" style={{ fontSize: 20, letterSpacing: 1 }}>
                {selectedWallet?.presentationData?.name}
              </Text>
            </Box>
            <Text color="light.white" style={{ fontSize: 13, letterSpacing: 1 }}>
              Unconfirmed 0.00050
            </Text>
          </Box>
        </Box>
      </Pressable>
    </Box>
  );
};

const WalletTile = ({
  isActive,
  selectedWallet,
  currentCurrency,
  currencyCode,
  exchangeRates,
  satsEnabled,
  balances,
}) => {
  return (
    <Box>
      <Box style={styles.walletCard}>
        <Box style={styles.walletInnerView}>
          <GradientIcon
            Icon={WalletInsideGreen}
            height={35}
            gradient={isActive ? ['#FFFFFF', '#80A8A1'] : ['#9BB4AF', '#9BB4AF']}
          />
          <Box
            style={{
              marginLeft: 10,
            }}
          >
            <Text color="light.white" style={styles.walletName}>
              {selectedWallet?.presentationData?.name}
            </Text>
            <Text
              color="light.white"
              style={styles.walletDescription}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {selectedWallet?.presentationData?.name}
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
              {getCurrencyImageByRegion(currencyCode, 'light', currentCurrency, BtcWallet)}
            </Box>
            <Text color="light.white" style={styles.unconfirmedBalance}>
              {getAmt(
                balances?.unconfirmed,
                exchangeRates,
                currencyCode,
                currentCurrency,
                satsEnabled
              )}
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
            {getCurrencyImageByRegion(currencyCode, 'light', currentCurrency, BtcWallet)}
          </Box>
          <Text color="light.white" style={styles.availableBalance}>
            {getAmt(
              balances?.confirmed + balances?.unconfirmed,
              exchangeRates,
              currencyCode,
              currentCurrency,
              satsEnabled
            )}
            <Text color="light.textColor" style={styles.balanceUnit}>
              {getUnit(currentCurrency, satsEnabled)}
            </Text>
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

function WalletItem({
  item,
  index,
  walletIndex,
  exchangeRates,
  currencyCode,
  currentCurrency,
  satsEnabled,
  navigation,
  translations,
}: {
  item: Wallet;
  index: number;
  walletIndex: number;
  exchangeRates: any;
  currencyCode: string;
  currentCurrency: any;
  satsEnabled: boolean;
  navigation;
  translations;
}) {
  if (!item) {
    return null;
  }
  const isActive = index === walletIndex;
  const { wallet } = translations;
  const [selectedAccount, setSelectedAccount] = useState(WalletType.DEFAULT);
  const [accountSelectionModalVisible, setAccountSelectionModalVisible] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet>();
  const isWhirlpoolWallet = Boolean(item?.whirlpoolConfig?.whirlpoolWalletDetails);

  useEffect(() => {
    if (isWhirlpoolWallet) {
      if (selectedAccount === WalletType.DEFAULT) {
        setSelectedWallet(item);
      } else setSelectedWallet(item.whirlpoolConfig[whirlpoolWalletTypeMap[selectedAccount]]);
    } else {
      setSelectedWallet(item);
    }
  }, [selectedAccount]);

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
          ) : isWhirlpoolWallet ? (
            <WhirlpoolWalletTile
              isActive={isActive}
              selectedWallet={selectedWallet}
              setAccountSelectionModalVisible={setAccountSelectionModalVisible}
              currentCurrency={currentCurrency}
              currencyCode={currencyCode}
            />
          ) : (
            <WalletTile
              isActive={isActive}
              selectedWallet={selectedWallet}
              currentCurrency={currentCurrency}
              currencyCode={currencyCode}
              exchangeRates={exchangeRates}
              satsEnabled={satsEnabled}
              balances={selectedWallet?.specs?.balances}
            />
          )}
        </Box>
        <KeeperModal
          visible={accountSelectionModalVisible}
          close={() => {
            setAccountSelectionModalVisible(false);
          }}
          title="Select Account"
          subTitle="Select Account Type"
          Content={() => (
            <SelectAccountContent depositWallet={item} setSelectedAccount={setSelectedAccount} />
          )}
        />
      </View>
    </Shadow>
  );
}

function WalletList({ flatListRef, walletIndex, onViewRef, viewConfigRef, wallets }: any) {
  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);

  return (
    <Box style={styles.walletsContainer}>
      <FlatList
        ref={flatListRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={wallets.concat({ isEnd: true })}
        renderItem={({ item, index }) => (
          <WalletItem
            item={item}
            index={index}
            walletIndex={walletIndex}
            exchangeRates={exchangeRates}
            currencyCode={currencyCode}
            currentCurrency={currentCurrency}
            satsEnabled={satsEnabled}
            navigation={navigation}
            translations={translations}
          />
        )}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        snapToAlignment="start"
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
    width: wp(310),
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
    width: wp(173),
  },
  walletDescription: {
    letterSpacing: 0.24,
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
});
