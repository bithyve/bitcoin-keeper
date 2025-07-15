import { CommonActions, useNavigation } from '@react-navigation/native';
import { Box, HStack, useColorMode, VStack } from 'native-base';
import React, { useContext, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import useWalletAsset from 'src/hooks/useWalletAsset';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import AddWalletIcon from 'src/assets/images/addWallet_illustration.svg';
import Transactions from '../WalletDetails/components/Transactions';
import { useUSDTWallets } from 'src/hooks/useUSDTWallets';
import { getAvailableBalanceUSDTWallet } from 'src/services/wallets/factories/USDTWalletFactory';
import WalletDetailHeader from '../WalletDetails/components/WalletDetailHeader';
import DetailCards from '../WalletDetails/components/DetailCards';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';
import MoreCard from '../WalletDetails/components/MoreCard';
import KeeperModal from 'src/components/KeeperModal';
import SwapSvg from 'src/assets/images/swap.svg';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';

function TransactionsAndUTXOs({ transactions, setPullRefresh, pullRefresh, wallet }) {
  const [initialLoading, setInitialLoading] = useState(false);

  return (
    <>
      <ActivityIndicatorView visible={initialLoading} showLoader />
      <Transactions
        transactions={transactions}
        setPullRefresh={setPullRefresh}
        pullRefresh={pullRefresh}
        currentWallet={wallet}
        setInitialLoading={setInitialLoading}
      />
    </>
  );
}

const UsdtDetails = ({ route }) => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { getWalletCardGradient, getWalletTags } = useWalletAsset();
  const [pullRefresh, setPullRefresh] = useState(false);
  const { usdtWalletId } = route.params || {};
  const { getWalletById } = useUSDTWallets();
  const usdtWallet = getWalletById(usdtWalletId);
  const [showmore, setShowMore] = useState(false);
  const viewAll_color = ThemedColor({ name: 'viewAll_color' });

  return (
    <Box style={styles.wrapper}>
      <WalletDetailHeader
        settingCallBack={() =>
          navigation.dispatch(CommonActions.navigate('usdtsetting', { usdtWallet }))
        }
        backgroundColor={getWalletCardGradient(usdtWallet)}
        title={usdtWallet.presentationData.name}
        tags={getWalletTags(usdtWallet)}
        totalBalance={getAvailableBalanceUSDTWallet(usdtWallet)}
        description={usdtWallet.presentationData.description}
        wallet={usdtWallet}
      />
      <Box style={styles.detailCardsContainer}>
        <Box style={styles.detailCards}>
          <DetailCards
            // setShowMore={setShowMore}
            disabled={false}
            sendCallback={() =>
              navigation.dispatch(CommonActions.navigate('sendUsdt', { usdtWallet }))
            }
            receiveCallback={() =>
              navigation.dispatch(CommonActions.navigate('usdtReceive', { usdtWallet }))
            }
            buyCallback={() =>
              navigation.dispatch(CommonActions.navigate('buyUstd', { usdtWallet }))
            }
            wallet={usdtWallet}
          />
        </Box>
      </Box>
      <VStack backgroundColor={`${colorMode}.primaryBackground`} style={styles.walletContainer}>
        {usdtWallet ? (
          <Box
            flex={1}
            style={styles.transactionsContainer}
            backgroundColor={`${colorMode}.thirdBackground`}
          >
            {usdtWallet?.specs?.transactions?.length ? (
              <HStack style={styles.transTitleWrapper}>
                <Text color={`${colorMode}.black`} medium fontSize={wp(14)}>
                  {common.recentTransactions}
                </Text>
                <Pressable
                  style={styles.viewAllBtn}
                  onPress={() =>
                    navigation.dispatch(
                      CommonActions.navigate({
                        name: 'usdtTransactionHistory',
                        params: { wallet: usdtWallet, transactions: usdtWallet.specs.transactions },
                      })
                    )
                  }
                >
                  <Text color={viewAll_color} medium fontSize={wp(14)}>
                    {common.viewAll}
                  </Text>
                </Pressable>
              </HStack>
            ) : null}
            <TransactionsAndUTXOs
              transactions={usdtWallet.specs.transactions}
              setPullRefresh={setPullRefresh}
              pullRefresh={pullRefresh}
              wallet={usdtWallet}
            />
            <Box style={styles.footerContainer}></Box>
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
      <KeeperModal
        visible={showmore}
        close={() => setShowMore(false)}
        title={common.moreOptions}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        textColor={`${colorMode}.textGreen`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        Content={() => {
          return (
            <Box>
              <MoreCard
                title={common.swapBtc}
                callBack={() => {
                  setShowMore(false);
                }}
                Icon={<SwapSvg />}
              />
            </Box>
          );
        }}
      />
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
  detailCardsContainer: {
    zIndex: 1000,
  },
  detailCards: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    transform: [{ translateY: hp(50) }],
  },
});
