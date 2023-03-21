import { Box } from 'native-base';
import { StyleSheet } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import AddWalletIcon from 'src/assets/images/addWallet_illustration.svg';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal } from 'src/store/reducers/wallets';
import { useAppSelector } from 'src/store/hooks';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HeaderTitle from 'src/components/HeaderTitle';
import useWallets, { whirlpoolWalletTypeMap } from 'src/hooks/useWallets';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { WalletType } from 'src/core/wallets/enums';
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
import FinalizeFooter from './components/FinalizeFooter';

// TODO: add type definitions to all components
function TransactionsAndUTXOs({
  tab,
  transactions,
  setPullRefresh,
  pullRefresh,
  currentWallet,
  utxoState,
  enableSelection,
  setSelectionTotal,
  selectedUTXOMap,
  setSelectedUTXOMap,
}) {
  return (
    <Box style={styles.transactionsListContainer}>
      {tab === 'Transactions' ? (
        <Transactions
          transactions={transactions}
          setPullRefresh={setPullRefresh}
          pullRefresh={pullRefresh}
          currentWallet={currentWallet}
        />
      ) : (
        <UTXOList
          utxoState={utxoState}
          enableSelection={enableSelection}
          setSelectionTotal={setSelectionTotal}
          selectedUTXOMap={selectedUTXOMap}
          setSelectedUTXOMap={setSelectedUTXOMap}
          currentWallet={currentWallet}
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
  selectedUTXOs,
}) {
  const navigation = useNavigation();
  const [initiateWhirlpool, setInitiateWhirlpool] = useState(false);

  return tab === 'Transactions' ? (
    <TransactionFooter currentWallet={currentWallet} onPressBuyBitcoin={onPressBuyBitcoin} />
  ) : enableSelection ? (
    <FinalizeFooter
      initiateWhirlpool={initiateWhirlpool}
      setEnableSelection={setEnableSelection}
      setInitiateWhirlpool={setInitiateWhirlpool}
      secondaryText="Cancel"
      footerCallback={() =>
        initiateWhirlpool
          ? navigation.dispatch(
              CommonActions.navigate('WhirlpoolConfiguration', {
                utxos: selectedUTXOs || [],
                wallet: currentWallet,
              })
            )
          : navigation.dispatch(
              CommonActions.navigate('Send', { sender: currentWallet, selectedUTXOs })
            )
      }
    />
  ) : (
    <UTXOFooter
      setEnableSelection={setEnableSelection}
      setInitiateWhirlpool={setInitiateWhirlpool}
      enableSelection={enableSelection}
      utxos={utxos}
      wallet={currentWallet}
    />
  );
}

function WalletDetails({ route }) {
  const dispatch = useDispatch();
  const { autoRefresh, accountType, walletId } = route?.params || {};
  const { wallets } = useWallets({ whirlpoolStruct: true });
  const introModal = useAppSelector((state) => state.wallet.introModal) || false;
  const [showBuyRampModal, setShowBuyRampModal] = useState(false);
  const [walletIndex, setWalletIndex] = useState<number>(0);
  const [currentWallet, setCurrentWallet] = useState<Wallet>(wallets[walletIndex]);
  const [whirlpoolAccountType, setWhirlpoolAccountType] = useState<String>(WalletType.DEFAULT);
  const [pullRefresh, setPullRefresh] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [tab, setActiveTab] = useState('Transactions');

  useEffect(() => {
    if (walletIndex !== wallets.length) {
      if (accountType && wallets[walletIndex]?.id === walletId) {
        console.log(accountType, wallets[walletIndex]?.id, walletId);
        console.log('here');
        setWhirlpoolAccountType(accountType);
        setCurrentWallet(wallets[walletIndex].whirlpoolConfig[whirlpoolWalletTypeMap[accountType]]);
      } else {
        setWhirlpoolAccountType(WalletType.DEFAULT);
        setCurrentWallet(wallets[walletIndex]);
      }
    }
  }, [walletIndex]);

  useEffect(() => {
    console.log(currentWallet.id);
    setTransactions(currentWallet?.specs?.transactions || []);
  }, [currentWallet]);

  const { confirmedUTXOs, unconfirmedUTXOs } = wallets[walletIndex]?.specs || {
    confirmedUTXOs: [],
    unconfirmedUTXOs: [],
  };
  const utxos =
    confirmedUTXOs
      .map((utxo) => {
        utxo.confirmed = true;
        return utxo;
      })
      .concat(
        unconfirmedUTXOs.map((utxo) => {
          utxo.confirmed = false;
          return utxo;
        })
      ) || [];

  const [selectionTotal, setSelectionTotal] = useState(0);
  const [selectedUTXOMap, setSelectedUTXOMap] = useState({});
  const [enableSelection, _setEnableSelection] = useState(false);
  const selectedUTXOs = utxos.filter((utxo) => selectedUTXOMap[`${utxo.txId}${utxo.vout}`]);

  const cleanUp = useCallback(() => {
    setSelectedUTXOMap({});
    setSelectionTotal(0);
  }, []);
  const setEnableSelection = useCallback(
    (value) => {
      _setEnableSelection(value);
      if (!value) {
        cleanUp();
      }
    },
    [cleanUp]
  );

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
  const pullDownRefresh = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([currentWallet], { hardRefresh: true }));
    setPullRefresh(false);
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
        whirlpoolAccountType={whirlpoolAccountType}
        setCurrentWallet={setCurrentWallet}
      />
      {walletIndex !== undefined && walletIndex !== wallets.length ? (
        <>
          {Object.values(selectedUTXOMap).length && tab === 'UTXOs' ? (
            <UTXOSelectionTotal selectionTotal={selectionTotal} selectedUTXOs={selectedUTXOs} />
          ) : (
            <WalletDetailsTabView setActiveTab={setActiveTab} />
          )}
          <TransactionsAndUTXOs
            tab={tab}
            transactions={transactions}
            setPullRefresh={setPullRefresh}
            pullRefresh={pullRefresh}
            currentWallet={currentWallet}
            utxoState={utxos}
            selectedUTXOMap={selectedUTXOMap}
            setSelectedUTXOMap={setSelectedUTXOMap}
            enableSelection={enableSelection}
            setSelectionTotal={setSelectionTotal}
          />
          <Footer
            tab={tab}
            currentWallet={currentWallet}
            onPressBuyBitcoin={onPressBuyBitcoin}
            setEnableSelection={setEnableSelection}
            enableSelection={enableSelection}
            utxos={utxos}
            selectedUTXOs={selectedUTXOs}
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
    height: '45%',
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
