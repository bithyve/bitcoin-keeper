import React from 'react'
import { StyleSheet } from 'react-native'
import KeeperModal from 'src/components/KeeperModal';
import { Box } from 'native-base';
import Text from 'src/components/KeeperText';
import openLink from 'src/utils/OpenLink';
import { modalParams } from 'src/common/data/models/interfaces/UTXOs';
import ScodeIllustration from 'src/assets/images/ScodeIllustration.svg'


function SCodeContent() {
    return (
        <Box style={styles.container}>
            <Box style={styles.iconWrapper}>
                <ScodeIllustration />
            </Box>
            <Text style={styles.paraText}>
                As in any bitcoin sending transaction, Priority determines how fast your transaction gets confirmed on the bitcoin blockchain.
            </Text>
        </Box>
    )
}

function SCodeLearnMore({ visible, closeModal }: modalParams) {
    return (
        <KeeperModal
            visible={visible}
            close={() => {
                closeModal()
            }}
            title="SCODES and Priority"
            subTitle="SCODES are discount codes periodically released by Samurai on their social media platforms. Keep an eye out for them and use them to get attractive discounts on your whirlpool fees."
            DarkCloseIcon
            modalBackground={['light.gradientStart', 'light.gradientEnd']}
            textColor="light.white"
            Content={SCodeContent}
            learnMore
            learnMoreCallback={() => openLink('https://www.bitcoinkeeper.app/')}
            buttonText='Proceed'
            buttonTextColor="light.greenText02"
            buttonBackground={['#FFFFFF', '#80A8A1']}
            buttonCallback={() => closeModal()}
        />
    )
}
const styles = StyleSheet.create({
    container: {
        marginVertical: 5
    },
    paraText: {
        color: "white",
        fontSize: 13,
        letterSpacing: 0.65,
        padding: 1
    },
    iconWrapper: {
        alignSelf: "center",
    },
})

export default SCodeLearnMore