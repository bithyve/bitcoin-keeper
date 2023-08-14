import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import Text from '../KeeperText';
import KeeperGradient from '../KeeperGradient';

const getStyles = (btnActiveBack) =>
  StyleSheet.create({
    container: {
      alignSelf: 'flex-end',
      marginRight: 10
    },
    gradient: {
      borderRadius: 20,
      flexDirection: 'row'
    },
    textActive: {
      fontSize: 11,
      padding: 4,
    },
    text: {
      fontSize: 11,
      padding: 4,
    },
    containerBtn: {
      margin: 3,
      justifyContent: 'center',
      alignItems: 'center'
    },
    containerBtnActive: {
      margin: 3,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: btnActiveBack
    }
  })

type Props = {
  value: boolean;
  onValueChange: Function;
};


const containerBackgroundColorLight = ['#00836A', '#073E39']
const containerBackgroundColorDark = ['#89AEA7', '#89AEA7']

function Element(props) {
  const { colorMode } = useColorMode();
  const btnActiveBack = colorMode === 'dark' ? '#212726' : '#FAFCFC'
  const textColor = colorMode === 'dark' ? '#24312E' : '#FAFCFC'
  const textActiveColor = colorMode === 'light' ? '#2A6255' : '#E3BE96'
  const styles = getStyles(btnActiveBack);
  return (
    <Box borderRadius={15} style={props.isActive ? styles.containerBtnActive : styles.containerBtn}>
      <Text style={props.isActive ? styles.textActive : styles.text} color={props.isActive ? textActiveColor : textColor}>{props.title}</Text>
    </Box>
  )
}

function MonthlyYearlySwitch({ value, onValueChange }: Props) {
  const { colorMode } = useColorMode();
  const styles = getStyles('');
  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onValueChange} style={styles.container} testID='btn_monthlyYearlySwitch'>
      <KeeperGradient
        start={[0, 0]}
        end={[1, 0]}
        style={styles.gradient}
        colors={colorMode === 'dark' ? containerBackgroundColorDark : containerBackgroundColorLight}
      >
        <Element isActive={value} title="Monthly" />
        <Element isActive={!value} title="Yearly" />

      </KeeperGradient>
    </TouchableOpacity>
  )
}

export default MonthlyYearlySwitch

