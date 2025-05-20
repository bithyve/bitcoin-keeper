import { Box } from 'native-base';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackIcon from 'src/assets/images/back_white.svg';
import BackBlackButton from 'src/assets/images/header-arrow-icon.svg';

import { hp } from 'src/constants/responsive';
import { useSelector } from 'react-redux';
type Props = { slider?: boolean };
function InheritanceHeader({ slider = false }: Props) {
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const navigation = useNavigation();
  const BackButtonIcon = themeMode === 'PRIVATE_LIGHT' ? BackBlackButton : BackIcon;

  return (
    <Box style={[styles.container, { marginBottom: slider ? 0 : hp(20) }]}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <BackButtonIcon />
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
