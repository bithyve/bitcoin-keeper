import { StyleSheet } from 'react-native';
import React from 'react';
import { Box } from 'native-base';
import { hp, windowHeight } from 'src/common/data/responsiveness/responsive';
import MixIcon from 'src/assets/images/icon_mix.svg';
import Send from 'src/assets/images/send.svg';
import BottomMenuItem from '../../screens/WalletDetailScreen/BottomMenuItem';

function UTXOFooter({ setEnableSelection, enableSelection }) {
  return (
    <Box style={styles.footerContainer}>
      <Box style={styles.border} borderColor="light.GreyText" />
      <Box style={styles.footerItemContainer}>
        <BottomMenuItem onPress={() => {}} icon={<MixIcon />} title="Select for Mix" />
        <BottomMenuItem
          onPress={() => setEnableSelection(!enableSelection)}
          icon={<Send />}
          title="Select to Send"
        />
      </Box>
    </Box>
  );
}

export default UTXOFooter;

const styles = StyleSheet.create({
  footerContainer: {
    width: '100%',
    justifyContent: 'space-around'
  },
  border: {
    borderWidth: 0.5,
    borderRadius: 20,
    opacity: 0.2,
  },
  footerItemContainer: {
    flexDirection: 'row',
    paddingTop: windowHeight > 850 ? 15 : 5,
    marginBottom: windowHeight > 850 ? hp(10) : 0,
    justifyContent: 'space-evenly',
    marginHorizontal: 16,
  },
});
