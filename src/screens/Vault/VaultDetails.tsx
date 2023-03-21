import { VStack } from 'native-base';
import { StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import LinearGradient from 'src/components/KeeperGradient';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { VaultMigrationType } from 'src/core/wallets/enums';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePlan from 'src/hooks/usePlan';
import useVault from 'src/hooks/useVault';
import UTXOsTransactionTabView from 'src/components/UTXOsComponents/UTXOsTransactionTabView';
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

function VaultDetails({ route }) {
  const { autoRefresh } = route.params || {};
  const vault: Vault = useVault().activeVault;
  const { subscriptionScheme } = usePlan();
  const [showBuyRampModal, setShowBuyRampModal] = useState(false);
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
  console.log('utxos', utxos)
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
          <UTXOsTransactionTabView setActiveTab={setActiveTab} />
        </VStack>
        <TransactionsAndUTXOs transactions={transactions} vault={vault} autoRefresh={autoRefresh} tab={tab} utxoState={utxos} />
        <VaultFooter onPressBuy={() => setShowBuyRampModal(true)} vault={vault} />
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
