import React from 'react'
import { Box } from 'native-base'
import Text from 'src/components/KeeperText'
import { StyleSheet } from 'react-native'

function CurrentPlanView() {
    return (
        <Box style={styles.wrapper} borderBottomColor='light.lightAccent'>
            <Text style={styles.titleTxet} color='light.secondaryText'>You are at</Text>
            <Text style={styles.currentPlanText} color='light.greenText2'>Hodler</Text>
        </Box>
    )
}
const styles = StyleSheet.create({
    wrapper: {
        borderBottomWidth: 0.8,
        paddingVertical: 10
    },
    titleTxet: {
        fontSize: 12
    },
    currentPlanText: {
        fontSize: 18,
        fontWeight: '600'
    }
})
export default CurrentPlanView