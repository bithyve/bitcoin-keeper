import React from 'react'
import { StyleSheet } from 'react-native'
import KeeperModal from 'src/components/KeeperModal';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import openLink from 'src/utils/OpenLink';
import { modalParams } from 'src/common/data/models/interfaces/UTXOs';
import ScodeIllustration from 'src/assets/images/SomeDefination.svg';


function SCodeContent() {
    return (
        <Box style={styles.container}>
            <Text style={styles.titleText} italic>SCODES</Text>
            <Text style={styles.paraText}>SCODES are discount codes periodically released by Samurai on their social media platforms. Keep an eye out for them and use them to get attractive discounts on your whirlpool fees.</Text>
            <Box style={styles.iconWrapper}>
                <ScodeIllustration />
            </Box>
            <Text style={styles.titleText}>Priority</Text>
            <Text style={styles.paraText} italic>
                As in any bitcoin sending transaction, Priority determines how fast your transaction gets confirmed on the bitcoin blockchain.
            </Text>
        </Box>
    )
}

function SCodeLearnMore({ visible, closeModal }: modalParams) {
    const { colorMode } = useColorMode();
    return (
        <KeeperModal
            visible={visible}
            close={() => {
                closeModal()
            }}
            title="Some Definitions:"
            subTitle=""
            DarkCloseIcon
            modalBackground={[`${colorMode}.modalGreenBackground`, `${colorMode}.modalGreenBackground`]}
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
    titleText: {
        color: "white",
        fontSize: 13,
        letterSpacing: 0.65,
        padding: 1,
        fontWeight: 'bold'
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