import { Platform, StyleSheet } from 'react-native';
import React from 'react';
import { wp } from 'src/common/data/responsiveness/responsive';
import Buttons from 'src/components/Buttons';
import { Box } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function FinalizeFooter({ setEnableSelection, selectedUTXOs, currentWallet }) {
  const navigation = useNavigation();
  const { bottom } = useSafeAreaInsets();

  const goToSend = () =>
    navigation.dispatch(CommonActions.navigate('Send', { sender: currentWallet, selectedUTXOs }));
  return (
    <Box style={[styles.footerContainer, { marginBottom: bottom }]}>
      <Buttons
        primaryDisable={!selectedUTXOs.length}
        primaryText="Send"
        secondaryText="Cancel"
        secondaryCallback={() => setEnableSelection(false)}
        primaryCallback={goToSend}
      />
    </Box>
  );
}

export default FinalizeFooter;

const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 5 : 0,
    width: wp(375),
    paddingHorizontal: '10%',
    marginBottom: '4%',
  },
});
