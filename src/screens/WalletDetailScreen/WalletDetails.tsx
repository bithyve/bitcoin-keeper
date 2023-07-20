import { StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
// icons and images
import AddWalletIcon from 'src/assets/images/addWallet_illustration.svg';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal } from 'src/store/reducers/wallets';
import { useAppSelector } from 'src/store/hooks';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HeaderTitle from 'src/components/HeaderTitle';
import useWallets from 'src/hooks/useWallets';
import { WalletType } from 'src/core/wallets/enums';
import Buttons from 'src/components/Buttons';
import { fetchRampReservation } from 'src/services/ramp';
import WalletOperations from 'src/core/wallets/operations';
import useFeatureMap from 'src/hooks/useFeatureMap';

import UTXOsManageNavBox from 'src/components/UTXOsComponents/UTXOsManageNavBox';
import WalletList from './components/WalletList';
import Transactions from './components/Transactions';
import TransactionFooter from './components/TransactionFooter';
import RampModal from './components/RampModal';
import LearnMoreModal from './components/LearnMoreModal';
import WalletInfo from './components/WalletInfo';

export const allowedSendTypes = [
  WalletType.DEFAULT,
  WalletType.IMPORTED,
  WalletType.POST_MIX,
  WalletType.BAD_BANK,
];
export const allowedRecieveTypes = [WalletType.DEFAULT, WalletType.IMPORTED];

export const allowedMixTypes = [WalletType.DEFAULT, WalletType.IMPORTED];

// TODO: add type definitions to all components
function TransactionsAndUTXOs({ transactions, setPullRefresh, pullRefresh, currentWallet }) {
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

function Footer({ currentWallet, onPressBuyBitcoin }) {
  return <TransactionFooter currentWallet={currentWallet} onPressBuyBitcoin={onPressBuyBitcoin} />;
}

function WalletDetails({ route }) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { autoRefresh } = route?.params || {};
  const { wallets } = useWallets();
  const introModal = useAppSelector((state) => state.wallet.introModal) || false;

  const [showBuyRampModal, setShowBuyRampModal] = useState(false);
  const [walletIndex, setWalletIndex] = useState<number>(0);
  const currentWallet = wallets[walletIndex];

  const [pullRefresh, setPullRefresh] = useState(false);

  const featureMap = useFeatureMap({ walletIndex });

  useEffect(() => {
    if (autoRefresh) pullDownRefresh();
  }, [autoRefresh]);

  const flatListRef = useRef(null);

  const onViewRef = useRef((viewableItems) => {
    const index = viewableItems.changed.find((item) => item.isViewable === true);
    if (index?.index !== undefined) {
      setWalletIndex(index?.index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 20 });

  // eslint-disable-next-line no-underscore-dangle
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
            <View style={styles.addWalletContent}>
              <TouchableOpacity
                style={styles.addWalletView}
                onPress={() =>
                  navigation.navigate('EnterWalletDetail', {
                    name: `Wallet ${wallets.length + 1}`,
                    description: 'Single-sig Wallet',
                    type: WalletType.DEFAULT,
                  })
                }
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
              <TouchableOpacity
                style={styles.addWalletContainer}
                onPress={() => navigation.navigate('ImportWallet')}
              >
                <GradientIcon
                  Icon={ImportCardIcon}
                  height={40}
                  gradient={isActive ? ['#FFFFFF', '#80A8A1'] : ['#9BB4AF', '#9BB4AF']}
                />

                <Text color="light.white" style={styles.addWalletText}>
                  {wallet.ImportAWallet}
                </Text>
              </TouchableOpacity>
            </View>
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
                    <Text color={`${colorMode}.white`} style={styles.walletName}>
                      {walletName}
                    </Text>
                    <Text
                      color="light.white"
                      style={styles.walletDescription}
                      ellipsizeMode="tail"
                      numberOfLines={1}
                    >
                      {walletDescription}
                    </Text>
                  </Box>
                </Box>
                <Box>
                  <Text color={`${colorMode}.white`} style={styles.unconfirmedText}>
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
                      {getAmt(
                        balances?.unconfirmed,
                        exchangeRates,
                        currencyCode,
                        currentCurrency,
                        satsEnabled
                      )}
                    </Text>
                  </Box>
                </Box>
              </Box>

              <Box style={styles.walletBalance}>
                <Text color={`${colorMode}.white`} style={styles.walletName}>
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
                    {getAmt(
                      walletBalance,
                      exchangeRates,
                      currencyCode,
                      currentCurrency,
                      satsEnabled
                    )}
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

  const pullDownRefresh = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([currentWallet], { hardRefresh: true }));
    setPullRefresh(false);
  };

  const renderTransactionElement = ({ item }) => (
    <TransactionElement
      transaction={item}
      onPress={() => {
        navigation.dispatch(
          CommonActions.navigate('TransactionDetails', {
            transaction: item,
          })
        );
      }}
    />
  );

  function GradientIcon({ height, Icon, gradient = ['#9BB4AF', '#9BB4AF'] }) {
    return (
      <LinearGradient
        colors={gradient}
        start={[0, 0]}
        end={[1, 1]}
        style={{
          height: hp(height),
          width: hp(height),
          borderRadius: height,
          ...styles.center,
        }}
      >
        <Icon />
      </LinearGradient>
    );
  }
  function LinkedWalletContent() {
    return (
      <View marginY={5}>
        <Box alignSelf="center">
          <VaultSetupIcon />
        </Box>
        <Text marginTop={hp(20)} color="white" fontSize={13} letterSpacing={0.65} padding={1}>
          You can use the individual wallet’s Recovery Phrases to connect other bitcoin apps to
          Keeper
        </Text>
        <Text color="white" fontSize={13} letterSpacing={0.65} padding={1}>
          When the funds in a wallet cross a threshold, a transfer to the vault is triggered. This
          ensures you don’t have more sats in hot wallets than you need.
        </Text>
      </View>
    );
  }

  function RampBuyContent() {
    const [buyAddress, setBuyAddress] = useState('');
    useEffect(() => {
      const receivingAddress = WalletOperations.getNextFreeAddress(wallets[walletIndex]);
      setBuyAddress(receivingAddress);
    }, []);

    return (
      <Box style={styles.buyBtcWrapper}>
        <Text color="#073B36" style={styles.buyBtcContent}>
          By proceeding, you understand that Ramp will process the payment and transfer for the
          purchased bitcoin
        </Text>
        <Box style={styles.toWalletWrapper}>
          <GradientIcon Icon={WalletInsideGreen} height={35} gradient={['#FFFFFF', '#80A8A1']} />
          <Box style={styles.buyBtcCard}>
            <Text style={styles.buyBtcTitle}>Bitcoin will be transferred to</Text>
            <Text style={styles.presentationName}>
              {wallets[walletIndex].presentationData.name}
            </Text>
            <Text
              style={styles.confirmBalanceText}
            >{`Balance: ${wallets[walletIndex].specs.balances.confirmed} sats`}</Text>
          </Box>
        </Box>

        <Box style={styles.atViewWrapper}>
          <Box style={styles.atViewWrapper02}>
            <Text style={styles.atText}>@</Text>
          </Box>
          <Box style={styles.buyBtcCard}>
            <Text style={styles.buyBtcTitle}>Address for ramp transactions</Text>
            <Text
              style={styles.addressTextView}
              ellipsizeMode="middle"
              numberOfLines={1}
              fontSize={19}
              letterSpacing={1.28}
              color="#041513"
            >
              {wallets[walletIndex].specs.receivingAddress}
            </Text>
          </Box>
        </Box>
        <Buttons
          secondaryText="Cancel"
          secondaryCallback={() => {
            setShowBuyRampModal(false);
          }}
          primaryText="Buy Bitcoin"
          primaryCallback={() => buyWithRamp(buyAddress)}
        />
      </Box>
    );
  }

  const buyWithRamp = (address: string) => {
    try {
      setShowBuyRampModal(false);
      Linking.openURL(fetchRampReservation({ receiveAddress: address }));
    } catch (error) {
      console.log(error);
    }
  };

  const onPressBuyBitcoin = () => setShowBuyRampModal(true);

  return (
    <ScreenWrapper>
      <HeaderTitle learnMore learnMorePressed={() => dispatch(setIntroModal(true))} />
      <WalletInfo wallets={wallets} />
      <WalletList
        flatListRef={flatListRef}
        walletIndex={walletIndex}
        onViewRef={onViewRef}
        viewConfigRef={viewConfigRef}
        wallets={wallets}
      />
      {walletIndex !== undefined && walletIndex !== wallets.length ? (
        <>
          <UTXOsManageNavBox
            currentWallet={currentWallet}
            isWhirlpoolWallet={Boolean(
              currentWallet?.whirlpoolConfig?.whirlpoolWalletDetails?.length
            )}
            onClick={() => {
              navigation.navigate('UTXOManagement', {
                data: currentWallet,
                routeName: 'Wallet',
                accountType: WalletType.DEFAULT,
              });
            }}
          />
          <TransactionsAndUTXOs
            transactions={currentWallet?.specs.transactions}
            setPullRefresh={setPullRefresh}
            pullRefresh={pullRefresh}
            currentWallet={currentWallet}
          />
          <Footer currentWallet={currentWallet} onPressBuyBitcoin={onPressBuyBitcoin} />
        </>
      ) : (
        <Box style={styles.addNewWalletContainer}>
          <AddWalletIcon />
          <Text color={`${colorMode}.primaryText`} numberOfLines={2} style={styles.addNewWalletText}>
            Add a new wallet or import one
          </Text>
        </Box>
      )
      }
      <RampModal
        showBuyRampModal={showBuyRampModal}
        setShowBuyRampModal={setShowBuyRampModal}
        wallets={wallets}
        walletIndex={walletIndex}
      />
      <LearnMoreModal introModal={introModal} setIntroModal={setIntroModal} />
    </ScreenWrapper >
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
  unconfirmedText: {
    fontSize: 11,
    letterSpacing: 0.72,
    textAlign: 'right',
  },
  unconfirmedBalance: {
    fontSize: 17,
    letterSpacing: 0.6,
    alignSelf: 'flex-end',
  },
  availableBalance: {
    fontSize: hp(24),
    letterSpacing: 1.2,
    lineHeight: hp(30),
  },
  transferPolicyContent: {
    paddingLeft: wp(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  // buy bitcoin
  buyBtcWrapper: {
    padding: 1,
  },
  buyBtcContent: {
    fontSize: 13,
    letterSpacing: 0.65,
    marginVertical: 15,
  },
  toWalletWrapper: {
    marginVertical: 4,
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#FDF7F0',
    flexDirection: 'row',
  },
  buyBtcCard: {
    marginHorizontal: 20,
  },
  buyBtcTitle: {
    fontSize: 12,
    color: '#5F6965',
  },
  presentationName: {
    fontSize: 19,
    letterSpacing: 1.28,
    color: '#041513',
  },
  confirmBalanceText: {
    fontStyle: 'italic',
    fontSize: 12,
    color: '#00836A',
  },
  atViewWrapper: {
    marginVertical: 4,
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: '#FDF7F0',
    flexDirection: 'row',
  },
  atViewWrapper02: {
    backgroundColor: '#FAC48B',
    borderRadius: 30,
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  atText: {
    fontSize: 21,
    textAlign: 'center',
  },
  addressTextView: {
    width: wp(180),
  },
  addWalletContent: {
    // paddingRight: wp(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: hp(20),
  },
});
export default WalletDetails;
