import { Platform, StyleSheet } from 'react-native';
import React from 'react';
import { Box } from 'native-base';
import MixIcon from 'src/assets/images/icon_mix.svg';
import Send from 'src/assets/images/send.svg';
import { WalletType } from 'src/core/wallets/enums';
import { allowedMixTypes, allowedSendTypes } from 'src/screens/WalletDetailScreen/WalletDetails';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from 'src/theme/Colors';
import { windowWidth } from 'src/common/data/responsiveness/responsive';
import BottomMenuItem from '../../screens/WalletDetailScreen/BottomMenuItem';

function UTXOFooter({
  setEnableSelection,
  enableSelection,
  setInitiateWhirlpool,
  setInitateWhirlpoolMix,
  setIsRemix,
  wallet,
  utxos,
  selectedUTXOs,
}) {
  const { bottom } = useSafeAreaInsets();
  return (
    <Box style={[styles.footerContainer, { marginBottom: bottom }]} borderColor="light.GreyText">
      <Box style={styles.border} borderColor="light.GreyText" />
      <Box style={styles.footerItemContainer}>
        {allowedMixTypes.includes(wallet?.type) && (
          <BottomMenuItem
            disabled={!utxos.length}
            onPress={() => {
              setEnableSelection(!enableSelection);
              setInitiateWhirlpool(true);
            }}
            icon={<MixIcon />}
            title="Select for Mix"
          />
        )}
        {[WalletType.PRE_MIX, WalletType.POST_MIX].includes(wallet?.type) && (
          <BottomMenuItem
            disabled={!utxos.length}
            onPress={() => {
              setEnableSelection(!enableSelection);
              setIsRemix(wallet?.type === WalletType.POST_MIX);
              setInitateWhirlpoolMix(true);
            }}
            icon={<MixIcon />}
            title={wallet?.type === WalletType.POST_MIX ? 'Start Remix' : 'Start Mix'}
          />
        )}
        {allowedSendTypes.includes(wallet?.type) && (
          <BottomMenuItem
            disabled={!utxos.length}
            onPress={() => setEnableSelection(!enableSelection)}
            icon={<Send />}
            title="Select to Send"
          />
        )}
      </Box>
    </Box>
  );
}

export default UTXOFooter;

const styles = StyleSheet.create({
  footerContainer: {
    height: 70,
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 10 : 15,
    width: windowWidth,
    paddingHorizontal: '10%',
    backgroundColor: Colors.LightWhite,
  },
  footerItemContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  border: {
    borderWidth: 0.5,
    borderRadius: 20,
    opacity: 0.2,
  },
});
