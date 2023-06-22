import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Box } from 'native-base';
import Text from '../KeeperText';
import KeeperGradient from '../KeeperGradient';

const styles = StyleSheet.create({
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
    color: '#2A6255',
    padding: 4,
  },
  text: {
    fontSize: 11,
    padding: 4,
    color: '#FAFCFC'
  },
  containerBtn: {
    margin: 3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  containerBtnActive: {
    margin: 3,
    backgroundColor: '#FAFCFC',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  }
})

type Props = {
  value: boolean;
  onValueChange: Function;
};



function Element(props) {
  return (
    <Box borderRadius={15} style={props.isActive ? styles.containerBtnActive : styles.containerBtn}>
      <Text style={props.isActive ? styles.textActive : styles.text}>{props.title}</Text>
    </Box>
  )
}

function MonthlyYearlySwitch({ value, onValueChange }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onValueChange} style={styles.container} testID='btn_monthlyYearlySwitch'>
      <KeeperGradient
        start={[0, 0]}
        end={[1, 0]}
        style={styles.gradient}
        colors={['#00836A', '#073E39']}
      >
        <Element isActive={value} title="Monthly" />
        <Element isActive={!value} title="Yearly" />

      </KeeperGradient>
    </TouchableOpacity>
  )
}

export default MonthlyYearlySwitch

