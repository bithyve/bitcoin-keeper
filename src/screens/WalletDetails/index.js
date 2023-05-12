import { StyleSheet, TouchableOpacity } from 'react-native';
import { Box, HStack, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AddWalletIcon from 'src/assets/images/addWallet_illustration.svg';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal } from 'src/store/reducers/wallets';
import { useAppSelector } from 'src/store/hooks';
import HeaderTitle from 'src/components/HeaderTitle';

import { WalletType } from 'src/core/wallets/enums';
import IconArrowBlack from 'src/assets/images/icon_arrow_black.svg';
import Transactions from './components/Transactions';
import TransactionFooter from './components/TransactionFooter';
import RampModal from './components/RampModal';
import LearnMoreModal from './components/LearnMoreModal';
import CurrencyInfo from '../NewHomeScreen/components/CurrencyInfo';

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
  return (
    <Box style={styles.transactionsListContainer}>
      <Transactions
        transactions={transactions}
        setPullRefresh={setPullRefresh}
        pullRefresh={pullRefresh}
        currentWallet={wallet}
      />
    </Box>
  );
}

function Footer({ wallet, onPressBuyBitcoin }) {
  return <TransactionFooter currentWallet={wallet} onPressBuyBitcoin={onPressBuyBitcoin} />;
}

function WalletDetails({ route }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { autoRefresh, wallet } = route?.params || {};
  const {
    presentationData: { name, description } = { name: '', description: '' },
    specs: { balances: { confirmed, unconfirmed } } = {
      balances: { confirmed: 0, unconfirmed: 0 },
    },
  } = wallet;
  const introModal = useAppSelector((state) => state.wallet.introModal) || false;
  const [showBuyRampModal, setShowBuyRampModal] = useState(false);
  const [pullRefresh, setPullRefresh] = useState(false);

  useEffect(() => {
    if (autoRefresh) pullDownRefresh();
  }, [autoRefresh]);

  const pullDownRefresh = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([wallet], { hardRefresh: true }));
    setPullRefresh(false);
  };
  const onPressBuyBitcoin = () => setShowBuyRampModal(true);

  return (
    <Box style={styles.container} backgroundColor="light.greenText2">
      <HeaderTitle
        learnMore
        learnMorePressed={() => dispatch(setIntroModal(true))}
        backBtnBlackColor={false}
      />
      <VStack>
        <Box style={styles.walletHeaderWrapper}>
          <Box style={styles.walletIconWrapper}>
            <Box style={styles.walletIconView} backgroundColor="light.white" />
          </Box>
          <Box style={styles.walletNameWrapper}>
            <Text color="light.white" style={styles.walletNameText}>
              {name}
            </Text>
            <Text color="light.white" style={styles.walletDescText}>
              {description}
            </Text>
          </Box>
        </Box>
        <Box style={styles.balanceWrapper}>
          <Box style={styles.unconfirmBalanceView}>
            <Text color="light.white">Unconfirmed</Text>
            <CurrencyInfo
              hideAmounts={false}
              amount={unconfirmed}
              fontSize={14}
              color="light.white"
            />
          </Box>
          <Box style={styles.availableBalanceView}>
            <Text color="light.white">Available Balance</Text>
            <CurrencyInfo
              hideAmounts={false}
              amount={confirmed}
              fontSize={22}
              color="light.white"
            />
          </Box>
        </Box>
      </VStack>
      <VStack
        backgroundColor="light.primaryBackground"
        px={wp(28)}
        borderTopLeftRadius={20}
        flex={1}
        justifyContent="space-between"
      >
        {/* <WalletInfo wallets={wallets} /> */}

        {wallet ? (
          <>
            {/* <UTXOsManageNavBox
            wallet={wallet}
            isWhirlpoolWallet={Boolean(wallet?.whirlpoolConfig?.whirlpoolWalletDetails?.length)}
            onClick={() => {
              navigation.navigate('UTXOManagement', {
                data: wallet,
                routeName: 'Wallet',
                accountType: WalletType.DEFAULT,
              });
            }}
          /> */}
            <HStack style={styles.transTitleWrapper}>
              <Text color="light.textBlack" fontSize={16} letterSpacing={1.28}>
                Transactions
              </Text>
              {wallet?.specs.transactions.length ? (
                <TouchableOpacity>
                  <HStack alignItems="center">
                    <TouchableOpacity onPress={() => {}}>
                      <Text
                        color="light.primaryGreen"
                        marginRight={2}
                        fontSize={11}
                        bold
                        letterSpacing={0.6}
                      >
                        View All
                      </Text>
                    </TouchableOpacity>
                    <IconArrowBlack />
                  </HStack>
                </TouchableOpacity>
              ) : null}
            </HStack>
            <TransactionsAndUTXOs
              transactions={wallet?.specs.transactions}
              setPullRefresh={setPullRefresh}
              pullRefresh={pullRefresh}
              wallet={wallet}
            />
            <Footer wallet={wallet} onPressBuyBitcoin={onPressBuyBitcoin} />
          </>
        ) : (
          <Box style={styles.addNewWalletContainer}>
            <AddWalletIcon />
            <Text color="light.primaryText" numberOfLines={2} style={styles.addNewWalletText}>
              Add a new wallet or import one
            </Text>
          </Box>
        )}
      </VStack>
      <RampModal
        showBuyRampModal={showBuyRampModal}
        setShowBuyRampModal={setShowBuyRampModal}
        wallet={wallet}
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
  walletContainer: {
    borderRadius: hp(10),
    width: wp(310),
    height: hp(windowHeight > 700 ? 145 : 150),
    padding: wp(15),
    position: 'relative',
    marginLeft: 0,
  },
  transactionsListContainer: {
    paddingVertical: hp(10),
    height: windowHeight > 800 ? '75%' : '66%',
    position: 'relative',
  },
  addNewWalletText: {
    fontSize: 12,
    letterSpacing: 0.6,
    marginVertical: 5,
    marginHorizontal: 16,
    opacity: 0.85,
    fontWeight: '300',
  },
  addNewWalletContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  walletHeaderWrapper: {
    margin: wp(20),
    flexDirection: 'row',
    width: '100%',
  },
  walletIconWrapper: {
    width: '15%',
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
    width: '100%',
    margin: wp(20),
  },
  unconfirmBalanceView: {
    width: '50%',
  },
  availableBalanceView: {
    width: '50%',
    alignItems: 'center',
  },
  transTitleWrapper: {
    paddingTop: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
export default WalletDetails;
