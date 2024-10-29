import { StyleSheet } from 'react-native';
import { Box, HStack, StatusBar, useColorMode, VStack } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import idx from 'idx';
import { CommonActions, useNavigation } from '@react-navigation/native';
import AddWalletIcon from 'src/assets/images/addWallet_illustration.svg';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import TribeWalletIcon from 'src/assets/images/hexagontile_wallet.svg';

import WhirlpoolAccountIcon from 'src/assets/images/whirlpool_account.svg';
import CoinsIcon from 'src/assets/images/coins.svg';
import BTC from 'src/assets/images/icon_bitcoin_white.svg';
import SettingIcon from 'src/assets/images/settings.svg';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal } from 'src/store/reducers/wallets';
import { useAppSelector } from 'src/store/hooks';
import KeeperHeader from 'src/components/KeeperHeader';
import useWallets from 'src/hooks/useWallets';

import { DerivationPurpose, EntityKind, VaultType, WalletType } from 'src/services/wallets/enums';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import CardPill from 'src/components/CardPill';
import ActionCard from 'src/components/ActionCard';
import { AppStackParams } from 'src/navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { formatNumber } from 'src/utils/utilities';
import * as Sentry from '@sentry/react-native';
import { errorBourndaryOptions } from 'src/screens/ErrorHandler';
import Colors from 'src/theme/Colors';
import HexagonIcon from 'src/components/HexagonIcon';
import WalletUtilities from 'src/services/wallets/operations/utils';
import CurrencyInfo from '../Home/components/CurrencyInfo';
import LearnMoreModal from './components/LearnMoreModal';
import TransactionFooter from './components/TransactionFooter';
import Transactions from './components/Transactions';
import useToastMessage from 'src/hooks/useToastMessage';
import { TouchableOpacity } from 'react-native-gesture-handler';

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

  const walletType = idx(wallet, (_) => _.type) || 'DEFAULT';
  const { walletSyncing } = useAppSelector((state) => state.wallet);
  const syncing = walletSyncing && wallet ? !!walletSyncing[wallet.id] : false;
  const isWhirlpoolWallet = Boolean(wallet?.whirlpoolConfig?.whirlpoolWalletDetails);
  const introModal = useAppSelector((state) => state.wallet.introModal) || false;
  const [pullRefresh, setPullRefresh] = useState(false);

  let isTaprootWallet = false;
  const derivationPath = idx(wallet, (_) => _.derivationDetails.xDerivationPath);
  if (derivationPath && WalletUtilities.getPurpose(derivationPath) === DerivationPurpose.BIP86) {
    isTaprootWallet = true;
  }

  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currencyCodeExchangeRate = exchangeRates[currencyCode];

  useEffect(() => {
    if (!syncing) {
      // temporarily disabled due to huge performance lag (never call dispatch in useEffect)
      // dispatch(refreshWallets([wallet], { hardRefresh: true }));
    }
  }, []);

  useEffect(() => {
    if (autoRefresh) pullDownRefresh();
  }, [autoRefresh]);

  useEffect(() => {
    if (!syncing && syncingCompleted && transactionToast) {
      showToast(walletTranslations.transactionToastMessage);
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

  const getWalletIcon = (wallet) => {
    if (wallet.entityKind === EntityKind.VAULT) {
      return wallet.type === VaultType.COLLABORATIVE ? <CollaborativeIcon /> : <VaultIcon />;
    } else if (wallet.entityKind === EntityKind.WALLET) {
      return (
        <HexagonIcon
          width={58}
          height={50}
          backgroundColor={Colors.DarkGreen}
          icon={<WalletIcon />}
        />
      );
    } else if (isWhirlpoolWallet) {
      return <WhirlpoolAccountIcon />;
    } else {
      return <TribeWalletIcon />;
    }
  };

  return (
    <Box style={styles.container} backgroundColor={`${colorMode}.pantoneGreen`}>
      <StatusBar barStyle="light-content" />
      <Box style={styles.topContainer}>
        <KeeperHeader
          learnMore
          learnTextColor={`${colorMode}.buttonText`}
          learnBackgroundColor={`${colorMode}.pantoneGreen`}
          learnMorePressed={() => dispatch(setIntroModal(true))}
          contrastScreen={true}
          title={name}
          titleColor={`${colorMode}.seashellWhiteText`}
          mediumTitle
          subtitle={walletType === 'IMPORTED' ? 'Imported wallet' : description}
          subTitleColor={`${colorMode}.seashellWhiteText`}
          icon={getWalletIcon(wallet)}
          rightComponent={
            <TouchableOpacity
              style={styles.settingBtn}
              onPress={() =>
                navigation.dispatch(CommonActions.navigate('WalletSettings', { wallet }))
              }
            >
              <SettingIcon width={24} height={24} />
            </TouchableOpacity>
          }
        />
        <Box style={styles.balanceWrapper}>
          <Box style={styles.unconfirmBalanceView}>
            <CardPill
              heading={isTaprootWallet ? 'TAPROOT' : 'SINGLE SIG'}
              backgroundColor={`${colorMode}.SignleSigCardPillBackColor`}
            />
            <CardPill heading={wallet.type} />
          </Box>
          <Box style={styles.availableBalanceView}>
            <CurrencyInfo
              hideAmounts={false}
              amount={unconfirmed + confirmed}
              fontSize={24}
              color={`${colorMode}.buttonText`}
              variation="light"
            />
          </Box>
        </Box>
      </Box>
      <Box style={styles.actionCard}>
        <ActionCard
          cardName={common.buyBitCoin}
          description={common.inToThisWallet}
          callback={() =>
            navigation.dispatch(CommonActions.navigate({ name: 'BuyBitcoin', params: { wallet } }))
          }
          icon={<BTC />}
          cardPillText={`1 BTC = ${currencyCodeExchangeRate.symbol} ${formatNumber(
            currencyCodeExchangeRate.buy.toFixed(0)
          )}`}
        />
        <ActionCard
          cardName={common.viewAllCoins}
          description={common.manageUTXO}
          callback={() =>
            navigation.navigate('UTXOManagement', {
              data: wallet,
              routeName: 'Wallet',
              accountType: WalletType.DEFAULT,
            })
          }
          icon={<CoinsIcon />}
        />
      </Box>
      <VStack backgroundColor={`${colorMode}.primaryBackground`} style={styles.walletContainer}>
        {wallet ? (
          <>
            {wallet?.specs?.transactions?.length ? (
              <HStack style={styles.transTitleWrapper}>
                <Text color={`${colorMode}.black`} style={styles.transactionHeading}>
                  {common.transactions}
                </Text>
              </HStack>
            ) : null}
            <TransactionsAndUTXOs
              transactions={wallet?.specs?.transactions}
              setPullRefresh={setPullRefresh}
              pullRefresh={pullRefresh}
              wallet={wallet}
            />
            <TransactionFooter currentWallet={wallet} />
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
  topContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  walletContainer: {
    paddingHorizontal: wp(28),
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
    width: '90%',
    marginVertical: wp(30),
    marginHorizontal: wp(20),
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
    paddingTop: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 5,
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
  transactionHeading: {
    fontSize: 16,
    letterSpacing: 0.16,
    paddingBottom: 16,
  },
  settingBtn: {
    width: wp(24),
    height: hp(24),
    marginRight: wp(7),
  },
});
export default Sentry.withErrorBoundary(WalletDetails, errorBourndaryOptions);
