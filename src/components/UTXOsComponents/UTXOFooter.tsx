import { StyleSheet } from 'react-native';
import React from 'react';
import { Box } from 'native-base';
import MixIcon from 'src/assets/images/icon_mix.svg';
import Send from 'src/assets/images/send.svg';
import { WalletType } from 'src/core/wallets/enums';
import { allowedMixTypes, allowedSendTypes } from 'src/screens/WalletDetailScreen/WalletDetails';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomMenuItem from '../../screens/WalletDetailScreen/BottomMenuItem';

function UTXOFooter({
  setEnableSelection,
  enableSelection,
  setInitiateWhirlpool,
  setInitateWhirlpoolMix,
  wallet,
}) {
  const { bottom } = useSafeAreaInsets();
  return (
    <Box
      style={[styles.footerContainer, { bottom: bottom ? bottom / 2 : 0 }]}
      borderColor="light.GreyText"
    >
      <Box style={styles.footerItemContainer}>
        {allowedMixTypes.includes(wallet?.type) && (
          <BottomMenuItem
            onPress={() => {
              setEnableSelection(!enableSelection);
              setInitiateWhirlpool(true);
            }}
            icon={<MixIcon />}
            title="Mix Selected"
          />
        )}
        {wallet?.type === WalletType.PRE_MIX && (
          <BottomMenuItem
            onPress={() => {
              setEnableSelection(!enableSelection);
              setInitateWhirlpoolMix(true);
            }}
            icon={<MixIcon />}
            title="Start Mix "
          />
        )}
        {allowedSendTypes.includes(wallet?.type) && (
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
    width: '100%',
    justifyContent: 'space-around',
    borderTopWidth: 0.2,
  },
  footerItemContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});
