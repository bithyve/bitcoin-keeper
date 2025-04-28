import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import Text from '../KeeperText';
import KeeperGradient from '../KeeperGradient';
import Colors from 'src/theme/Colors';
import { hp, wp } from 'src/constants/responsive';
import usePlan from 'src/hooks/usePlan';

const getStyles = (btnActiveBack) =>
  StyleSheet.create({
    gradient: {
      borderRadius: 10,
      flexDirection: 'row',
      height: hp(50),
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: hp(16),
      borderWidth: 1,
      borderColor: Colors.separator,
    },
    textActive: {
      fontSize: 15,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    text: {
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    containerBtn: {
      justifyContent: 'center',
      alignItems: 'center',
      width: wp(163),
    },
    containerBtnActive: {
      margin: 2,
      borderRadius: 9,
      justifyContent: 'center',
      alignItems: 'center',
      width: wp(163),
      height: hp(42),
      backgroundColor: btnActiveBack,
    },
  });

type Props = {
  value: boolean;
  onValueChange: Function;
  title1: string;
  title2: string;
};

const containerBackgroundColorLight = [Colors.brightCream];
const containerBackgroundColorDark = [Colors.SecondaryBlack];

function Element(props) {
  const { colorMode } = useColorMode();
  const { isOnL4 } = usePlan();

  const btnActiveBack = isOnL4 ? Colors.goldenGradient : Colors.primaryGreen;
  const textColor = colorMode === 'dark' ? Colors.primaryCream : Colors.primaryGreen;
  const textActiveColor = colorMode === 'light' ? Colors.primaryCream : Colors.primaryCream;
  const styles = getStyles(btnActiveBack);

  return (
    <Box style={props.isActive ? styles.containerBtnActive : styles.containerBtn}>
      <Text
        style={props.isActive ? styles.textActive : styles.text}
        color={props.isActive ? textActiveColor : textColor}
        semiBold={props.isActive}
        fontSize={15}
      >
        {props.title}
      </Text>
    </Box>
  );
}

function MonthlyYearlySwitch({ value, onValueChange, title1, title2 }: Props) {
  const { colorMode } = useColorMode();
  const styles = getStyles('');
  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onValueChange} testID="btn_monthlyYearlySwitch">
      <KeeperGradient
        start={[0, 0]}
        end={[1, 0]}
        style={styles.gradient}
        colors={colorMode === 'dark' ? containerBackgroundColorDark : containerBackgroundColorLight}
      >
        <Element isActive={!value} title={title1} />
        <Element isActive={value} title={title2} />
      </KeeperGradient>
    </TouchableOpacity>
  );
}

export default MonthlyYearlySwitch;
