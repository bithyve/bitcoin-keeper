import { Platform, StyleSheet } from 'react-native';
import React from 'react';
import { windowWidth, wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { Box, useColorMode } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function FinalizeFooter({
  setEnableSelection,
  footerCallback,
  initiateWhirlpool,
  setInitiateWhirlpool,
  secondaryText,
  initateWhirlpoolMix,
  setInitateWhirlpoolMix,
  selectedUTXOs,
  isRemix,
  remixingToVault,
  setRemixingToVault,
}) {
  const { colorMode } = useColorMode();
  return (
    <Box style={[styles.footerContainer]} backgroundColor={`${colorMode}.primaryBackground`}>
      <Buttons
        primaryText={
          // initiateWhirlpool
          //   ? 'Initiate Premix'
          //   : initateWhirlpoolMix
          //   ? isRemix
          //     ? remixingToVault
          //       ? 'Remix to vault'
          //       : 'Start Remix'
          //     : 'Start Mix'
          //   : 'Send'
          'Send' // TODO: Use translations
        }
        secondaryText={secondaryText}
        secondaryCallback={() => {
          // if (initiateWhirlpool) {
          //   setInitiateWhirlpool(false);
          // }
          // if (initateWhirlpoolMix) {
          //   setInitateWhirlpoolMix(false);
          // }
          // if (remixingToVault) {
          //   setRemixingToVault(false);
          // }
          setEnableSelection(false);
        }}
        primaryCallback={footerCallback}
        primaryDisable={!selectedUTXOs.length}
      />
    </Box>
  );
}

export default FinalizeFooter;

const styles = StyleSheet.create({
  footerContainer: {
    paddingHorizontal: wp(20),
  },
});
