import { StyleSheet } from 'react-native';
import { Box } from 'native-base';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import AddWalletIcon from 'src/assets/images/addWallet_illustration.svg';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import Text from 'src/components/KeeperText';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal } from 'src/store/reducers/wallets';
import { useAppSelector } from 'src/store/hooks';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HeaderTitle from 'src/components/HeaderTitle';
import UTXOsManageNavBox from 'src/components/UTXOsComponents/UTXOsManageNavBox';
import WalletList from './components/WalletList';
import Transactions from './components/Transactions';
import TransactionFooter from './components/TransactionFooter';
import RampModal from './components/RampModal';
import LearnMoreModal from './components/LearnMoreModal';
import WalletInfo from './components/WalletInfo';

// TODO: add type definitions to all components
function TransactionsAndUTXOs({
  transactions,
  setPullRefresh,
  pullRefresh,
  currentWallet,
}) {
  return (
    <Box style={styles.transactionsListContainer}>
      <Transactions
        transactions={transactions}
        setPullRefresh={setPullRefresh}
        pullRefresh={pullRefresh}
        currentWallet={currentWallet}
      />
    </Box>
  );
}

function Footer({
  currentWallet,
  onPressBuyBitcoin,
}) {
  return <TransactionFooter currentWallet={currentWallet} onPressBuyBitcoin={onPressBuyBitcoin} />
}

function WalletDetails({ route }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { useQuery } = useContext(RealmWrapperContext);
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet).map(getJSONFromRealmObject) || [];
  const introModal = useAppSelector((state) => state.wallet.introModal) || false;
  const [showBuyRampModal, setShowBuyRampModal] = useState(false);
  const [walletIndex, setWalletIndex] = useState<number>(0);
  const [pullRefresh, setPullRefresh] = useState(false);
  const currentWallet = wallets[walletIndex];
  const transactions = currentWallet?.specs?.transactions || [];

  const { autoRefresh } = route?.params || {};

  useEffect(() => {
    if (autoRefresh) pullDownRefresh();
  }, [autoRefresh]);

  const onViewRef = useRef((viewableItems) => {
    const index = viewableItems.changed.find((item) => item.isViewable === true);
    if (index?.index !== undefined) {
      setWalletIndex(index?.index);
    }
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 20 });
<<<<<<< HEAD

  function _renderItem({ item, index }: { item; index }) {
    const walletName = item?.presentationData?.name;
    const walletDescription = item?.presentationData?.description;
    const balances = item?.specs?.balances;
    const walletBalance = balances?.confirmed + balances?.unconfirmed;
    const isActive = index === walletIndex;

    return (
      <Shadow
        distance={9}
        startColor="#e4e4e4"
        offset={[0, 14]}
        viewStyle={{
          height: hp(137),
          marginRight: 15,
        }}
      >
        <Box
          variant={isActive ? 'linearGradient' : 'InactiveGradient'}
          style={styles.walletContainer}
        >
          {!(item?.presentationData && item?.specs) ? (
            <TouchableOpacity
              style={styles.addWalletContainer}
              onPress={() => navigation.navigate('EnterWalletDetail', {
                name: `Wallet ${wallets.length}`,
                description: 'Single-sig Wallet',
                type: WalletType.DEFAULT
              })}
            >
              <GradientIcon
                Icon={AddSCardIcon}
                height={40}
                gradient={isActive ? ['#FFFFFF', '#80A8A1'] : ['#9BB4AF', '#9BB4AF']}
              />

              <Text color="light.white" style={styles.addWalletText}>
                {wallet.AddNewWallet}
              </Text>
            </TouchableOpacity>
          ) : (
            <Box>
              <Box style={styles.walletCard}>
                <Box style={styles.walletInnerView}>
                  <GradientIcon
                    Icon={WalletInsideGreen}
                    height={35}
                    gradient={isActive ? ['#FFFFFF', '#80A8A1'] : ['#9BB4AF', '#9BB4AF']}
                  />
                  <Box
                    style={{
                      marginLeft: 10,
                    }}
                  >
                    <Text color="light.white" style={styles.walletName} testID={`text_${walletName.replace(/ /g, '_')}`}>
                      {walletName}
                    </Text>
                    <Text color="light.white" style={styles.walletDescription} testID={`text_${walletDescription.replace(/ /g, '_')}`}>
                      {walletDescription}
                    </Text>
                  </Box>
                </Box>
                <Box>
                  <Text color="light.white" style={styles.unconfirmedText}>
                    Unconfirmed
                  </Text>
                  <Box style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Box
                      style={{
                        marginRight: 3,
                      }}
                    >
                      {getCurrencyImageByRegion(currencyCode, 'light', currentCurrency, BtcWallet)}
                    </Box>
                    <Text color="light.white" style={styles.unconfirmedBalance}>
                      {getAmt(balances?.unconfirmed, exchangeRates, currencyCode, currentCurrency, satsEnabled)}
                    </Text>
                  </Box>
                </Box>
              </Box>

              <Box style={styles.walletBalance}>
                <Text color="light.white" style={styles.walletName}>
                  Available Balance
                </Text>
                <Box style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Box
                    style={{
                      marginRight: 3,
                    }}
                  >
                    {getCurrencyImageByRegion(currencyCode, 'light', currentCurrency, BtcWallet)}
                  </Box>
                  <Text color="light.white" style={styles.availableBalance}>
                    {getAmt(walletBalance, exchangeRates, currencyCode, currentCurrency, satsEnabled)}
                    <Text color="light.textColor" style={styles.balanceUnit}>
                      {getUnit(currentCurrency, satsEnabled)}
                    </Text>
                  </Text>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Shadow>
    );
  }

=======
>>>>>>> utxo-mgt/ui
  const pullDownRefresh = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([currentWallet], { hardRefresh: true }));
    setPullRefresh(false);
  };
  const onPressBuyBitcoin = () => setShowBuyRampModal(true);

  return (
    <ScreenWrapper>
      <HeaderTitle learnMore learnMorePressed={() => dispatch(setIntroModal(true))} />
      <WalletInfo />
      <WalletList walletIndex={walletIndex} onViewRef={onViewRef} viewConfigRef={viewConfigRef} />
      {walletIndex !== undefined && walletIndex !== wallets.length ? (
        <>
<<<<<<< HEAD
          {/* {Transfer pollicy} */}
          <Box style={styles.transferPolicyContainer}>
            <Pressable
              backgroundColor="light.accent"
              style={styles.transferPolicyCard}
              onPress={() => {
                if (vaultExsist) {
                  navigation.navigate('WalletSettings', {
                    wallet: currentWallet,
                    editPolicy: true,
                  });
                } else showToast('Create a vault to transfer', <ToastErrorIcon />);
              }}
            >
              <Box style={styles.transferPolicyContent}>
                <Box
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    color="light.learnMoreBorder"
                    fontSize={12}
                    style={{
                      letterSpacing: 0.6,
                    }}
                  >
                    Transfer Policy is set at{'  '}
                  </Text>
                  <Text
                    bold
                    color="light.learnMoreBorder"
                    style={{
                      fontSize: 14,
                      letterSpacing: 0.7,
                    }}
                  >
                    ฿{' '}
                    {getAmt(
                      wallets[walletIndex].transferPolicy.threshold,
                      exchangeRates,
                      currencyCode,
                      currentCurrency,
                      satsEnabled
                    )}
                    {getUnit(currentCurrency, satsEnabled)}
                  </Text>
                </Box>
                <Box>
                  <Arrow />
                </Box>
              </Box>
            </Pressable>
          </Box>

          <Box style={styles.transactions}>
            <Text color="light.textBlack" style={styles.transactionText}>
              Transactions
            </Text>
          </Box>

          <Box style={styles.transactionsListContainer}>
            <FlatList
              refreshControl={
                <RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />
              }
              data={transections}
              renderItem={renderTransactionElement}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <EmptyStateView
                  IllustartionImage={NoTransactionIcon}
                  title="No transactions yet."
                  subTitle="Pull down to refresh"
                />
              }
            />
          </Box>
          <Box style={styles.footerContainer}>
            <Box style={styles.border} borderColor="light.GreyText" />
            <Box style={styles.footerItemContainer}>
              <TouchableOpacity
                style={styles.IconText}
                onPress={() => {
                  navigation.navigate('Send', { sender: currentWallet });
                }}
              >
                <Send />
                <Text color="light.primaryText" style={styles.footerItemText}>
                  Send
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.IconText}
                onPress={() => {
                  navigation.navigate('Receive', { wallet: currentWallet });
                }}
              >
                <Recieve />
                <Text color="light.primaryText" style={styles.footerItemText}>
                  Receive
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.IconText}
                onPress={() => {
                  navigation.navigate('WalletSettings', { wallet: currentWallet });
                }}
                testID='btn_walletSettings'
              >
                <IconSettings />
                <Text color="light.primaryText" style={styles.footerItemText}>
                  Settings
                </Text>
              </TouchableOpacity>
            </Box>
          </Box>
=======
          <UTXOsManageNavBox onClick={() => navigation.navigate('UTXOManagement', { data: currentWallet, routeName: 'Wallet' })} />
          <TransactionsAndUTXOs
            transactions={transactions}
            setPullRefresh={setPullRefresh}
            pullRefresh={pullRefresh}
            currentWallet={currentWallet}
          />
          <Footer
            currentWallet={currentWallet}
            onPressBuyBitcoin={onPressBuyBitcoin}
          />
>>>>>>> utxo-mgt/ui
        </>
      ) : (
        <Box style={styles.addNewWalletContainer}>
          <AddWalletIcon />
          <Text color="light.primaryText" numberOfLines={2} style={styles.addNewWalletText}>
            Add a new wallet or import one
          </Text>
        </Box>
      )}
      <RampModal
        showBuyRampModal={showBuyRampModal}
        setShowBuyRampModal={setShowBuyRampModal}
        wallets={wallets}
        walletIndex={walletIndex}
      />
      <LearnMoreModal introModal={introModal} setIntroModal={setIntroModal} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
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
    height: windowHeight > 800 ? '40%' : '34%',
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
});
export default WalletDetails;
