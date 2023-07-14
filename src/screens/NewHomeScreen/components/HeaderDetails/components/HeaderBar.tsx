import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Box } from 'native-base';
import IconSettings from 'src/assets/images/new_icon_settings.svg';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { hp } from 'src/common/data/responsiveness/responsive';
import TorStatusTag from 'src/components/TorStatus';

function HeaderBar() {
  const navigation = useNavigation();
  return (
    <Box style={styles.wrapper}>
      <TorStatusTag />
      <TouchableOpacity
        style={styles.settingIconWrapper}
        onPress={() => navigation.dispatch(CommonActions.navigate('AppSettings'))}
        testID="btn_AppSettingsIcon"
      >
        <IconSettings />
      </TouchableOpacity>
    </Box>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    paddingTop: hp(20),
  },

  settingIconWrapper: {
    width: '40%',
    alignItems: 'flex-end',
  },
});
export default HeaderBar;
