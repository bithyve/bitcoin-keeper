import { Platform, StyleSheet } from 'react-native';
import React from 'react';
import { Box } from 'native-base';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import MixIcon from 'src/assets/images/icon_mix.svg';
import Send from 'src/assets/images/send.svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomMenuItem from '../BottomMenuItem';
import { allowedMixTypes, allowedSendTypes } from '../WalletDetails';
import { WalletType } from 'src/core/wallets/enums';

function UTXOFooter({
  setEnableSelection,
  enableSelection,
  setInitiateWhirlpool,
  setInitateWhirlpoolMix,
  wallet,
}) {
  const { bottom } = useSafeAreaInsets();
  return (
    <Box style={[styles.footerContainer, { marginBottom: bottom }]}>
      <Box style={styles.border} borderColor="light.GreyText" />
      <Box style={styles.footerItemContainer}>
        {allowedMixTypes.includes(wallet.type) && (
          <BottomMenuItem
            onPress={() => {
              setEnableSelection(!enableSelection);
              setInitiateWhirlpool(true);
            }}
            icon={<MixIcon />}
            title="Mix Selected"
          />
        )}
        {wallet.type === WalletType.PRE_MIX && (
          <BottomMenuItem
            onPress={() => {
              setEnableSelection(!enableSelection);
              setInitateWhirlpoolMix(true);
            }}
            icon={<MixIcon />}
            title="Start Mix "
          />
        )}
        {allowedSendTypes.includes(wallet.type) && (
          <BottomMenuItem
            onPress={() => setEnableSelection(!enableSelection)}
            icon={<Send />}
            title="Send Selected"
          />
        )}
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
