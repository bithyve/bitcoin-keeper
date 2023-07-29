import { Dimensions, StyleSheet } from 'react-native'
import React from 'react'
import Pdf from 'react-native-pdf';
import { Box } from 'native-base';

function PreviewPDF({ route }: any) {
    const { source } = route.params;
    return (
        <Box style={styles.container}>
            <Pdf
                trustAllCerts={false}
                source={{ uri: source }}
                style={styles.pdf} />
        </Box>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginTop: 25,
    },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    }
});

export default PreviewPDF