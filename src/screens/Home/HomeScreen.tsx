/* eslint-disable react/no-unstable-nested-components */
import { FlatList, Linking, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActionCard from 'src/components/ActionCard';
import WalletInfoCard from 'src/screens/Home/components/WalletInfoCard';
import AddCard from 'src/components/AddCard';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import React, { useEffect, useState } from 'react';
import useWallets from 'src/hooks/useWallets';
import { useAppSelector } from 'src/store/hooks';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { EntityKind, VaultType, VisibilityType, WalletType } from 'src/core/wallets/enums';
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
import AddWalletModal from './components/AddWalletModal';
import BalanceComponent from './components/BalanceComponent';
import RampModal from '../WalletDetails/components/RampModal';
import { urlParamsToObj } from 'src/core/utils';
import { DowngradeModal } from './components/DowngradeModal';
import ElectrumDisconnectModal from './components/ElectrumDisconnectModal';
import HeaderDetails from './components/HeaderDetails';
import { hp } from 'src/constants/responsive';

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

  const [addImportVisible, setAddImportVisible] = useState(false);
  const [electrumErrorVisible, setElectrumErrorVisible] = useState(false);
  const { relayWalletUpdate, relayWalletError, realyWalletErrorMessage } = useAppSelector(
    (state) => state.bhr
  );
  const netBalanceWallets = useAppSelector((state) => state.wallet.netBalance);
  const netBalanceAllVaults = calculateBalancesForVaults(allVaults);

  const [defaultWalletCreation, setDefaultWalletCreation] = useState(false);
  const { showToast } = useToastMessage();
  const electrumClientConnectionStatus = useAppSelector(
    (state) => state.login.electrumClientConnectionStatus
  );
  const [showBuyRampModal, setShowBuyRampModal] = useState(false);
  // const wallet = useWallets({ walletIds: [walletId] })?.wallets[0];
  const receivingAddress = idx(wallets[0], (_) => _.specs.receivingAddress) || '';
  const balance = idx(wallets[0], (_) => _.specs.balances.confirmed) || 0;
  const presentationName = idx(wallets[0], (_) => _.presentationData.name) || '';

  useEffect(() => {
    Linking.addEventListener('url', handleDeepLinkEvent);
    handleDeepLinking();
    return () => {
      Linking.removeAllListeners('url');
    };
  }, []);

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

  const { top } = useSafeAreaInsets();
  const { plan } = usePlan();
  const onPressBuyBitcoin = () => setShowBuyRampModal(true);
  const cardsData = [
    {
      name: 'Buy Bitcoin',
      icon: <BTC />,
      callback: onPressBuyBitcoin,
    },
    {
      name: 'Manage All Signers',
      icon: <SignerIcon />,
      callback: () => navigation.dispatch(CommonActions.navigate({ name: 'ManageSigners' })),
    },
    {
      name: 'Security & Inheritance Tools',
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
      <Box
        backgroundColor={`${colorMode}.primaryGreenBackground`}
        style={[styles.wrapper, { paddingTop: top }]}
      >
        <Box style={styles.headerContainer}>
          <HeaderDetails />
        </Box>
        <Box style={styles.actionContainer}>
          {cardsData.map((data, index) => (
            <ActionCard
              key={`${index}_${data.name}`}
              cardName={data.name}
              callback={data.callback}
              icon={data.icon}
              dottedBorder
            />
          ))}
        </Box>
      </Box>
      <Box style={styles.valueWrapper}>
        <BalanceComponent
          count={allWallets.length}
          balance={netBalanceWallets + netBalanceAllVaults}
        />
        <FlatList
          contentContainerStyle={styles.walletDetailWrapper}
          horizontal
          data={allWallets}
          keyExtractor={(item) => item.id}
          renderItem={({ item: wallet }) => {
            const { confirmed, unconfirmed } = wallet.specs.balances;
            const balance = confirmed + unconfirmed;
            const tags =
              wallet.entityKind === EntityKind.VAULT
                ? [
                    `${(wallet as Vault).scheme.m} of ${(wallet as Vault).scheme.n}`,
                    `${wallet.type === VaultType.COLLABORATIVE ? 'COLLABORATIVE' : 'VAULT'}`,
                  ]
                : ['SINGLE SIG', wallet.type];
            return (
              <TouchableOpacity
                style={styles.wallerCardWrapper}
                onPress={() => {
                  if (wallet.entityKind === EntityKind.VAULT) {
                    switch (wallet.type) {
                      case VaultType.COLLABORATIVE:
                        navigation.navigate('VaultDetails', {
                          collaborativeWalletId: (wallet as Vault).collaborativeWalletId,
                        });
                        return;
                      case VaultType.DEFAULT:
                      default:
                        navigation.navigate('VaultDetails', { vaultId: wallet.id });
                    }
                  } else {
                    navigation.navigate('WalletDetails', { walletId: wallet.id });
                  }
                }}
              >
                <WalletInfoCard
                  tags={tags}
                  walletName={wallet.presentationData.name}
                  walletDescription={wallet.presentationData.description}
                  icon={wallet.entityKind === EntityKind.VAULT ? <VaultIcon /> : <WalletIcon />}
                  amount={balance}
                />
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={() => (
            <AddCard
              name="Add"
              cardStyles={{ height: 260, width: 130 }}
              callback={() => navigation.navigate('AddWallet')}
              iconWidth={44}
              iconHeight={38}
            />
          )}
        />
      </Box>
      <AddWalletModal
        navigation={navigation}
        visible={addImportVisible}
        setAddImportVisible={setAddImportVisible}
        wallets={wallets}
        collaborativeWallets={collaborativeWallets}
        setDefaultWalletCreation={setDefaultWalletCreation}
      />
      <RampModal
        showBuyRampModal={showBuyRampModal}
        setShowBuyRampModal={setShowBuyRampModal}
        receivingAddress={receivingAddress}
        balance={balance}
        name={presentationName}
      />
      <DowngradeModal navigation={navigation} />
      <ElectrumDisconnectModal
        electrumErrorVisible={electrumErrorVisible}
        setElectrumErrorVisible={setElectrumErrorVisible}
      />
    </Box>
  );
}
export default NewHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  valueWrapper: {
    flex: 0.65,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '35%',
    gap: 10,
    height: '100%',
  },
  headerContainer: {
    paddingHorizontal: 10,
    width: '100%',
  },
  wrapper: {
    flex: 0.35,
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    position: 'absolute',
    top: Platform.OS === 'android' ? hp(200) : hp(220),
  },
  walletDetailWrapper: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  wallerCardWrapper: {
    marginRight: 10,
  },
});
