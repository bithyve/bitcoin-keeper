import { StyleSheet } from 'react-native'
import React from 'react'
import { Box } from 'native-base';
import { hp } from 'src/common/data/responsiveness/responsive';
import SendBadBankSatsIcon from 'src/assets/images/sendBadBankSats.svg'
import KeeperModal from 'src/components/KeeperModal';
import { modalParams } from 'src/common/data/models/interfaces/UTXOs';
import Text from 'src/components/KeeperText';

function SendBadBankSatsContent() {
    return (
        <Box style={styles.contentWrapper}>
            <Text style={styles.paragraphText}>
                Never mix UTXOs in Badbank with one another or with UTXOs in the Post Mix wallet
            </Text>
            <Box style={styles.iconWrapper}>
                <SendBadBankSatsIcon />
            </Box>
            <Text style={styles.paragraphText}>
                A good use of these sats is to purchase redeamable vouchers or anonymous donations
            </Text>
        </Box>
    );
}
function SendBadBankSatsModal({ visible, closeModal }: modalParams) {
    return (
        <KeeperModal
            visible={visible}
            close={() => closeModal()}
            title="Sending Sats from Badbank"
            subTitle="Sats in the Badbank could potentially reveal your identity."
            Content={SendBadBankSatsContent}
            showCloseIcon
            buttonText='Proceed'
            buttonBackground={['#00836A', '#073E39']}
            buttonTextColor='#FAFAFA'
            buttonCallback={() => closeModal()}
        />
    )
}
const styles = StyleSheet.create({
    contentWrapper: {
        // marginVertical: 20
    },
    iconWrapper: {
        alignSelf: "center",
        marginVertical: hp(25)
    },
    paragraphText: {
        fontSize: 13,
        letterSpacing: 0.65,
        padding: 1
    }
})

export default SendBadBankSatsModal