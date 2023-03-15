import { Platform, StyleSheet } from 'react-native';
import { Box } from 'native-base';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
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
import WalletDetailsTabView from './components/WalletDetailsTabView';
import WalletList from './components/WalletList';
import Transactions from './components/Transactions';
import UTXOList from './components/UTXOList';
import TransactionFooter from './components/TransactionFooter';
import UTXOFooter from './components/UTXOFooter';
import RampModal from './components/RampModal';
import LearnMoreModal from './components/LearnMoreModal';
import WalletInfo from './components/WalletInfo';
import UTXOSelectionTotal from './components/UTXOSelectionTotal';

// TODO: add type definitions to all components
function TransactionsAndUTXOs({
  tab,
  transections,
  setPullRefresh,
  pullRefresh,
  currentWallet,
  utxoState,
  enableSelection,
  selectionTotal,
  setSelectionTotal,
  selectedUTXOMap,
  setSelectedUTXOMap,
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
          enableSelection={enableSelection}
          selectionTotal={selectionTotal}
          setSelectionTotal={setSelectionTotal}
          selectedUTXOMap={selectedUTXOMap}
          setSelectedUTXOMap={setSelectedUTXOMap}
          currentWallet={currentWallet}
        />
      )}
    </Box>
  );
}

function Footer({ tab, currentWallet, onPressBuyBitcoin, setEnableSelection, enableSelection }) {
  return tab === 'Transactions' ? (
    <TransactionFooter currentWallet={currentWallet} onPressBuyBitcoin={onPressBuyBitcoin} />
  ) : (
    <UTXOFooter setEnableSelection={setEnableSelection} enableSelection={enableSelection} />
  );
}

function WalletDetails({ route }) {
  const dispatch = useDispatch();
  const { useQuery } = useContext(RealmWrapperContext);
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet).map(getJSONFromRealmObject) || [];
  const introModal = useAppSelector((state) => state.wallet.introModal) || false;
  const [showBuyRampModal, setShowBuyRampModal] = useState(false);
  const [walletIndex, setWalletIndex] = useState<number>(0);
  const [pullRefresh, setPullRefresh] = useState(false);
  const [tab, setActiveTab] = useState('Transactions');
  const currentWallet = wallets[walletIndex];
  const transections = wallets[walletIndex]?.specs?.transactions || [];
  const utxos = wallets[walletIndex]?.specs?.confirmedUTXOs || [];
  const [selectionTotal, setSelectionTotal] = useState(0);
  const [selectedUTXOMap, setSelectedUTXOMap] = useState({});

  const [enableSelection, setEnableSelection] = useState(false);
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

  return (
    <ScreenWrapper>
      <HeaderTitle learnMore learnMorePressed={() => dispatch(setIntroModal(true))} />
      <WalletInfo />
      <WalletList
        flatListRef={flatListRef}
        walletIndex={walletIndex}
        onViewRef={onViewRef}
        viewConfigRef={viewConfigRef}
      />
      {walletIndex !== undefined && walletIndex !== wallets.length ? (
        <>
          {Object.values(selectedUTXOMap).length && tab === 'UTXOs' ? <UTXOSelectionTotal selectionTotal={selectionTotal}/>
            : <WalletDetailsTabView setActiveTab={setActiveTab} />}
          <TransactionsAndUTXOs
            tab={tab}
            transections={transections}
            setPullRefresh={setPullRefresh}
            pullRefresh={pullRefresh}
            currentWallet={currentWallet}
            utxoState={utxos}
            selectedUTXOMap={selectedUTXOMap}
            setSelectedUTXOMap={setSelectedUTXOMap}
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
