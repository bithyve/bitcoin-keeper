import { StyleSheet } from 'react-native';
import React from 'react';
import { Box, Pressable } from 'native-base';
import ArrowIcon from 'src/assets/images/arrow.svg';
import { windowHeight } from 'src/common/data/responsiveness/responsive';
import Text from '../KeeperText';

function UTXOsManageNavBox({ onClick }: any) {
    return (
        <Pressable style={styles.manageUTXOsWrapper} backgroundColor="light.lightAccent" onPress={onClick}>
            <Box style={styles.titleViewWrapper}>
                <Text style={styles.titleText}>Manage UTXO’s</Text>
                <Text style={styles.subTitleText}>Lorem ipsum dolor sit amet, consectetur</Text>
            </Box>
            <Box style={styles.arrowViewWrapper}>
                <ArrowIcon />
            </Box>
        </Pressable>
    )
}
const styles = StyleSheet.create({
    manageUTXOsWrapper: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        padding: windowHeight > 815 ? 10 : 5,
        paddingHorizontal: windowHeight > 815 ? 0 : 10,
        borderRadius: 5,
        marginBottom: windowHeight > 815 ? 15 : 5,
        marginTop: windowHeight > 815 ? 0 : 10
    },
    titleViewWrapper: {
        width: '95%'
    },
    titleText: {
        color: '#725436',
        fontSize: 14
    },
    subTitleText: {
        color: '#725436',
        fontSize: 12
    },
    arrowViewWrapper: {
        width: '5%'
    }
})
export default UTXOsManageNavBox