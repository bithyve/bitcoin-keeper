/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-unused-vars */
import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';

import { hp, wp } from 'src/common/data/responsiveness/responsive';
import LinearGradient from 'src/components/KeeperGradient';
import Text from 'src/components/KeeperText';
import Inheritance from 'src/assets/images/inheritance_Inner.svg';

type Props = {
    title?: string;
    subtitle?: string;
}

function InheritanceSupportView({
    title = '',
    subtitle = '',
}: Props) {
    const { colorMode } = useColorMode();
    function GradientIcon({ height, Icon }) {
        return (
            <LinearGradient
                colors={['light.gradientStart', 'light.gradientEnd']}
                start={[0, 0]}
                end={[1, 1]}
                style={{
                    ...styles.gradientIcon,
                    height: hp(height),
                    width: hp(height),
                    borderRadius: height,
                }}
            >
                <Icon />
            </LinearGradient>
        );
    }
    return (
        <Box style={styles.topContainer}>
            <GradientIcon Icon={Inheritance} height={50} />
            <Text color={`${colorMode}.primaryText`} style={styles.title}>
                {title}
            </Text>
            <Text color={`${colorMode}.textColor2`} style={styles.subtitle}>
                {subtitle}
            </Text>
        </Box>
    )
}
const styles = StyleSheet.create({
    topContainer: {
        alignItems: 'center',
        paddingHorizontal: 1,
    },
    title: {
        fontSize: 16,
        letterSpacing: 0.96,
        marginTop: hp(10),
    },
    subtitle: {
        textAlign: 'center',
        width: wp(290),
        marginTop: hp(4),
        fontSize: 13,
        letterSpacing: 1.3,
    },
    gradientIcon: {
        justifyContent: 'center',
        alignItems: 'center',
    },
})
export default InheritanceSupportView