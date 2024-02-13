import { StyleSheet } from 'react-native';
import { Box, HStack, StatusBar, useColorMode, VStack } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import idx from 'idx';
import { useNavigation } from '@react-navigation/native';
import AddWalletIcon from 'src/assets/images/addWallet_illustration.svg';
import WalletIcon from 'src/assets/images/hexagontile_wallet.svg';

import WhirlpoolAccountIcon from 'src/assets/images/whirlpool_account.svg';
import CoinsIcon from 'src/assets/images/whirlpool.svg';
import { wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal } from 'src/store/reducers/wallets';
import { useAppSelector } from 'src/store/hooks';
import KeeperHeader from 'src/components/KeeperHeader';
import useWallets from 'src/hooks/useWallets';

import { WalletType } from 'src/core/wallets/enums';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import CardPill from 'src/components/CardPill';
import ActionCard from 'src/components/ActionCard';
import Transactions from './components/Transactions';
import TransactionFooter from './components/TransactionFooter';
import RampModal from './components/RampModal';
import LearnMoreModal from './components/LearnMoreModal';
import CurrencyInfo from '../Home/components/CurrencyInfo';
import { AppStackParams } from 'src/navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

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
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { autoRefresh = false, walletId } = route.params || {};
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

  return (
    <Box style={styles.container} backgroundColor={`${colorMode}.pantoneGreen`}>
      <StatusBar barStyle="light-content" />
      <Box style={styles.topContainer}>
        <KeeperHeader
          learnMore
          learnTextColor={`${colorMode}.white`}
          learnBackgroundColor={`${colorMode}.pantoneGreen`}
          learnMorePressed={() => dispatch(setIntroModal(true))}
          contrastScreen={true}
          title={name}
          titleColor={`${colorMode}.seashellWhite`}
          subtitle={walletType === 'IMPORTED' ? 'Imported wallet' : description}
          subTitleColor={`${colorMode}.seashellWhite`}
          icon={isWhirlpoolWallet ? <WhirlpoolAccountIcon /> : <WalletIcon />}
        />
        <Box style={styles.balanceWrapper}>
          <Box style={styles.unconfirmBalanceView}>
            <CardPill heading="SINGLE SIG" backgroundColor={`${colorMode}.PaleTurquoise`} />
            <CardPill heading={wallet.type} />
          </Box>
          <Box style={styles.availableBalanceView}>
            <CurrencyInfo
              hideAmounts={false}
              amount={unconfirmed + confirmed}
              fontSize={22}
              color={`${colorMode}.white`}
              variation={colorMode === 'light' ? 'light' : 'dark'}
            />
          </Box>
        </Box>
      </Box>
      <Box style={styles.actionCard}>
        <ActionCard
          cardName="View All Coins"
          description="Manage Whirlpool and UTXOs"
          callback={() =>
            navigation.navigate('UTXOManagement', {
              data: wallet,
              routeName: 'Wallet',
              accountType: WalletType.DEFAULT,
            })
          }
          icon={<CoinsIcon />}
          customStyle={{ paddingTop: 0 }}
        />
      </Box>
      <VStack backgroundColor={`${colorMode}.primaryBackground`} style={styles.walletContainer}>
        {wallet ? (
          <>
            <HStack style={styles.transTitleWrapper}>
              <Text color={`${colorMode}.black`} style={styles.transactionHeading}>
                {common.transactions}
              </Text>
            </HStack>
            <TransactionsAndUTXOs
              transactions={wallet?.specs.transactions}
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
  },
});
export default WalletDetails;
