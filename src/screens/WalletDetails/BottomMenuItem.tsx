import { StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import Text from 'src/components/KeeperText';
import { useColorMode } from 'native-base';

function BottomMenuItem(props) {
  const { colorMode } = useColorMode();
  const { onPress, icon, title, disabled = false } = props;
  return (
    <TouchableOpacity
      style={styles.IconText}
      onPress={onPress}
      disabled={disabled}
      testID="btn_bottomMenu"
    >
      {icon}
      <Text color={`${colorMode}.primaryText`} style={styles.footerItemText}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  IconText: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerItemText: {
    fontSize: 12,
    letterSpacing: 0.84,
    marginVertical: 5,
  },
});
export default BottomMenuItem;
