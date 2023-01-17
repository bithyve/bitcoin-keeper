/* eslint-disable react/prop-types */
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, Pressable, View } from 'native-base';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { getAmt, getCurrencyImageByRegion, getUnit } from 'src/common/constants/Bitcoin';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';

// icons and images

import AddSCardIcon from 'src/assets/images/card_add.svg';
import AddWalletIcon from 'src/assets/images/addWallet_illustration.svg';
import BTC from 'src/assets/images/btc_wallet.svg';
import NoTransactionIcon from 'src/assets/images/noTransaction.svg';
import BtcWallet from 'src/assets/images/btc_walletCard.svg';
import IconSettings from 'src/assets/images/icon_settings.svg';
import KeeperModal from 'src/components/KeeperModal';
import LinearGradient from 'src/components/KeeperGradient';
// data
import { LocalizationContext } from 'src/common/content/LocContext';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import Recieve from 'src/assets/images/receive.svg';
import Send from 'src/assets/images/send.svg';
import { Shadow } from 'react-native-shadow-2';
// components and interfaces and hooks
import TransactionElement from 'src/components/TransactionElement';
import { Vault } from 'src/core/wallets/interfaces/vault';
import VaultSetupIcon from 'src/assets/images/vault_setup.svg';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletInsideGreen from 'src/assets/images/Wallet_inside_green.svg';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal } from 'src/store/reducers/wallets';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation } from '@react-navigation/native';
import openLink from 'src/utils/OpenLink';
import { TransferType } from 'src/common/data/enums/TransferType';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HeaderTitle from 'src/components/HeaderTitle';
import EmptyStateView from 'src/components/EmptyView/EmptyStateView';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';

function WalletDetails({ route }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();

  const { useQuery } = useContext(RealmWrapperContext);
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet).map(getJSONFromRealmObject);
  const vaults: Vault[] = useQuery(RealmSchema.Vault).map(getJSONFromRealmObject);
  const vaultExsist = Boolean(vaults.length);
  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind)

  const netBalance = useAppSelector((state) => state.wallet.netBalance);
  const introModal = useAppSelector((state) => state.wallet.introModal);

  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;

  const [walletIndex, setWalletIndex] = useState<number>(0);
  const [pullRefresh, setPullRefresh] = useState(false);
  const currentWallet = wallets[walletIndex];
  const transections = wallets[walletIndex]?.specs?.transactions || [];
  const { autoRefresh } = route?.params || {};

  useEffect(() => {
    if (autoRefresh) pullDownRefresh();
  }, [autoRefresh]);

  const onViewRef = useRef((viewableItems) => {
    const index = viewableItems.changed.find((item) => item.isViewable === true);
    setWalletIndex(index.index);
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  function _renderItem({ item, index }: { item; index }) {
    const walletName = item?.presentationData?.name;
    const walletDescription = item?.presentationData?.description;
    const balances = item?.specs?.balances;
    const walletBalance = balances?.confirmed + balances?.unconfirmed;
    const isActive = index === walletIndex;

    return (
      <Shadow
        distance={9}
        startColor="#e4e4e4"
        offset={[0, 14]}
        viewStyle={{
          height: hp(150),
          marginRight: 15,
        }}
      >
        <LinearGradient
          colors={isActive ? ['light.gradientStart', 'light.gradientEnd'] : ['#06423C', '#06423C']}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.walletContainer}
        >
          {!(item?.presentationData && item?.specs) ? (
            <TouchableOpacity
              style={styles.addWalletContainer}
              onPress={() => navigation.navigate('EnterWalletDetail', wallets.length)}
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
          ) : (
            <Box style={styles.walletCard}>
              <GradientIcon
                Icon={WalletInsideGreen}
                height={40}
                gradient={isActive ? ['#FFFFFF', '#80A8A1'] : ['#9BB4AF', '#9BB4AF']}
              />
              <Box>
                <Text color="light.white" style={styles.walletDescription}>
                  {walletDescription}
                </Text>
                <Text color="light.white" style={styles.walletName}>
                  {walletName}
                </Text>
              </Box>
              <Box style={styles.walletBalance}>
                <Box
                  style={{
                    marginRight: 3,
                  }}
                >
                  {getCurrencyImageByRegion(currencyCode, 'light', currentCurrency, BtcWallet)}
                </Box>
                <Text
                  color="light.white"
                  style={{
                    fontSize: hp(24),
                    letterSpacing: 1.2,
                    lineHeight: hp(34),
                  }}
                >
                  {getAmt(walletBalance, exchangeRates, currencyCode, currentCurrency)}
                  <Text color="light.textColor" style={styles.balanceUnit}>
                    {getUnit(currentCurrency)}
                  </Text>
                </Text>
              </Box>
            </Box>
          )}
        </LinearGradient>
      </Shadow>
    );
  }

  const pullDownRefresh = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([currentWallet], { hardRefresh: true }));
    setPullRefresh(false);
  };

  const renderTransactionElement = ({ item }) => (
    <TransactionElement
      transaction={item}
      onPress={() => {
        navigation.dispatch(
          CommonActions.navigate('TransactionDetails', {
            transaction: item,
          })
        );
      }}
    />
  );

  function GradientIcon({ height, Icon, gradient = ['#9BB4AF', '#9BB4AF'] }) {
    return (
      <LinearGradient
        colors={gradient}
        start={[0, 0]}
        end={[1, 1]}
        style={{
          height: hp(height),
          width: hp(height),
          borderRadius: height,
          ...styles.center,
        }}
      >
        <Icon />
      </LinearGradient>
    );
  }
  function LinkedWalletContent() {
    return (
      <View marginY={5}>
        <Box alignSelf="center">
          <VaultSetupIcon />
        </Box>
        <Text marginTop={hp(20)} color="white" fontSize={13} letterSpacing={0.65} padding={1}>
          You can use the individual wallet’s Recovery Phrases to connect other bitcoin apps to
          Keeper
        </Text>
        <Text color="white" fontSize={13} letterSpacing={0.65} padding={1}>
          When the funds in a wallet cross a threshold, a transfer to the vault is triggered. This
          ensures you don’t have more sats in hot wallets than you need.
        </Text>
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <HeaderTitle />
      <Box style={styles.headerContainer}>
        <Text color="light.textWallet" style={styles.headerTitle}>
          {wallets?.length} Linked Wallets
        </Text>

        <Box style={styles.headerBalanceContainer}>
          <Box style={styles.headerBTCIcon}>
            {getCurrencyImageByRegion(currencyCode, 'dark', currentCurrency, BTC)}

          </Box>
          <Text color="light.textWallet" fontSize={hp(30)} style={styles.headerBalance}>
            {getAmt(netBalance, exchangeRates, currencyCode, currentCurrency)}
            <Text color="light.textColorDark" style={styles.balanceUnit}>
              {getUnit(currentCurrency)}
            </Text>
          </Text>
        </Box>
      </Box>

      <Box style={styles.walletsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[...wallets, { isEnd: true }]}
          renderItem={_renderItem}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
          snapToAlignment={'start'}
        />
      </Box>

      {walletIndex !== wallets.length ? (
        <>
          {/* {Transfer pollicy} */}
          <Box style={styles.transferPolicyContainer}>
            <Box backgroundColor="light.accent" style={styles.transferPolicyCard}>
              <Box
                style={{
                  paddingLeft: wp(10),
                }}
              >
                <Text
                  color="light.learnMoreBorder"
                  fontSize={12}
                  style={{
                    letterSpacing: 0.6,
                  }}
                >
                  Available to spend
                  <Text bold>
                    {' '}
                    {'\n'}฿ {wallets[walletIndex].specs.balances.confirmed}sats
                  </Text>
                </Text>
              </Box>
            </Box>
            <Pressable
              backgroundColor="light.accent"
              style={styles.transferPolicyCard}
              onPress={() => {
                if (vaultExsist) {
                  navigation.navigate('SendConfirmation', {
                    transferType: TransferType.WALLET_TO_VAULT,
                    walletId: wallets[walletIndex].id,
                  });
                } else showToast('Vault is not created', <ToastErrorIcon />);
              }}
            >
              <Box style={{ paddingLeft: wp(10) }}>
                <Text
                  color="light.learnMoreBorder"
                  fontSize={12}
                  style={{
                    letterSpacing: 0.6,
                  }}
                >
                  Transfer Policy is set at{'  '}
                  <Text bold>฿ {wallets[walletIndex].specs.transferPolicy}sats</Text>
                </Text>
              </Box>
            </Pressable>
          </Box>

          <Box style={styles.transactions}>
            <Text color="light.textBlack" style={styles.transactionText}>
              Transactions
            </Text>
          </Box>

          <Box style={styles.transactionsListContainer}>
            <FlatList
              refreshControl={
                <RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />
              }
              data={transections}
              renderItem={renderTransactionElement}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <EmptyStateView
                  IllustartionImage={NoTransactionIcon}
                  title={'No transactions yet.'}
                  subTitle={'Pull down to refresh'}
                />
              }
            />
          </Box>
          <Box style={styles.footerContainer}>
            <Box style={styles.border} borderColor="light.GreyText" />
            <Box style={styles.footerItemContainer}>
              <TouchableOpacity
                style={styles.IconText}
                onPress={() => {
                  navigation.navigate('Send', { sender: currentWallet });
                }}
              >
                <Send />
                <Text color="light.primaryText" style={styles.footerItemText}>
                  Send
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.IconText}
                onPress={() => {
                  navigation.navigate('Receive', { wallet: currentWallet });
                }}
              >
                <Recieve />
                <Text color="light.primaryText" style={styles.footerItemText}>
                  Receive
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.IconText}
                onPress={() => {
                  navigation.navigate('WalletSettings', { wallet: currentWallet });
                }}
              >
                <IconSettings />
                <Text color="light.primaryText" style={styles.footerItemText}>
                  Settings
                </Text>
              </TouchableOpacity>
            </Box>
          </Box>
        </>
      ) : (
        <Box style={styles.addNewWalletContainer}>
          <AddWalletIcon />
          <Text color="light.primaryText" numberOfLines={2} style={styles.addNewWalletText}>
            Add a new wallet or import one
          </Text>
        </Box>
      )}
      <KeeperModal
        visible={introModal}
        close={() => {
          dispatch(setIntroModal(false));
        }}
        title="Bip-85 Wallets"
        subTitle="Create as many (hot) wallets as you want, and backup with a single Recovery Phrase"
        modalBackground={['light.gradientStart', 'light.gradientEnd']}
        textColor="light.white"
        Content={LinkedWalletContent}
        DarkCloseIcon
        learnMore
        learnMoreCallback={() => openLink('https://www.bitcoinkeeper.app/')}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  backIcon: {
    height: 50,
    width: 50,
    paddingTop: 6,
    alignItems: 'flex-start',
  },
  IconText: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addWalletContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  transferPolicyCard: {
    paddingHorizontal: wp(10),
    height: hp(50),
    width: '48%',
    borderRadius: hp(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    letterSpacing: 0.96,
    fontSize: 16,
    marginTop: hp(10),
  },
  headerContainer: {
    alignItems: 'center',
  },
  headerBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(35),
  },
  headerBTCIcon: {
    marginRight: 3,
    marginBottom: -hp(10),
  },
  headerBalance: {
    letterSpacing: 1.5,
  },
  balanceUnit: {
    letterSpacing: 0.6,
    fontSize: 12,
  },
  walletsContainer: {
    marginTop: 18,
    height: hp(180),
    width: '100%',
  },
  walletContainer: {
    borderRadius: hp(10),
    width: wp(170),
    height: hp(170),
    position: 'relative',
    marginLeft: 0,
  },
  addWalletText: {
    fontSize: 14,
    marginTop: hp(10),
  },
  walletCard: {
    marginTop: hp(20),
    marginLeft: wp(20),
  },
  walletName: {
    letterSpacing: 0.24,
    fontSize: 12,
  },
  walletDescription: {
    letterSpacing: 0.2,
    fontSize: 10,
    fontWeight: '400',
    marginTop: hp(10),
  },
  walletBalance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transferPolicyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(24),
    width: '100%',
  },
  transactionText: {
    marginLeft: wp(10),
    fontSize: 16,
    letterSpacing: 1.28,
  },
  viewAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp(2),
  },
  transactionsListContainer: {
    marginTop: hp(10),
    height: hp(250),
    position: 'relative',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    width: wp(375),
    paddingHorizontal: 5,
  },
  border: {
    borderWidth: 0.5,
    borderRadius: 20,
    opacity: 0.2,
  },
  footerItemContainer: {
    flexDirection: 'row',
    marginTop: windowHeight > 800 ? 15 : 5,
    marginBottom: windowHeight > 800 ? hp(10) : 0,
    justifyContent: 'space-evenly',
    marginHorizontal: 16,
  },
  footerItemText: {
    fontSize: 12,
    letterSpacing: 0.84,
    marginVertical: 5,
  },
  addNewWalletText: {
    fontSize: 12,
    letterSpacing: 0.6,
    marginVertical: 5,
    marginHorizontal: 16,
    opacity: 0.85,
    fontWeight: '300',
  },
  addNewWalletContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});
export default WalletDetails;
