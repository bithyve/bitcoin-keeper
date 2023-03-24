import { VStack } from 'native-base';
import { StyleSheet } from 'react-native';
import React, { useCallback, useState } from 'react';
import { windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import LinearGradient from 'src/components/KeeperGradient';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { VaultMigrationType } from 'src/core/wallets/enums';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePlan from 'src/hooks/usePlan';
import useVault from 'src/hooks/useVault';
import UTXOsTransactionTabView from 'src/components/UTXOsComponents/UTXOsTransactionTabView';
import UTXOFooter from 'src/components/UTXOsComponents/UTXOFooter';
import FinalizeFooter from 'src/components/UTXOsComponents/FinalizeFooter';
import UTXOSelectionTotal from 'src/components/UTXOsComponents/UTXOSelectionTotal';
import VaultInfo from './components/VaultInfo';
import VaultFooter from './components/VaultFooter';
import VaultHeader from './components/VaultHeader';
import SignerList from './components/SignerList';
import TransactionsAndUTXOs from './components/TransactionsAndUTXOs';
import VaultModals from './components/VaultModals';

function Wrapper({ children }) {
  const { top } = useSafeAreaInsets();
  const styles = getStyles(top);
  return (
    <LinearGradient
      colors={['#B17F44', '#6E4A35']}
      style={styles.container}
      start={[-0.5, 1]}
      end={[1, 1]}
    >
      {children}
    </LinearGradient>
  );
}
function Footer({
  tab,
  onPressBuy,
  vault,
  setEnableSelection,
  enableSelection,
  selectedUTXOs
}) {
  // eslint-disable-next-line no-nested-ternary
  return tab === 'Transactions' ? (
    <VaultFooter onPressBuy={onPressBuy} vault={vault} />
  ) : enableSelection ? (
    <FinalizeFooter
      currentWallet={vault}
      selectedUTXOs={selectedUTXOs}
      setEnableSelection={setEnableSelection}
    />
  ) : (
    <UTXOFooter setEnableSelection={setEnableSelection} enableSelection={enableSelection} />
  );
}

function VaultDetails({ route }) {
  const { autoRefresh } = route.params || {};
  const vault: Vault = useVault().activeVault;
  const { subscriptionScheme } = usePlan();
  const [showBuyRampModal, setShowBuyRampModal] = useState(false);
  const [enableSelection, _setEnableSelection] = useState(false);
  const [tab, setActiveTab] = useState('Transactions');

  const transactions = vault?.specs?.transactions || [];
  const { confirmedUTXOs, unconfirmedUTXOs } = vault?.specs || {
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
  const hasPlanChanged = (): VaultMigrationType => {
    const currentScheme = vault.scheme;
    if (currentScheme.m > subscriptionScheme.m) {
      return VaultMigrationType.DOWNGRADE;
    }
    if (currentScheme.m < subscriptionScheme.m) {
      return VaultMigrationType.UPGRADE;
    }
    return VaultMigrationType.CHANGE;
  };
  return (
    <Wrapper>
      <VStack zIndex={1}>
        <VStack mx="8%" mt={5}>
          <VaultHeader />
          <VaultInfo vault={vault} />
        </VStack>
        <SignerList upgradeStatus={hasPlanChanged()} vault={vault} />
      </VStack>
      <VStack
        backgroundColor="light.primaryBackground"
        px={wp(28)}
        borderTopLeftRadius={20}
        flex={1}
        justifyContent="space-between"
        paddingBottom={windowHeight > 800 ? 5 : 0}
      >
        <VStack style={{ paddingTop: windowHeight * 0.09 }}>
          {Object.values(selectedUTXOMap).length && tab === 'UTXOs' ? (
            <UTXOSelectionTotal selectionTotal={selectionTotal} selectedUTXOs={selectedUTXOs} />
          ) : (
            <UTXOsTransactionTabView activeTab={tab} setActiveTab={setActiveTab} />
          )}
        </VStack>
        <TransactionsAndUTXOs
          transactions={transactions}
          vault={vault}
          autoRefresh={autoRefresh}
          tab={tab}
          utxoState={utxos}
          selectedUTXOMap={selectedUTXOMap}
          setSelectedUTXOMap={setSelectedUTXOMap}
          selectionTotal={selectionTotal}
          setSelectionTotal={setSelectionTotal}
          enableSelection={enableSelection}
        />
        <Footer tab={tab} onPressBuy={() => setShowBuyRampModal(true)} vault={vault} setEnableSelection={() => setEnableSelection(true)} enableSelection={enableSelection} selectedUTXOs={selectedUTXOs} />
        <VaultModals
          showBuyRampModal={showBuyRampModal}
          setShowBuyRampModal={setShowBuyRampModal}
          hasPlanChanged={hasPlanChanged}
        />
      </VStack>
    </Wrapper>
  );
}

const getStyles = (top) =>
  StyleSheet.create({
    container: {
      paddingTop: Math.max(top, 35),
      justifyContent: 'space-between',
      flex: 1,
    },
  });
export default VaultDetails;
