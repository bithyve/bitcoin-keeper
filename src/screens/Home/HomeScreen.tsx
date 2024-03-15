import { StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
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
import usePlan from 'src/hooks/usePlan';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import { HomeModals } from './components/HomeModals';
import { TopSection } from './components/TopSection';
import { WalletsList } from './components/WalletList';
import InititalAppController from './InititalAppController';
import openLink from 'src/utils/OpenLink';
import { KEEPER_KNOWLEDGEBASE } from 'src/utils/service-utilities/config';

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

  useEffect(() => {
    if (relayWalletError) {
      showToast(
        realyWalletErrorMessage || 'Something went wrong - Wallet creation failed',
        <ToastErrorIcon />
      );
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError, wallets]);

  const cardsData = [
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
    {
      name: `Need\nHelp?`,
      icon: <FaqIcon />,
      callback: () => openLink(`${KEEPER_KNOWLEDGEBASE}`),
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
        setElectrumErrorVisible={setElectrumErrorVisible}
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
