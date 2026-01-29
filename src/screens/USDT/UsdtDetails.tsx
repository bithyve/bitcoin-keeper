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
import ThemedColor from 'src/components/ThemedColor/ThemedColor';
import MoreCard from '../WalletDetails/components/MoreCard';
import KeeperModal from 'src/components/KeeperModal';
import SwapSvg from 'src/assets/images/swap.svg';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import Fonts from 'src/constants/Fonts';
import Colors from 'src/theme/Colors';
import SendWhiteIcon from 'src/assets/images/send-btc-white-arrow.svg';
import ReceiveWhiteIcon from 'src/assets/images/recieve-btc-white-arrow.svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
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
      <VStack style={styles.walletContainer}>
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
      <Box
        backgroundColor={`${colorMode}.pantoneGreen`}
        style={[styles.bottomCtr, { bottom: insets.bottom + hp(5) }]}
      >
        <Pressable
          style={styles.bottomCta}
          onPress={() => navigation.dispatch(CommonActions.navigate('sendUsdt', { usdtWallet }))}
        >
          <SendWhiteIcon />
          <Text style={styles.bottomCtaTxt}>{common.send}</Text>
        </Pressable>
        <Pressable
          style={[styles.bottomCta, { justifyContent: 'flex-start' }]}
          onPress={() => navigation.dispatch(CommonActions.navigate('usdtReceive', { usdtWallet }))}
        >
          <ReceiveWhiteIcon />
          <Text style={styles.bottomCtaTxt}>{common.receive}</Text>
        </Pressable>
      </Box>
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
    marginTop: hp(20),
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
    borderBottomWidth: 0,
    borderWidth: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderColor: Colors.separator,
    paddingBottom: hp(50),
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
    paddingTop: hp(5),
    paddingBottom: hp(10),
  },
  detailCards: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomCtr: {
    position: 'absolute',
    width: '70%',
    borderRadius: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: wp(40),
  },
  bottomCta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: wp(10),
    paddingVertical: hp(17),
  },
  bottomCtaTxt: { fontFamily: Fonts.InterBold, fontSize: 14, color: Colors.headerWhite },
});
