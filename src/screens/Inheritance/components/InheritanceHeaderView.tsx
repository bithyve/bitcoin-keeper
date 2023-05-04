import React from 'react'
import { Box } from 'native-base'
import Text from 'src/components/KeeperText'
import { StyleSheet } from 'react-native'
import { hp } from 'src/common/data/responsiveness/responsive'

function InheritanceHeaderView(props) {
    return (
        <Box style={styles.wrapper}>
            <Box style={styles.iconWrapper}>
                {props.icon}
            </Box>
            <Box style={styles.titleWrapper}>
                <Text color="light.textWallet" style={styles.titleText}>{props.title}</Text>
                <Text color="light.secondaryText" style={styles.subTitleText}>{props.subTitle}</Text>
            </Box>
        </Box>
    )
}
const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        flexDirection: 'row',
        borderRadius: 10,
        paddingHorizontal: 25,
        alignItems: 'center',
    },
    iconWrapper: {
        width: '20%'
    },
    titleWrapper: {
        width: '80%'
    },
    titleText: {
        fontSize: 14,
        fontWeight: '400',
        letterSpacing: 0.80

    },
    subTitleText: {
        fontSize: 12,
        letterSpacing: 0.80
    }
})
export default InheritanceHeaderView