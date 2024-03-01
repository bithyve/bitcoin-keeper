import { StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import useWallets from 'src/hooks/useWallets';
import { useAppSelector } from 'src/store/hooks';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { VisibilityType } from 'src/core/wallets/enums';
import useToastMessage from 'src/hooks/useToastMessage';
import { useDispatch } from 'react-redux';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import useVault from 'src/hooks/useVault';
import idx from 'idx';
import { CommonActions } from '@react-navigation/native';
import BTC from 'src/assets/images/icon_bitcoin_white.svg';
import InheritanceIcon from 'src/assets/images/inheri.svg';
import SignerIcon from 'src/assets/images/signer_white.svg';
import usePlan from 'src/hooks/usePlan';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { HomeModals } from './components/HomeModals';
import { TopSection } from './components/TopSection';
import { WalletsList } from './components/WalletList';
import InititalAppController from './InititalAppController';

const calculateBalancesForVaults = (vaults) => {
  let totalUnconfirmedBalance = 0;
  let totalConfirmedBalance = 0;

  vaults.forEach((vault) => {
    const unconfirmedBalance = idx(vault, (_) => _.specs.balances.unconfirmed) || 0;
    const confirmedBalance = idx(vault, (_) => _.specs.balances.confirmed) || 0;

    totalUnconfirmedBalance += unconfirmedBalance;
    totalConfirmedBalance += confirmedBalance;
  });
  return totalUnconfirmedBalance + totalConfirmedBalance;
};

function NewHomeScreen({ navigation }) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const { wallets } = useWallets({ getAll: true });
  const { allVaults, activeVault } = useVault({
    includeArchived: false,
    getFirst: true,
    getHiddenWallets: false,
  });
  const nonHiddenWallets = wallets.filter(
    (wallet) => wallet.presentationData.visibility !== VisibilityType.HIDDEN
  );
  const allWallets: (Wallet | Vault)[] = [...nonHiddenWallets, ...allVaults].filter(
    (item) => item !== null
  );
  const [isShowAmount, setIsShowAmount] = useState(false);
  const [electrumErrorVisible, setElectrumErrorVisible] = useState(false);
  const { relayWalletUpdate, relayWalletError, realyWalletErrorMessage } = useAppSelector(
    (state) => state.bhr
  );
  const netBalanceWallets = useAppSelector((state) => state.wallet.netBalance);
  const netBalanceAllVaults = calculateBalancesForVaults(allVaults);

  const { showToast } = useToastMessage();
  const { top } = useSafeAreaInsets();
  const { plan } = usePlan();

  const [showBuyRampModal, setShowBuyRampModal] = useState(false);
  const receivingAddress = idx(wallets[0], (_) => _.specs.receivingAddress) || '';
  const balance = idx(wallets[0], (_) => _.specs.balances.confirmed) || 0;
  const presentationName = idx(wallets[0], (_) => _.presentationData.name) || '';

  useEffect(() => {
    if (relayWalletError) {
      showToast(
        realyWalletErrorMessage || 'Something went wrong - Wallet creation failed',
        <ToastErrorIcon />
      );
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError, wallets]);

  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currencyCodeExchangeRate = exchangeRates[currencyCode];

  const cardsData = [
    {
      name: 'Buy\nBitcoin',
      icon: <BTC />,
      callback: () => navigation.dispatch(CommonActions.navigate({ name: 'BuyBitcoin' })),
      cardPillText: `1 BTC = ${
        currencyCodeExchangeRate.symbol
      } ${currencyCodeExchangeRate.buy.toFixed(2)}`,
    },
    {
      name: 'Manage\nKeys',
      icon: <SignerIcon />,
      callback: () => navigation.dispatch(CommonActions.navigate({ name: 'ManageSigners' })),
    },
    {
      name: 'Inheritance & Security',
      icon: <InheritanceIcon />,
      callback: () => {
        const eligible = plan === SubscriptionTier.L3.toUpperCase();
        if (!eligible) {
          showToast(`Please upgrade to ${SubscriptionTier.L3} to use Inheritance Tools`);
          navigation.navigate('ChoosePlan', { planPosition: 2 });
        } else if (!activeVault) {
          showToast('Please create a vault to setup inheritance');
          navigation.dispatch(
            CommonActions.navigate({
              name: 'AddSigningDevice',
              merge: true,
              params: { scheme: { m: 3, n: 5 } },
            })
          );
        } else {
          navigation.dispatch(CommonActions.navigate({ name: 'SetupInheritance' }));
        }
      },
    },
  ];

  return (
    <Box backgroundColor={`${colorMode}.primaryBackground`} style={styles.container}>
      <InititalAppController
        navigation={navigation}
        electrumErrorVisible={electrumErrorVisible}
        setElectrumErrorVisible={setElectrumErrorVisible}
      />
      <TopSection colorMode={colorMode} top={top} cardsData={cardsData} />
      <WalletsList
        allWallets={allWallets}
        navigation={navigation}
        totalBalance={netBalanceWallets + netBalanceAllVaults}
        isShowAmount={isShowAmount}
        setIsShowAmount={() => setIsShowAmount(!isShowAmount)}
      />
      <HomeModals
        electrumErrorVisible={electrumErrorVisible}
        showBuyRampModal={showBuyRampModal}
        setElectrumErrorVisible={setElectrumErrorVisible}
        setShowBuyRampModal={setShowBuyRampModal}
        receivingAddress={receivingAddress}
        balance={balance}
        presentationName={presentationName}
        navigation={navigation}
      />
    </Box>
  );
}

export default NewHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
