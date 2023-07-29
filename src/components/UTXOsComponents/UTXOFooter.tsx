import { Platform, StyleSheet } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';
import MixIcon from 'src/assets/images/icon_mix.svg';
import Send from 'src/assets/images/send.svg';
import { WalletType } from 'src/core/wallets/enums';
import { allowedMixTypes, allowedSendTypes } from 'src/screens/WalletDetailScreen/WalletDetails';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { windowWidth } from 'src/common/data/responsiveness/responsive';
import useVault from 'src/hooks/useVault';
import useToastMessage from 'src/hooks/useToastMessage';
import BottomMenuItem from '../../screens/WalletDetails/BottomMenuItem';

function UTXOFooter({
  setEnableSelection,
  enableSelection,
  setInitiateWhirlpool,
  setInitateWhirlpoolMix,
  setIsRemix,
  wallet,
  utxos,
  selectedUTXOs,
  setRemixingToVault,
}) {
  const { colorMode } = useColorMode();
  const { bottom } = useSafeAreaInsets();
  const { activeVault } = useVault();
  const { showToast } = useToastMessage();
  return (
    <Box style={styles.footerContainer} borderColor={`${colorMode}.GreyText`} backgroundColor={`${colorMode}.seashellWhite`}>
      <Box style={styles.border} borderColor={`${colorMode}.GreyText`} />
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
            title={wallet?.type === WalletType.POST_MIX ? 'Select for Remix' : 'Select for Mix'}
          />
        )}
        {WalletType.POST_MIX === wallet?.type && activeVault && (
          <BottomMenuItem
            disabled={!utxos.length}
            onPress={() => {
              if (!activeVault) {
                showToast('Please create a vault before remixing!');
                return;
              }
              setEnableSelection(!enableSelection);
              setIsRemix(wallet?.type === WalletType.POST_MIX);
              setInitateWhirlpoolMix(true);
              setRemixingToVault(true);
            }}
            icon={<MixIcon />}
            title="Remix to Vault"
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
    height: 75,
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 10 : 15,
    width: windowWidth,
    // paddingHorizontal: '10%',
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
