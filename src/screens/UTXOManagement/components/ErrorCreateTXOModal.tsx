import { StyleSheet } from 'react-native'
import React from 'react'
import { Box } from 'native-base';
import { hp } from 'src/common/data/responsiveness/responsive';
import TXOErrorIcon from 'src/assets/images/TXOError.svg'
import KeeperModal from 'src/components/KeeperModal';
import { modalParams } from 'src/common/data/models/interfaces/UTXOs';

function InitiateContent() {
    return (
        <Box style={styles.contentWrapper}>
            <Box style={styles.iconWrapper}>
                <TXOErrorIcon />
            </Box>
        </Box>
    );
}
function ErrorCreateTxoModal({ visible, closeModal }: modalParams) {
    return (
        <KeeperModal
            visible={visible}
            close={() => closeModal()}
            title="Error creating TXO"
            subTitle="There was an issue in readying your sats to Whirlpool. Please try again."
            Content={InitiateContent}
            showCloseIcon
            buttonText='Try Again'
            buttonBackground={['#00836A', '#073E39']}
            buttonTextColor='#FAFAFA'
            buttonCallback={() => closeModal()}
        />
    )
}
const styles = StyleSheet.create({
    contentWrapper: {
        marginVertical: 20
    },
    iconWrapper: {
        alignSelf: "center"
    },
    paragraphText: {
        marginTop: hp(20),
        color: "white",
        fontSize: 13,
        letterSpacing: 0.65,
        padding: 1
    }
})

export default ErrorCreateTxoModal