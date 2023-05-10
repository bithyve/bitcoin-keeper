import React from 'react'
import { Box } from 'native-base'
import Text from 'src/components/KeeperText'
import { StyleSheet } from 'react-native'
import { hp } from 'src/common/data/responsiveness/responsive'


function UAIView() {
    return (
        <Box style={styles.wrapper}>
            <Box style={styles.uaiMessageWrapper}>
                <Text style={styles.uaiMessageText}>Add signing device to secure your vault</Text>
            </Box>
            <Box style={styles.skipWrapper}>
                <Text style={styles.skipText}>SKIP</Text>
            </Box>
            <Box style={styles.addNowWrapper}>
                <Box style={styles.addNowCTAWrapper}>
                    <Text style={styles.addNowCTAText}>ADD NOW</Text>
                </Box>
            </Box>
        </Box>
    )
}
const styles = StyleSheet.create({
    wrapper: {
        marginTop: hp(20),
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
    },
    uaiMessageWrapper: {
        width: '60%'
    },
    uaiMessageText: {
        color: '#24312E',
        fontSize: 12,
        fontWeight: 'bold',
        width: 150
    },
    skipWrapper: {
        width: '20%',
        alignItems: 'center'
    },
    skipText: {
        color: '#704E2E',
        fontWeight: '500'
    },
    addNowWrapper: {
        width: '20%'
    },
    addNowCTAWrapper: {
        backgroundColor: '#2D6759',
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20
    },
    addNowCTAText: {
        color: '#F7F2EC',
        fontSize: 10,
        fontWeight: '500'
    }
})
export default UAIView