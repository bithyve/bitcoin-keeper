import { Pressable, StyleSheet } from 'react-native';
import { Box, HStack, StatusBar, useColorMode, VStack } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import idx from 'idx';
import { CommonActions, useNavigation } from '@react-navigation/native';
import AddWalletIcon from 'src/assets/images/addWallet_illustration.svg';
import CoinsIcon from 'src/assets/images/coins.svg';
import BTC from 'src/assets/images/icon_bitcoin_white.svg';
import SettingIcon from 'src/assets/images/settings-gear-green.svg';
import SettingIconWhite from 'src/assets/images/settings-gear.svg';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal } from 'src/store/reducers/wallets';
import { useAppSelector } from 'src/store/hooks';
import useWallets from 'src/hooks/useWallets';
import { DerivationPurpose, WalletType } from 'src/services/wallets/enums';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { AppStackParams } from 'src/navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Colors from 'src/theme/Colors';
import WalletUtilities from 'src/services/wallets/operations/utils';
import LearnMoreModal from './components/LearnMoreModal';
import TransactionFooter from './components/TransactionFooter';
import Transactions from './components/Transactions';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import { TouchableOpacity } from 'react-native-gesture-handler';
import BTCAmountPill from 'src/components/BTCAmountPill';
import { SentryErrorBoundary } from 'src/services/sentry';
import WalletHeader from 'src/components/WalletHeader';
import WalletCard from '../Home/components/Wallet/WalletCard';
import useWalletAsset from 'src/hooks/useWalletAsset';
import FeatureCard from 'src/components/FeatureCard';
import { sendPhaseOneReset } from 'src/store/reducers/send_and_receive';

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

type ScreenProps = NativeStackScreenProps<AppStackParams, 'WalletDetails'>;
function WalletDetails({ route }: ScreenProps) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { common, wallet: walletTranslations } = translations;
  const { autoRefresh = false, walletId, transactionToast = false } = route.params || {};
  const [syncingCompleted, setSyncingCompleted] = useState(false);
  const wallet = useWallets({ walletIds: [walletId] })?.wallets[0];
  const {
    presentationData: { name, description } = { name: '', description: '' },
    specs: { balances: { confirmed, unconfirmed } } = {
      balances: { confirmed: 0, unconfirmed: 0 },
    },
  } = wallet;

  const { getWalletIcon, getWalletCardGradient, getWalletTags } = useWalletAsset();
  const WalletIcon = getWalletIcon(wallet);

  const walletType = idx(wallet, (_) => _.type) || 'DEFAULT';
  const { walletSyncing } = useAppSelector((state) => state.wallet);
  const syncing = walletSyncing && wallet ? !!walletSyncing[wallet.id] : false;
  const isWhirlpoolWallet = Boolean(wallet?.whirlpoolConfig?.whirlpoolWalletDetails);
  const introModal = useAppSelector((state) => state.wallet.introModal) || false;
  const [pullRefresh, setPullRefresh] = useState(false);
  const walletKind =
    walletType === WalletType.DEFAULT
      ? 'Hot Wallet'
      : walletType === WalletType.IMPORTED && wallet.specs && !wallet.specs.xpriv
      ? 'Watch Only'
      : walletType === WalletType.IMPORTED
      ? 'Imported Wallet'
      : undefined;
  let isTaprootWallet = false;
  const derivationPath = idx(wallet, (_) => _.derivationDetails.xDerivationPath);
  if (derivationPath && WalletUtilities.getPurpose(derivationPath) === DerivationPurpose.BIP86) {
    isTaprootWallet = true;
  }

  const disableBuy = false;
  const cardProps = {
    circleColor: disableBuy ? `${colorMode}.secondaryGrey` : null,
    pillTextColor: disableBuy ? `${colorMode}.buttonText` : null,
    cardPillText: disableBuy ? common.comingSoon : '',
    customCardPill: !disableBuy && <BTCAmountPill />,
    cardPillColor: disableBuy ? `${colorMode}.secondaryGrey` : null,
  };

  useEffect(() => {
    if (!syncing) {
    }
  }, []);

  useEffect(() => {
    dispatch(sendPhaseOneReset());
  }, []);

  useEffect(() => {
    if (autoRefresh) pullDownRefresh();
  }, [autoRefresh]);

  useEffect(() => {
    if (!syncing && syncingCompleted && transactionToast) {
      showToast(
        walletTranslations.transactionToastMessage,
        <TickIcon />,
        IToastCategory.DEFAULT,
        5000
      );
      navigation.dispatch(CommonActions.setParams({ transactionToast: false }));
    }
  }, [syncingCompleted, transactionToast]);

  useEffect(() => {
    if (!syncing) {
      setSyncingCompleted(true);
    } else {
      setSyncingCompleted(false);
    }
  }, [syncing]);

  const pullDownRefresh = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([wallet], { hardRefresh: true }));
    setPullRefresh(false);
  };

  return (
    <Box safeAreaTop style={styles.wrapper}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Box style={styles.topContainer}>
        <WalletHeader
          rightComponent={
            <TouchableOpacity
              style={styles.settingBtn}
              onPress={() =>
                navigation.dispatch(CommonActions.navigate('WalletSettings', { wallet }))
              }
            >
              {isDarkMode ? (
                <SettingIconWhite width={24} height={24} />
              ) : (
                <SettingIcon width={24} height={24} />
              )}
            </TouchableOpacity>
          }
        />

        <Box style={styles.card}>
          <WalletCard
            backgroundColor={getWalletCardGradient(wallet)}
            hexagonBackgroundColor={Colors.CyanGreen}
            icon={<WalletIcon />}
            iconWidth={42}
            iconHeight={38}
            title={wallet.presentationData.name}
            tags={getWalletTags(wallet)}
            totalBalance={wallet.specs.balances.confirmed + wallet.specs.balances.unconfirmed}
            description={wallet.presentationData.description}
            wallet={wallet}
            allowHideBalance={false}
          />
        </Box>
      </Box>
      <Box style={styles.actionCard}>
        <FeatureCard
          cardName={common.buyBitCoin}
          callback={() =>
            navigation.dispatch(CommonActions.navigate({ name: 'BuyBitcoin', params: { wallet } }))
          }
          icon={<BTC />}
          customStyle={{ justifyContent: 'flex-end' }}
        />
        <FeatureCard
          cardName={common.viewAllCoins}
          callback={() =>
            navigation.navigate('UTXOManagement', {
              data: wallet,
              routeName: 'Wallet',
              accountType: WalletType.DEFAULT,
            })
          }
          icon={<CoinsIcon />}
          customStyle={{ justifyContent: 'flex-end' }}
        />
      </Box>
      <VStack backgroundColor={`${colorMode}.primaryBackground`} style={styles.walletContainer}>
        {wallet ? (
          <Box
            flex={1}
            style={styles.transactionsContainer}
            backgroundColor={`${colorMode}.thirdBackground`}
          >
            {wallet?.specs?.transactions?.length ? (
              <HStack style={styles.transTitleWrapper}>
                <Text color={`${colorMode}.black`} medium fontSize={wp(14)}>
                  {common.recentTransactions}
                </Text>
                <Pressable
                  style={styles.viewAllBtn}
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.navigate({ name: 'TransactionHistory', params: { wallet } })
                    )
                  }
                >
                  <Text color={`${colorMode}.greenText`} medium fontSize={wp(14)}>
                    {common.viewAll}
                  </Text>
                </Pressable>
              </HStack>
            ) : null}
            <TransactionsAndUTXOs
              transactions={wallet?.specs?.transactions}
              setPullRefresh={setPullRefresh}
              pullRefresh={pullRefresh}
              wallet={wallet}
            />
            <TransactionFooter currentWallet={wallet} />
          </Box>
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
      <LearnMoreModal introModal={introModal} setIntroModal={setIntroModal} />
    </Box>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  topContainer: {
    paddingHorizontal: 18,
  },
  walletContainer: {
    paddingTop: wp(60),
    paddingBottom: 20,
    flex: 1,
    justifyContent: 'space-between',
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
    marginTop: -10,
    marginHorizontal: wp(15),
    flexDirection: 'row',
    width: '100%',
  },
  walletIconWrapper: {
    width: '15%',
    marginRight: 7,
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
    paddingLeft: '3%',
    marginTop: 20,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  transactionsContainer: {
    paddingHorizontal: wp(22),
    marginTop: hp(5),
    paddingTop: hp(24),
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  unconfirmBalanceView: {
    width: '50%',
    flexDirection: 'row',
    gap: 5,
  },
  availableBalanceView: {
    width: '50%',
    alignItems: 'flex-end',
  },
  transTitleWrapper: {
    paddingTop: 5,
    marginLeft: wp(2),
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    paddingLeft: 10,
  },
  viewAllBtn: {
    width: wp(80),
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCard: {
    marginTop: 20,
    marginBottom: -50,
    zIndex: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingBtn: {
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default SentryErrorBoundary(WalletDetails);
