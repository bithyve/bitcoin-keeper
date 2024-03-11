import { Box } from 'native-base';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackIcon from 'src/assets/images/back_white.svg';
import { hp } from 'src/constants/responsive';
type Props = {};
function InheritanceHeader({}: Props) {
  const navigation = useNavigation();
  return (
    <Box style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <BackIcon />
      </TouchableOpacity>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    marginBottom: hp(50),
  },
});
export default InheritanceHeader;
