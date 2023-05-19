import React from 'react';
import { Box } from 'native-base';
import { StyleSheet, View } from 'react-native';

function PageIndicator({ totalPage, currentPage }: { totalPage: number; currentPage: number }) {
    const dotView = (totalPage: number, currentPage: number) => {
        const dots = [];
        for (let i = 0; i <= totalPage; i++) {
            dots.push(
                <View
                    key={i}
                    style={currentPage === i ? styles.dash : styles.dot}
                />,
            );
        }
        return dots;
    }

    return (
        <Box style={styles.bottomBtnsWrapper02}>
            {dotView(totalPage, currentPage)}
        </Box>
    )
}

const styles = StyleSheet.create({
    bottomBtnsWrapper02: {
        backgroundColor: 'transparent',
        flexDirection: 'row',
        marginLeft: 25,
        marginTop: 6,
    },
    dot: {
        backgroundColor: '#A7A7A7',
        width: 6,
        height: 4,
        marginHorizontal: 2,
    },
    dash: {
        backgroundColor: '#676767',
        width: 26,
        height: 4,
    },
});
export default PageIndicator;
