import { TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { Box } from 'native-base'

import Text from 'src/components/KeeperText';
import { hp } from 'src/common/data/responsiveness/responsive'

function WalletDetailsTabView({ setActiveTab }: { setActiveTab: () => void }) {
    return (
        <Box style={styles.tabWrapper}>
            <TouchableOpacity style={styles.transTabWrapper} onPress={() => setActiveTab('Transactions')}>
                <Text>Transactions</Text>
            </TouchableOpacity>
            <Box style={{ width: '4%' }}>
                <Text style={styles.verticalDash}>|</Text>
            </Box>
            <TouchableOpacity style={styles.utxoTabWrapper} onPress={() => setActiveTab('UTXOs')}>
                <Text>UTXOs</Text>
            </TouchableOpacity>
        </Box>
    )
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
    },
    utxoTabWrapper: {
        width: '48%',
        alignItems: 'flex-end',
    },
    verticalDash: {
        color: '#E3BE96',
        fontSize: 16,
    },
})
export default WalletDetailsTabView