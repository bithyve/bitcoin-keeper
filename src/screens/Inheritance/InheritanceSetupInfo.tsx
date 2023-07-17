/* eslint-disable react/prop-types */
import React from 'react'
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Box, FlatList } from 'native-base';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HeaderTitle from 'src/components/HeaderTitle';
import { hp } from 'src/common/data/responsiveness/responsive';
import DotView from 'src/components/DotView';
import Text from 'src/components/KeeperText';
import InheritanceHeaderView from './components/InheritanceHeaderView'

const renderItem = ({ item }) => (
    <Box style={styles.wrapper}>
        <Box style={styles.dotViewWrapper}>
            <DotView color='#073B36' height={1.5} width={1.5} />
        </Box>
        <Box style={styles.tipsWrapper}>
            <Text style={styles.titleText}>{item.title}</Text>
            <Text style={styles.tipsParagraph01Text}>{item.subTitle}</Text>
            <Text style={styles.tipsParagraph02Text}>{item.message}</Text>
        </Box>
    </Box>
)
function InheritanceSetupInfo({ route }) {
    const { title, subTitle, infoData, icon } = route.params;
    const navigtaion = useNavigation();
    return (
        <ScreenWrapper>
            <HeaderTitle
                onPressHandler={() => navigtaion.goBack()}
            />
            <InheritanceHeaderView icon={icon} title={title && title} subTitle={subTitle && subTitle} />
            <FlatList
                showsVerticalScrollIndicator={false}
                style={styles.scrollViewWrapper}
                data={infoData}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
        </ScreenWrapper>
    )
}
const styles = StyleSheet.create({
    scrollViewWrapper: {
        height: '70%',
        marginTop: hp(20),
        marginLeft: hp(5)
    },
    wrapper: {
        flexDirection: 'row',
        width: '100%',
        margin: hp(5),
    },
    dotViewWrapper: {
        width: '10%',
        marginTop: hp(8),
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    tipsWrapper: {
        width: '88%'
    },
    titleText: {
        fontSize: 14,
        fontWeight: '600'
    },
    tipsParagraph01Text: {
        marginBottom: hp(5),
        fontSize: 12,
        letterSpacing: 0.50
    },
    tipsParagraph02Text: {
        fontSize: 12,
        letterSpacing: 0.50
    }
})
export default InheritanceSetupInfo