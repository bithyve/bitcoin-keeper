import { Linking, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import useWallets from 'src/hooks/useWallets';
import { useAppSelector } from 'src/store/hooks';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { VisibilityType, WalletType } from 'src/core/wallets/enums';
import TickIcon from 'src/assets/images/icon_tick.svg';
import useToastMessage from 'src/hooks/useToastMessage';
import { useDispatch } from 'react-redux';
import { resetElectrumNotConnectedErr } from 'src/store/reducers/login';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { Vault } from 'src/core/wallets/interfaces/vault';
import useCollaborativeWallet from 'src/hooks/useCollaborativeWallet';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import useVault from 'src/hooks/useVault';
import idx from 'idx';
import { CommonActions } from '@react-navigation/native';
import BTC from 'src/assets/images/icon_bitcoin_white.svg';
import InheritanceIcon from 'src/assets/images/inheri.svg';
import SignerIcon from 'src/assets/images/signer_white.svg';
import usePlan from 'src/hooks/usePlan';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import { urlParamsToObj } from 'src/core/utils';
import { HomeModals } from './components/HomeModals';
import { TopSection } from './components/TopSection';
import { WalletsList } from './components/WalletList';

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
  const { collaborativeWallets } = useCollaborativeWallet();
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
  const [addImportVisible, setAddImportVisible] = useState(false);
  const [electrumErrorVisible, setElectrumErrorVisible] = useState(false);
  const { relayWalletUpdate, relayWalletError, realyWalletErrorMessage } = useAppSelector(
    (state) => state.bhr
  );
  const netBalanceWallets = useAppSelector((state) => state.wallet.netBalance);
  const netBalanceAllVaults = calculateBalancesForVaults(allVaults);

  const [defaultWalletCreation, setDefaultWalletCreation] = useState(false);
  const { showToast } = useToastMessage();
  const { top } = useSafeAreaInsets();
  const { plan } = usePlan();
  const electrumClientConnectionStatus = useAppSelector(
    (state) => state.login.electrumClientConnectionStatus
  );
  const [showBuyRampModal, setShowBuyRampModal] = useState(false);
  const receivingAddress = idx(wallets[0], (_) => _.specs.receivingAddress) || '';
  const balance = idx(wallets[0], (_) => _.specs.balances.confirmed) || 0;
  const presentationName = idx(wallets[0], (_) => _.presentationData.name) || '';

  function handleDeepLinkEvent({ url }) {
    if (url) {
      if (url.includes('backup')) {
        const splits = url.split('backup/');
        const decoded = Buffer.from(splits[1], 'base64').toString();
        const params = urlParamsToObj(decoded);
        if (params.seed) {
          navigation.navigate('EnterWalletDetail', {
            seed: params.seed,
            name: `${
              params.name.slice(0, 1).toUpperCase() + params.name.slice(1, params.name.length)
            } `,
            path: params.path,
            appId: params.appId,
            description: `Imported from ${
              params.name.slice(0, 1).toUpperCase() + params.name.slice(1, params.name.length)
            } `,
            type: WalletType.IMPORTED,
          });
        } else {
          showToast('Invalid deeplink');
        }
      }
    }
  }

  async function handleDeepLinking() {
    try {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        if (initialUrl.includes('backup')) {
          const splits = initialUrl.split('backup/');
          const decoded = Buffer.from(splits[1], 'base64').toString();
          const params = urlParamsToObj(decoded);
          if (params.seed) {
            navigation.navigate('EnterWalletDetail', {
              seed: params.seed,
              name: `${
                params.name.slice(0, 1).toUpperCase() + params.name.slice(1, params.name.length)
              } `,
              path: params.path,
              appId: params.appId,
              purpose: params.purpose,
              description: `Imported from ${
                params.name.slice(0, 1).toUpperCase() + params.name.slice(1, params.name.length)
              } `,
              type: WalletType.IMPORTED,
            });
          } else {
            showToast('Invalid deeplink');
          }
        } else if (initialUrl.includes('create/')) {
        }
      }
    } catch (error) {
      //
    }
  }

  useEffect(() => {
    Linking.addEventListener('url', handleDeepLinkEvent);
    handleDeepLinking();
    return () => {
      Linking.removeAllListeners('url');
    };
  }, []);

  useEffect(() => {
    if (electrumClientConnectionStatus.success) {
      showToast(`Connected to: ${electrumClientConnectionStatus.connectedTo}`, <TickIcon />);
      if (electrumErrorVisible) setElectrumErrorVisible(false);
    } else if (electrumClientConnectionStatus.failed) {
      showToast(`${electrumClientConnectionStatus.error}`, <ToastErrorIcon />);
      setElectrumErrorVisible(true);
    }
  }, [electrumClientConnectionStatus.success, electrumClientConnectionStatus.error]);

  useEffect(() => {
    if (electrumClientConnectionStatus.setElectrumNotConnectedErr) {
      showToast(`${electrumClientConnectionStatus.setElectrumNotConnectedErr}`, <ToastErrorIcon />);
      dispatch(resetElectrumNotConnectedErr());
    }
  }, [electrumClientConnectionStatus.setElectrumNotConnectedErr]);

  useEffect(() => {
    if (relayWalletUpdate) {
      if (defaultWalletCreation && wallets[collaborativeWallets.length]) {
        navigation.navigate('SetupCollaborativeWallet', {
          coSigner: wallets[collaborativeWallets.length],
          walletId: wallets[collaborativeWallets.length].id,
          collaborativeWalletsCount: collaborativeWallets.length,
        });
        dispatch(resetRealyWalletState());
        setDefaultWalletCreation(false);
      }
    }
    if (relayWalletError) {
      showToast(
        realyWalletErrorMessage || 'Something went wrong - Wallet creation failed',
        <ToastErrorIcon />
      );
      setDefaultWalletCreation(false);
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError, wallets]);

  const onPressBuyBitcoin = () => setShowBuyRampModal(true);
  const cardsData = [
    {
      name: 'Buy\nBitcoin',
      icon: <BTC />,
      callback: onPressBuyBitcoin,
    },
    {
      name: 'Manage\nAll Signers',
      icon: <SignerIcon />,
      callback: () => navigation.dispatch(CommonActions.navigate({ name: 'ManageSigners' })),
    },
    {
      name: 'Inheritance & Security Tools',
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
    <Box backgroundColor={`${colorMode}.Linen`} style={styles.container}>
      <TopSection colorMode={colorMode} top={top} cardsData={cardsData} />
      <WalletsList
        allWallets={allWallets}
        navigation={navigation}
        totalBalance={netBalanceWallets + netBalanceAllVaults}
        isShowAmount={isShowAmount}
        setIsShowAmount={() => setIsShowAmount(!isShowAmount)}
      />
      <HomeModals
        addImportVisible={addImportVisible}
        electrumErrorVisible={electrumErrorVisible}
        showBuyRampModal={showBuyRampModal}
        setAddImportVisible={setAddImportVisible}
        setElectrumErrorVisible={setElectrumErrorVisible}
        setShowBuyRampModal={setShowBuyRampModal}
        receivingAddress={receivingAddress}
        balance={balance}
        presentationName={presentationName}
        navigation={navigation}
        wallets={wallets}
        collaborativeWallets={collaborativeWallets}
        setDefaultWalletCreation={setDefaultWalletCreation}
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
