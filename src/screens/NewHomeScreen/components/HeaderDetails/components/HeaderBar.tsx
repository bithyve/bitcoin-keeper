import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { Box } from 'native-base';
import Text from 'src/components/KeeperText'
import IconSettings from 'src/assets/images/new_icon_settings.svg';


function HeaderBar() {
    return (
        <Box style={styles.wrapper}>
            <Box style={styles.torStatusWrapper}>
                <Box style={styles.torStatusView}>
                    <Text style={styles.torStatusText} color='light.white'>TOR ENABLED</Text>
                </Box>
            </Box>
            <TouchableOpacity style={styles.settingIconWrapper}>
                <IconSettings />
            </TouchableOpacity>

        </Box>
    )
}
const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center'
    },
    torStatusWrapper: {
        width: '60%',
        alignItems: 'flex-end'
    },
    torStatusView: {
        backgroundColor: '#BFA8A3',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
        borderRadius: 10
    },
    torStatusText: {
        fontSize: 12
    },
    settingIconWrapper: {
        width: '40%',
        alignItems: 'flex-end'
    }
})
export default HeaderBar