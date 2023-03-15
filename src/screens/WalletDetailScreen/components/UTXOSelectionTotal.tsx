import { StyleSheet } from 'react-native'
import React from 'react'
import { Box } from 'native-base'
import Text from 'src/components/KeeperText'
import { hp } from 'src/common/data/responsiveness/responsive'
import BtcBlack from 'src/assets/images/btc_black.svg';

function UTXOSelectionTotal(props) {
    return (
        <Box style={styles.tabWrapper}>
            <Box style={styles.selectionWrapper}>
                <Text style={styles.selectionText}>02 UTXO Selected</Text>
            </Box>
            <Box style={styles.totalWrapper}>
                <Text style={styles.selectionTotalText}>Total</Text>
                <Box style={styles.totalView}>
                    <BtcBlack />
                    <Text style={styles.selectionText}>&nbsp;{props.selectionTotal}</Text>
                </Box>
            </Box>
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
    selectionWrapper: {
        width: '48%'
    },
    totalWrapper: {
        flexDirection: 'row',
        width: '48%',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    totalView: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectionText: {
        fontSize: 16,
        fontWeight: '400'
    },
    selectionTotalText: {
        fontSize: 16,
        marginRight: 10,
        fontWeight: '400'
    }
})
export default UTXOSelectionTotal