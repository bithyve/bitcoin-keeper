import { StyleSheet, TouchableOpacity } from 'react-native';
import { Box, HStack, Pressable, StatusBar, useColorMode, VStack } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import idx from 'idx';
import { useNavigation } from '@react-navigation/native';
import AddWalletIcon from 'src/assets/images/addWallet_illustration.svg';
import WalletInsideGreen from 'src/assets/images/Wallet_inside_green.svg';
import WhirlpoolAccountIcon from 'src/assets/images/whirlpool_account.svg';
import Arrow from 'src/assets/images/arrow_brown.svg';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal } from 'src/store/reducers/wallets';
import { useAppSelector } from 'src/store/hooks';
import KeeperHeader from 'src/components/KeeperHeader';
import useWallets from 'src/hooks/useWallets';

import { EntityKind, WalletType } from 'src/core/wallets/enums';
import IconArrowBlack from 'src/assets/images/icon_arrow_black.svg';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import useExchangeRates from 'src/hooks/useExchangeRates';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import Transactions from './components/Transactions';
import TransactionFooter from './components/TransactionFooter';
import RampModal from './components/RampModal';
import LearnMoreModal from './components/LearnMoreModal';
import CurrencyInfo from '../Home/components/CurrencyInfo';
import { LocalizationContext } from 'src/context/Localization/LocContext';

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
    <>
      <ActivityIndicatorView visible={syncing} showLoader />
      <Transactions
        transactions={transactions}
        setPullRefresh={setPullRefresh}
        pullRefresh={pullRefresh}
        currentWallet={wallet}
      />
    </>
  );
}

function WalletDetails({ route }) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const currencyCode = useCurrencyCode();
  const exchangeRates = useExchangeRates();
  const { autoRefresh, walletId } = route?.params || {};
  const wallet = useWallets({ walletIds: [walletId] })?.wallets[0];
  const {
    presentationData: { name, description } = { name: '', description: '' },
    specs: { balances: { confirmed, unconfirmed } } = {
      balances: { confirmed: 0, unconfirmed: 0 },
    },
  } = wallet;

  const walletType = idx(wallet, (_) => _.type) || 'DEFAULT';
  const receivingAddress = idx(wallet, (_) => _.specs.receivingAddress) || '';
  const balance = idx(wallet, (_) => _.specs.balances.confirmed) || 0;
  const presentationName = idx(wallet, (_) => _.presentationData.name) || '';
  const { walletSyncing } = useAppSelector((state) => state.wallet);
  const syncing = walletSyncing && wallet ? !!walletSyncing[wallet.id] : false;
  const isWhirlpoolWallet = Boolean(wallet?.whirlpoolConfig?.whirlpoolWalletDetails);
  const introModal = useAppSelector((state) => state.wallet.introModal) || false;
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const [showBuyRampModal, setShowBuyRampModal] = useState(false);
  const [pullRefresh, setPullRefresh] = useState(false);

  useEffect(() => {
    if (!syncing) {
      // temporarily disabled due to huge performance lag (never call dispatch in useEffect)
      // dispatch(refreshWallets([wallet], { hardRefresh: true }));
    }
  }, []);

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
    <Box style={styles.container} backgroundColor={`${colorMode}.greenText2`}>
      <StatusBar barStyle="light-content" />
      <Box style={{ paddingHorizontal: 20, paddingTop: 15 }}>
        <KeeperHeader
          learnMore
          learnMorePressed={() => dispatch(setIntroModal(true))}
          contrastScreen={true}
        />
        <VStack>
          <Box style={styles.walletHeaderWrapper}>
            <Box style={styles.walletIconWrapper}>
              <Box style={styles.walletIconView} backgroundColor={`${colorMode}.white`}>
                {isWhirlpoolWallet ? <WhirlpoolAccountIcon /> : <WalletInsideGreen />}
              </Box>
            </Box>
            <Box style={styles.walletNameWrapper}>
              <Text color={`${colorMode}.white`} style={styles.walletNameText}>
                {name}
              </Text>
              <Text color={`${colorMode}.white`} style={styles.walletDescText}>
                {walletType === 'IMPORTED' ? 'Imported wallet' : description}
              </Text>
            </Box>
          </Box>
          <Box style={styles.balanceWrapper}>
            <Box style={styles.unconfirmBalanceView}>
              <Text color={`${colorMode}.white`}>{common.unconfirmed}</Text>
              <CurrencyInfo
                hideAmounts={false}
                amount={unconfirmed}
                fontSize={14}
                color={`${colorMode}.white`}
                variation={colorMode === 'light' ? 'light' : 'dark'}
              />
            </Box>
            <Box style={styles.availableBalanceView}>
              <Text color={`${colorMode}.white`}>{common.availableBalance}</Text>
              <CurrencyInfo
                hideAmounts={false}
                amount={confirmed}
                fontSize={22}
                color={`${colorMode}.white`}
                variation={colorMode === 'light' ? 'light' : 'dark'}
              />
            </Box>
          </Box>
        </VStack>
      </Box>
      <VStack backgroundColor={`${colorMode}.primaryBackground`} style={styles.walletContainer}>
        <Pressable
          key={wallet?.id}
          backgroundColor={`${colorMode}.accent`}
          style={styles.transferPolicyCard}
          onPress={() => {
            navigation.navigate('WalletDetailsSettings', {
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
                {common.transferPolicySet}
                {'  '}
              </Text>
              <CurrencyInfo
                hideAmounts={false}
                amount={wallet?.transferPolicy.threshold}
                fontSize={14}
                color="light.learnMoreBorder"
                variation="dark"
              />
            </Box>
            <Box>
              <Arrow />
            </Box>
          </Box>
        </Pressable>
        {wallet ? (
          <>
            <HStack style={styles.transTitleWrapper}>
              <Text color={`${colorMode}.black`} fontSize={16} letterSpacing={1.28}>
                {common.transactions}
              </Text>
              {wallet?.specs.transactions.length ? (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('AllTransactions', {
                      title: 'Wallet Transactions',
                      subtitle: 'All incoming and outgoing transactions',
                      entityKind: EntityKind.WALLET,
                    })
                  }
                >
                  <HStack alignItems="center">
                    <Text
                      color={`${colorMode}.primaryGreen`}
                      marginRight={2}
                      fontSize={11}
                      bold
                      letterSpacing={0.6}
                    >
                      {common.viewAll}
                    </Text>
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
            <TransactionFooter currentWallet={wallet} onPressBuyBitcoin={onPressBuyBitcoin} />
          </>
        ) : (
          <Box style={styles.addNewWalletContainer}>
            <AddWalletIcon />
            <Text
              color={`${colorMode}.primaryText`}
              numberOfLines={2}
              style={styles.addNewWalletText}
            >
              {common.addNewWalletOrImport}
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
    paddingHorizontal: wp(28),
    paddingTop: wp(28),
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  transactionsListContainer: {
    height: windowHeight > 800 ? '66%' : '58%',
    position: 'relative',
  },
  addNewWalletText: {
    fontSize: 12,
    letterSpacing: 0.6,
    marginVertical: 5,
    marginHorizontal: 16,
    opacity: 0.85,
  },
  addNewWalletContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  walletHeaderWrapper: {
    margin: wp(15),
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
    paddingLeft: 5,
  },
  transferPolicyCard: {
    paddingHorizontal: wp(10),
    height: hp(50),
    width: '95%',
    borderRadius: hp(5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
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
