import { StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import Text from 'src/components/KeeperText';

function BottomMenuItem(props) {
    return (
        <TouchableOpacity
            style={styles.IconText}
            onPress={props.onPress}
        >
            {props.icon}
            <Text color="light.primaryText" style={styles.footerItemText}>
                {props.title}
            </Text>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    IconText: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerItemText: {
        fontSize: 12,
        letterSpacing: 0.84,
        marginVertical: 5,
    },
})
export default BottomMenuItem