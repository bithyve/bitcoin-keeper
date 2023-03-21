import { Platform, StyleSheet } from 'react-native';
import React from 'react';
import { Box } from 'native-base';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import MixIcon from 'src/assets/images/icon_mix.svg';
import Send from 'src/assets/images/send.svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import BottomMenuItem from '../BottomMenuItem';

function UTXOFooter({ setEnableSelection, enableSelection, setInitiateWhirlpool, utxos, wallet }) {
  const navigation = useNavigation();
  const { bottom } = useSafeAreaInsets();

  const handleMix = () => {
    // setEnableMixSelection(true);
    // console.log(utxos);
    // navigation.navigate('WhirlpoolConfiguration', {
    //   utxos: utxos?.filter((item) => item.selected) || [],
    //   wallet,
    // });
  };

  return (
    <Box style={[styles.footerContainer, { marginBottom: bottom }]}>
      <Box style={styles.border} borderColor="light.GreyText" />
      <Box style={styles.footerItemContainer}>
        <BottomMenuItem
          onPress={() => {
            setInitiateWhirlpool(true);
            setEnableSelection(!enableSelection);
          }}
          icon={<MixIcon />}
          title="Mix Selected"
        />
        <BottomMenuItem
          onPress={() => setEnableSelection(!enableSelection)}
          icon={<Send />}
          title="Send Selected"
        />
      </Box>
    </Box>
  );
}

export default UTXOFooter;

const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 5 : 0,
    width: wp(375),
    paddingHorizontal: 5,
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
