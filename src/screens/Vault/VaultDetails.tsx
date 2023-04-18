import { Box, VStack } from 'native-base';
import { StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import LinearGradient from 'src/components/KeeperGradient';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { VaultMigrationType } from 'src/core/wallets/enums';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePlan from 'src/hooks/usePlan';
import useVault from 'src/hooks/useVault';
import UTXOsManageNavBox from 'src/components/UTXOsComponents/UTXOsManageNavBox';
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
function Footer({ onPressBuy, vault }) {
  return <VaultFooter onPressBuy={onPressBuy} vault={vault} />;
}

function VaultDetails({ route }) {
  const navigation = useNavigation();
  const styles = getStyles(0);
  const { autoRefresh } = route.params || {};
  const vault: Vault = useVault().activeVault;
  const { subscriptionScheme } = usePlan();
  const [showBuyRampModal, setShowBuyRampModal] = useState(false);

  const transactions = vault?.specs?.transactions || [];

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
        <VStack style={styles.vaultHeaderWrapper}>
          <VaultHeader />
          <VaultInfo vault={vault} />
        </VStack>
      </VStack>
      <VStack
        backgroundColor="light.primaryBackground"
        px={wp(28)}
        borderTopLeftRadius={20}
        flex={1}
      >
        <VStack zIndex={1}>
          <SignerList upgradeStatus={hasPlanChanged()} vault={vault} />
        </VStack>
        <Box style={{ paddingTop: windowHeight > 800 ? windowHeight * 0.12 : windowHeight * 0.14 }}>
          <UTXOsManageNavBox
            onClick={() =>
              navigation.navigate('UTXOManagement', { data: vault, routeName: 'Vault' })
            }
            isWhirlpoolWallet={false}
            currentWallet={vault}
          />
        </Box>
        <TransactionsAndUTXOs transactions={transactions} vault={vault} autoRefresh={autoRefresh} />
        <Box
          position="absolute"
          bottom={windowHeight > 800 ? 5 : 1}
          width="100%"
          alignSelf="center"
          zIndex="1"
          backgroundColor="light.primaryBackground"
        >
          <Footer onPressBuy={() => setShowBuyRampModal(true)} vault={vault} />
        </Box>
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
    vaultHeaderWrapper: {
      marginHorizontal: '8%',
      marginTop: windowHeight > 670 ? 5 : 0,
    },
    bodyWrapper: {
      paddingHorizontal: wp(28),
      borderTopLeftRadius: 20,
      flex: 1,
      justifyContent: 'space-between',
      paddingBottom: windowHeight > 800 ? 5 : 0,
    },
  });
export default VaultDetails;
