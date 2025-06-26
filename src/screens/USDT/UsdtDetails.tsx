import { CommonActions, useNavigation } from '@react-navigation/native';
import { Box, HStack, StatusBar, useColorMode, VStack } from 'native-base';
import React, { useContext, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import WalletCard from '../Home/components/Wallet/WalletCard';
import UsdtWalletLogo from 'src/assets/images/usdt-wallet-logo.svg';
import useWalletAsset from 'src/hooks/useWalletAsset';
import WalletHeader from 'src/components/WalletHeader';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import Colors from 'src/theme/Colors';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import AddWalletIcon from 'src/assets/images/addWallet_illustration.svg';
import { useAppSelector } from 'src/store/hooks';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import Transactions from '../WalletDetails/components/Transactions';
import UsdtFooter from './components/UsdtFooter';

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

const UsdtDetails = () => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { getWalletCardGradient, getWalletTags } = useWalletAsset();
  const [pullRefresh, setPullRefresh] = useState(false);

  // dummy usdt wallet
  const wallet = {
    entityKind: 'WALLET',
    id: 'dummy-id-001',
    networkType: 'MAINNET',
    presentationData: {
      description: 'Dummy wallet for testing',
      name: 'Test Wallet',
      visibility: 'DEFAULT',
    },
    scriptType: 'P2WPKH',
    specs: {
      addressPubs: {
        bc1qexampleaddress0001:
          '02abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      },
      addresses: {
        external: [
          {
            address: 'bc1qexternaladdress0001',
            index: 0,
          },
        ],
        internal: [
          {
            address: 'bc1qinternaladdress0001',
            index: 0,
          },
        ],
      },
      balances: {
        confirmed: 500000,
        unconfirmed: 0,
      },
      confirmedUTXOs: [],
      hasNewUpdates: false,
      lastSynched: 1750325128253,
      nextFreeAddressIndex: 1,
      nextFreeChangeAddressIndex: 0,
      receivingAddress: 'bc1qreceivingaddress0001',
      totalExternalAddresses: 1,
      transactions: [
        {
          amount: 500000,
          blockHeight: 0,
          blockHash: '0000000000000000000000000000000000000000000000000000000000000000',
          blockIndex: 0,
          confirmations: 0,
          date: 1750325128253,
        },
      ],
      unconfirmedUTXOs: [],
      xpriv: 'xprv9s21ZrQH143K3dummyprivatekey',
      xpub: 'xpub661MyMwAqRbcFdummypublickey',
    },
    type: 'USDT',
  };

  return (
    <Box safeAreaTop style={styles.wrapper} backgroundColor={`${colorMode}.primaryBackground`}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Box style={styles.topContainer}>
        <WalletHeader
          rightComponent={
            <TouchableOpacity style={styles.settingBtn} onPress={() => {}}>
              <ThemedSvg name={'setting_icon'} width={25} height={25} />
            </TouchableOpacity>
          }
        />

        <Box style={styles.card}>
          <WalletCard
            backgroundColor={getWalletCardGradient(wallet)}
            hexagonBackgroundColor={Colors.CyanGreen}
            icon={<UsdtWalletLogo />}
            iconWidth={42}
            iconHeight={38}
            title={'USDT Wallet'}
            tags={getWalletTags(wallet)}
            totalBalance={10000}
            description={'USDT wallet desc'}
            wallet={wallet}
            allowHideBalance={false}
          />
        </Box>
      </Box>
      <VStack backgroundColor={`${colorMode}.primaryBackground`} style={styles.walletContainer}>
        {wallet ? (
          <Box
            flex={1}
            style={styles.transactionsContainer}
            backgroundColor={`${colorMode}.thirdBackground`}
            borderColor={`${colorMode}.separator`}
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
            <Box style={styles.footerContainer}>
              <UsdtFooter />
            </Box>
          </Box>
        ) : (
          <Box
            style={styles.addNewWalletContainer}
            borderColor={`${colorMode}.separator`}
            borderTopWidth={1}
          >
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
    </Box>
  );
};

export default UsdtDetails;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  topContainer: {
    paddingHorizontal: 18,
  },
  walletContainer: {
    paddingTop: wp(30),
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
  transactionsContainer: {
    paddingHorizontal: wp(22),
    marginTop: hp(5),
    paddingTop: hp(24),
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderBottomWidth: 0,
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
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(20),
  },
});
