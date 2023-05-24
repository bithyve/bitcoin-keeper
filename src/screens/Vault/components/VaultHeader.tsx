import { StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Box } from 'native-base';
import BackIcon from 'src/assets/images/back_white.svg';
import Text from 'src/components/KeeperText';
import { setIntroModal } from 'src/store/reducers/vaults';

function VaultHeader() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  return (
    <Box flexDirection="row" width="100%" px="2%">
      <StatusBar barStyle="light-content" />
      <Box width="50%">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
      </Box>
      <Box width="50%">
        <TouchableOpacity style={styles.knowMore} onPress={() => dispatch(setIntroModal(true))}>
          <Text color="light.white" style={styles.footerText} light>
            Know More
          </Text>
        </TouchableOpacity>
      </Box>
    </Box>
  );
}

export default VaultHeader;

const styles = StyleSheet.create({
  knowMore: {
    backgroundColor: '#725436',
    paddingHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FAFCFC',
    alignSelf: 'flex-end',
  },
  footerText: {
    fontSize: 12,
    letterSpacing: 0.84,
  },
});
