import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import Pdf from 'react-native-pdf';
import { Box, useColorMode } from 'native-base';
import Share from 'react-native-share';

import DownloadIcon from 'src/assets/images/download.svg';
import ScreenWrapper from 'src/components/ScreenWrapper';
import Text from 'src/components/KeeperText';

function PreviewPDF({ route }: any) {
    const { colorMode } = useColorMode();
    const { source } = route.params;
    const DownloadPDF = () => {
        Share.open({
            url: source,
            excludedActivityTypes: [
                'copyToPasteBoard',
                'markupAsPDF',
                'addToReadingList',
                'assignToContact',
                'mail',
                'default',
                'message',
                'postToFacebook',
                'print',
                'saveToCameraRoll',
            ],
        });
    }
    return (
        <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
            <TouchableOpacity onPress={() => DownloadPDF()} style={{ alignSelf: 'flex-end', marginBottom: 5 }}>
                <Box style={styles.downloadBtn} backgroundColor={`${colorMode}.yellowButtonBackground`}>
                    <DownloadIcon />
                    <Text style={styles.downloadBtnText} color={`${colorMode}.yellowButtonTextColor`}>&nbsp;&nbsp;Download</Text>
                </Box>
            </TouchableOpacity>
            <Box style={styles.container}>
                <Pdf
                    trustAllCerts={false}
                    source={{ uri: source }}
                    style={styles.pdf} />
            </Box>
        </ScreenWrapper>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    downloadBtn: {
        flexDirection: 'row',
        padding: 5,
        paddingHorizontal: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    downloadBtnText: {
        fontSize: 14,
    }
});

export default PreviewPDF