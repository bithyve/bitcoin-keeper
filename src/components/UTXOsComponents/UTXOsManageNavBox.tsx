import { StyleSheet } from 'react-native';
import React from 'react';
import { Box, Pressable } from 'native-base';
import ArrowIcon from 'src/assets/images/arrow.svg';
import { windowHeight } from 'src/common/data/responsiveness/responsive';
import Text from '../KeeperText';

function UTXOsManageNavBox({ onClick }: any) {
    return (
        <Pressable style={styles.manageUTXOsWrapper} backgroundColor="light.lightAccent" onPress={onClick} testID="btn_manageUTXOS">
            <Box style={styles.titleViewWrapper}>
                <Text style={styles.titleText} testID="text_manageUTXOSTitle">Manage UTXO’s</Text>
                <Text style={styles.subTitleText} testID="text_manageUTXOSubTitle">Lorem ipsum dolor sit amet, consectetur</Text>
            </Box>
            <Box style={styles.arrowViewWrapper} testID="view_manageUTXOArrow">
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
        paddingHorizontal: 10,
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