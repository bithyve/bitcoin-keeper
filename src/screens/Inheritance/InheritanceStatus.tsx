import React from 'react';
import { Box, ScrollView } from 'native-base';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { setInheritance } from 'src/store/reducers/settings';
import { useAppDispatch } from 'src/store/hooks';
import Vault from 'src/assets/images/vault.svg';
import Letter from 'src/assets/images/LETTER.svg';
import Recovery from 'src/assets/images/recovery.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';

import Text from 'src/components/KeeperText';
import Note from 'src/components/Note/Note';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { SafeGuardTips } from 'src/common/data/inheritance/Inheritance';
import InheritanceSupportView from './components/InheritanceSupportView';
import InheritanceDownloadView from './components/InheritanceDownloadView';

function InheritanceStatus() {
    const navigtaion = useNavigation();
    const dispatch = useAppDispatch();
    return (
        <ScreenWrapper>
            <HeaderTitle
                onPressHandler={() => navigtaion.goBack()}
                learnMore
                learnMorePressed={() => {
                    dispatch(setInheritance(true));
                }}
            />
            <InheritanceSupportView title='Inheritance Support' subtitle='For yourself, the heir and the attorney' />
            <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
                <InheritanceDownloadView icon={<Vault />} title='Safeguarding Tips' subTitle='How to store your keys securely'
                    onPress={() => navigtaion.navigate('InheritanceSetupInfo', {
                        title: 'Safe Guarding Tips',
                        subTitle: 'How to store your keys securely',
                        infoData: SafeGuardTips,
                        icon: <Vault />
                    })} />
                <InheritanceDownloadView icon={<Vault />} title='Setup Inheritance Key' subTitle='How to store your keys securely' />
                <Box style={styles.signingDevicesView}>
                    <Text style={styles.signingDevicesText}>Signing Devices have been changed&nbsp;</Text>
                    <ToastErrorIcon />
                </Box>
                <InheritanceDownloadView icon={<Letter />} title='Letter to the attorney' subTitle='A partly filled pdf template'
                    onPress={() => navigtaion.navigate('InheritanceSetupInfo', {
                        title: 'Letter to the attorney',
                        subTitle: 'A partly filled pdf template',
                        infoData: SafeGuardTips,
                        icon: <Letter />
                    })} />
                <InheritanceDownloadView icon={<Recovery />} title='Recovery Instructions' subTitle='A document for the heir only'
                    onPress={() => navigtaion.navigate('InheritanceSetupInfo', {
                        title: 'Recovery Instructions',
                        subTitle: 'A document for the heir only',
                        infoData: SafeGuardTips,
                        icon: <Recovery />
                    })} />
            </ScrollView>
            <Box style={styles.note}>
                <Note
                    title="Note"
                    subtitle="Consult your estate planner to use the information appropriately"
                    subtitleColor="GreyText"
                />
            </Box>
        </ScreenWrapper>
    )
}
const styles = StyleSheet.create({
    signingDevicesView: {
        alignSelf: 'flex-end',
        flexDirection: 'row',
        marginTop: hp(20),
        right: 3
    },
    scrollViewWrapper: {
    },
    signingDevicesText: {
        color: '#E07962',
        fontSize: 14
    },
    note: {
        bottom: hp(10),
        justifyContent: 'center',
        width: wp(320),
    },
})
export default InheritanceStatus