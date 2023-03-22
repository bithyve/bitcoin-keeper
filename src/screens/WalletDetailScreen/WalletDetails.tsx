import { Box } from 'native-base';
import { StyleSheet } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import AddWalletIcon from 'src/assets/images/addWallet_illustration.svg';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal, setWalletDetailsUI } from 'src/store/reducers/wallets';
import { useAppSelector } from 'src/store/hooks';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HeaderTitle from 'src/components/HeaderTitle';
import useWallets, { whirlpoolWalletTypeMap } from 'src/hooks/useWallets';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { LabelType, WalletType } from 'src/core/wallets/enums';
import WhirlpoolClient from 'src/core/services/whirlpool/client';
import { createUTXOReference } from 'src/store/sagaActions/utxos';
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
import Buttons from 'src/components/Buttons';
import KeeperModal from 'src/components/KeeperModal';

export const allowedSendTypes = [
  WalletType.DEFAULT,
  WalletType.IMPORTED,
  WalletType.POST_MIX,
  WalletType.BAD_BANK,
];
export const allowedRecieveTypes = [WalletType.DEFAULT, WalletType.IMPORTED];

export const allowedMixTypes = [WalletType.DEFAULT, WalletType.IMPORTED];

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
  depositWallet,
  currentWallet,
  onPressBuyBitcoin,
  setEnableSelection,
  enableSelection,
  utxos,
  selectedUTXOs,
  setShowMixSuccessModal,
}) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [initiateWhirlpool, setInitiateWhirlpool] = useState(false);
  const [initateWhirlpoolMix, setInitateWhirlpoolMix] = useState(false);
  const { walletPoolMap } = useAppSelector((state) => state.wallet);
  const goToWhirlpoolConfiguration = () => {
    setEnableSelection(false);
    navigation.dispatch(
      CommonActions.navigate('WhirlpoolConfiguration', {
        utxos: selectedUTXOs || [],
        wallet: currentWallet,
      })
    );
  };

  const inititateWhirlpoolMixProcess = async () => {
    try {
      const postmix = depositWallet?.whirlpoolConfig?.postmixWallet;
      const destination = postmix.specs.receivingAddress;
      const poolDenomination = walletPoolMap[depositWallet.id];
      // To-Do: Instead of taking pool_denomination from the lets create a switch case to get it based on UTXO value
      let isBroadcasted = true;
      for (const utxo of selectedUTXOs) {
        const { txid, PSBT } = await WhirlpoolClient.premixToPostmix(
          utxo,
          destination,
          poolDenomination,
          currentWallet
        );
        console.log('txid', txid);
        if (txid) {
          const outputs = PSBT.txOutputs;
          const voutPostmix = outputs.findIndex((o) => o.address === destination);
          dispatch(
            createUTXOReference({
              labels: [{ name: 'Premix', type: LabelType.SYSTEM }],
              txId: txid,
              vout: voutPostmix,
            })
          );
        } else isBroadcasted = false;
      }
      if (isBroadcasted) setShowMixSuccessModal(true);
    } catch (err) {
      console.log(err);
    }
  };

  return tab === 'Transactions' ? (
    <TransactionFooter currentWallet={currentWallet} onPressBuyBitcoin={onPressBuyBitcoin} />
  ) : enableSelection ? (
    <FinalizeFooter
      initiateWhirlpool={initiateWhirlpool}
      setEnableSelection={setEnableSelection}
      setInitiateWhirlpool={setInitiateWhirlpool}
      initateWhirlpoolMix={initateWhirlpoolMix}
      setInitateWhirlpoolMix={setInitateWhirlpoolMix}
      secondaryText="Cancel"
      footerCallback={() =>
        initiateWhirlpool
          ? goToWhirlpoolConfiguration()
          : initateWhirlpoolMix
          ? inititateWhirlpoolMixProcess()
          : navigation.dispatch(
              CommonActions.navigate('Send', { sender: currentWallet, selectedUTXOs })
            )
      }
    />
  ) : (
    <UTXOFooter
      setEnableSelection={setEnableSelection}
      setInitiateWhirlpool={setInitiateWhirlpool}
      setInitateWhirlpoolMix={setInitateWhirlpoolMix}
      enableSelection={enableSelection}
      utxos={utxos}
      wallet={currentWallet}
    />
  );
}

function WalletDetails({ route }) {
  const dispatch = useDispatch();
  const { autoRefresh } = route?.params || {};
  const selectedTab = route?.params?.selectedtab;
  const { wallets } = useWallets({ whirlpoolStruct: true });
  const introModal = useAppSelector((state) => state.wallet.introModal) || false;
  const { walletDetailsUI } = useAppSelector((state) => state.wallet);

  const [showBuyRampModal, setShowBuyRampModal] = useState(false);
  const [walletIndex, setWalletIndex] = useState<number>(0);
  const [depositWallet, setDepositWallet] = useState<Wallet>();
  const [currentWallet, setCurrentWallet] = useState<Wallet>(wallets[walletIndex]);

  const [pullRefresh, setPullRefresh] = useState(false);
  const [tab, setActiveTab] = useState('Transactions');
  const [showMixSuccessModal, setShowMixSuccessModal] = useState(false);

  useEffect(() => {
    setActiveTab(selectedTab || 'Transactions');
    if (walletIndex !== wallets.length) {
      const defaultWallet: Wallet = wallets[walletIndex];
      const accountType = walletDetailsUI[defaultWallet.id];
      if (accountType && accountType !== WalletType.DEFAULT) {
        if (defaultWallet?.whirlpoolConfig[whirlpoolWalletTypeMap[accountType]]) {
          setDepositWallet(defaultWallet);
          setCurrentWallet(defaultWallet?.whirlpoolConfig[whirlpoolWalletTypeMap[accountType]]);
          dispatch(
            refreshWallets(
              [
                defaultWallet,
                defaultWallet?.whirlpoolConfig.premixWallet,
                defaultWallet?.whirlpoolConfig.postmixWallet,
                defaultWallet?.whirlpoolConfig.badbankWallet,
              ],
              { hardRefresh: true }
            )
          );
        }
      } else {
        setCurrentWallet(defaultWallet);
      }
    }
  }, [walletIndex, walletDetailsUI]);

  const { confirmedUTXOs, unconfirmedUTXOs } = currentWallet?.specs || {
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

    setShowMixSuccessModal(false);
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

  const goToPostMixWallet = () => {
    setShowMixSuccessModal(false);
    dispatch(
      setWalletDetailsUI({
        walletId: depositWallet.id,
        walletType: WalletType.POST_MIX,
      })
    );
  };

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
            transactions={currentWallet?.specs.transactions}
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
            depositWallet={depositWallet}
            currentWallet={currentWallet}
            onPressBuyBitcoin={onPressBuyBitcoin}
            setEnableSelection={setEnableSelection}
            enableSelection={enableSelection}
            utxos={utxos}
            selectedUTXOs={selectedUTXOs}
            setShowMixSuccessModal={setShowMixSuccessModal}
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
        justifyContent="flex-end"
        visible={showMixSuccessModal}
        close={() => {
          () => goToPostMixWallet();
        }}
        title="Mix broadcasted"
        subTitle="Your mix is now being broadcasted to the Bitcoin network."
        subTitleColor="#5F6965"
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonTextColor="#FAFAFA"
        closeOnOverlayClick={false}
        Content={() => (
          <Box style={styles.mixSuccesModalFooter}>
            <Box style={{ alignSelf: 'flex-end' }}>
              <Buttons
                primaryText="View Postmix Account"
                primaryCallback={() => goToPostMixWallet()}
              />
            </Box>
          </Box>
        )}
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
  mixSuccesModalFooter: {
    marginTop: 80,
    flexDirection: 'row',
    alignContent: 'flex-end',
    justifyContent: 'flex-end',
    width: '100%',
  },
});
export default WalletDetails;
