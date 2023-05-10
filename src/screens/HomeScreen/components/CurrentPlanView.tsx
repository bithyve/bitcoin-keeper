import React from 'react'
import { Box } from 'native-base'
import Text from 'src/components/KeeperText'
import { StyleSheet } from 'react-native'

function CurrentPlanView() {
    return (
        <Box style={styles.wrapper}>
            <Text style={styles.titleTxet}>You are at</Text>
            <Text style={styles.currentPlanText}>Hodler</Text>
        </Box>
    )
}
const styles = StyleSheet.create({
    wrapper: {
        borderBottomColor: '#CBB9A8',
        borderBottomWidth: 0.7,
        paddingVertical: 10
    },
    titleTxet: {
        color: '#888888',
        fontSize: 12
    },
    currentPlanText: {
        color: '#2D6759',
        fontSize: 18
    }
})
export default CurrentPlanView