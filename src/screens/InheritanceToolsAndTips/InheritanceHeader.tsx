import { Box } from 'native-base';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackIcon from 'src/assets/images/back_white.svg';
import { hp } from 'src/constants/responsive';
type Props = { slider?: boolean };
function InheritanceHeader({ slider = false }: Props) {
  const navigation = useNavigation();
  return (
    <Box style={[styles.container, { marginBottom: slider ? 0 : hp(20) }]}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <BackIcon />
      </TouchableOpacity>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    // marginBottom: hp(20),
  },
});
export default InheritanceHeader;
