import React, { useState } from 'react'
import ScreenWrapper from 'src/components/ScreenWrapper'
import HeaderTitle from 'src/components/HeaderTitle'
import { useNavigation } from '@react-navigation/native';
import { Box, Input } from 'native-base';
import Buttons from 'src/components/Buttons';
import { StyleSheet } from 'react-native';
import { hp } from 'src/common/data/responsiveness/responsive';

function IKSAddEmailPhone() {
    const navigtaion = useNavigation();
    const [emailOrPhone, setEmailOrPhone] = useState('');
    return (
        <ScreenWrapper>
            <HeaderTitle
                onPressHandler={() => navigtaion.goBack()}
                title='Add phone or email'
                subtitle='Lorem ipsum dolor sit amet, consectetur adipiscing elit'
            />
            <Box style={styles.inputWrapper}>
                <Input
                    placeholderTextColor="grey"
                    backgroundColor="light.primaryBackground"
                    placeholder="Add phone/email"
                    style={styles.input}
                    borderWidth={0}
                    height={50}
                    value={emailOrPhone}
                    onChangeText={(text) => {
                        setEmailOrPhone(text);
                    }}
                />
            </Box>
            <Buttons
                primaryText="Proceed"
                primaryCallback={() => navigtaion.navigate('EnterOTPEmailConfirmation')}
            />
        </ScreenWrapper>
    )
}
const styles = StyleSheet.create({
    inputWrapper: {
        marginVertical: hp(60),
        marginHorizontal: 4,
    },
    input: {
        width: "90%",
        fontSize: 14,
        paddingLeft: 5
    }
})
export default IKSAddEmailPhone