import { TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { Box } from 'native-base';

import Text from 'src/components/KeeperText';
import { hp } from 'src/common/data/responsiveness/responsive';

function UTXOsTransactionTabView({
  activeTab,
  setActiveTab,
}: {
  activeTab: string,
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <Box style={styles.tabWrapper}>
      <TouchableOpacity style={styles.transTabWrapper} onPress={() => setActiveTab('Transactions')}>
        <Text style={[styles.tabTitleText, { color: activeTab === 'Transactions' ? '#041513' : '#8B7860', fontWeight: activeTab === 'Transactions' ? 'bold' : '400' }]}>Transactions</Text>
      </TouchableOpacity>
      <Box style={{ width: '4%' }}>
        <Text style={styles.verticalDash}>|</Text>
      </Box>
      <TouchableOpacity style={styles.utxoTabWrapper} onPress={() => setActiveTab('UTXOs')}>
        <Text style={[styles.tabTitleText, { color: activeTab === 'UTXOs' ? '#041513' : '#8B7860', fontWeight: activeTab === 'UTXOs' ? 'bold' : '400' }]}>UTXOs</Text>
      </TouchableOpacity>
    </Box>
  );
}
const styles = StyleSheet.create({
  tabWrapper: {
    flexDirection: 'row',
    padding: 12,
    marginTop: hp(20),
    width: '100%',
  },
  transTabWrapper: {
    width: '48%',
    alignItems: 'center',
  },
  utxoTabWrapper: {
    width: '48%',
    alignItems: 'center',
  },
  tabTitleText: {
    fontSize: 15
  },
  verticalDash: {
    color: '#E3BE96',
    fontSize: 16,
  },
});
export default UTXOsTransactionTabView;
