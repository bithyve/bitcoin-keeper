import { Platform, StyleSheet, View } from 'react-native';
import { Box, Pressable } from 'native-base';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
import AddWalletIcon from 'src/assets/images/addWallet_illustration.svg';
import BTC from 'src/assets/images/btc_wallet.svg';
import KeeperModal from 'src/components/KeeperModal';
import PreMix from 'src/assets/images/icon_premix.svg';
import PostMix from 'src/assets/images/icon_postmix.svg';
import BadBank from 'src/assets/images/icon_badbank.svg';
import Deposit from 'src/assets/images/icon_deposit.svg';
// data
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal } from 'src/store/reducers/wallets';
import { useAppSelector } from 'src/store/hooks';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HeaderTitle from 'src/components/HeaderTitle';
import WalletDetailsTabView from './components/WalletDetailsTabView';
import WalletList from './components/WalletList';
import Transactions from './components/Transactions';
import UTXOList from './components/UTXOList';
import TransactionFooter from './components/TransactionFooter';
import UTXOFooter from './components/UTXOFooter';
import RampModal from './components/RampModal';
import LearnMoreModal from './components/LearnMoreModal';
import WalletInfo from './components/WalletInfo';
import useWallets from 'src/hooks/useWallets';

// TODO: add type definitions to all components
function TransactionsAndUTXOs({
  tab,
  transections,
  setPullRefresh,
  pullRefresh,
  currentWallet,
  utxoState,
  setUtxoState,
  enableSelection,
  selectionTotal,
  setSelectionTotal,
}) {
  return (
    <Box style={styles.transactionsListContainer}>
      {tab === 'Transactions' ? (
        <Transactions
          transections={transections}
          setPullRefresh={setPullRefresh}
          pullRefresh={pullRefresh}
          currentWallet={currentWallet}
        />
      ) : (
        <UTXOList
          utxoState={utxoState}
          setUtxoState={setUtxoState}
          enableSelection={enableSelection}
          selectionTotal={selectionTotal}
          setSelectionTotal={setSelectionTotal}
        />
      )}
    </Box>
  );
}

function Footer({
  tab,
  currentWallet,
  onPressBuyBitcoin,
  setEnableSelection,
  enableSelection,
  utxos,
}) {
  return tab === 'Transactions' ? (
    <TransactionFooter currentWallet={currentWallet} onPressBuyBitcoin={onPressBuyBitcoin} />
  ) : (
    <UTXOFooter
      setEnableSelection={setEnableSelection}
      enableSelection={enableSelection}
      utxos={utxos}
    />
  );
}

function WalletDetails({ route }) {
  const dispatch = useDispatch();
  const { wallets } = useWallets({ whirlpoolStruct: true });
  const introModal = useAppSelector((state) => state.wallet.introModal) || false;
  const [showBuyRampModal, setShowBuyRampModal] = useState(false);
  const [walletIndex, setWalletIndex] = useState<number>(0);
  const [selectAccount, setselectAccount] = useState(false);
  const [pullRefresh, setPullRefresh] = useState(false);
  const [tab, setActiveTab] = useState('Transactions');
  const currentWallet = wallets[walletIndex];
  const transections = wallets[walletIndex]?.specs?.transactions || [];
  const utxos = _.clone(currentWallet && currentWallet.specs && currentWallet.specs.confirmedUTXOs);
  const [selectionTotal, setSelectionTotal] = useState(0);
  const [utxoState, setUtxoState] = useState(
    (utxos &&
      utxos.map((utxo) => {
        utxo.selected = false;
        return utxo;
      })) ||
      []
  );
  const [enableSelection, setEnableSelection] = useState(false);
  // const [selectAccount, setselectAccount] = useState(false);
  // const { translations } = useContext(LocalizationContext);
  // const { wallet } = translations;
  // const [walletIndex, setWalletIndex] = useState<number>(0);
  // const [pullRefresh, setPullRefresh] = useState(false);
  // const currentWallet: Wallet = wallets[walletIndex];
  // const isWhirlpoolWallet = !!currentWallet.whirlpoolConfig.whirlpoolWalletDetails.length;
  // const transections = isWhirlpoolWalletwallets[walletIndex]?.specs?.transactions || [];

  const { autoRefresh } = route?.params || {};
  useEffect(() => {
    if (autoRefresh) pullDownRefresh();
  }, [autoRefresh]);

  const flatListRef = useRef(null);

  const handleScrollToIndex = (index) => {
    if (index !== undefined && flatListRef && flatListRef?.current) {
      flatListRef?.current?.scrollToIndex({ index });
    }
  };

  const onViewRef = useRef((viewableItems) => {
    const index = viewableItems.changed.find((item) => item.isViewable === true);
    if (index?.index !== undefined) {
      handleScrollToIndex(index?.index);
      setWalletIndex(index?.index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 20 });
  const pullDownRefresh = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([currentWallet], { hardRefresh: true }));
    setPullRefresh(false);
  };
  const onPressBuyBitcoin = () => setShowBuyRampModal(true);

  const AccountComponent = ({ title, balance, onPress, icon }) => {
    return (
      <Pressable
        style={{
          marginTop: hp(20),
          paddingHorizontal: wp(15),
          paddingVertical: hp(10),
          height: hp(55),
          width: wp(270),
          alignSelf: 'center',
          justifyContent: 'center',
          borderRadius: hp(5),
        }}
        backgroundColor="light.lightAccent"
        onPress={onPress}
      >
        <Box
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Box style={{ flexDirection: 'row', alignItems: 'center' }}>
            {icon}
            <Text style={{ fontSize: 13, letterSpacing: 1, marginLeft: wp(10) }}>{title}</Text>
          </Box>
          <Box flexDirection={'row'}>
            <Box
              style={{
                marginRight: 3,
                marginTop: 3,
              }}
            >
              <BTC />
            </Box>
            <Text style={{ fontSize: 20, letterSpacing: 1 }}>{balance}</Text>
          </Box>
        </Box>
      </Pressable>
    );
  };

  function SelectAccountContent() {
    return (
      <View>
        <AccountComponent
          title={'Deposit'}
          balance={'0.000024'}
          onPress={() => {}}
          icon={<Deposit />}
        />

        <AccountComponent
          title={'PreMix Account'}
          balance={'0.000024'}
          onPress={() => {}}
          icon={<PreMix />}
        />

        <AccountComponent
          title={'PostMix Account'}
          balance={'0.000024'}
          onPress={() => {}}
          icon={<PostMix />}
        />

        <AccountComponent
          title={'Bad bank Account'}
          balance={'0.000024'}
          onPress={() => {}}
          icon={<BadBank />}
        />
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <HeaderTitle learnMore learnMorePressed={() => dispatch(setIntroModal(true))} />
      <WalletInfo />
      <WalletList
        flatListRef={flatListRef}
        walletIndex={walletIndex}
        onViewRef={onViewRef}
        viewConfigRef={viewConfigRef}
        wallets={wallets}
        setselectAccount={setselectAccount}
      />
      {walletIndex !== undefined && walletIndex !== wallets.length ? (
        <>
          <WalletDetailsTabView setActiveTab={setActiveTab} />
          <TransactionsAndUTXOs
            tab={tab}
            transections={transections}
            setPullRefresh={setPullRefresh}
            pullRefresh={pullRefresh}
            currentWallet={currentWallet}
            utxoState={utxoState}
            setUtxoState={setUtxoState}
            enableSelection={enableSelection}
            selectionTotal={selectionTotal}
            setSelectionTotal={setSelectionTotal}
          />
          <Footer
            tab={tab}
            currentWallet={currentWallet}
            onPressBuyBitcoin={onPressBuyBitcoin}
            setEnableSelection={setEnableSelection}
            enableSelection={enableSelection}
            utxos={utxoState}
          />
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
      <KeeperModal
        visible={selectAccount}
        close={() => {
          setselectAccount(false);
        }}
        title="Select Account"
        subTitle="Select Account Type"
        Content={SelectAccountContent}
      />
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
    height: Platform.OS === 'ios' ? '45%' : '43%',
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
