import { StyleSheet } from 'react-native';
import React from 'react';
import { Box } from 'native-base';
import MixIcon from 'src/assets/images/icon_mix.svg';
import Send from 'src/assets/images/send.svg';
import { WalletType } from 'src/core/wallets/enums';
import { allowedMixTypes, allowedSendTypes } from 'src/screens/WalletDetailScreen/WalletDetails';
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
  return (
    <Box style={styles.footerContainer} borderColor="light.GreyText">
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
            title={WalletType.POST_MIX ? 'Start Remix' : 'Start Mix'}
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
    width: '100%',
    justifyContent: 'space-around',
  },
  footerItemContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  border: {
    borderWidth: 0.5,
    borderRadius: 20,
    opacity: 0.2,
  },
});
