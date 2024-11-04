import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import Text from '../KeeperText';
import KeeperGradient from '../KeeperGradient';
import Colors from 'src/theme/Colors';

const getStyles = (btnActiveBack) =>
  StyleSheet.create({
    gradient: {
      borderRadius: 20,
      flexDirection: 'row',
    },
    textActive: {
      fontSize: 11,
      padding: 4,
    },
    text: {
      paddingVertical: 8,
      paddingHorizontal: 2,
    },
    containerBtn: {
      margin: 3,
      justifyContent: 'center',
      alignItems: 'center',
    },
    containerBtnActive: {
      margin: 3,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: btnActiveBack,
    },
  });

type Props = {
  value: boolean;
  onValueChange: Function;
};

const containerBackgroundColorLight = ['#2D6759', '#073E39'];
const containerBackgroundColorDark = [Colors.DullGreenDark, Colors.DullGreenDark];

function Element(props) {
  const { colorMode } = useColorMode();
  const btnActiveBack = colorMode === 'dark' ? '#F1F1F1' : '#FAFCFC';
  const textColor = colorMode === 'dark' ? '#F1F1F1' : '#FAFCFC';
  const textActiveColor = colorMode === 'light' ? '#2A6255' : Colors.DullGreenDark;
  const styles = getStyles(btnActiveBack);
  return (
    <Box style={props.isActive ? styles.containerBtnActive : styles.containerBtn}>
      <Text
        style={props.isActive ? styles.textActive : styles.text}
        color={props.isActive ? textActiveColor : textColor}
        bold={props.isActive}
        fontSize={props.isActive ? 10 : 9}
      >
        {props.title}
      </Text>
    </Box>
  );
}

function MonthlyYearlySwitch({ value, onValueChange }: Props) {
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
        <Element isActive={value} title="MONTHLY" />
        <Element isActive={!value} title="YEARLY" />
      </KeeperGradient>
    </TouchableOpacity>
  );
}

export default MonthlyYearlySwitch;
