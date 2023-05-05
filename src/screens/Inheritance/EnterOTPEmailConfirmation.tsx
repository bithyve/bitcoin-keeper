import React, { useState } from 'react'
import ScreenWrapper from 'src/components/ScreenWrapper'
import HeaderTitle from 'src/components/HeaderTitle'
import { useNavigation } from '@react-navigation/native';
import { Box } from 'native-base';
import Buttons from 'src/components/Buttons';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import DeleteIcon from 'src/assets/images/deleteBlack.svg';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import { StyleSheet } from 'react-native';
import { wp, windowHeight } from 'src/common/data/responsiveness/responsive';

function EnterOTPEmailConfirmation() {
    const navigtaion = useNavigation();
    const [emailOrPhoneOTP, setEmailOrPhoneOTP] = useState('');
    const [passcodeFlag] = useState(true);

    const onPressNumber = (text) => {
        let tmpPasscode = emailOrPhoneOTP;
        tmpPasscode += text;
        if (emailOrPhoneOTP.length <= 6) {
            setEmailOrPhoneOTP(tmpPasscode);
        }
    };

    const onDeletePressed = (text) => {
        let str = emailOrPhoneOTP;
        str = str.substring(0, str.length - 1);
        setEmailOrPhoneOTP(str);
    };
    return (
        <ScreenWrapper>
            <HeaderTitle
                onPressHandler={() => navigtaion.goBack()}
                title='Add phone or email'
                subtitle='Lorem ipsum dolor sit amet, consectetur adipiscing elit'
            />
            {/* pin input view */}
            <Box style={styles.passwordContainer}>
                <CVVInputsView passCode={emailOrPhoneOTP} passcodeFlag={passcodeFlag} backgroundColor textColor height={windowHeight > 670 ? 50 : 39} width={windowHeight > 670 ? 50 : 39} />
            </Box>
            <Buttons
                primaryText="Next"
                primaryCallback={() => console.log('pr')}
            />
            <KeyPadView
                onPressNumber={onPressNumber}
                onDeletePressed={onDeletePressed}
                keyColor="light.primaryText"
                ClearIcon={<DeleteIcon />}
            />
        </ScreenWrapper>
    )
}
const styles = StyleSheet.create({
    passwordContainer: {
        marginVertical: wp(30),
        marginLeft: windowHeight > 670 ? 0 : 15
    },
})
export default EnterOTPEmailConfirmation