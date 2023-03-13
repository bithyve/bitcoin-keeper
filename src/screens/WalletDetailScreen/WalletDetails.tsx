/* eslint-disable react/prop-types */
import { FlatList, Linking, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, Pressable, View } from 'native-base';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { getAmt, getCurrencyImageByRegion, getUnit } from 'src/common/constants/Bitcoin';
import { Shadow } from 'react-native-shadow-2';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation } from '@react-navigation/native';
// icons and images
import AddSCardIcon from 'src/assets/images/card_add.svg';
import AddWalletIcon from 'src/assets/images/addWallet_illustration.svg';
import BTC from 'src/assets/images/btc_wallet.svg';
import NoTransactionIcon from 'src/assets/images/noTransaction.svg';
import BtcWallet from 'src/assets/images/btc_walletCard.svg';
import IconSettings from 'src/assets/images/icon_settings.svg';
import BuyBitcoin from 'src/assets/images/icon_buy.svg';
import KeeperModal from 'src/components/KeeperModal';
import LinearGradient from 'src/components/KeeperGradient';
import Arrow from 'src/assets/images/arrow_brown.svg';
import Recieve from 'src/assets/images/receive.svg';
import Send from 'src/assets/images/send.svg';
import PreMix from 'src/assets/images/icon_premix.svg';
import PostMix from 'src/assets/images/icon_postmix.svg';
import BadBank from 'src/assets/images/icon_badbank.svg';
import Deposit from 'src/assets/images/icon_deposit.svg';
// data
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import { LocalizationContext } from 'src/common/content/LocContext';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
// components and interfaces and hooks
import Text from 'src/components/KeeperText';
import TransactionElement from 'src/components/TransactionElement';
import { Vault } from 'src/core/wallets/interfaces/vault';
import VaultSetupIcon from 'src/assets/images/vault_setup.svg';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletInsideGreen from 'src/assets/images/Wallet_inside_green.svg';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal } from 'src/store/reducers/wallets';
import { useAppSelector } from 'src/store/hooks';
import openLink from 'src/utils/OpenLink';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HeaderTitle from 'src/components/HeaderTitle';
import EmptyStateView from 'src/components/EmptyView/EmptyStateView';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { WalletType } from 'src/core/wallets/enums';
import Buttons from 'src/components/Buttons';
import { fetchRampReservation } from 'src/services/ramp';

function WalletDetails({ route }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();

  const { useQuery } = useContext(RealmWrapperContext);
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet).map(getJSONFromRealmObject) || [];
  const vaults: Vault[] = useQuery(RealmSchema.Vault).map(getJSONFromRealmObject) || [];
  const vaultExsist = Boolean(vaults.length);
  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const { satsEnabled } = useAppSelector((state) => state.settings);

  const netBalance = useAppSelector((state) => state.wallet.netBalance) || 0;
  const introModal = useAppSelector((state) => state.wallet.introModal) || false;
  const [showBuyRampModal, setShowBuyRampModal] = useState(false);
  const [selectAccount, setselectAccount] = useState(false);
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

  const flatListRef = useRef(null);

  const handleScrollToIndex = (index) => {
    if (index !== undefined && flatListRef && flatListRef?.current) {
      flatListRef?.current?.scrollToIndex({ index });
    }
  };

  const onViewRef = useRef((viewableItems) => {
    const index = viewableItems.changed.find((item) => item.isViewable === true);
    if (index?.index !== undefined) {
      handleScrollToIndex(index?.index);
      setWalletIndex(index?.index);
    }
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 20 });

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
          height: hp(137),
          marginRight: 15,
        }}
      >
        <Box
          variant={isActive ? 'linearGradient' : 'InactiveGradient'}
          style={styles.walletContainer}
        >
          {!(item?.presentationData && item?.specs) ? (
            <TouchableOpacity
              style={styles.addWalletContainer}
              onPress={() =>
                navigation.navigate('EnterWalletDetail', {
                  name: `Wallet ${wallets.length + 1}`,
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
          ) : (
            true ?
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
                        {walletName}
                      </Text>
                      <Text
                        color="light.white"
                        style={styles.walletDescription}
                        ellipsizeMode="tail"
                        numberOfLines={1}
                      >
                        {walletDescription}
                      </Text>
                    </Box>
                  </Box>

                </Box>

                <Pressable style={{
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
                  onPress={() => setselectAccount(true)}
                >
                  <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <PreMix />
                      <Text color="light.white" style={{ fontSize: 13, letterSpacing: 1, marginLeft: wp(10) }}>
                        PerMix Account
                      </Text>
                    </Box>
                    <Box>
                      <Box flexDirection={'row'}>
                        <Box
                          style={{
                            marginRight: 3, marginTop: 3
                          }}
                        >
                          {getCurrencyImageByRegion(currencyCode, 'light', currentCurrency, BtcWallet)}
                        </Box>
                        <Text color="light.white" style={{ fontSize: 20, letterSpacing: 1 }}>
                          0.000024
                        </Text>
                      </Box>
                      <Text color="light.white" style={{ fontSize: 13, letterSpacing: 1 }}>
                        Unconfirmed 0.00050
                      </Text>
                    </Box>
                  </Box>
                </Pressable>
              </Box>
              :
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
                        {walletName}
                      </Text>
                      <Text
                        color="light.white"
                        style={styles.walletDescription}
                        ellipsizeMode="tail"
                        numberOfLines={1}
                      >
                        {walletDescription}
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
                        walletBalance,
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
          )}
        </Box>
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
  const AccountComponent = ({ title, balance, onPress, icon }) => {
    return (
      <Pressable style={{
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
            <Text style={{ fontSize: 13, letterSpacing: 1, marginLeft: wp(10) }}>
              {title}
            </Text>
          </Box>
          <Box flexDirection={'row'}>
            <Box
              style={{
                marginRight: 3, marginTop: 3
              }}
            >
              {getCurrencyImageByRegion(currencyCode, 'light', currentCurrency, BTC)}
            </Box>
            <Text style={{ fontSize: 20, letterSpacing: 1 }}>
              {balance}
            </Text>
          </Box>
        </Box>
      </Pressable>
    );
  }

  function SelectAccountContent() {
    return (
      <View >
        <AccountComponent
          title={'Deposit'}
          balance={'0.000024'}
          onPress={() => { }}
          icon={<Deposit />} />

        <AccountComponent
          title={'PreMix Account'}
          balance={'0.000024'}
          onPress={() => { }}
          icon={<PreMix />} />

        <AccountComponent
          title={'PostMix Account'}
          balance={'0.000024'}
          onPress={() => { }}
          icon={<PostMix />} />

        <AccountComponent
          title={'Bad bank Account'}
          balance={'0.000024'}
          onPress={() => { }}
          icon={<BadBank />} />
      </View>
    );
  }

  function RampBuyContent() {
    return (
      <Box padding={1}>
        <Text color="#073B36" fontSize={13} letterSpacing={0.65} my={1}>
          By proceeding, you understand that Ramp will process the payment and transfer for the
          purchased bitcoin
        </Text>
        <Box
          my={4}
          alignItems="center"
          borderRadius={10}
          p={4}
          backgroundColor="#FDF7F0"
          flexDirection="row"
        >
          <GradientIcon Icon={WalletInsideGreen} height={35} gradient={['#FFFFFF', '#80A8A1']} />
          <Box mx={4}>
            <Text fontSize={12} color="#5F6965">
              Bitcoin will be transferred to
            </Text>
            <Text fontSize={19} letterSpacing={1.28} color="#041513">
              {wallets[walletIndex].presentationData.name}
            </Text>
            <Text
              fontStyle="italic"
              fontSize={12}
              color="#00836A"
            >{`Balance: ${wallets[walletIndex].specs.balances.confirmed} sats`}</Text>
          </Box>
        </Box>

        <Box
          my={4}
          alignItems="center"
          borderRadius={10}
          px={4}
          py={6}
          backgroundColor="#FDF7F0"
          flexDirection="row"
        >
          <Box
            backgroundColor="#FAC48B"
            borderRadius={20}
            height={10}
            width={10}
            justifyItems="center"
            alignItems="center"
          >
            <Text fontSize={22}>@</Text>
          </Box>
          <Box mx={4}>
            <Text fontSize={12} color="#5F6965">
              Address for ramp transactions
            </Text>
            <Text
              width={wp(200)}
              ellipsizeMode="middle"
              numberOfLines={1}
              fontSize={19}
              letterSpacing={1.28}
              color="#041513"
            >
              {wallets[walletIndex].specs.receivingAddress}
            </Text>
          </Box>
        </Box>
        <Buttons
          secondaryText="Cancel"
          secondaryCallback={() => {
            setShowBuyRampModal(false);
          }}
          primaryText="Buy Bitcoin"
          primaryCallback={() => buyWithRamp(wallets[walletIndex].specs.receivingAddress)}
        />
      </Box>
    );
  }

  const buyWithRamp = (address: string) => {
    try {
      setShowBuyRampModal(false);
      Linking.openURL(fetchRampReservation({ receiveAddress: address }));
    } catch (error) {
      console.log(error);
    }
  };

  const onPressBuyBitcoin = () => setShowBuyRampModal(true);

  return (
    <ScreenWrapper>
      <HeaderTitle learnMore learnMorePressed={() => dispatch(setIntroModal(true))} />
      <Box style={styles.headerContainer}>
        <Text color="light.textWallet" style={styles.headerTitle}>
          {wallets?.length} Linked Wallets
        </Text>

        <Box style={styles.headerBalanceContainer}>
          <Box style={styles.headerBTCIcon}>
            {getCurrencyImageByRegion(currencyCode, 'dark', currentCurrency, BTC)}
          </Box>
          <Text color="light.textWallet" fontSize={hp(30)} style={styles.headerBalance}>
            {getAmt(netBalance, exchangeRates, currencyCode, currentCurrency, satsEnabled)}
            <Text color="light.textColorDark" style={styles.balanceUnit}>
              {getUnit(currentCurrency, satsEnabled)}
            </Text>
          </Text>
        </Box>
      </Box>

      <Box style={styles.walletsContainer}>
        <FlatList
          ref={flatListRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[...wallets, { isEnd: true }]}
          renderItem={_renderItem}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
          snapToAlignment="start"
        />
      </Box>

      {walletIndex !== undefined && walletIndex !== wallets.length ? (
        <>
          {/* {Transfer pollicy} */}
          <Box style={styles.transferPolicyContainer}>
            <Pressable
              backgroundColor="light.accent"
              style={styles.transferPolicyCard}
              onPress={() => {
                if (vaultExsist) {
                  navigation.navigate('WalletSettings', {
                    wallet: currentWallet,
                    editPolicy: true,
                  });
                } else showToast('Create a vault to transfer', <ToastErrorIcon />);
              }}
            >
              <Box style={styles.transferPolicyContent}>
                <Box
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    color="light.learnMoreBorder"
                    fontSize={12}
                    style={{
                      letterSpacing: 0.6,
                    }}
                  >
                    Transfer Policy is set at{'  '}
                  </Text>
                  <Text
                    bold
                    color="light.learnMoreBorder"
                    style={{
                      fontSize: 14,
                      letterSpacing: 0.7,
                    }}
                  >
                    ฿{' '}
                    {getAmt(
                      wallets[walletIndex].transferPolicy.threshold,
                      exchangeRates,
                      currencyCode,
                      currentCurrency,
                      satsEnabled
                    )}
                    {getUnit(currentCurrency, satsEnabled)}
                  </Text>
                </Box>
                <Box>
                  <Arrow />
                </Box>
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
                  title="No transactions yet."
                  subTitle="Pull down to refresh"
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
              <TouchableOpacity style={styles.IconText} onPress={onPressBuyBitcoin}>
                <BuyBitcoin />
                <Text color="light.primaryText" style={styles.footerItemText}>
                  Buy Bitcoin
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
        visible={showBuyRampModal}
        close={() => {
          setShowBuyRampModal(false);
        }}
        title="Buy bitcoin with Ramp"
        subTitle="Ramp enables BTC purchases using Apple Pay, Debit/Credit card, Bank Transfer and open banking where available payment methods available may vary based on your country"
        subTitleColor="#5F6965"
        textColor="light.primaryText"
        Content={RampBuyContent}
      />
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
      <KeeperModal
        visible={selectAccount}
        close={() => {
          setselectAccount(false)
        }}
        title="Select Account"
        subTitle="Select Account Type"
        Content={SelectAccountContent}
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
    width: '100%',
    borderRadius: hp(5),
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
    marginTop: hp(-20),
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
    height: windowHeight > 800 ? hp(220) : hp(205),
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
  transferPolicyContent: {
    paddingLeft: wp(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
});
export default WalletDetails;
