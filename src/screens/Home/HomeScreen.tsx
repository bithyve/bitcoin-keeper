import { StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useContext, useEffect, useState } from 'react';
import useWallets from 'src/hooks/useWallets';
import { useAppSelector } from 'src/store/hooks';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { VisibilityType } from 'src/services/wallets/enums';
import useToastMessage from 'src/hooks/useToastMessage';
import { useDispatch } from 'react-redux';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import useVault from 'src/hooks/useVault';
import idx from 'idx';
import { CommonActions } from '@react-navigation/native';
import InheritanceIcon from 'src/assets/images/inheri.svg';
import FaqIcon from 'src/assets/images/faq.svg';
import SignerIcon from 'src/assets/images/signer_white.svg';
import SignerDarkIcon from 'src/assets/images/signer_dark.svg';
import InheritanceDarkIcon from 'src/assets/images/inheri_dark.svg';
import FaqDarkIcon from 'src/assets/images/faq_dark.svg';
import { HomeModals } from './components/HomeModals';
import { TopSection } from './components/TopSection';
import { WalletsList } from './components/WalletList';
import InititalAppController from './InititalAppController';
import { useIndicatorHook } from 'src/hooks/useIndicatorHook';
import { uaiType } from 'src/models/interfaces/Uai';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { SentryErrorBoundary } from 'src/services/sentry';


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

  const { translations } = useContext(LocalizationContext);
  const { home: homeTranslation } = translations;

  const { typeBasedIndicator } = useIndicatorHook({ types: [uaiType.VAULT_TRANSFER] });

  useEffect(() => {
    if (relayWalletError) {
      showToast(
        realyWalletErrorMessage || homeTranslation.RelayWalletErrorMessage,
        <ToastErrorIcon />
      );
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError, wallets]);

  const cardsData = [
    {
      name: homeTranslation.ManageKeys,
      icon: colorMode === 'dark' ? <SignerDarkIcon /> : <SignerIcon />,
      callback: () => navigation.dispatch(CommonActions.navigate({ name: 'ManageSigners' })),
    },
    {
      name: homeTranslation.InheritancePlanning,
      icon: colorMode === 'dark' ? <InheritanceDarkIcon /> : <InheritanceIcon />,
      callback: () => {
        //-----FOR Futhure use------
        // const eligible = plan === SubscriptionTier.L3.toUpperCase();
        // if (!eligible) {
        //   showToast(`Please upgrade to ${SubscriptionTier.L3} to use Inheritance Tools`);
        //   navigation.navigate('ChoosePlan', { planPosition: 2 });
        // } else if (!activeVault) {
        //   showToast('Please create a vault to setup inheritance');
        //   navigation.dispatch(
        //     CommonActions.navigate({
        //       name: 'InheritanceToolsAndTips',
        //     })
        //   );
        // } else {
        // navigation.dispatch(CommonActions.navigate({ name: 'SetupInheritance' }));
        navigation.dispatch(
          CommonActions.navigate({
            name: 'InheritanceToolsAndTips',
          })
        );
        // }
      },
    },
    {
      name: homeTranslation.KeeperConcierge,
      icon: colorMode === 'dark' ? <FaqDarkIcon /> : <FaqIcon />,
      callback: () => {
        navigation.dispatch(CommonActions.navigate({ name: 'KeeperConcierge' }));
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
        typeBasedIndicator={typeBasedIndicator}
      />
      <HomeModals
        electrumErrorVisible={electrumErrorVisible}
        setElectrumErrorVisible={setElectrumErrorVisible}
        navigation={navigation}
      />
    </Box>
  );
}

export default SentryErrorBoundary(NewHomeScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
