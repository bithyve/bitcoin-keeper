import { StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, HStack, Pressable, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import idx from 'idx';
import { useNavigation } from '@react-navigation/native';
import AddWalletIcon from 'src/assets/images/addWallet_illustration.svg';
import WalletInsideGreen from 'src/assets/images/Wallet_inside_green.svg';
import WhirlpoolAccountIcon from 'src/assets/images/whirlpool_account.svg';
import Arrow from 'src/assets/images/arrow_brown.svg';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal } from 'src/store/reducers/wallets';
import { useAppSelector } from 'src/store/hooks';
import HeaderTitle from 'src/components/HeaderTitle';
import useWallets from 'src/hooks/useWallets';

import { WalletType } from 'src/core/wallets/enums';
import IconArrowBlack from 'src/assets/images/icon_arrow_black.svg';
import BtcBlack from 'src/assets/images/btc_black.svg';
import { getAmt, getCurrencyImageByRegion, getUnit } from 'src/common/constants/Bitcoin';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import useExchangeRates from 'src/hooks/useExchangeRates';
import Transactions from './components/Transactions';
import TransactionFooter from './components/TransactionFooter';
import RampModal from './components/RampModal';
import LearnMoreModal from './components/LearnMoreModal';
import CurrencyInfo from '../NewHomeScreen/components/CurrencyInfo';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';

export const allowedSendTypes = [
  WalletType.DEFAULT,
  WalletType.IMPORTED,
  WalletType.POST_MIX,
  WalletType.BAD_BANK,
];
export const allowedRecieveTypes = [WalletType.DEFAULT, WalletType.IMPORTED];

export const allowedMixTypes = [WalletType.DEFAULT, WalletType.IMPORTED];
// TODO: add type definitions to all components
function TransactionsAndUTXOs({ transactions, setPullRefresh, pullRefresh, wallet }) {
  const { walletSyncing } = useAppSelector((state) => state.wallet);
  const syncing = walletSyncing && wallet ? !!walletSyncing[wallet.id] : false;
  return (
    <Box style={styles.transactionsListContainer}>
      <ActivityIndicatorView visible={syncing} showLoader={false} />
      <Transactions
        transactions={transactions}
        setPullRefresh={setPullRefresh}
        pullRefresh={pullRefresh}
        currentWallet={wallet}
      />
    </Box>
  );
}

function Footer({ wallet, onPressBuyBitcoin, walletIndex }) {
  return (
    <TransactionFooter
      currentWallet={wallet}
      onPressBuyBitcoin={onPressBuyBitcoin}
      walletIndex={walletIndex}
    />
  );
}

function WalletDetails({ route }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const currencyCode = useCurrencyCode();
  const exchangeRates = useExchangeRates();
  const { autoRefresh, walletId, walletIndex } = route?.params || {};
  const wallet = useWallets({ walletIds: [walletId] })?.wallets[0];
  const {
    presentationData: { name, description } = { name: '', description: '' },
    specs: { balances: { confirmed, unconfirmed } } = {
      balances: { confirmed: 0, unconfirmed: 0 },
    },
  } = wallet;

  const receivingAddress = idx(wallet, (_) => _.specs.receivingAddress) || '';
  const balance = idx(wallet, (_) => _.specs.balances.confirmed) || 0;
  const presentationName = idx(wallet, (_) => _.presentationData.name) || '';

  const isWhirlpoolWallet = Boolean(wallet?.whirlpoolConfig?.whirlpoolWalletDetails);
  const introModal = useAppSelector((state) => state.wallet.introModal) || false;
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const [showBuyRampModal, setShowBuyRampModal] = useState(false);
  const [pullRefresh, setPullRefresh] = useState(false);

  useEffect(() => {
    if (autoRefresh) pullDownRefresh();
  }, [autoRefresh]);

  const pullDownRefresh = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([wallet], { hardRefresh: true }));
    setPullRefresh(false);
  };
  const onPressBuyBitcoin = () => setShowBuyRampModal(true);

  return (
    <Box style={styles.container} backgroundColor="light.greenText2">
      <StatusBar barStyle="light-content" backgroundColor="light.greenText2" />
      <VStack mr={5}>
        <HeaderTitle
          learnMore
          learnMorePressed={() => dispatch(setIntroModal(true))}
          backBtnBlackColor={false}
          learnBackgroundColor=""
          learnTextColor="light.white"
        />
      </VStack>
      <VStack>
        <Box style={styles.walletHeaderWrapper}>
          <Box style={styles.walletIconWrapper}>
            <Box style={styles.walletIconView} backgroundColor="light.white">
              {isWhirlpoolWallet ? <WhirlpoolAccountIcon /> : <WalletInsideGreen />}
            </Box>
          </Box>
          <Box style={styles.walletNameWrapper}>
            <Text color="light.white" style={styles.walletNameText}>
              {name}
            </Text>
            <Text color="light.white" style={styles.walletDescText}>
              {description}
            </Text>
          </Box>
        </Box>
        <Box style={styles.balanceWrapper}>
          <Box style={styles.unconfirmBalanceView}>
            <Text color="light.white">Unconfirmed</Text>
            <CurrencyInfo
              hideAmounts={false}
              amount={unconfirmed}
              fontSize={14}
              color="light.white"
            />
          </Box>
          <Box style={styles.availableBalanceView}>
            <Text color="light.white">Available Balance</Text>
            <CurrencyInfo
              hideAmounts={false}
              amount={confirmed}
              fontSize={22}
              color="light.white"
            />
          </Box>
        </Box>
      </VStack>
      <VStack
        backgroundColor="light.primaryBackground"
        px={wp(28)}
        borderTopLeftRadius={20}
        flex={1}
        justifyContent="space-between"
      >
        {/* <WalletInfo wallets={wallets} /> */}
        {/* {Transfer pollicy} */}
        <Box style={styles.transferPolicyContainer}>
          <Pressable
            backgroundColor="light.accent"
            style={styles.transferPolicyCard}
            onPress={() => {
              navigation.navigate('WalletSettings', {
                wallet,
                editPolicy: true,
              });
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
                  {getCurrencyImageByRegion(currencyCode, 'dark', currentCurrency, BtcBlack)}{' '}
                  {getAmt(
                    wallet?.transferPolicy.threshold,
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
        {wallet ? (
          <>
            {/* <UTXOsManageNavBox
            wallet={wallet}
            isWhirlpoolWallet={Boolean(wallet?.whirlpoolConfig?.whirlpoolWalletDetails?.length)}
            onClick={() => {
              navigation.navigate('UTXOManagement', {
                data: wallet,
                routeName: 'Wallet',
                accountType: WalletType.DEFAULT,
              });
            }}
          /> */}
            <HStack style={styles.transTitleWrapper}>
              <Text color="light.textBlack" fontSize={16} letterSpacing={1.28}>
                Transactions
              </Text>
              {wallet?.specs.transactions.length ? (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('VaultTransactions', {
                      title: 'Wallet Transactions',
                      subtitle: 'All incoming and outgoing transactions',
                    })
                  }
                >
                  <HStack alignItems="center">
                    {/* <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('VaultTransactions', {
                          title: 'Wallet Transactions',
                          subtitle: 'All incoming and outgoing transactions',
                        })
                      }
                    > */}
                    <Text
                      color="light.primaryGreen"
                      marginRight={2}
                      fontSize={11}
                      bold
                      letterSpacing={0.6}
                    >
                      View All
                    </Text>
                    {/* </TouchableOpacity> */}
                    <IconArrowBlack />
                  </HStack>
                </TouchableOpacity>
              ) : null}
            </HStack>
            <TransactionsAndUTXOs
              transactions={wallet?.specs.transactions}
              setPullRefresh={setPullRefresh}
              pullRefresh={pullRefresh}
              wallet={wallet}
            />
            <Footer
              wallet={wallet}
              onPressBuyBitcoin={onPressBuyBitcoin}
              walletIndex={walletIndex}
            />
          </>
        ) : (
          <Box style={styles.addNewWalletContainer}>
            <AddWalletIcon />
            <Text color="light.primaryText" numberOfLines={2} style={styles.addNewWalletText}>
              Add a new wallet or import one
            </Text>
          </Box>
        )}
      </VStack>
      <RampModal
        showBuyRampModal={showBuyRampModal}
        setShowBuyRampModal={setShowBuyRampModal}
        wallet={wallet}
        receivingAddress={receivingAddress}
        balance={balance}
        name={presentationName}
      />
      <LearnMoreModal introModal={introModal} setIntroModal={setIntroModal} />
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: '10%',
    justifyContent: 'space-between',
    flex: 1,
  },
  walletContainer: {
    borderRadius: hp(10),
    width: wp(310),
    height: hp(windowHeight > 700 ? 145 : 150),
    padding: wp(15),
    position: 'relative',
    marginLeft: 0,
  },
  transactionsListContainer: {
    paddingVertical: hp(10),
    height: windowHeight > 800 ? '66%' : '58%',
    position: 'relative',
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
  walletHeaderWrapper: {
    margin: wp(20),
    flexDirection: 'row',
    width: '100%',
  },
  walletIconWrapper: {
    width: '15%',
  },
  walletNameWrapper: {
    width: '85%',
  },
  walletNameText: {
    fontSize: 20,
  },
  walletDescText: {
    fontSize: 14,
  },
  walletIconView: {
    height: 40,
    width: 40,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceWrapper: {
    flexDirection: 'row',
    width: '90%',
    marginVertical: wp(20),
    marginHorizontal: wp(20),
  },
  unconfirmBalanceView: {
    width: '50%',
  },
  availableBalanceView: {
    width: '50%',
    alignItems: 'flex-end',
  },
  transTitleWrapper: {
    paddingTop: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transferPolicyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(15),
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
  transferPolicyContent: {
    paddingLeft: wp(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
});
export default WalletDetails;
